"""
3D Cadastral & ULPIN System — FastAPI Backend
Author: Geospatial Dev (Production-Ready)
"""

from __future__ import annotations

import math
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from shapely.geometry import box as shapely_box

# ─────────────────────────────────────────────
# App bootstrap
# ─────────────────────────────────────────────
app = FastAPI(
    title="3D Cadastral & ULPIN API",
    description="Backend for India's Unique Land Parcel Identification Number system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Topology Engine (Shapely-based)
# ─────────────────────────────────────────────

def _compute_volume(coords: list[list[float]], z_min: float, z_max: float) -> float:
    """Compute approximate volume in m³ using 2D polygon area × height."""
    from shapely.geometry import Polygon
    poly = Polygon(coords[0])
    # Convert from degrees² (approx) to m² using 1° ≈ 111_000 m
    area_deg2 = poly.area
    area_m2 = area_deg2 * (111_000 ** 2)
    height = abs(z_max - z_min)
    return round(area_m2 * height, 2)


def _validate_topology(parcels: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Shapely-based 2D/3D bounding-box intersection validator.
    Returns a topology health report with a conflict-free score.
    """
    conflicts: list[dict[str, str]] = []

    boxes = []
    for feature in parcels:
        coords = feature["geometry"]["coordinates"][0]
        lons = [c[0] for c in coords]
        lats = [c[1] for c in coords]
        props = feature["properties"]
        z_min: float = props["z_min"]
        z_max: float = props["z_max"]
        bbox_2d = shapely_box(min(lons), min(lats), max(lons), max(lats))
        boxes.append({
            "ulpin": props["ulpin"],
            "bbox_2d": bbox_2d,
            "z_min": z_min,
            "z_max": z_max,
        })

    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            a, b = boxes[i], boxes[j]
            # Check 2D intersection
            if a["bbox_2d"].intersects(b["bbox_2d"]):
                # Check Z-range overlap
                if a["z_min"] < b["z_max"] and b["z_min"] < a["z_max"]:
                    # Ignore coincident planar interfaces (shared walls)
                    intersection = a["bbox_2d"].intersection(b["bbox_2d"])
                    if intersection.area > 1e-10:
                        conflicts.append(
                            {"parcel_a": a["ulpin"], "parcel_b": b["ulpin"]}
                        )

    total_pairs = math.comb(len(boxes), 2) or 1
    conflict_count = len(conflicts)
    health_score = round(((total_pairs - conflict_count) / total_pairs) * 100, 2)

    return {
        "total_parcels": len(parcels),
        "total_pairs_checked": total_pairs,
        "conflicts_found": conflict_count,
        "conflict_details": conflicts,
        "health_score": health_score,
        "status": "CONFLICT-FREE" if conflict_count == 0 else "CONFLICTS DETECTED",
        "message": (
            "All parcels are topologically valid — 100% Conflict-Free"
            if conflict_count == 0
            else f"{conflict_count} volumetric conflict(s) detected."
        ),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Authentic 14-Character ULPIN (Geohash) Encoding Engine
# ─────────────────────────────────────────────────────────────────────────────
def encode_geohash(lat: float, lon: float, precision: int = 6) -> str:
    """Standard base32 geohash algorithm for SIH spatial indexing."""
    b32 = "0123456789bcdefghjkmnpqrstuvwxyz"
    lat_range = [-90.0, 90.0]
    lon_range = [-180.0, 180.0]
    geohash = []
    bit = 0
    ch = 0
    even = True
    
    while len(geohash) < precision:
        if even:
            mid = (lon_range[0] + lon_range[1]) / 2
            if lon > mid:
                ch |= (1 << (4 - bit))
                lon_range[0] = mid
            else:
                lon_range[1] = mid
        else:
            mid = (lat_range[0] + lat_range[1]) / 2
            if lat > mid:
                ch |= (1 << (4 - bit))
                lat_range[0] = mid
            else:
                lat_range[1] = mid
        even = not even
        if bit < 4:
            bit += 1
        else:
            geohash.append(b32[ch])
            bit = 0
            ch = 0
    return "".join(geohash).upper()

def generate_14char_ulpin(lat: float, lon: float, state: str = "UP", dist: str = "MAT", floor_str: str = "F00") -> str:
    """
    Format: [2-Char State][3-Char Dist][6-Char Geohash][3-Char Floor]
    Total 14 characters authentic DoLR spec.
    """
    ghash = encode_geohash(lat, lon, 6)
    return f"{state[:2]}{dist[:3]}{ghash}{floor_str}"

def get_centroid(coords: list) -> tuple:
    lats = [c[1] for c in coords[0]]
    lons = [c[0] for c in coords[0]]
    return sum(lats)/len(lats), sum(lons)/len(lons)

# ─────────────────────────────────────────────────────────────────────────────
# Mock ULPIN Parcel Dataset (Mathura, UP)
# ─────────────────────────────────────────────────────────────────────────────
_PARCELS: list[dict[str, Any]] = [
    {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [77.6720, 27.4930], [77.6730, 27.4930], [77.6730, 27.4940],
                [77.6720, 27.4940], [77.6720, 27.4930]
            ]],
        },
        "properties": {
            "owner_name": "Rajesh Kumar Sharma", "property_type": "Surface",
            "district": "Mathura", "state": "Uttar Pradesh", "area_sqm": 1210.0,
            "z_min": 0.0, "z_max": 12.0, "land_use": "Residential", "registration_date": "2021-04-15",
            "color": "#2563eb", "floor_number": 0
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [77.6745, 27.4925], [77.6758, 27.4925], [77.6758, 27.4935],
                [77.6745, 27.4935], [77.6745, 27.4925]
            ]],
        },
        "properties": {
            "owner_name": "Priya Devi Agarwal", "property_type": "Surface",
            "district": "Mathura", "state": "Uttar Pradesh", "area_sqm": 1430.0,
            "z_min": 0.0, "z_max": 8.0, "land_use": "Commercial", "registration_date": "2022-07-01",
            "color": "#16a34a", "floor_number": 0
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [77.6720, 27.4910], [77.6735, 27.4910], [77.6735, 27.4920],
                [77.6720, 27.4920], [77.6720, 27.4910]
            ]],
        },
        "properties": {
            "owner_name": "Suresh Chandra Mishra", "property_type": "Vertical Unit",
            "district": "Mathura", "state": "Uttar Pradesh", "area_sqm": 1650.0,
            "z_min": 0.0, "z_max": 4.0, "floor_number": 1, "land_use": "Residential Apartment",
            "registration_date": "2023-01-10", "color": "#f97316",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [77.6720, 27.4910], [77.6735, 27.4910], [77.6735, 27.4920],
                [77.6720, 27.4920], [77.6720, 27.4910]
            ]],
        },
        "properties": {
            "owner_name": "Anita Kumari Pandey", "property_type": "Vertical Unit",
            "district": "Mathura", "state": "Uttar Pradesh", "area_sqm": 1650.0,
            "z_min": 4.0, "z_max": 8.0, "floor_number": 2, "land_use": "Residential Apartment",
            "registration_date": "2023-01-10", "color": "#a855f7",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [77.6720, 27.4910], [77.6735, 27.4910], [77.6735, 27.4920],
                [77.6720, 27.4920], [77.6720, 27.4910]
            ]],
        },
        "properties": {
            "owner_name": "Vijay Singh Yadav", "property_type": "Vertical Unit",
            "district": "Mathura", "state": "Uttar Pradesh", "area_sqm": 1650.0,
            "z_min": 8.0, "z_max": 12.0, "floor_number": 3, "land_use": "Residential Apartment",
            "registration_date": "2023-01-10", "color": "#ec4899",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [77.6700, 27.4915], [77.6760, 27.4915], [77.6760, 27.4920],
                [77.6700, 27.4920], [77.6700, 27.4915]
            ]],
        },
        "properties": {
            "owner_name": "Mathura Jal Nigam (Utility)", "property_type": "Subsurface",
            "district": "Mathura", "state": "Uttar Pradesh", "area_sqm": 660.0,
            "z_min": -8.0, "z_max": -2.0, "land_use": "Underground Water Main", "floor_number": 0,
            "registration_date": "2020-11-20", "color": "#f59e0b",
        },
    },
]

for _feat in _PARCELS:
    # Inject 14-char ULPIN dynamically
    lat, lon = get_centroid(_feat["geometry"]["coordinates"])
    flr = _feat["properties"].get("floor_number", 0)
    floor_id = f"F{flr:02d}"
    _feat["properties"]["ulpin"] = generate_14char_ulpin(lat, lon, "UP", "MAT", floor_id)


# Pre-compute volumes into properties
for _feat in _PARCELS:
    _feat["properties"]["volume_m3"] = _compute_volume(
        _feat["geometry"]["coordinates"],
        _feat["properties"]["z_min"],
        _feat["properties"]["z_max"],
    )

# Pre-compute topology report (once, at startup)
_TOPOLOGY_REPORT = _validate_topology(_PARCELS)


# ─────────────────────────────────────────────
# REST Endpoints
# ─────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root() -> dict[str, str]:
    return {"status": "online", "system": "3D Cadastral & ULPIN API v1.0"}


@app.get("/api/parcels", tags=["Cadastral"])
def get_parcels() -> dict[str, Any]:
    """
    Returns a GeoJSON FeatureCollection of all ULPIN-indexed 3D parcels
    around Mathura, Uttar Pradesh.
    """
    return {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"},
        },
        "features": _PARCELS,
    }


@app.get("/api/topology", tags=["Topology"])
def get_topology() -> dict[str, Any]:
    """
    Returns the Shapely-computed topology health report for all parcels.
    Validates 2D + 3D (Z-range) bounding-box intersections.
    """
    return _TOPOLOGY_REPORT


@app.get("/api/parcel/{ulpin}", tags=["Cadastral"])
def get_parcel_by_ulpin(ulpin: str) -> dict[str, Any]:
    """Fetch a single parcel by its ULPIN identifier."""
    for feature in _PARCELS:
        if feature["properties"]["ulpin"] == ulpin:
            return feature
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail=f"Parcel '{ulpin}' not found.")
