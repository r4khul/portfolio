/**
 * Places I've been. Rendered by the travel atlas on the home page.
 * Coordinates are WGS84 (lat, lng). `home` marks the origin the
 * flight arcs radiate from.
 */
export type Place = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  home?: boolean;
};

export const places: Place[] = [
  { id: "chennai", name: "Chennai", region: "Tamil Nadu", lat: 13.0827, lng: 80.2707, home: true },
  { id: "nagercoil", name: "Nagercoil", region: "Kanyakumari, Tamil Nadu", lat: 8.1833, lng: 77.4119 },
  { id: "coimbatore", name: "Coimbatore", region: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { id: "salem", name: "Salem", region: "Tamil Nadu", lat: 11.6643, lng: 78.146 },
  { id: "bangalore", name: "Bangalore", region: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { id: "mysore", name: "Mysore", region: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { id: "mangalore", name: "Mangalore", region: "Karnataka", lat: 12.9141, lng: 74.856 },
  { id: "kerala", name: "Kerala", region: "Kochi, Kerala", lat: 9.9312, lng: 76.2673 },
  { id: "mumbai", name: "Mumbai", region: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { id: "delhi", name: "Delhi", region: "National Capital Territory", lat: 28.6139, lng: 77.209 },
];
