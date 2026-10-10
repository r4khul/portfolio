"""
Rasterises Natural Earth land polygons into the grayscale land masks used by
the travel atlas (src/components/home/travel). The map is drawn entirely by
our own canvas renderer; these PNGs are just the coastline signal it samples.

  world.png       2048x1024 equirectangular, -180..180 / -90..90   (1:50m)
  south-asia.png  1000x1000 equirectangular,  60..100 /   0..40    (1:10m)

Usage:
  git clone --depth 1 --filter=blob:none --sparse \
      https://github.com/nvkelso/natural-earth-vector ne
  (cd ne && git sparse-checkout set --no-cone /geojson/ne_50m_land.geojson \
      /geojson/ne_10m_land.geojson /geojson/ne_50m_lakes.geojson)
  python3 scripts/generate_atlas_masks.py ne/geojson public/atlas

Pixels hold 16 coverage levels (0 = sea, 255 = land), supersampled 4x so the
renderer can interpolate a smooth coastline.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw


def load(path):
    with open(path) as f:
        return json.load(f)["features"]


def rings(geom):
    coords = geom["coordinates"]
    polys = [coords] if geom["type"] == "Polygon" else coords
    for poly in polys:
        yield poly[0], poly[1:]


def render(features, lakes, bounds, width, height, ss=4):
    west, south, east, north = bounds
    img = Image.new("L", (width * ss, height * ss), 0)
    draw = ImageDraw.Draw(img)
    sx = width * ss / (east - west)
    sy = height * ss / (north - south)

    def pts(ring):
        return [((x - west) * sx, (north - y) * sy) for x, y in ring]

    for f in features:
        for ext, holes in rings(f["geometry"]):
            draw.polygon(pts(ext), fill=255)
            for h in holes:
                draw.polygon(pts(h), fill=0)
    for f in lakes:
        for ext, _ in rings(f["geometry"]):
            draw.polygon(pts(ext), fill=0)

    img = img.resize((width, height), Image.LANCZOS)
    a = np.asarray(img).astype(np.float32)
    a = (np.round(a / 255 * 15) * 17).astype(np.uint8)
    return Image.fromarray(a, "L")


def main():
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    lakes = [
        f for f in load(os.path.join(src, "ne_50m_lakes.geojson"))
        if f["properties"].get("scalerank", 9) <= 2
    ]
    render(load(os.path.join(src, "ne_50m_land.geojson")), lakes,
           (-180, -90, 180, 90), 2048, 1024).save(
        os.path.join(out, "world.png"), optimize=True)
    render(load(os.path.join(src, "ne_10m_land.geojson")), [],
           (60, 0, 100, 40), 1000, 1000).save(
        os.path.join(out, "south-asia.png"), optimize=True)


if __name__ == "__main__":
    main()
