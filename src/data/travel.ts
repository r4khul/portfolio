/**
 * Places I've been. Rendered by the travel atlas (home preview + /travels).
 * Coordinates are WGS84.
 *
 * Roles:
 * - `home`   born and brought up here; every route on the map starts here
 * - `native` where the family is from
 * - `now`    where I'm living / working from at the moment
 *
 * `note` is the one line shown when a place is opened.
 */
export type PlaceRole = "home" | "native" | "now";

export type Place = {
  id: string;
  name: string;
  /** neighbourhood, landmark or district shown under the name */
  region: string;
  state: string;
  note: string;
  lat: number;
  lng: number;
  role?: PlaceRole;
};

export const places: Place[] = [
  {
    id: "chennai",
    name: "Chennai",
    region: "Home",
    state: "Tamil Nadu",
    note: "Born and brought up here. Every line on this map starts here.",
    lat: 13.0827,
    lng: 80.2707,
    role: "home",
  },
  {
    id: "nagercoil",
    name: "Nagercoil",
    region: "Kanyakumari",
    state: "Tamil Nadu",
    note: "My native. Near the very tip of the land, where three seas meet.",
    lat: 8.1833,
    lng: 77.4119,
    role: "native",
  },
  {
    id: "bangalore",
    name: "Bangalore",
    region: "Brookfield",
    state: "Karnataka",
    note: "Where I'm working from right now, out in Brookfield.",
    lat: 12.9667,
    lng: 77.7181,
    role: "now",
  },
  {
    id: "pondicherry",
    name: "Pondicherry",
    region: "White Town",
    state: "Puducherry",
    note: "French streets and a long promenade on the Bay of Bengal.",
    lat: 11.9416,
    lng: 79.8083,
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
    id: "coimbatore",
    name: "Coimbatore",
    region: "Kongu Nadu",
    state: "Tamil Nadu",
    note: "Cool air drifting down from the Nilgiris.",
    lat: 11.0168,
    lng: 76.9558,
  },
  {
    id: "dindigul",
    name: "Dindigul",
    region: "Rock Fort",
    state: "Tamil Nadu",
    note: "A fort on a rock, famous locks and even more famous biryani.",
    lat: 10.3673,
    lng: 77.9803,
  },
  {
    id: "kodaikanal",
    name: "Kodaikanal",
    region: "Palani Hills",
    state: "Tamil Nadu",
    note: "Mist, pine forests and a lake up in the clouds.",
    lat: 10.2381,
    lng: 77.4892,
  },
  {
    id: "tirunelveli",
    name: "Tirunelveli",
    region: "Thamirabarani",
    state: "Tamil Nadu",
    note: "Halwa, temple towers and the river running south.",
    lat: 8.7139,
    lng: 77.7567,
  },
  {
    id: "trivandrum",
    name: "Trivandrum",
    region: "Thiruvananthapuram",
    state: "Kerala",
    note: "Kerala's capital, a short ride over the hills from home turf.",
    lat: 8.5241,
    lng: 76.9366,
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
    id: "surathkal",
    name: "Surathkal",
    region: "Dakshina Kannada",
    state: "Karnataka",
    note: "A quiet stretch of coast just north of Mangalore.",
    lat: 13.0108,
    lng: 74.7943,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    region: "Maharashtra",
    state: "Maharashtra",
    note: "A city that runs on sea breeze and local trains.",
    lat: 19.076,
    lng: 72.8777,
  },
  {
    id: "delhi",
    name: "Delhi",
    region: "Raj Ghat",
    state: "Delhi",
    note: "Raj Ghat, the quiet memorial where Gandhi was laid to rest.",
    lat: 28.6406,
    lng: 77.2495,
  },
];

export const homePlace = places.find((p) => p.role === "home") ?? places[0];
export const nowPlace = places.find((p) => p.role === "now");
export const nativePlace = places.find((p) => p.role === "native");

/** Short label for a role, shown beside the name in lists. */
export const roleLabel: Record<PlaceRole, string> = {
  home: "home",
  native: "native",
  now: "now",
};
