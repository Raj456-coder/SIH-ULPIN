import React, { useState, useEffect } from "react";
import { EncroachmentModal, BhuAadhaarCertificate, TransferModal } from "./GovernanceTools";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</span>
      <span className="text-slate-800 text-sm font-semibold text-right max-w-[55%] leading-tight">
        {value ?? "—"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Component
// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar({ feature, onClose }) {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [floodLevel, setFloodLevel] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [splitFloors, setSplitFloors] = useState(new Set());
  const [transferUlpin, setTransferUlpin] = useState(null);

  const handleSubdivide = (idx) => {
    setSplitFloors(prev => new Set(prev).add(idx));
    window.dispatchEvent(new CustomEvent('splitFloorVisual', { detail: idx }));
  };

  useEffect(() => {
    const handleFloodChange = (e) => setFloodLevel(e.detail);
    window.addEventListener('floodLevelChange', handleFloodChange);
    return () => window.removeEventListener('floodLevelChange', handleFloodChange);
  }, []);

  if (!feature) return null;

  const totalFloors = feature.floors ? feature.floors.length : 1;
  const unitType = totalFloors === 1 ? "Surface Unit (G+0)" : `Vertical Unit (G+${totalFloors - 1} Floors)`;

  const categoryLabel = feature.categoryBadge || feature.category || "Feature";

  return (
    <aside className="sidebar-enter w-[360px] bg-slate-50 border-l border-slate-200 flex flex-col shadow-2xl z-30 overflow-hidden flex-shrink-0">
      
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="bg-[#0b2545] text-white px-5 py-4 flex-shrink-0 flex justify-between items-start">
        <div className="flex-1 pr-3">
          <div className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            {categoryLabel}
          </div>
          <h2 className="text-lg font-black leading-tight mb-1">{feature.name}</h2>
          <div className="text-sm font-medium text-slate-300">{feature.owner}</div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>

      <div className="flex bg-white border-b border-slate-200">
        {['Overview', 'LADM (Rights)', 'Hazard Audit'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-center border-b-2 transition-colors ${
              activeSubTab === tab ? 'border-[#0b2545] text-[#0b2545]' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto print:hidden">
        
        {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
        {activeSubTab === 'Overview' && (
          <div className="animate-[fade-in_0.2s_ease-out]">
            {(() => {
              if (!feature.statusCode) return null;
              let cardClasses = 'bg-emerald-50 border-l-4 border-emerald-500';
              let headerColor = 'text-emerald-700';
              let headerText = '✅ 100% CONFLICT-FREE & VERIFIED';
              let noteText = 'Zero subsurface overlaps, clear airspace title. Ready for instantaneous digital registry.';
              let pillText = 'VALID / CLEAR TITLE';
              let pillBg = 'bg-emerald-600 text-white';

              if (feature.statusCode === 'YELLOW') {
                cardClasses = 'bg-amber-50 border-l-4 border-amber-500';
                headerColor = 'text-amber-700';
                headerText = '⏳ UNDER TEHSILDAR VERIFICATION';
                noteText = 'Drone 3D footprint mapped. Physical ground verification and document cross-check in progress.';
                pillText = 'PROCESSING';
                pillBg = 'bg-amber-500 text-white';
              } else if (feature.statusCode === 'RED') {
                cardClasses = 'bg-red-50 border-l-4 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
                headerColor = 'text-red-700';
                headerText = '🚨 BOUNDARY & AIRSPACE CLASH DETECTED';
                noteText = 'Action Blocked: North-East corner intersects PWD Flyover Right-of-Way (+9.2m level). Property mutation & registration are automatically frozen.';
                pillText = 'INVALID / CLASH FLAGGED';
                pillBg = 'bg-red-600 text-white';
              }

              return (
                <div className={`mx-5 mt-5 mb-1 p-3.5 shadow-sm rounded-r-lg ${cardClasses}`}>
                  <div className="flex flex-col gap-1.5 mb-2">
                     <div className={`font-bold text-sm ${headerColor}`}>{headerText}</div>
                     <div className="self-start">
                       <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide whitespace-nowrap ${pillBg}`}>
                         {pillText}
                       </span>
                     </div>
                  </div>
                  <div className="text-xs font-medium text-slate-700 leading-relaxed">{noteText}</div>
                </div>
              );
            })()}

            <div className="px-5 py-4 bg-white border-b border-slate-200">
              <h3 className="text-[11px] font-black text-[#0b2545] uppercase tracking-widest mb-3 flex items-center gap-2"><span>📐</span> Physical Dimensions</h3>
              <DetailRow label="Footprint Dimensions" value={feature.dims} />
              <DetailRow label="Ground Plot Area" value={`${feature.groundArea.toLocaleString()} m²`} />
              <DetailRow label="Total Built-Up Area" value={`${feature.totalArea.toLocaleString()} m²`} />
            </div>

            {/* ── 3D Municipal Tax & FAR Audit ───────────────────────── */}
            <div className="px-5 py-4 bg-white border-b border-slate-200">
              <h3 className="text-[11px] font-black text-[#0b2545] uppercase tracking-widest mb-3 flex items-center gap-2"><span>📊</span> 3D Municipal Tax & FAR Audit</h3>
              {(() => {
                const consumedFAR = feature.totalArea / feature.groundArea;
                const isCompliant = consumedFAR <= 2.0;
                if (isCompliant) {
                  return (
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 shadow-sm flex items-start gap-3">
                       <span className="text-xl">✅</span>
                       <div>
                         <div className="text-xs font-bold text-emerald-800">Compliant FAR: {consumedFAR.toFixed(2)} (Allowed: 2.0)</div>
                         <div className="text-[10px] font-black text-emerald-700 mt-0.5 uppercase tracking-wide">Tax Assessed: Standard Rate</div>
                       </div>
                    </div>
                  );
                } else {
                  const extraArea = feature.totalArea - (feature.groundArea * 2.0);
                  const penalty = ((extraArea * 1250) / 100000).toFixed(2);
                  return (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200 shadow-sm">
                       <div className="text-xs font-bold text-red-800 flex items-center gap-2 mb-1">
                         <span className="animate-pulse">🚨</span> ILLEGAL EXTRA FLOOR(S) DETECTED
                       </div>
                       <div className="text-[10px] font-bold text-red-600 mb-2">FAR Violation: {consumedFAR.toFixed(2)} vs 2.0 Allowed</div>
                       <div className="text-[11px] text-red-700 bg-white p-2 border border-red-100 rounded leading-relaxed">
                         <strong>Unapproved Volume:</strong> {Math.round(extraArea)} m² built-up.<br/>
                         <strong>Penalty Recovery:</strong> ₹{penalty} Lakhs under-assessed municipal tax pending.
                       </div>
                    </div>
                  );
                }
              })()}
            </div>

            <div className="px-5 py-5">
              <h3 className="text-[11px] font-black text-[#0b2545] uppercase tracking-widest mb-3 flex items-center gap-2"><span>🏢</span> Strata Floor Registry (ULPIN)</h3>
              <div className="flex flex-col gap-2">
                {feature.floors && [...feature.floors].reverse().map((floor, rIdx) => {
                  if (floor.name === "Roof Slab") return null;
                  const actualIdx = feature.floors.length - 1 - rIdx;
                  const isSplit = splitFloors.has(actualIdx);
                  
                  return (
                    <div key={actualIdx} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: floor.color.startsWith('#') ? floor.color : floor.color.replace('0.85', '1') }}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="text-xs font-bold text-slate-800 truncate mb-1">
                              {floor.name} {actualIdx === feature.floors.length - (feature.floors.length > 2 ? 2 : 1) ? "(Top)" : ""}
                            </div>
                            {!isSplit && (
                              <button 
                                onClick={() => handleSubdivide(actualIdx)} 
                                className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors"
                              >
                                ✂️ Sub-divide Unit
                              </button>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mb-1.5 uppercase tracking-wide">Elevation: {floor.min}m — {floor.max}m</div>
                          
                          {!isSplit ? (
                            <div className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block border border-orange-100">{floor.ulpin}</div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 mt-2 animate-[fade-in_0.2s_ease-out]">
                              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                                <div className="text-[10px] font-black text-blue-800 mb-0.5">UNIT 1 (North)</div>
                                <div className="font-mono text-[9px] font-bold text-blue-600 mb-2">{floor.ulpin}-U1</div>
                                <button onClick={() => setTransferUlpin(`${floor.ulpin}-U1`)} className="w-full text-[9px] font-bold bg-blue-600 hover:bg-blue-700 text-white py-1 rounded">Mutate</button>
                              </div>
                              <div className="bg-amber-50 p-2 rounded border border-amber-200">
                                <div className="text-[10px] font-black text-amber-800 mb-0.5">UNIT 2 (South)</div>
                                <div className="font-mono text-[9px] font-bold text-amber-600 mb-2">{floor.ulpin}-U2</div>
                                <button onClick={() => setTransferUlpin(`${floor.ulpin}-U2`)} className="w-full text-[9px] font-bold bg-amber-600 hover:bg-amber-700 text-white py-1 rounded">Mutate</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── LADM 3D RIGHTS TAB ──────────────────────────────────── */}
        {activeSubTab === 'LADM (Rights)' && (
          <div className="p-5 animate-[fade-in_0.2s_ease-out]">
            <h3 className="text-[11px] font-black text-[#0b2545] uppercase tracking-widest mb-4">ISO 19152 LADM RRRs Matrix</h3>
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200"></div>
              
              <div className="relative pl-10">
                <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center shadow-sm"></div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Airspace Rights (&gt;3.5m)</div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                   {totalFloors > 2 ? (
                     <div className="text-sm font-bold text-slate-800">Unit-level Strata Titles</div>
                   ) : (
                     <div className="text-sm font-bold text-slate-800">Private Airspace (Limited Z-Max)</div>
                   )}
                   <div className="text-xs text-slate-500 mt-1">Rooftop governed by Municipal RoW guidelines. Registration verified under RERA/Cooperative Act.</div>
                </div>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center shadow-sm"></div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Surface Rights (0m to 3.5m)</div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                   <div className="text-sm font-bold text-slate-800">Full Freehold Ownership</div>
                   <div className="text-xs text-slate-500 mt-1">Ground floor registered in State Land Registry. Clear surface encumbrances.</div>
                </div>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center shadow-sm"></div>
                <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Subsurface Rights (&lt;0m)</div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                   <div className="text-sm font-bold text-slate-800">State Sovereign Utility Easement</div>
                   <div className="text-xs text-slate-500 mt-1">No private excavation permitted below -2.5m. Easement Restriction: 1.5m offset required from municipal storm drain.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HAZARD AUDIT TAB ────────────────────────────────────── */}
        {activeSubTab === 'Hazard Audit' && (
          <div className="p-5 animate-[fade-in_0.2s_ease-out]">
            <h3 className="text-[11px] font-black text-[#0b2545] uppercase tracking-widest mb-4">Yamuna Flood Inundation Engine</h3>
            
            <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-center mb-6 shadow-inner">
               <div className="text-4xl mb-2">🌊</div>
               <div className="text-sm font-bold text-slate-700">Live Global Water Level</div>
               <div className="text-3xl font-black text-cyan-600">+{floodLevel.toFixed(1)}m</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Above Mean Sea Level</div>
            </div>

            <div className="mb-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Real-Time Parcel Impact</h4>
              {(() => {
                if (floodLevel === 0) {
                  return (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg shadow-sm">
                      <div className="text-sm font-bold text-emerald-800 mb-1">✅ Safe (No Inundation)</div>
                      <div className="text-xs text-emerald-700 font-medium">Topology secure. Normal operational status.</div>
                    </div>
                  );
                } else if (floodLevel > 0 && floodLevel <= 2.5) {
                  return (
                    <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg shadow-sm">
                      <div className="text-sm font-bold text-amber-800 mb-1">⚠️ Moderate Inundation Risk</div>
                      <div className="text-xs text-amber-700 font-medium">Ground Plinth Threatened. Early warning thresholds met.</div>
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-red-50 border border-red-400 p-4 rounded-lg shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full"></div>
                      <div className="text-sm font-bold text-red-700 mb-1 animate-pulse">🚨 CRITICAL HAZARD</div>
                      <div className="text-xs text-red-800 font-bold mb-2">Ground Floor Submerged.</div>
                      <div className="text-xs text-red-700 font-medium p-2 bg-red-100 rounded border border-red-200">
                        Evacuation Protocol: Retreat to 1st Floor (Safe Zone &gt; +3.5m)
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold text-center italic mt-6 px-4">
              "Demonstrates how 3D Cadastre protects insurance, disaster relief, and life-safety operations."
            </p>
          </div>
        )}

      </div>

      {/* ── Footer Actions ───────────────────────────────────────── */}
      <div className="bg-white border-t border-slate-200 p-4 flex flex-col gap-2 flex-shrink-0 print:hidden z-10 relative shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex-1 bg-[#0b2545] hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-2 rounded-lg shadow-sm transition-colors uppercase tracking-wide flex items-center justify-center gap-1.5">
            <span>🖨️</span> Bhu-Aadhaar PDF
          </button>
          <button onClick={() => setShowModal(true)} className="flex-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-bold py-2.5 px-2 rounded-lg shadow-sm transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5">
            <span>🚩</span> Flag Grievance
          </button>
        </div>
        {feature.statusCode === 'RED' ? (
          <button disabled className="w-full border border-slate-300 bg-slate-100 text-slate-400 text-xs font-bold py-2.5 px-3 rounded-lg cursor-not-allowed uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-inner">
            <span>🚫</span> MUTATION BLOCKED
          </button>
        ) : (
          <button className="w-full border-2 border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-lg transition-colors uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-sm">
            <span>✏️</span> Mutate Rights
          </button>
        )}
      </div>

      <EncroachmentModal isOpen={showModal} onClose={() => setShowModal(false)} parcel={feature} />
      <BhuAadhaarCertificate parcel={feature} />
      <TransferModal isOpen={!!transferUlpin} onClose={() => setTransferUlpin(null)} unitUlpin={transferUlpin} />
    </aside>
  );
}
