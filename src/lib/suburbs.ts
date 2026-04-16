export interface SuburbGroup {
  label: string;
  suburbs: string[];
}

export const SUBURB_GROUPS: SuburbGroup[] = [
  {
    label: "City Bowl & Surrounds",
    suburbs: ["Gardens", "Bo-Kaap", "Tamboerskloof", "Woodstock", "Observatory", "Rondebosch", "Claremont", "Newlands", "Vredehoek", "Oranjezicht", "De Waterkant", "District Six", "Devil's Peak Estate", "Walmer Estate", "Higgovale", "Schotsche Kloof", "University Estate", "Zonnebloem"],
  },
  {
    label: "Atlantic Seaboard",
    suburbs: ["Sea Point", "Green Point", "Camps Bay", "Mouille Point", "Hout Bay", "Clifton", "Fresnaye", "Bantry Bay", "Bakoven", "Llandudno", "Three Anchor Bay"],
  },
  {
    label: "Southern Suburbs",
    suburbs: ["Plumstead", "Bergvliet", "Constantia", "Tokai", "Pinelands", "Mowbray", "Observatory", "Kenilworth", "Wynberg", "Bishopscourt", "Lansdowne", "Diep River", "Ottery", "Meadowridge", "Zeekoevlei", "Grassy Park", "Rosebank"],
  },
  {
    label: "Northern Suburbs",
    suburbs: ["Bellville", "Durbanville", "Brackenfell", "Parow", "Goodwood", "Kraaifontein", "Kuils River", "Plattekloof", "Panorama", "Welgemoed", "Tyger Valley", "Edgemead", "Brooklyn", "Bothasig", "Monte Vista"],
  },
  {
    label: "West Coast / Blaauwberg",
    suburbs: ["Table View", "Blouberg", "Milnerton", "Parklands", "Sunningdale", "Big Bay", "Century City"],
  },
  {
    label: "Cape Flats",
    suburbs: ["Khayelitsha", "Mitchells Plain", "Belhar", "Delft", "Ravensmead", "Elsie's River", "Eersterivier", "Gugulethu", "Blue Downs", "Mfuleni", "Philippi", "Manenberg", "Lotus River", "Athlone", "Langa", "Heideveld", "Lavender Hill", "Bonteheuwel", "Crossroads", "Hanover Park"],
  },
];

export const ALL_SUBURBS = SUBURB_GROUPS.flatMap(g => g.suburbs);
