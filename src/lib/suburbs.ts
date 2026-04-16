export interface SuburbGroup {
  label: string;
  suburbs: string[];
}

export const SUBURB_GROUPS: SuburbGroup[] = [
  {
    label: "City Bowl & Surrounds",
    suburbs: ["Gardens", "Bo-Kaap", "Tamboerskloof", "Woodstock", "Observatory", "Rondebosch", "Claremont", "Newlands"],
  },
  {
    label: "Atlantic Seaboard",
    suburbs: ["Sea Point", "Green Point", "Camps Bay", "Mouille Point"],
  },
  {
    label: "Southern Suburbs",
    suburbs: ["Plumstead", "Bergvliet", "Constantia", "Tokai"],
  },
  {
    label: "Northern Suburbs",
    suburbs: ["Bellville", "Durbanville", "Brackenfell", "Parow", "Goodwood", "Kraaifontein", "Kuils River", "Plattekloof", "Panorama", "Welgemoed", "Tyger Valley", "Edgemead"],
  },
  {
    label: "West Coast / Blaauwberg",
    suburbs: ["Table View", "Blouberg", "Milnerton", "Parklands", "Sunningdale"],
  },
  {
    label: "Cape Flats",
    suburbs: ["Khayelitsha", "Mitchells Plain", "Belhar", "Delft", "Ravensmead", "Elsie's River", "Eersterivier", "Gugulethu", "Blue Downs", "Mfuleni", "Phillippi", "Manenberg", "Lotus River"],
  },
];

export const ALL_SUBURBS = SUBURB_GROUPS.flatMap(g => g.suburbs);
