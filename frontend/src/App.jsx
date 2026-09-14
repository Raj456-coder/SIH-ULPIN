import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import { EXTENDED_PARCELS } from './data/parcels';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Tab Error caught by App ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-800 w-full h-full flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><span>🚨</span> Application Render Error</h2>
          <p className="text-sm font-medium opacity-90 mb-6 bg-red-100 p-4 rounded-lg border border-red-200">
            {this.state.error?.toString()}
          </p>
          <button 
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-sm transition-colors" 
            onClick={() => this.setState({hasError: false})}
          >
            Retry Render
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const TABS = ['Dashboard', '3D Map View', 'Parcel Registry', 'Mutation Records', 'Reports & Analytics', 'Admin'];

function MutationRecordsTab({ navigateToMap }) {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const cases = [
    {
      id: 'MUT-8841', parcel: 'UP26MAT1029U', displayParcel: 'UP26MAT1029U (P-1029)',
      type: 'Vertical Sub-division (Flat 201 & 202)', applicant: 'Alok Kumar Verma', date: '08 Sep 2026',
      status: 'Under Review', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200', badgeLabel: '⏳ UNDER TEHSILDAR REVIEW',
      note: 'Drone 3D footprint mapped; Field survey verification pending.',
      btnText: 'Inspect in 3D'
    },
    {
      id: 'MUT-8842', parcel: 'UP26MAT1023V', displayParcel: 'UP26MAT1023V (P-1023)',
      type: 'Commercial Retail Ownership Transfer (Ground Floor)', applicant: 'Mathura Retail Ventures Ltd', date: '10 Sep 2026',
      status: 'Approved', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', badgeLabel: '✅ AUTO-APPROVED',
      note: '100% Conflict-free topology validated via Shapely. Title mutated instantaneously.',
      btnText: 'Inspect in 3D'
    },
    {
      id: 'MUT-8843', parcel: 'UP26MAT1010C', displayParcel: 'UP26MAT1010C (P-1010)',
      type: 'Multi-Story Mutation (Commercial Arcade Floor 3)', applicant: 'Vikas Aggarwal', date: '11 Sep 2026',
      status: 'Blocked', badgeColor: 'bg-red-100 text-red-800 border-red-200 shadow-[0_0_8px_rgba(239,68,68,0.3)]', badgeLabel: '🚨 AUTO-BLOCKED / REJECTED',
      note: 'CRITICAL AIRSPACE CLASH: Building violates PWD Flyover RoW (+9.2m level). Registration frozen.',
      btnText: 'Inspect Clash in 3D'
    },
    {
      id: 'MUT-8844', parcel: 'UP26MAT1013V', displayParcel: 'UP26MAT1013V (P-1013)',
      type: 'Family Partition Deed (G+2 Residential)', applicant: 'Rajeshwar Dayal Sharma', date: '05 Sep 2026',
      status: 'Approved', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', badgeLabel: '✅ AUTO-APPROVED',
      note: 'Boundary clearances verified; Digital khatauni updated.',
      btnText: 'Inspect in 3D'
    },
    {
      id: 'MUT-8845', parcel: 'UP26MAT1021V', displayParcel: 'UP26MAT1021V (P-1021)',
      type: 'Land Use Conversion (Mixed Residential to Clinic)', applicant: 'Dr. N. K. Bansal Memorial Trust', date: '09 Sep 2026',
      status: 'Under Review', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200', badgeLabel: '⏳ PENDING MUNICIPAL NOC',
      note: 'Awaiting traffic ingress safety certificate.',
      btnText: 'Inspect in 3D'
    },
    {
      id: 'MUT-8846', parcel: 'UP26MAT0056705', displayParcel: 'UP26MAT0056705',
      type: 'Industrial Warehouse Long-Term Lease', applicant: 'Brij Agritech Logistics Ltd', date: '11 Sep 2026',
      status: 'Approved', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', badgeLabel: '✅ AUTO-APPROVED',
      note: 'Industrial buffer zoning verified.',
      btnText: 'Inspect in 3D'
    }
  ];

  const filteredCases = cases.filter(c => {
    const matchesFilter = filter === 'All' || c.status === filter;
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.parcel.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.applicant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full h-full overflow-y-auto p-10 bg-slate-50">
      
      {/* Executive Summary Metric Bar */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-[#0b2545]">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Applications</div>
          <div className="text-2xl font-black text-[#0b2545]">6 Active</div>
        </div>
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 shadow-sm border-l-4 border-l-emerald-500">
          <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Auto-Approved</div>
          <div className="text-2xl font-black text-emerald-600">3 Verified</div>
        </div>
        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm border-l-4 border-l-amber-500">
          <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Tehsildar Review</div>
          <div className="text-2xl font-black text-amber-600">2 Pending</div>
        </div>
        <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm border-l-4 border-l-red-500">
          <div className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Auto-Blocked / Clash</div>
          <div className="text-2xl font-black text-red-600">1 Critical</div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#0b2545] tracking-tight">Mutation Records</h2>
          <p className="text-slate-500 font-medium mt-1">Live Sub-Registrar Queues and Automated 3D Topology Actions</p>
        </div>
      </div>

      {/* Filterable Tab Bar + Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          {['All', 'Approved', 'Under Review', 'Blocked'].map(f => {
            const count = cases.filter(c => f === 'All' || c.status === f).length;
            const label = f === 'All' ? 'All Applications' : f === 'Approved' ? 'Auto-Approved' : f === 'Under Review' ? 'Under Review' : 'Blocked';
            return (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${filter === f ? 'bg-[#0b2545] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
        <div className="relative w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search by App #MUT, ULPIN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Rich Mutation Dataset */}
      <div className="flex flex-col gap-4">
        {filteredCases.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-blue-300 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-black text-sm text-[#0b2545]">Case #{c.id}</span>
                  <span className="text-xs font-bold text-slate-300">|</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">{c.displayParcel}</span>
                  <span className="text-xs font-bold text-slate-300">|</span>
                  <span className="text-xs font-bold text-slate-500">Applied: {c.date}</span>
                </div>
                <div className="text-sm font-bold text-slate-800">{c.type}</div>
                <div className="text-xs font-medium text-slate-500 mt-1">Applicant: <span className="text-slate-700 font-bold">{c.applicant}</span></div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-black tracking-widest border ${c.badgeColor}`}>
                  {c.badgeLabel}
                </span>
                <button 
                  onClick={() => navigateToMap(c.parcel)}
                  className={`px-4 py-2 text-xs font-bold rounded shadow-sm transition-colors flex items-center gap-2 ${
                    c.status === 'Blocked' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-[#0b2545] hover:bg-blue-900 text-white'
                  }`}
                >
                  <span>{c.status === 'Blocked' ? '🚨' : '🌐'}</span>
                  {c.btnText}
                </button>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-sm font-medium text-slate-600 border border-slate-100 flex items-start gap-2">
              <span className="mt-0.5">📋</span>
              <div>
                <strong className="text-slate-800">Action/Remarks:</strong> {c.note}
              </div>
            </div>
          </div>
        ))}
        {filteredCases.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
            No mutation cases found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('3D Map View');
  const [targetParcelId, setTargetParcelId] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [floorExplosion, setFloorExplosion] = useState(0);
  
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryFilter, setRegistryFilter] = useState('All');

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navigateToMap = (id) => {
    setTargetParcelId(id);
    setActiveTab('3D Map View');
  };

  const handleSidebarClose = () => {
    setSelectedParcel(null);
    setTargetParcelId('RESET'); // Triggers MapComponent to clear floors and reset camera
  };

  const SafeMapComponent = MapComponent || (() => <div className="p-8 font-bold text-red-500">MapComponent failed to load.</div>);
  const SafeSidebar = Sidebar || (() => <div className="p-8 font-bold text-red-500">Sidebar failed to load.</div>);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* ── National MoRD Header ────────────────────────────────────────────────── */}
      <header className="bg-[#0b2545] text-white flex-shrink-0 shadow-lg z-20 flex flex-col">
        {/* Top Branding Row */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1.5 shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#0b2545] animate-[spin_30s_linear_infinite]">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4"/>
                <circle cx="50" cy="50" r="8" fill="currentColor"/>
                {Array.from({ length: 24 }).map((_, i) => (
                  <line key={i} x1="50" y1="50" 
                    x2={50 + 45 * Math.cos(i * 15 * Math.PI / 180)} 
                    y2={50 + 45 * Math.sin(i * 15 * Math.PI / 180)} 
                    stroke="currentColor" strokeWidth="1.5" />
                ))}
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black tracking-widest text-orange-400">भारत सरकार • GOVERNMENT OF INDIA</h1>
              <h2 className="text-[13px] font-bold tracking-wide text-slate-200 mt-0.5">
                National 3D Cadastral & ULPIN Management System (DoLR — MoRD)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6 h-full">
            <div className="flex flex-col justify-center text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">State / District Selector</span>
              <select className="bg-slate-800/80 border border-slate-600 text-white text-[13px] font-bold rounded-md px-3 py-1.5 outline-none hover:border-slate-400 transition-colors cursor-pointer appearance-none">
                <option>Uttar Pradesh / Mathura (Pilot)</option>
                <option>Maharashtra / Pune</option>
                <option>Delhi NCR / Central</option>
                <option>Karnataka / Bengaluru</option>
              </select>
            </div>
            <div className="h-10 border-l border-slate-600"></div>
            <div className="flex items-center gap-2.5 bg-emerald-900/50 border border-emerald-500/50 px-4 py-2 rounded-lg shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Topology: 100% Conflict-Free</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Row */}
        <nav className="flex px-6 bg-[#061833]">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-[13px] uppercase tracking-wide font-bold border-b-4 transition-colors duration-200 ${
                activeTab === tab 
                  ? 'border-orange-500 text-orange-400 bg-white/5' 
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500 hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Main Flex Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 relative min-h-0 w-full">
        <ErrorBoundary>
          
          {/* 1. 3D MAP VIEW */}
          <div className={`w-full h-full flex ${activeTab === '3D Map View' ? '' : 'hidden'}`}>
            <div className="flex-1 relative h-full">
              <SafeMapComponent 
                targetParcelId={targetParcelId}
                floorExplosion={floorExplosion}
                onParcelSelect={setSelectedParcel}
                clearTarget={() => setTargetParcelId(null)}
              />
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 w-[420px] border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[11px] font-black text-[#0b2545] uppercase tracking-widest flex items-center gap-1.5">
                    <span className="text-sm">🏢</span> Vertical Floor Exploder
                  </label>
                  <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
                    {floorExplosion}m Gap
                  </span>
                </div>
                <input 
                  type="range" min="0" max="15" step="0.5" 
                  value={floorExplosion} 
                  onChange={e => setFloorExplosion(Number(e.target.value))} 
                  className="w-full accent-[#0b2545] h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                />
              </div>
            </div>
            {selectedParcel && (
              <SafeSidebar feature={selectedParcel} onClose={handleSidebarClose} />
            )}
          </div>

          {/* 2. DASHBOARD */}
          {activeTab === 'Dashboard' && (
            <div className="w-full h-full overflow-y-auto p-10 bg-slate-50">
              <h2 className="text-3xl font-black text-[#0b2545] tracking-tight mb-8">System Dashboard</h2>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                     <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Total 3D Parcels</div>
                     <div className="text-4xl font-black text-blue-600">1,442</div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                     <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Verified Titles</div>
                     <div className="text-4xl font-black text-emerald-600">1,420</div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98.4%' }}></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                     <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">High-Risk Buffer Violations</div>
                     <div className="text-4xl font-black text-red-600">22</div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '1.6%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-[11px] font-black text-[#0b2545] uppercase tracking-widest mb-6">Recent System Activity Timeline</h3>
                
                <div className="relative border-l-2 border-slate-200 ml-3 flex flex-col gap-8">
                  <div className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                    <div className="text-xs font-bold text-red-600 mb-0.5">12 mins ago</div>
                    <div className="text-sm font-bold text-slate-800">Auto-blocked P-1010 Mutation</div>
                    <div className="text-xs text-slate-500 font-medium">Critical topological clash: Encroaches NH-19 Right-of-Way (+9.2m airspace level). Registry API frozen.</div>
                  </div>
                  
                  <div className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                    <div className="text-xs font-bold text-emerald-600 mb-0.5">45 mins ago</div>
                    <div className="text-sm font-bold text-slate-800">Verified Parcel P-1023</div>
                    <div className="text-xs text-slate-500 font-medium">Commercial title transfer automated. 0.0m overlaps detected by Shapely engine. Approved.</div>
                  </div>

                  <div className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                    <div className="text-xs font-bold text-blue-600 mb-0.5">2 hours ago</div>
                    <div className="text-sm font-bold text-slate-800">System Batch Sync</div>
                    <div className="text-xs text-slate-500 font-medium">Ingested 150 new footprint records from Mathura Urban drone orthomosaic survey.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. PARCEL REGISTRY */}
          {activeTab === 'Parcel Registry' && (() => {
            const categories = ['All', 'Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Special Corridor', 'Institutional'];
            const filteredParcels = EXTENDED_PARCELS.filter(p => {
              const matchesSearch = p.ulpin.toLowerCase().includes(registrySearch.toLowerCase()) || 
                                    p.name.toLowerCase().includes(registrySearch.toLowerCase()) || 
                                    p.owner.toLowerCase().includes(registrySearch.toLowerCase());
              const matchesFilter = registryFilter === 'All' || p.category === registryFilter;
              return matchesSearch && matchesFilter;
            });

            return (
              <div className="w-full h-full flex flex-col p-8 bg-slate-50">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0b2545] mb-2">Mathura Parcel Registry</h2>
                    <p className="text-sm font-medium text-slate-500">Managing {filteredParcels.length} active cadastral records</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                      <input 
                        type="text" 
                        placeholder="Search ULPIN, Owner, or Property..." 
                        value={registrySearch}
                        onChange={e => setRegistrySearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-72 focus:ring-2 focus:ring-[#0b2545] outline-none shadow-sm"
                      />
                    </div>
                    <select 
                      value={registryFilter}
                      onChange={e => setRegistryFilter(e.target.value)}
                      className="border border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-[#0b2545] outline-none shadow-sm bg-white"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100 text-slate-500 text-[11px] uppercase tracking-widest font-black sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4">ULPIN (14-digit)</th>
                          <th className="px-6 py-4">Property Details</th>
                          <th className="px-6 py-4">Type / Category</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredParcels.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-[#0b2545]">{p.ulpin}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{p.name}</div>
                              <div className="text-xs text-slate-500 font-medium">{p.owner}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-bold text-slate-700">{p.type}</div>
                              <div className="text-[10px] uppercase font-black text-slate-400 tracking-wide">{p.category}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-black tracking-wider ${
                                p.status.includes('⚠️') ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => navigateToMap(p.id)} 
                                className="inline-flex bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded shadow-sm text-xs items-center gap-1.5 transition-colors uppercase tracking-wide"
                              >
                                <span>🔍</span> View in 3D
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredParcels.length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                              No parcels found matching your filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 4. MUTATION RECORDS */}
          {activeTab === 'Mutation Records' && (
            <MutationRecordsTab navigateToMap={navigateToMap} />
          )}

          {/* 5. REPORTS & ANALYTICS */}
          {activeTab === 'Reports & Analytics' && (() => {
            const handleExcelDownload = () => {
              const headers = "ULPIN,Parcel ID,Owner Name,Category,Floor Count,Ground Area (sq.m),Built-up Area (sq.m),Topology Status,Airspace Clearance,Action Date\n";
              const rows = EXTENDED_PARCELS.map(p => {
                 const floors = Math.max(1, Math.round(p.height / 3.2));
                 const status = p.status.includes('⚠️') ? 'Clash Detected' : 'Verified';
                 return `"${p.ulpin}","${p.id}","${p.owner}","${p.category}","${floors}","${p.groundArea.toFixed(2)}","${(p.groundArea * floors).toFixed(2)}","${p.status}","${status}","${new Date().toLocaleDateString()}"`;
              }).join("\n");
              
              const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", "Mathura_Cadastral_Audit_Report_2026.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div className="w-full h-full overflow-y-auto p-10 bg-slate-50 print-container">
                <div className="print:hidden flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-[#0b2545] tracking-tight">Executive Audit Reports</h2>
                    <p className="text-slate-500 font-medium mt-1">Live data fetched from Mathura Pilot Phase 1</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => { showToast('Preparing PDF Report...'); setTimeout(() => window.print(), 500); }} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-5 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2">
                      <span>🖨️</span> Download PDF Report
                    </button>
                    <button onClick={() => { showToast('Exporting Mathura_Cadastral_Audit_Report_2026.csv...'); handleExcelDownload(); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2">
                      <span>📊</span> Download Excel Data
                    </button>
                  </div>
                </div>

                {/* Printable Header - hidden on screen, block on print */}
                <div className="hidden print:block mb-8 text-center border-b-2 border-slate-800 pb-6">
                  <h1 className="text-2xl font-black uppercase tracking-widest">GOVERNMENT OF UTTAR PRADESH</h1>
                  <h2 className="text-lg font-bold uppercase tracking-wide mt-1">Revenue & Cadastral Audit Report</h2>
                  <div className="flex justify-between mt-6 text-sm font-bold text-slate-600">
                    <span>Pilot District: Mathura Urban Pilot</span>
                    <span>Timestamp: {new Date().toLocaleString()}</span>
                  </div>
                </div>

                {/* Executive Metric Cards */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-blue-600">
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mathura Urban 3D Coverage</div>
                     <div className="text-3xl font-black text-[#0b2545]">98.4%</div>
                     <div className="text-xs text-slate-400 font-medium mt-1">1,420 / 1,442 Parcels Mapped</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-red-500">
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active 3D Conflict Rate</div>
                     <div className="text-3xl font-black text-red-600">1.6%</div>
                     <div className="text-xs text-slate-400 font-medium mt-1">22 Airspace/Subsurface Clashes</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-emerald-500">
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Auto-Mutation Approval</div>
                     <div className="text-3xl font-black text-emerald-600">86.2%</div>
                     <div className="text-xs text-slate-400 font-medium mt-1">Cleared without manual review</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-orange-500">
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Revenue Assessed</div>
                     <div className="text-3xl font-black text-orange-600">₹42.8 Cr</div>
                     <div className="text-xs text-slate-400 font-medium mt-1">Based on dynamic 3D volumetric FAR</div>
                  </div>
                </div>

                {/* Zone-wise Compliance Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h3 className="font-bold text-[#0b2545]">Zone-wise Compliance Summary</h3>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                      <tr>
                        <th className="px-6 py-3">Zone Classification</th>
                        <th className="px-6 py-3">Mapped Units</th>
                        <th className="px-6 py-3">Conflict-Free</th>
                        <th className="px-6 py-3">Clash Flagged</th>
                        <th className="px-6 py-3 text-right">Topology Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="px-6 py-4">Zone A - City Center</td>
                        <td className="px-6 py-4 text-slate-600">452</td>
                        <td className="px-6 py-4 text-emerald-600">448</td>
                        <td className="px-6 py-4 text-red-500">4</td>
                        <td className="px-6 py-4 text-right font-bold text-[#0b2545]">99.1%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4">Zone B - NH-19 Highway Corridor</td>
                        <td className="px-6 py-4 text-slate-600">328</td>
                        <td className="px-6 py-4 text-emerald-600">312</td>
                        <td className="px-6 py-4 text-red-500">16</td>
                        <td className="px-6 py-4 text-right font-bold text-[#0b2545]">95.1%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4">Zone C - Industrial Block</td>
                        <td className="px-6 py-4 text-slate-600">662</td>
                        <td className="px-6 py-4 text-emerald-600">660</td>
                        <td className="px-6 py-4 text-red-500">2</td>
                        <td className="px-6 py-4 text-right font-bold text-[#0b2545]">99.6%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <style>{`
                  @media print {
                    @page { size: landscape; margin: 10mm; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                    /* Hide everything except print-container */
                    body > * { display: none !important; }
                    body > #root { display: block !important; }
                    header, nav, .print\\:hidden { display: none !important; }
                    .print-container { position: absolute; left: 0; top: 0; width: 100%; display: block !important; overflow: visible; padding: 0 !important; }
                  }
                `}</style>
              </div>
            );
          })()}

          {/* 6. ADMIN */}
          {activeTab === 'Admin' && (
            <div className="w-full h-full overflow-y-auto p-10 bg-slate-50">
              <h2 className="text-2xl font-bold text-[#0b2545] mb-8">System Configuration</h2>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-2xl">
                <div className="flex justify-between py-4 border-b border-slate-100">
                  <span className="font-bold text-slate-600 text-sm">DoLR Gateway Status</span>
                  <span className="flex items-center gap-2 text-[11px] tracking-wide uppercase font-black text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                  </span>
                </div>
                <div className="flex justify-between py-4 border-b border-slate-100">
                  <span className="font-bold text-slate-600 text-sm">Coordinate Reference System</span>
                  <span className="text-sm font-mono font-bold text-[#0b2545]">EPSG:4326 (WGS84)</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="font-bold text-slate-600 text-sm">Current Active Role</span>
                  <span className="text-[11px] uppercase tracking-wide font-black text-[#0b2545] bg-slate-100 border border-slate-200 px-3 py-1 rounded">
                    Sub-Registrar
                  </span>
                </div>
              </div>
            </div>
          )}

        </ErrorBoundary>
      </div>
      
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-[#0b2545] text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-[fade-in_0.2s_ease-out]">
          <span className="text-emerald-400">✅</span>
          <span className="text-sm font-bold tracking-wide">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
