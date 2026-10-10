import type { Metadata } from "next";
import { profile } from "@/data/profile";
import { homePlace, nativePlace, nowPlace, places } from "@/data/travel";
import { AtlasExplorer } from "@/components/home/travel/atlas-explorer";

/*
 * /travels: the full-screen atlas.
 *
 * Social previews come from the file conventions next to this page:
 *   opengraph-image.png + .alt.txt, twitter-image.png + .alt.txt
 * (a 1200x630 render of the real atlas engine, postcards and type).
 * They are more specific than the root banner, so they win for this route.
 */

const stateCount = new Set(places.map((p) => p.state)).size;
const url = `${profile.url}/travels`;

// One line that reads well in a search result, a tweet card and a DM preview.
const description = `Born and raised in ${homePlace.name}, roots in ${nativePlace?.name ?? "the south"}, working out of ${
  nowPlace?.name ?? "India"
} for now. A hand-built pixel map of ${places.length} places across ${stateCount} states, with a living postcard for each.`;

export const metadata: Metadata = {
  title: "Travels",
  description,
  alternates: { canonical: "/travels" },
  keywords: [
    "Rakhul Prakash travels",
    "travel map",
    "India travel map",
    "interactive map",
    "WebGL map",
    "dot matrix map",
    ...places.map((p) => p.name),
  ],
  // `images` intentionally omitted: opengraph-image.png / twitter-image.png supply them
  openGraph: {
    type: "website",
    url,
    siteName: profile.name,
    locale: "en_US",
    title: `Places I've been | ${profile.name}`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@r4khul",
    title: `Places I've been | ${profile.name}`,
    description,
  },
};

/**
 * Structured data: the page as an ItemList of real places (with coordinates),
 * authored by the site's Person. Helps search engines understand that this is
 * a list of destinations rather than a generic app page.
 */
function TravelsJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    url,
    name: `Places I've been | ${profile.name}`,
    description,
    inLanguage: "en",
    author: { "@type": "Person", name: profile.name, url: profile.url },
    mainEntity: {
      "@type": "ItemList",
      name: "Places visited",
      numberOfItems: places.length,
      itemListElement: places.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${url}?place=${p.id}`,
        item: {
          "@type": "Place",
          name: p.name,
          description: p.note,
          address: {
            "@type": "PostalAddress",
            addressLocality: p.region,
            addressRegion: p.state,
            addressCountry: "IN",
          },
          geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
        },
      })),
    },
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here: all values are our own static data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function TravelsPage() {
  return (
    <>
      <TravelsJsonLd />
      {/* crawlable text twin of the map, for readers without JS and for search */}
      <noscript>
        <h1>Places I&apos;ve been</h1>
        <p>{description}</p>
        <ul>
          {places.map((p) => (
            <li key={p.id}>
              {p.name}, {p.state}: {p.note}
            </li>
          ))}
        </ul>
      </noscript>
      <AtlasExplorer />
    </>
  );
}
