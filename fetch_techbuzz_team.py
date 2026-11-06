#!/usr/bin/env python3
"""
Download TechBuzz team photos into <project>/public/assets/team/.

Put this file in your Next.js project root (next to package.json) and run:
    python fetch_techbuzz_team.py

Looks for photos in three places, because the old Elementor site hides them:
  1. The Our Team page HTML (img src, srcset, lazy-load data-* attributes, inline styles)
  2. The page's own Elementor stylesheet (background-image photos)
  3. The WordPress media library, searched by each team member's name

Saves full-resolution originals where available, names each file after the person
when it can match them, and writes team/manifest.csv. Python 3.8+, no extra packages.
"""
import csv
import html
import json
import os
import re
import urllib.parse
import urllib.request

SITE = "https://techbuzz.com.pk"
TEAM_PAGE = f"{SITE}/our-team/"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "assets", "team")
HEADERS = {"User-Agent": "Mozilla/5.0 (TechBuzz asset migration)"}
IMG_EXT = (".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif")

# Names and roles as listed on techbuzz.com.pk/our-team (duplicates removed).
TEAM = [
    ("Usman Shabbir", "Founder & CEO"),
    ("Muhammad Mehran", "Director"),
    ("Gulraiz Masood", "IT Director"),
    ("Hasan Arif", "Director"),
    ("Ahmad Khan Lodhi", "Chief Marketing Officer"),
    ("Danial Sajid", "General Manager"),
    ("Ali Shabbir", "Head of Performance Marketing"),
    ("Zargham Ali", "Creative Director"),
    ("Umer Faheem", "SEO Consultant"),
    ("Shiza Daha", "SEO Executive"),
    ("Sana Chaudhary", "SEO Expert"),
    ("Nabeel", "SEO Expert"),
    ("Jaysha Khan", "Jr. SEO"),
    ("Hira Rasheed", "Jr. SEO & WordPress Developer"),
    ("Abdur Rehman", "Graphic Designer"),
    ("Yousaf Adeel", "Graphic Designer"),
    ("Bilal Butt", "Video Editor"),
    ("Zeeshan", "Video Editor"),
    ("Asad Ahmad", "Video Editor"),
    ("Kisa Zahra", "Senior Script Writer"),
    ("Fatima Mehboob", "Script Writer Intern"),
    ("Aqsa Khan", "Sr. Content Writer"),
    ("Fakhriya", "Content Writer"),
    ("Saba Gill", "Content Writer"),
    ("Nouman Butt", "Sr. WordPress / Shopify Developer"),
    ("Bilal Ahmad", "Sr. WordPress / Shopify Developer"),
    ("Ghazanfar", "Jr. WordPress / Shopify Developer"),
    ("Awais", "Jr. Content Creator"),
    ("Faiqa", "Content Creator Intern"),
]

# Filenames that are clearly not people (logos, icons, backgrounds).
SKIP_WORDS = ("logo", "icon", "globe", "favicon", "bg", "background", "banner",
              "pattern", "shape", "arrow", "placeholder", "elementor")


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def get_text(url: str) -> str:
    return get(url).decode("utf-8", errors="replace")


def full_size(url: str) -> str:
    """Strip WordPress size suffix: photo-300x300.jpg -> photo.jpg"""
    return re.sub(r"-\d{2,5}x\d{2,5}(?=\.\w+$)", "", url)


def is_upload_image(url: str) -> bool:
    path = urllib.parse.urlparse(url).path.lower()
    if "/wp-content/uploads/" not in path or not path.endswith(IMG_EXT):
        return False
    name = os.path.basename(path)
    return not any(w in name for w in SKIP_WORDS)


