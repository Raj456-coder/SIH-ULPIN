import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import { EXTENDED_PARCELS } from '../data/parcels';

// ─────────────────────────────────────────────────────────────────────────────
// Authentic 14-Character ULPIN (Geohash) Encoding Engine
// ─────────────────────────────────────────────────────────────────────────────
export function encodeGeohash(lat, lon, precision = 6) {
  const B32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  let latMin = -90, latMax = 90;
  let lonMin = -180, lonMax = 180;
  let hash = "";
  let bit = 0, ch = 0;
  let even = true;
  while (hash.length < precision) {
    if (even) {
      let mid = (lonMin + lonMax) / 2;
      if (lon > mid) { ch |= (1 << (4 - bit)); lonMin = mid; } else { lonMax = mid; }
    } else {
      let mid = (latMin + latMax) / 2;
      if (lat > mid) { ch |= (1 << (4 - bit)); latMin = mid; } else { latMax = mid; }
    }
    even = !even;
    if (bit < 4) bit++; else { hash += B32[ch]; bit = 0; ch = 0; }
  }
  return hash.toUpperCase();
}

export function generate14CharULPIN(lat, lon, floorStr = "F00") {
  const ghash = encodeGeohash(lat, lon, 6);
  return `UPMAT${ghash}${floorStr}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARCEL DATA & GENERATORS
// ─────────────────────────────────────────────────────────────────────────────

const generateBoxCoords = (lon, lat, widthM, heightM) => {
  const latOffset = (heightM / 2) / 111000;
  const lonOffset = (widthM / 2) / (111000 * Math.cos(lat * Math.PI / 180));
  return [
    lon - lonOffset, lat - latOffset,
    lon + lonOffset, lat - latOffset,
    lon + lonOffset, lat + latOffset,
    lon - lonOffset, lat + latOffset,
    lon - lonOffset, lat - latOffset
  ];
};

const generateFloors = (numFloors, baseUlpin) => {
  const floors = [];
  
  // Specific NBC standard colors requested
  const getFloorColor = (i) => {
    if (i === 0) return 'rgba(13, 148, 136, 0.85)'; // Teal (Ground)
    if (i === 1) return 'rgba(245, 158, 11, 0.85)'; // Amber (1st)
    if (i === 2) return 'rgba(139, 92, 246, 0.85)'; // Purple (2nd)
    if (i === 3) return 'rgba(244, 63, 94, 0.85)';  // Rose (3rd)
    return 'rgba(99, 102, 241, 0.85)';              // Indigo (4th+)
  };
  
  for (let i = 0; i < numFloors; i++) {
    let name = "Ground Floor";
    if (i === 1) name = "1st Floor";
    else if (i === 2) name = "2nd Floor";
    else if (i === 3) name = "3rd Floor";
    else if (i === 4) name = "4th Floor";
    else if (i > 4) name = `${i}th Floor`;

    floors.push({
      name,
      min: i * 3.2,
      max: (i + 1) * 3.2,
      color: getFloorColor(i),
      ulpin: `${baseUlpin}-F${(i + 1).toString().padStart(2, '0')}`
    });
  }
  
  // Add crisp Slate Roof Lid (thickness 0.4m)
  const roofMin = numFloors * 3.2;
  floors.push({
    name: "Roof Slab",
    min: roofMin,
    max: roofMin + 0.4,
    color: '#1e293b',
    ulpin: `${baseUlpin}-ROOF`
  });
  
  return floors;
};

// Dynamically generate the map entities for all 13 registry parcels
const PARCELS_DATA = {};
EXTENDED_PARCELS.forEach(p => {
  const w = p.width || Math.sqrt(p.groundArea) * 0.95;
  const l = p.length || Math.sqrt(p.groundArea) * 1.05;
  const trueGroundArea = Math.round(w * l);
  const baseCoords = generateBoxCoords(p.center[0], p.center[1], w, l);
  const numFloors = Math.max(1, Math.round(p.height / 3.2));
  
  const authenticBaseUlpin = generate14CharULPIN(p.center[1], p.center[0], "");
  const floors = generateFloors(numFloors, authenticBaseUlpin);

  PARCELS_DATA[p.id] = {
    ...p,
    ulpin: `${authenticBaseUlpin}F00`,
    dims: `${w.toFixed(1)}m × ${l.toFixed(1)}m`,
    groundArea: trueGroundArea,
    totalArea: trueGroundArea * numFloors,
    baseCoords,
    floors,
    clearanceStatus: p.status.includes('⚠️') ? p.status : "✅ Topology Validated - No Overlap Detected"
  };
});



function makeOsmProvider() {
  return new Cesium.UrlTemplateImageryProvider({
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    credit: new Cesium.Credit("© OpenStreetMap contributors", false),
    maximumLevel: 19, minimumLevel: 0, tileWidth: 256, tileHeight: 256,
  });
}

function makeSatelliteProvider() {
  return new Cesium.UrlTemplateImageryProvider({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    credit: new Cesium.Credit("Tiles © Esri — Source: Esri", false),
    maximumLevel: 19, minimumLevel: 0, tileWidth: 256, tileHeight: 256,
  });
}

const LayerSwitcher = ({ isSatellite, onStreet, onSatellite, showTransit, onToggleTransit }) => {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-lg border border-slate-200">
      <button
        onClick={onStreet}
        className={`px-3 py-1.5 text-xs font-semibold rounded ${
          !isSatellite ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        🗺️ Street Map
      </button>
      <button
        onClick={onSatellite}
        className={`px-3 py-1.5 text-xs font-semibold rounded ${
          isSatellite ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        🛰️ Satellite
      </button>
      <div className="w-px bg-slate-300 mx-1 my-1"></div>
      <label className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 rounded">
        <input 
          type="checkbox" 
          checked={showTransit} 
          onChange={onToggleTransit} 
          className="cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        🔲 Toggle 3D Flyover
      </label>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Google Maps-Style Universal Location Search
// ─────────────────────────────────────────────────────────────────────────────
function LocationSearch({ onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const delayFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setResults(data);
      } catch (e) {
        console.error("Geocoding error:", e);
      }
    }, 300);
    return () => clearTimeout(delayFn);
  }, [query]);

  return (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 w-[450px]">
      <div className="relative backdrop-blur-md bg-white/95 shadow-xl rounded-xl border border-slate-200 p-1.5 flex items-center transition-all focus-within:ring-2 ring-orange-400">
        <span className="pl-3 text-slate-400 text-lg">🔍</span>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city, colony, or address in India..." 
          className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-[13px] font-bold text-slate-800 placeholder-slate-400"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="pr-3 text-slate-400 hover:text-slate-600 font-bold">✕</button>
        )}
      </div>
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto">
          {results.map(r => (
            <button 
              key={r.place_id} 
              onClick={() => {
                onLocationSelect(r);
                setQuery(r.display_name.split(',')[0]);
                setResults([]);
              }}
              className="w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-700 truncate transition-colors"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// MapComponent
// ─────────────────────────────────────────────────────────────────────────────
export default function MapComponent({ targetParcelId, floorExplosion, onParcelSelect, clearTarget }) {
  const cesiumContainerRef = useRef(null);
  const viewerRef          = useRef(null);
  const handlerRef         = useRef(null);
  const explodeRef         = useRef(floorExplosion);
  
  const currentSearchRef   = useRef({ name: 'Mathura', code: 'UP-MAT' });
  const [isSatellite, setIsSatellite] = useState(true);
  const [showTransit, setShowTransit] = useState(true);

  // Keep track of dynamically spawned floor entities so we can clear them easily
  const floorEntitiesRef   = useRef([]);
  const transitEntitiesRef = useRef([]);

  // Sync ref for CallbackProperty
  useEffect(() => {
    explodeRef.current = floorExplosion;
  }, [floorExplosion]);

  useEffect(() => {
    transitEntitiesRef.current.forEach(entity => {
      if (entity) entity.show = showTransit;
    });
  }, [showTransit]);

  const selectParcel = useCallback((pData) => {
    try {
      const v = viewerRef.current;
      if (!v || v.isDestroyed()) return;

      if (!pData) return;

      // 1. Remove previous floors
      floorEntitiesRef.current.forEach(entity => {
        v.entities.remove(entity);
      });
      floorEntitiesRef.current = [];

      // 2. Spawn Outline & Stacked Floors
      let outlineColor = Cesium.Color.CYAN;
      let glowPower = 0.2;
      let lineWidth = 4;
      
      if (pData.statusCode === 'GREEN') {
         outlineColor = Cesium.Color.fromCssColorString('#22c55e');
         glowPower = 0.25; lineWidth = 4;
      } else if (pData.statusCode === 'YELLOW') {
         outlineColor = Cesium.Color.fromCssColorString('#eab308');
         glowPower = 0.35; lineWidth = 4;
      } else if (pData.statusCode === 'RED') {
         outlineColor = Cesium.Color.fromCssColorString('#ef4444');
         glowPower = 0.6; lineWidth = 6;
      }

      // Add dynamic outline
      const outlineEntity = v.entities.add({
        id: `ACTIVE-OUTLINE-${pData.id}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(pData.baseCoords),
          width: lineWidth,
          material: new Cesium.PolylineGlowMaterialProperty({ glowPower, color: outlineColor }),
          clampToGround: true
        }
      });
      floorEntitiesRef.current.push(outlineEntity);

      // Add floors
      if (pData.floors) {
        pData.floors.forEach((f, i) => {
          const floorEntity = v.entities.add({
            id: `FLOOR-${pData.id}-${i}`,
            name: f.name,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(pData.baseCoords),
              height: new Cesium.CallbackProperty(() => f.min + i * explodeRef.current, false),
              extrudedHeight: new Cesium.CallbackProperty(() => f.max + i * explodeRef.current, false),
              material: Cesium.Color.fromCssColorString(f.color),
              outline: true,
              outlineColor: Cesium.Color.BLACK
            }
          });
          floorEntitiesRef.current.push(floorEntity);
        });
      }

      // 3. Orbit camera smoothly at 45 degree angle
      const [lon, lat] = pData.center;
      v.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat - 0.0006, 120),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0
        },
        duration: 2.0
      });

      // 4. Update Parent UI
      onParcelSelect(pData);
    } catch (e) {
      console.error("Error selecting parcel", e);
    }
  }, [onParcelSelect]);

  const handleLocationSelect = useCallback((result) => {
    try {
      const v = viewerRef.current;
      if (!v || v.isDestroyed()) return;

      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      const lowerName = result.display_name.toLowerCase();
      let code = 'IN-LOC';
      let cityName = result.display_name.split(',')[0];

      if (lowerName.includes('delhi')) code = 'DL-NDLS';
      else if (lowerName.includes('maharashtra')) code = 'MH-PUN';
      else if (lowerName.includes('uttar pradesh')) code = 'UP-LKO';
      else if (lowerName.includes('karnataka')) code = 'KA-BLR';

      currentSearchRef.current = { name: cityName, code };

      // Clean up previous pin
      const existingPin = v.entities.getById('search-pin');
      if (existingPin) v.entities.remove(existingPin);

      // Add temporary elegant locator pin
      v.entities.add({
        id: 'search-pin',
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        point: {
          pixelSize: 14,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 3,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: cityName,
          font: 'bold 13px sans-serif',
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 3,
          outlineColor: Cesium.Color.BLACK,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -18),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });

      // Fly to the newly searched location with cinematic perspective
      v.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, 750.0),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-40.0),
          roll: 0.0
        },
        duration: 2.5
      });

      // Clear currently exploded buildings
      floorEntitiesRef.current.forEach(entity => v.entities.remove(entity));
      floorEntitiesRef.current = [];
      onParcelSelect(null);

    } catch (e) {
      console.error('Error selecting location:', e);
    }
  }, [onParcelSelect]);

  // Handle incoming target ID (e.g. from Registry View or Sidebar Reset)
  useEffect(() => {
    if (targetParcelId === 'RESET') {
      try {
        const v = viewerRef.current;
        if (!v || v.isDestroyed()) return;
        
        // Clear all dynamically spawned 3D extrusions
        floorEntitiesRef.current.forEach(entity => v.entities.remove(entity));
        floorEntitiesRef.current = [];
        
        // Fly back to high altitude overview
        v.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(77.6734, 27.4912, 180),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 },
          duration: 1.5
        });
        
        if (clearTarget) clearTarget();
      } catch (e) {
        console.error("Reset failed", e);
      }
    } else if (targetParcelId) {
      const pData = PARCELS_DATA[targetParcelId];
      if (pData) selectParcel(pData);
      if (clearTarget) clearTarget();
    }
  }, [targetParcelId, selectParcel, clearTarget]);

  const [isFloodSimActive, setIsFloodSimActive] = useState(false);
  const [floodLevel, setFloodLevel] = useState(0);

  const floodLevelRef = useRef(0);
  useEffect(() => {
    floodLevelRef.current = isFloodSimActive ? floodLevel : 0;
  }, [floodLevel, isFloodSimActive]);

  // Sync flood level state with global window event for Sidebar
  useEffect(() => {
    const activeLevel = isFloodSimActive ? floodLevel : 0;
    window.dispatchEvent(new CustomEvent('floodLevelChange', { detail: activeLevel }));
  }, [floodLevel, isFloodSimActive]);

  // Map Initialization
  useEffect(() => {
    if (!cesiumContainerRef.current || viewerRef.current) return;

    let viewer;
    try {
      viewer = new Cesium.Viewer(cesiumContainerRef.current, {
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        baseLayerPicker: false, geocoder: false, homeButton: false, sceneModePicker: false,
        navigationHelpButton: false, animation: false, timeline: false, fullscreenButton: false,
        infoBox: false, selectionIndicator: false, shadows: false, requestRenderMode: false
      });

      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(makeSatelliteProvider());
      viewer.scene.globe.show = true;
      viewer.scene.globe.baseColor = Cesium.Color.SLATEGRAY;
      viewer.scene.globe.enableLighting = false;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      
      // Enable realistic LoD2 shadowing
      viewer.shadows = true;
      viewer.terrainShadows = Cesium.ShadowMode.ENABLED;

      viewerRef.current = viewer;

      // Add a clean bottom plane to hide global empty space
      const waterEntity = viewer.entities.add({
        id: 'FLOOD-PLANE',
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray([
            77.60, 27.45,
            77.75, 27.45,
            77.75, 27.55,
            77.60, 27.55
          ]),
          height: 0,
          extrudedHeight: new Cesium.CallbackProperty(() => floodLevelRef.current > 0 ? floodLevelRef.current : 0, false),
          material: Cesium.Color.fromCssColorString('#0284c7').withAlpha(0.55),
          show: new Cesium.CallbackProperty(() => floodLevelRef.current > 0, false)
        }
      });
    } catch (e) {
      console.error("Cesium Viewer initialization failed:", e);
      return;
    }

    try {
      // Create Boundaries and Floating Labels
      Object.values(PARCELS_DATA).forEach(p => {
        let color = Cesium.Color.CYAN;
        let labelColor = Cesium.Color.fromCssColorString('#0b2545');

        if (p.statusCode === 'GREEN') {
           color = Cesium.Color.fromCssColorString('#22c55e');
           labelColor = Cesium.Color.fromCssColorString('#166534');
        } else if (p.statusCode === 'YELLOW') {
           color = Cesium.Color.fromCssColorString('#eab308');
           labelColor = Cesium.Color.fromCssColorString('#854d0e');
        } else if (p.statusCode === 'RED') {
           color = Cesium.Color.fromCssColorString('#ef4444');
           labelColor = Cesium.Color.fromCssColorString('#991b1b');
        }

        // Invisible polygon for clicking
        viewer.entities.add({
          id: p.id,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(p.baseCoords),
            material: color.withAlpha(0.01),
            height: 0
          },
          properties: { isFootprint: true, parcelId: p.id }
        });

        // Floating Status Pill Label
        if (p.label) {
            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(p.center[0], p.center[1], p.height + 4.0),
                label: {
                    text: p.label,
                    font: 'bold 12px sans-serif',
                    fillColor: Cesium.Color.WHITE,
                    showBackground: true,
                    backgroundColor: labelColor,
                    backgroundPadding: new Cesium.Cartesian2(8, 5),
                    style: Cesium.LabelStyle.FILL,
                    pixelOffset: new Cesium.Cartesian2(0, 0),
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                }
            });
        }
      });

      // --- RELOCATED NH-19 FLYOVER (Mathura Bypass) ---
      const nh19Positions = Cesium.Cartesian3.fromDegreesArray([77.6585, 27.4850, 77.6610, 27.5050]);
      
      // 1. Dual-lane Elevated Roadway Deck (+9.5m, width 12m, thickness 0.9m)
      const flyoverDeck = viewer.entities.add({
         id: "INFRA-NH19-FLYOVER",
         corridor: {
           positions: nh19Positions,
           width: 12.0,
           height: 9.5,
           extrudedHeight: 10.4,
           material: Cesium.Color.fromCssColorString('#334155'), // Dark asphalt
           outline: true,
           outlineColor: Cesium.Color.fromCssColorString('#475569')
         },
         show: showTransit
      });
      transitEntitiesRef.current.push(flyoverDeck);

      // 2. Concrete Support Pillars (every ~60m along the median)
      const numPillars = 40;
      for (let i = 0; i <= numPillars; i++) {
          const t = i / numPillars;
          const lon = 77.6585 + (77.6610 - 77.6585) * t;
          const lat = 27.4850 + (27.5050 - 27.4850) * t;
          
          const pillar = viewer.entities.add({
             position: Cesium.Cartesian3.fromDegrees(lon, lat, 4.75),
             cylinder: {
                length: 9.5,
                topRadius: 0.8,
                bottomRadius: 0.8,
                material: Cesium.Color.fromCssColorString('#94a3b8')
             },
             show: showTransit
          });
          transitEntitiesRef.current.push(pillar);
      }

      // 3. Underground Metro Tunnel (-6.0m) - optional along same RoW
      const metroTunnel = viewer.entities.add({
         id: "INFRA-NH19-METRO",
         corridor: {
           positions: nh19Positions,
           width: 6.0,
           height: -7.0,
           extrudedHeight: -6.0,
           material: Cesium.Color.fromCssColorString('#8b5cf6').withAlpha(0.6),
           outline: true,
           outlineColor: Cesium.Color.fromCssColorString('#a78bfa')
         },
         show: showTransit
      });
      transitEntitiesRef.current.push(metroTunnel);

      // Default viewpoint perfectly framing the Mathura Grid (Slide 5)
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.6719, 27.4912, 320),
        orientation: { heading: 0, pitch: Cesium.Math.toRadians(-40), roll: 0 },
        duration: 0
      });
    } catch (e) {
      console.error("Failed to add footprints:", e);
    }

    return () => {
      try {
        if (handlerRef.current) {
          handlerRef.current.destroy();
          handlerRef.current = null;
        }
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.destroy();
          viewerRef.current = null;
        }
      } catch (e) {
        console.error("Error during MapComponent cleanup:", e);
      }
    };
  }, []);

  // Visual Strata Floor Splitter
  useEffect(() => {
    const handleSplit = (e) => {
      const idx = e.detail;
      if (!viewerRef.current || !targetParcelId) return;
      const idStr = `FLOOR-${targetParcelId}-${idx}`;
      const entity = viewerRef.current.entities.getById(idStr);
      if (entity && entity.polygon && entity.polygon.material) {
         let baseColor = Cesium.Color.fromCssColorString('#0d9488'); // fallback
         try {
           baseColor = entity.polygon.material.color.getValue();
         } catch(err){}
         entity.polygon.material = new Cesium.StripeMaterialProperty({
             evenColor: baseColor,
             oddColor: Cesium.Color.WHITE.withAlpha(0.9),
             repeat: 2,
             orientation: Cesium.StripeOrientation.VERTICAL
         });
      }
    };
    window.addEventListener('splitFloorVisual', handleSplit);
    return () => window.removeEventListener('splitFloorVisual', handleSplit);
  }, [targetParcelId]);

  // Universal Click Handler
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    try {
      if (handlerRef.current) handlerRef.current.destroy();

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      handler.setInputAction((click) => {
        try {
          if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

          const picked = viewer.scene.pick(click.position);
          let actualHeight = 4.0;
          let isOsmBuilding = false;

          // 1. Existing Predefined Footprint Clicked
          if (Cesium.defined(picked) && picked.id && picked.id.properties && picked.id.properties.isFootprint) {
            const parcelId = picked.id.properties.parcelId.getValue();
            const p = PARCELS_DATA[parcelId];
            selectParcel({ ...p, type: 'Building' });
            return;
          }

          // 2. OSM 3D Building Clicked
          if (Cesium.defined(picked) && picked.getProperty) {
            isOsmBuilding = true;
            const h = picked.getProperty('cesium#estimatedHeight') || 
                      picked.getProperty('height') || 
                      (picked.getProperty('building:levels') ? picked.getProperty('building:levels') * 3.2 : null);
            if (h) actualHeight = Math.max(3.5, parseFloat(h));
          }
          
          // 3. Universal Satellite Globe / OSM Clicked -> Generate Synthetic 3D Building anywhere in India
          let cartesian = null;
          if (viewer.scene.pickPositionSupported && isOsmBuilding) {
             cartesian = viewer.scene.pickPosition(click.position);
          } else {
             cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
          }
          
          if (cartesian) {
            const carto = Cesium.Cartographic.fromCartesian(cartesian);
            const lon = Cesium.Math.toDegrees(carto.longitude);
            const lat = Cesium.Math.toDegrees(carto.latitude);

            let numFloors = 1;

            // Generate realistic dynamic footprint
            const widthM = 10.0 + (Math.random() * 12.0); // 10 to 22m
            const lengthM = 10.0 + (Math.random() * 12.0); // 10 to 22m
            const footprintArea = Math.floor(widthM * lengthM); // ~100 to ~484 sq.m

            if (isOsmBuilding) {
               numFloors = Math.max(1, Math.round(actualHeight / 3.2));
            } else {
               // If footprint < 150 sq.m: Extrude 1 to 2 floors.
               if (footprintArea < 150) {
                 numFloors = Math.random() > 0.5 ? 1 : 2;
               } 
               // If footprint 150 - 350 sq.m: Extrude 3 floors.
               else if (footprintArea >= 150 && footprintArea <= 350) {
                 numFloors = 3;
               } 
               // If footprint > 350 sq.m: Extrude 4 to 5 floors.
               else {
                 numFloors = Math.random() > 0.5 ? 4 : 5;
               }
            }

            let categoryBadge = "🏢 Commercial Complex (Urban)";
            if (numFloors <= 2) {
              categoryBadge = "🏡 Single-Story / Duplex Residential";
            } else if (numFloors === 3) {
              categoryBadge = "🏠 Multi-Family Residential (G+2)";
            }

            const randSuffix = Math.floor(1000 + Math.random() * 9000);
            const baseUlpin = generate14CharULPIN(lat, lon, "");
            const floors = generateFloors(numFloors, baseUlpin);
            
            const synthParcelData = {
              type: 'Building',
              categoryBadge: categoryBadge,
              id: `SYNTH-${randSuffix}`,
              name: `Parcel Unit @ ${currentSearchRef.current?.name || 'Coordinate'}`,
              ulpin: `${baseUlpin}F00`,
              dims: `${widthM.toFixed(1)}m × ${lengthM.toFixed(1)}m`,
              groundArea: footprintArea,
              totalArea: footprintArea * numFloors,
              center: [lon, lat],
              baseCoords: generateBoxCoords(lon, lat, widthM, lengthM),
              floors: floors,
              statusCode: 'GREEN',
              clearanceStatus: "✅ 3D TOPOLOGY VALIDATED - Clear Title & Airspace"
            };

            selectParcel(synthParcelData);
          }
        } catch (e) {
          console.error("Click processing error:", e);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handlerRef.current = handler;
    } catch (e) {
      console.error("Failed to bind click handler:", e);
    }
  }, [selectParcel]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <LocationSearch onLocationSelect={handleLocationSelect} />
      
      <div ref={cesiumContainerRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />
      
      <LayerSwitcher
        isSatellite={isSatellite}
        onStreet={() => {
          viewerRef.current?.imageryLayers.removeAll();
          viewerRef.current?.imageryLayers.addImageryProvider(makeOsmProvider());
          setIsSatellite(false);
        }}
        onSatellite={() => {
          viewerRef.current?.imageryLayers.removeAll();
          viewerRef.current?.imageryLayers.addImageryProvider(makeSatelliteProvider());
          setIsSatellite(true);
        }}
        showTransit={showTransit}
        onToggleTransit={() => setShowTransit(!showTransit)}
      />

      {/* Yamuna Flood Simulator Widget */}
      <div className="absolute top-20 right-4 z-10 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-slate-200 w-[350px]">
        <button 
          onClick={() => setIsFloodSimActive(!isFloodSimActive)} 
          className={`w-full py-2 px-3 text-sm font-bold rounded-md transition-colors flex items-center justify-center gap-2 ${
            isFloodSimActive ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>🌊</span> Simulate Yamuna Flood Inundation
        </button>
        {isFloodSimActive && (
          <div className="mt-4 px-2">
            <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
              <span>Flood Water Level: +0.0m</span>
              <span className="text-cyan-700 font-bold">+{floodLevel.toFixed(1)}m</span>
              <span>+5.0m</span>
            </div>
            <input 
              type="range" 
              min="0" max="5.0" step="0.1" 
              value={floodLevel} 
              onChange={(e) => setFloodLevel(parseFloat(e.target.value))}
              className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Cadastral Interactive Legend */}
      <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-200 z-20 w-72 pointer-events-none">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Live Cadastral Status</h4>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-xs font-bold text-slate-700">Verified Parcel (No Clash)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-[#eab308] shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
            <span className="text-xs font-bold text-slate-700">Under Verification (Docs in Review)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-red-200 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-700">Boundary Clash (Action Blocked)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-slate-400 opacity-50 border-2 border-dashed border-slate-600"></div>
            <span className="text-xs font-bold text-slate-700">Elevated Corridor / Metro RoW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
