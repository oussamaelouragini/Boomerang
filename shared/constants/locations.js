export const LOCATIONS = [
  { building: "Epi Business", areas: ["Coworking", "Library", "Cafeteria"] },
  { building: "Epi Digital & Technique", areas: ["Coworking", "Library", "Cafeteria"] },
  { building: "Epi Polytechnique", areas: ["Coworking", "Library 1", "Library 2", "Cafeteria"] },
  { building: "Epi Stadium", areas: ["Main Field", "Entrance"] },
];

export const BUILDINGS = LOCATIONS.map((l) => l.building);

export const getAreas = (building) => {
  const loc = LOCATIONS.find((l) => l.building === building);
  return loc ? loc.areas : [];
};
