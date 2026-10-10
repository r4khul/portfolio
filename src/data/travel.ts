/**
 * Places I've been. Rendered by the travel atlas (home preview + /travels).
 * Coordinates are WGS84. `home` is where every route starts.
 * `note` is the one line shown when a place is opened.
 */
export type Place = {
  id: string;
  name: string;
  /** district, neighbourhood or city shown under the name */
  region: string;
  state: string;
  note: string;
  lat: number;
  lng: number;
  home?: boolean;
};

export const places: Place[] = [
  {
    id: "chennai",
    name: "Chennai",
    region: "Home",
    state: "Tamil Nadu",
    note: "Home. Every line on this map starts here.",
    lat: 13.0827,
    lng: 80.2707,
    home: true,
  },
  {
    id: "nagercoil",
    name: "Nagercoil",
    region: "Kanyakumari",
    state: "Tamil Nadu",
    note: "Near the very tip of the land, where three seas meet.",
    lat: 8.1833,
    lng: 77.4119,
  },
  {
    id: "coimbatore",
    name: "Coimbatore",
    region: "Kongu Nadu",
    state: "Tamil Nadu",
    note: "Cool air drifting down from the Nilgiris.",
    lat: 11.0168,
    lng: 76.9558,
  },
  {
    id: "salem",
    name: "Salem",
    region: "Kongu Nadu",
    state: "Tamil Nadu",
    note: "Ringed by hills, halfway between everywhere.",
    lat: 11.6643,
    lng: 78.146,
  },
  {
    id: "bangalore",
    name: "Bangalore",
    region: "Bengaluru",
    state: "Karnataka",
    note: "The garden city that never stops building.",
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: "mysore",
    name: "Mysore",
    region: "Mysuru",
    state: "Karnataka",
    note: "Palaces, silk and slow afternoons.",
    lat: 12.2958,
    lng: 76.6394,
  },
  {
    id: "mangalore",
    name: "Mangalore",
    region: "Coastal Karnataka",
    state: "Karnataka",
    note: "Where the Western Ghats lean into the Arabian Sea.",
    lat: 12.9141,
    lng: 74.856,
  },
  {
    id: "kerala",
    name: "Kerala",
    region: "Kochi",
    state: "Kerala",
    note: "Backwaters, coconut palms and monsoon green.",
    lat: 9.9312,
    lng: 76.2673,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    region: "Konkan coast",
    state: "Maharashtra",
    note: "A city that runs on sea breeze and local trains.",
    lat: 19.076,
    lng: 72.8777,
  },
  {
    id: "delhi",
    name: "Delhi",
    region: "Capital",
    state: "Delhi",
    note: "Centuries stacked on top of one another.",
    lat: 28.6139,
    lng: 77.209,
  },
];