def urls_from_html(page: str) -> dict:
    """Return {image_url: alt_text} from img tags, srcsets, data attrs and inline styles."""
    found = {}
    for tag in re.findall(r"<img\b[^>]*>", page, flags=re.I):
        alt = re.search(r'\balt="([^"]*)"', tag)
        alt_text = html.unescape(alt.group(1)) if alt else ""
        for attr in ("src", "data-src", "data-lazy-src", "data-orig-file", "data-large-file"):
            m = re.search(rf'\b{attr}="([^"]+)"', tag)
            if m:
                found.setdefault(html.unescape(m.group(1)), alt_text)
        for attr in ("srcset", "data-srcset", "data-lazy-srcset"):
            m = re.search(rf'\b{attr}="([^"]+)"', tag)
            if m:
                for part in m.group(1).split(","):
                    u = part.strip().split(" ")[0]
                    if u:
                        found.setdefault(html.unescape(u), alt_text)
    for u in re.findall(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", page):
        found.setdefault(html.unescape(u), "")
    for u in re.findall(r'https?://[^\s"\'<>]+?\.(?:jpe?g|png|webp|avif)', page, flags=re.I):
        found.setdefault(html.unescape(u), "")
    return found


def urls_from_page_css(page: str) -> dict:
    """Elementor stores per-page backgrounds in uploads/elementor/css/post-<id>.css."""
    found = {}
    m = re.search(r"page-id-(\d+)", page) or re.search(r"elementor-(\d+)", page)
    if not m:
        return found
    page_id = m.group(1)
    for css_url in set(re.findall(rf'href="([^"]*elementor/css/post-{page_id}\.css[^"]*)"', page)):
        try:
            css = get_text(html.unescape(css_url))
        except Exception:
            continue
        for u in re.findall(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", css):
            found.setdefault(urllib.parse.urljoin(css_url, u), "")
    return found


def urls_from_media_library() -> dict:
    """Search the WordPress media library for each person's name."""
    found = {}
    for name, _ in TEAM:
        query = urllib.parse.quote(name)
        url = f"{SITE}/wp-json/wp/v2/media?search={query}&per_page=10&media_type=image"
        try:
            items = json.loads(get_text(url))
        except Exception:
            continue
        for item in items:
            src = item.get("source_url")
            if src:
                found.setdefault(src, name)
    return found


def match_person(url: str, hint: str):
    """Match an image to a team member using alt text or the filename."""
    haystack = slug(hint) + "-" + slug(os.path.basename(urllib.parse.urlparse(url).path))
    best = None
    for name, role in TEAM:
        parts = slug(name).split("-")
        if all(p in haystack for p in parts):
            if best is None or len(parts) > len(slug(best[0]).split("-")):
                best = (name, role)
    return best


def download(url: str, dest_base: str) -> str:
    """Try the full-size original first, then the URL as found. Returns saved path or ''."""
    for candidate in dict.fromkeys([full_size(url), url]):
        ext = os.path.splitext(urllib.parse.urlparse(candidate).path)[1].lower() or ".jpg"
        dest = dest_base + ext
        if os.path.exists(dest):
            return dest
        try:
            data = get(candidate)
        except Exception:
            continue
        with open(dest, "wb") as f:
            f.write(data)
        return dest
    return ""


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    print(f"Saving to: {OUT}\n")

    try:
        page = get_text(TEAM_PAGE)
    except Exception as e:
        print(f"Could not open {TEAM_PAGE}: {e}")
        page = ""

    candidates = {}
    for source in (urls_from_html(page), urls_from_page_css(page), urls_from_media_library()):
        for u, hint in source.items():
            if is_upload_image(u):
                key = full_size(u)
                if key not in candidates or (hint and not candidates[key][1]):
                    candidates[key] = (u, hint)

    rows, used, unnamed = [], set(), 0
    for _, (url, hint) in sorted(candidates.items()):
        person = match_person(url, hint)
        if person and slug(person[0]) not in used:
            base_name = slug(person[0])
            used.add(base_name)
        else:
            unnamed += 1
            person = None
            base_name = f"team-{unnamed:02d}"
        saved = download(url, os.path.join(OUT, base_name))
        if not saved:
            print(f"FAIL {url}")
            continue
        print(f"ok   {os.path.basename(saved)}  <-  {url}")
        rows.append([
            os.path.basename(saved),
            person[0] if person else "",
            person[1] if person else "",
            f"/assets/team/{os.path.basename(saved)}",
            url,
        ])

    with open(os.path.join(OUT, "manifest.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["file", "name", "role", "next_path", "source_url"])
        w.writerows(rows)

    matched = sum(1 for r in rows if r[1])
    print(f"\n{len(rows)} images saved ({matched} matched to a name, {len(rows) - matched} unnamed).")
    print(f"Manifest: {os.path.join(OUT, 'manifest.csv')}")
    missing = [n for n, _ in TEAM if slug(n) not in used]
    if missing:
        print(f"\nNo photo matched for: {', '.join(missing)}")
        print("Check the unnamed team-XX files and rename them by hand.")


if __name__ == "__main__":
    main()
