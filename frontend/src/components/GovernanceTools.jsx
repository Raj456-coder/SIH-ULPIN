import React from 'react';

export const EncroachmentModal = ({ isOpen, onClose, parcel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="bg-[#0b2545] p-5 flex justify-between items-center">
          <h3 className="text-white font-black tracking-wide flex items-center gap-2">
            <span>🚩</span> Flag Vertical Encroachment
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm font-bold mb-5 shadow-sm">
            Issuing Official Notice for: {parcel?.ulpin || 'Selected Parcel'}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Encroachment Type</label>
              <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option>Airspace Violation (Balcony / Overhang)</option>
                <option>Right-of-Way (RoW) Projection</option>
                <option>Unauthorized Extra Floor</option>
                <option>Subsurface Utility Clash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Field Officer Remarks</label>
              <textarea rows="3" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Detail the structural breach..."></textarea>
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition-colors text-sm">
                Issue Digital Notice
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const TransferModal = ({ isOpen, onClose, unitUlpin }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="bg-emerald-700 p-5 flex justify-between items-center">
          <h3 className="text-white font-black tracking-wide flex items-center gap-2">
            <span>📝</span> Mutate / Transfer Strata Unit
          </h3>
          <button onClick={onClose} className="text-emerald-200 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-lg text-sm font-bold mb-5 shadow-sm">
            Sub-divided Strata ULPIN: <span className="text-emerald-700 font-mono">{unitUlpin}</span>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">New Buyer Name / Aadhaar</label>
              <input type="text" required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="e.g. Ramesh Kumar (XXXX-XXXX-1234)"/>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Deed Value (₹)</label>
              <input type="number" required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="e.g. 4500000"/>
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors text-sm">Execute Mutation</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export const BhuAadhaarCertificate = ({ parcel }) => {
  if (!parcel) return null;
  const height = parcel.height || (parcel.floors ? (parcel.floors.length - 1) * 3.2 : 0);
  const totalVol = Math.round((parcel.groundArea || 0) * height);
  
  return (
    <div className="hidden print:block absolute inset-0 bg-white z-[99999] p-12 print-container" style={{ WebkitPrintColorAdjust: 'exact' }}>
      <div className="border-8 border-double border-[#0b2545] p-10 h-full flex flex-col relative">
        <div className="absolute top-10 right-10 w-24 h-24 border-2 border-slate-900 p-1 bg-slate-50 flex items-center justify-center">
           <svg viewBox="0 0 100 100" className="w-full h-full opacity-80"><rect width="100" height="100" fill="none" stroke="currentColor" strokeWidth="4"/><path d="M20 20h20v20H20zM60 20h20v20H60zM20 60h20v20H20zM45 45h10v10H45z" fill="currentColor"/></svg>
           <div className="absolute bottom-[-20px] text-[8px] font-mono font-bold w-full text-center">SCAN TO VERIFY</div>
        </div>

        <div className="text-center mb-12 border-b-2 border-slate-300 pb-8">
          <h1 className="text-2xl font-black uppercase tracking-widest text-[#0b2545] mb-2">Department of Land Resources (DoLR)</h1>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-6">Ministry of Rural Development, Government of India</h2>
          <h3 className="text-3xl font-black uppercase tracking-tight text-[#0b2545]">National 3D Volumetric Bhu-Aadhaar</h3>
          <h4 className="text-xl font-bold uppercase tracking-widest text-emerald-700 mt-2">Record of Rights (RoR) Certificate</h4>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-12 flex-1">
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-200 pb-1">Bhu-Aadhaar (ULPIN)</div>
            <div className="text-xl font-mono font-black text-[#0b2545]">{parcel.ulpin || parcel.id}</div>
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-200 pb-1">Property Name / ID</div>
            <div className="text-xl font-bold text-slate-800">{parcel.name || parcel.id}</div>
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-200 pb-1">Spatial Reference System</div>
            <div className="text-lg font-bold text-slate-800">EPSG:4326 (WGS84) / UTM Zone 43N</div>
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-200 pb-1">Registered Owner(s)</div>
            <div className="text-lg font-bold text-slate-800">{parcel.owner || "Multiple (Strata Titles)"}</div>
          </div>
          
          <div className="col-span-2 mt-4">
            <h4 className="font-black text-lg text-[#0b2545] mb-4 uppercase tracking-widest bg-slate-100 py-2 px-4 border-l-4 border-[#0b2545]">3D Volumetric Extents & Matrix</h4>
            <div className="grid grid-cols-3 gap-6 px-4">
               <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Base Z-Min (MSL)</div>
                  <div className="text-xl font-black text-slate-800">0.00m</div>
               </div>
               <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Apex Z-Max (MSL)</div>
                  <div className="text-xl font-black text-slate-800">{height.toFixed(2)}m</div>
               </div>
               <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Enclosed Volume</div>
                  <div className="text-xl font-black text-emerald-700">{totalVol.toLocaleString()} m³</div>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-auto border-t-2 border-slate-300 pt-8 flex justify-between items-end">
          <div>
             <div className="text-xs font-bold text-slate-500 mb-1">Timestamp: {new Date().toLocaleString()}</div>
             <div className="text-xs font-bold text-slate-500">Pilot District: Mathura Urban Phase-1</div>
          </div>
          <div className="text-right">
             <div className="text-lg font-black text-blue-800 italic mb-2">"Digitally signed via State Spatial Data Infrastructure (SSDI)"</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid for official municipal clearance & strata mutations</div>
          </div>
        </div>
      </div>
    </div>
  );
};
