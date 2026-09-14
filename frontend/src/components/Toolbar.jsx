import React from "react";

// ── Property type colour dots ──────────────────────────────────────────────
const TYPE_DOTS = {
  "Surface":       "bg-blue-500",
  "Vertical Unit": "bg-orange-500",
  "Subsurface":    "bg-amber-500",
};

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-1">
      <span className="text-base">{icon}</span>
      <span className="text-xs font-bold text-navy uppercase tracking-widest">{title}</span>
    </div>
  );
}

export default function Toolbar({
  floorExplosion,
  onFloorExplosionChange,
  xRayMode,
  onXRayToggle,
  topology,
  parcels,
  onParcelSelect,
}) {
  const features = parcels?.features ?? [];

  // Group parcels by type for the legend
  const groups = features.reduce((acc, f) => {
    const t = f.properties.property_type;
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col overflow-y-auto flex-shrink-0 shadow-sm">

      {/* ── Topology Health ──────────────────────────────────── */}
      <div className="p-3 border-b border-slate-100">
        <SectionHeader icon="🔬" title="Topology Engine" />
        {topology ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-800 text-xs font-bold">Health Score</span>
              <span className="text-green-800 text-lg font-black">{topology.health_score}%</span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${topology.health_score}%` }}
              />
            </div>
            <div className={`text-xs font-semibold px-2 py-1 rounded text-center ${
              topology.conflicts_found === 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
              {topology.message}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-slate-600">
              <div>Parcels: <strong>{topology.total_parcels}</strong></div>
              <div>Pairs: <strong>{topology.total_pairs_checked}</strong></div>
              <div>Conflicts: <strong className={topology.conflicts_found > 0 ? "text-red-600" : "text-green-600"}>{topology.conflicts_found}</strong></div>
              <div>Status: <strong className="text-green-700">{topology.status}</strong></div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-100 rounded-lg p-3 text-xs text-slate-500 text-center">
            Connecting to topology engine…
          </div>
        )}
      </div>

      {/* ── Floor Exploder ───────────────────────────────────── */}
      <div className="p-3 border-b border-slate-100">
        <SectionHeader icon="🏢" title="Floor Exploder" />
        <p className="text-xs text-slate-500 mb-3">
          Visually separate stacked floor units along the Z-axis.
        </p>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-slate-400 w-6">0m</span>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={floorExplosion}
            onChange={(e) => onFloorExplosionChange(Number(e.target.value))}
            className="flex-1 accent-navy h-2 cursor-pointer"
            aria-label="Floor explosion offset in metres"
          />
          <span className="text-xs text-slate-400 w-8 text-right">50m</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">Separation Offset</span>
          <span className="font-mono text-sm font-bold text-navy bg-slate-100 px-2 py-0.5 rounded">
            +{floorExplosion}m
          </span>
        </div>
        {floorExplosion > 0 && (
          <div className="mt-2 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-1">
            ⚡ Floors exploded — visual mode only
          </div>
        )}
      </div>

      {/* ── Subsurface X-Ray ─────────────────────────────────── */}
      <div className="p-3 border-b border-slate-100">
        <SectionHeader icon="🔦" title="Subsurface X-Ray" />
        <p className="text-xs text-slate-500 mb-3">
          Lower globe opacity to reveal underground utility parcels in amber.
        </p>
        <button
          onClick={onXRayToggle}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border-2 ${
            xRayMode
              ? "bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-200"
              : "bg-slate-100 border-slate-200 text-slate-700 hover:border-navy hover:bg-slate-50"
          }`}
          aria-pressed={xRayMode}
        >
          <span className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full border-2 transition-all ${xRayMode ? "bg-white border-white" : "bg-slate-400 border-slate-400"}`} />
            {xRayMode ? "X-Ray Active" : "Activate X-Ray"}
          </span>
          <span className="text-lg">{xRayMode ? "🔆" : "🔇"}</span>
        </button>
        {xRayMode && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            Globe opacity: 40% · Subsurface parcels highlighted in <strong>amber</strong>
          </div>
        )}
      </div>

      {/* ── Parcel Legend / List ─────────────────────────────── */}
      <div className="p-3 border-b border-slate-100 flex-1">
        <SectionHeader icon="📋" title="Parcel Registry" />
        <div className="flex gap-2 mb-3 flex-wrap">
          {Object.entries(groups).map(([type, count]) => (
            <span key={type} className="flex items-center gap-1 text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
              <span className={`w-2 h-2 rounded-full ${TYPE_DOTS[type] ?? "bg-slate-400"}`} />
              {type} ({count})
            </span>
          ))}
        </div>

        <div className="space-y-1.5">
          {features.map((f) => {
            const p = f.properties;
            return (
              <button
                key={p.ulpin}
                onClick={() => onParcelSelect({ id: p.ulpin, properties: p })}
                className="w-full text-left bg-slate-50 hover:bg-navy hover:text-white border border-slate-200 hover:border-navy rounded-lg px-3 py-2.5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: p.color ?? "#64748b" }}
                  />
                  <span className="font-mono text-xs font-bold group-hover:text-orange-300 truncate">
                    {p.ulpin}
                  </span>
                </div>
                <div className="text-xs text-slate-500 group-hover:text-white/80 mt-0.5 truncate pl-4">
                  {p.owner_name}
                </div>
                <div className="flex items-center justify-between mt-1 pl-4">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_DOTS[p.property_type] ? "bg-slate-200 group-hover:bg-white/20 text-slate-600 group-hover:text-white" : ""}`}>
                    {p.property_type}
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-white/60">
                    {p.z_min}m → {p.z_max}m
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Map Controls hint ────────────────────────────────── */}
      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-500">🖱 Left-click</strong> a parcel or 3D building to select · <strong className="text-slate-500">Right-drag</strong> to tilt · <strong className="text-slate-500">Scroll</strong> to zoom
        </p>
      </div>
    </aside>
  );
}
