export interface SuburbGroup {
  label: string;
  suburbs: string[];
}

export const SUBURB_GROUPS: SuburbGroup[] = [
  {
    label: "Atlantic Seaboard",
    suburbs: ["Bakoven", "Bantry Bay", "Camps Bay", "Clifton", "Fresnaye", "Green Point", "Hout Bay", "Llandudno", "Mouille Point", "Sea Point", "Three Anchor Bay"],
  },
  {
    label: "Cape Flats",
    suburbs: ["Athlone", "Belhar", "Blue Downs", "Bonteheuwel", "Crossroads", "Delft", "Eersterivier", "Elsie's River", "Gugulethu", "Hanover Park", "Heideveld", "Khayelitsha", "Langa", "Lavender Hill", "Lotus River", "Manenberg", "Mfuleni", "Mitchells Plain", "Philippi", "Ravensmead"],
  },
  {
    label: "City Bowl & Surrounds",
    suburbs: ["Bo-Kaap", "Claremont", "De Waterkant", "Devil's Peak Estate", "District Six", "Gardens", "Higgovale", "Newlands", "Observatory", "Oranjezicht", "Rondebosch", "Schotsche Kloof", "Tamboerskloof", "University Estate", "Vredehoek", "Walmer Estate", "Woodstock", "Zonnebloem"],
  },
  {
    label: "Northern Suburbs",
    suburbs: ["Bellville", "Bothasig", "Brackenfell", "Brooklyn", "Durbanville", "Edgemead", "Goodwood", "Kraaifontein", "Kuils River", "Monte Vista", "Panorama", "Parow", "Plattekloof", "Tyger Valley", "Welgemoed"],
  },
  {
    label: "Southern Suburbs",
    suburbs: ["Bergvliet", "Bishopscourt", "Constantia", "Diep River", "Grassy Park", "Kenilworth", "Lansdowne", "Meadowridge", "Mowbray", "Observatory", "Ottery", "Pinelands", "Plumstead", "Rosebank", "Tokai", "Wynberg", "Zeekoevlei"],
  },
  {
    label: "West Coast / Blaauwberg",
    suburbs: ["Big Bay", "Blouberg", "Century City", "Milnerton", "Parklands", "Sunningdale", "Table View"],
  },
];

export const ALL_SUBURBS = SUBURB_GROUPS.flatMap(g => g.suburbs);
