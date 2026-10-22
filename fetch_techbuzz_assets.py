#!/usr/bin/env python3
"""
Download TechBuzz visual assets into a Next.js project's public/assets folder.

1. Known homepage assets (client logos, brand logo, hero globe) -> named paths.
2. The full WordPress media library (via the public REST API) -> public/assets/library/,
   plus manifest.csv so portfolio mockups can be found by title and size.

Place this file in the Next.js project root (next to package.json), then run:
    python fetch_techbuzz_assets.py
Files are saved to <project root>/public/assets/ regardless of the terminal's folder.
Requires: Python 3.8+, no extra packages.
"""
import csv
import json
import os
import urllib.request

SITE = "https://techbuzz.com.pk"
UP = f"{SITE}/wp-content/uploads"
# Always save next to this script, no matter which folder the terminal is in.
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "assets")

# Client logo files from the homepage "Trusted by" carousel, in on-page order.
LOGO_FILES = [
    "2-1", "1-1", "9-1", "8-1", "7-1", "6-1", "5-1", "11-1", "10-1", "18-1",
    "17-1", "16-1", "1", "15-1", "14-1", "13-1", "download", "3-1", "25",
]

KNOWN = {f"logos/client-{i:02d}.png": f"{UP}/2025/05/{name}.png"
         for i, name in enumerate(LOGO_FILES, start=1)}
KNOWN.update({
    "brand/techbuzz-logo-white.png": f"{UP}/2025/08/TechBuzz-HD-Logo-White.png",
    "brand/techbuzz-logo-white-footer.png": f"{UP}/2025/06/TechBuzz-HD-Logo-White.png",
    "hero/globe-hero.png": f"{UP}/2026/10/globe-hero-image.png",
    "hero/globe-icon.svg": f"{UP}/2025/08/globe-1.svg",
    "brand/og-portfolio.png": f"{UP}/2026/01/Untitled-design-61.png",
})

HEADERS = {"User-Agent": "Mozilla/5.0 (asset-migration)"}


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def save(rel: str, url: str) -> None:
    path = os.path.join(OUT, rel)
    if os.path.exists(path):
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    try:
        data = get(url)
    except Exception as e:  # keep going on a single bad file
        print(f"FAIL {url} ({e})")
        return
    with open(path, "wb") as f:
        f.write(data)
    print(f"ok   {rel}")


def main() -> None:
    for rel, url in KNOWN.items():
        save(rel, url)

    rows = []
    page = 1
    while True:
        url = f"{SITE}/wp-json/wp/v2/media?per_page=100&page={page}"
        try:
            items = json.loads(get(url))
        except Exception:
            break  # WordPress returns 400 past the last page
        if not items:
            break
        for m in items:
            src = m.get("source_url", "")
            details = m.get("media_details") or {}
            rel = "library/" + src.split("/wp-content/uploads/", 1)[-1]
            save(rel, src)
            rows.append([
                m.get("id"), m.get("title", {}).get("rendered", ""), m.get("mime_type"),
                details.get("width"), details.get("height"), m.get("date", "")[:10],
                f"/assets/{rel}", src,
            ])
        page += 1

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "library", "manifest.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "title", "mime", "width", "height", "uploaded", "next_path", "source_url"])
        w.writerows(rows)
    print(f"\n{len(rows)} library files listed in {OUT}/library/manifest.csv")


if __name__ == "__main__":
    main()
