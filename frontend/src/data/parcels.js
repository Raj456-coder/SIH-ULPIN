export const EXTENDED_PARCELS = [
  // --- SLIDE 5 SPECIFIC PARCELS (MATHURA CORRIDOR GRID) ---
  {
    id: "UP26MAT1023V", ulpin: "UP26MAT1023V", name: "Parcel P-1023", owner: "State Commercial Board",
    type: "Commercial Complex (G+3)", category: "Commercial", groundArea: 945.30, totalArea: 3781.2,
    center: [77.67410, 27.49340], width: 20, length: 15, status: "Verified - Clear Title", height: 13.5,
    statusCode: "GREEN", label: "P-1023 | 945.30 m²",
    auditNote: "✅ 100% Compliant. Clean Title, Zero boundary overlap, No corridor encroachment."
  },
  {
    id: "UP26MAT1029U", ulpin: "UP26MAT1029U", name: "Parcel P-1029", owner: "Mathura Housing Society",
    type: "Multi-Unit Residential (G+3)", category: "Residential", groundArea: 944.10, totalArea: 3776.4,
    center: [77.67445, 27.49335], width: 18, length: 14, status: "Under Verification", height: 13.2,
    statusCode: "YELLOW", label: "P-1029 | 944.10 m²",
    auditNote: "⚠️ Under Verification: Drone orthomosaic survey matches, Tehsildar physical verification pending."
  },
  {
    id: "UP26MAT1027V", ulpin: "UP26MAT1027V", name: "Parcel P-1027", owner: "Corporate Office IT Park",
    type: "Corporate Office (G+3)", category: "Commercial", groundArea: 924.10, totalArea: 3696.4,
    center: [77.67480, 27.49330], width: 20, length: 14, status: "Verified - Clear Title", height: 13.0,
    statusCode: "GREEN", label: "P-1027 | 924.10 m²",
    auditNote: "✅ Verified: Sub-registrar digital signature validated. Clear airspace buffer."
  },
  {
    id: "UP26MAT1013V", ulpin: "UP26MAT1013V", name: "Parcel P-1013", owner: "Residential Block Welfare",
    type: "Residential Block (G+2)", category: "Residential", groundArea: 705.30, totalArea: 2115.9,
    center: [77.67390, 27.49230], width: 16, length: 12, status: "Verified - Clear Title", height: 10.0,
    statusCode: "GREEN", label: "P-1013 | 705.30 m²",
    auditNote: "✅ Compliant: Clear distance from metro pier buffer."
  },
  {
    id: "UP26MAT1010C", ulpin: "UP26MAT1010C", name: "Parcel P-1010", owner: "Commercial Arcade Group",
    type: "Commercial Arcade (G+3)", category: "Commercial", groundArea: 675.40, totalArea: 2701.6,
    center: [77.67435, 27.49285], width: 22, length: 16, status: "⚠️ Boundary Clash", height: 12.8,
    statusCode: "RED", label: "P-1010 | 675.40 m²",
    auditNote: "🚨 CRITICAL AIRSPACE & BOUNDARY CLASH DETECTED:\n1. North-East edge extends 1.8m into PWD Flyover Right-of-Way (RoW) buffer.\n2. Elevation overlap with proposed bridge ramp at +9.2m level.\nAction: Mutation & Registration auto-blocked by AutoTopology Engine."
  },
  {
    id: "UP26MAT1021V", ulpin: "UP26MAT1021V", name: "Parcel P-1021", owner: "Mixed Commercial Board",
    type: "Mixed Commercial (G+2)", category: "Mixed-Use", groundArea: 710.15, totalArea: 2130.45,
    center: [77.67470, 27.49240], width: 18, length: 13, status: "Verified - Clear Title", height: 9.8,
    statusCode: "GREEN", label: "P-1021 | 710.15 m²",
    auditNote: "✅ Verified: Safe proximity from underground metro tunnel entry shaft."
  }
];
