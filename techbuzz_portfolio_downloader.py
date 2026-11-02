#!/usr/bin/env python3
"""
TechBuzz portfolio image downloader
===================================
Crawls the portfolio pages on techbuzz.com.pk (Portfolio, Logo Designs, SMM Creatives, YouTube and any
other /portfolio* page linked from them) and downloads every image shown there, in full resolution,
into one folder per page and section.

What it finds:
  - <img> src, data-src, data-lazy-src, data-original, srcset / data-srcset (largest candidate)
  - <source srcset> inside <picture>
  - inline style background-image: url(...)
  - Elementor data-settings JSON (background slideshows, galleries, carousels)
  - lightbox links (<a href="...jpg">) used by Elementor galleries
  - images inside <noscript>
  - WordPress thumbnails (-300x200.jpg) are upgraded to the original upload when it exists

Setup: nothing. Missing packages (requests, beautifulsoup4, and playwright for --browser) are
installed automatically into the Python you run it with.

Run:
  python techbuzz_portfolio_downloader.py
  python techbuzz_portfolio_downloader.py --browser          # render pages in Chromium and scroll (catches lazy loaded images)
  python techbuzz_portfolio_downloader.py --out my_folder --min-size 4000
  python techbuzz_portfolio_downloader.py --url https://techbuzz.com.pk/portfolio-page-3/   # one extra start page

Output: one folder per section, numbered in the order the sections appear on the site
  techbuzz_portfolio/
    01_logo-design/001_logo-name.png
    02_smm-creatives/001_post.jpg
    03_youtube-automation/...
    manifest.csv   (folder, page, section, file, source url, bytes, sha1)
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import unquote, urldefrag, urljoin, urlparse

import subprocess


def ensure(package: str, module: str) -> None:
    """Installs a missing package into the Python that is running this script."""
    try:
        __import__(module)
    except ImportError:
        print(f"Installing {package} ...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--quiet", package])


ensure("requests", "requests")
ensure("beautifulsoup4", "bs4")

import requests  # noqa: E402
from bs4 import BeautifulSoup, Tag  # noqa: E402

SITE = "https://techbuzz.com.pk"
START_PAGES = [
    f"{SITE}/portfolio/",
    f"{SITE}/portfolio-page-2/",
    f"{SITE}/portfolio-page-3/",
    f"{SITE}/portfolio-page-4/",
]
# Any internal page whose path matches this is crawled too (portfolio, portfolio-page-5, ...)
PAGE_PATTERN = re.compile(r"^/portfolio[^/]*/?$", re.I)
IMAGE_EXT = re.compile(r"\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$", re.I)
WP_SIZE = re.compile(r"-\d{2,5}x\d{2,5}(?=\.(jpe?g|png|webp|gif|avif)$)", re.I)
# Theme / plugin / emoji assets are site chrome, not portfolio work
SKIP_URL = re.compile(r"/wp-content/(themes|plugins)/|/wp-includes/|gravatar\.com|s\.w\.org|emoji|data:image", re.I)
HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"]
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"
)


@dataclass
class Found:
    url: str
    page: str
    section: str
    alt: str


# ─── helpers ──────────────────────────────────────────────────────────────────

def slug(text: str, fallback: str = "misc") -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return s[:60] or fallback


def largest_from_srcset(srcset: str) -> str | None:
    best, best_w = None, -1.0
    for part in srcset.split(","):
        bits = part.strip().split()
        if not bits:
            continue
        w = 0.0
        if len(bits) > 1:
            m = re.match(r"([\d.]+)([wx])", bits[1])
            if m:
                w = float(m.group(1)) * (1000 if m.group(2) == "x" else 1)
        if w > best_w:
            best, best_w = bits[0], w
    return best


def normalise(url: str, base: str) -> str | None:
    if not url:
        return None
    url = url.strip().strip("'\"")
    if not url or url.startswith("data:"):
        return None
    url = urldefrag(urljoin(base, url))[0]
    if SKIP_URL.search(url):
        return None
    path = urlparse(url).path
    if not IMAGE_EXT.search(path):
        return None
    return url


def section_for(el: Tag, page_title: str) -> str:
    """Nearest heading before the element in document order, else the Elementor tab title."""
    tab = el.find_parent(attrs={"class": re.compile(r"elementor-tab-content|e-n-tabs-content|e-con")})
    if tab is not None and tab.get("id"):
        tab_id = tab.get("id")
        title = el.find_parent("body")
        if title is not None:
            ctrl = title.find(attrs={"aria-controls": tab_id})
            if ctrl is not None and ctrl.get_text(strip=True):
                return ctrl.get_text(" ", strip=True)
    head = el.find_previous(HEADINGS)
    return head.get_text(" ", strip=True) if head is not None else page_title


def walk_json_for_urls(obj, out: list[str]) -> None:
    if isinstance(obj, dict):
        for v in obj.values():
            walk_json_for_urls(v, out)
    elif isinstance(obj, list):
        for v in obj:
            walk_json_for_urls(v, out)
    elif isinstance(obj, str) and IMAGE_EXT.search(urlparse(obj).path):
        out.append(obj)


# ─── extraction ───────────────────────────────────────────────────────────────

def extract(html: str, page_url: str) -> tuple[list[Found], set[str]]:
    soup = BeautifulSoup(html, "html.parser")
    page = slug(urlparse(page_url).path.strip("/") or "home")
    title = soup.title.get_text(strip=True) if soup.title else page
    found: list[Found] = []
    links: set[str] = set()

    def add(raw: str | None, el: Tag, alt: str = "") -> None:
        url = normalise(raw or "", page_url)
        if url:
            found.append(Found(url, page, slug(section_for(el, title)), alt))

    # <noscript> fallbacks contain real <img> tags for lazy loaders
    for ns in soup.find_all("noscript"):
        inner = BeautifulSoup(ns.decode_contents(), "html.parser")
        for img in inner.find_all("img"):
            add(img.get("src"), ns, img.get("alt", ""))

    for img in soup.find_all("img"):
        alt = img.get("alt", "")
        for attr in ("data-srcset", "srcset"):
            if img.get(attr):
                add(largest_from_srcset(img[attr]), img, alt)
        for attr in ("data-orig-file", "data-large-file", "data-lazy-src", "data-src", "data-original", "src"):
            if img.get(attr):
                add(img[attr], img, alt)

    for src in soup.find_all("source"):
        if src.get("srcset"):
            add(largest_from_srcset(src["srcset"]), src)
        if src.get("data-srcset"):
            add(largest_from_srcset(src["data-srcset"]), src)

    for el in soup.find_all(style=True):
        for m in re.finditer(r"url\(([^)]+)\)", el["style"]):
            add(m.group(1), el)

    # Elementor widgets keep galleries / slideshows in JSON
    for el in soup.find_all(attrs={"data-settings": True}):
        try:
            data = json.loads(el["data-settings"])
        except (ValueError, TypeError):
            continue
        urls: list[str] = []
        walk_json_for_urls(data, urls)
        for u in urls:
            add(u, el)

    # Lightbox links straight to image files, and links to more portfolio pages
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if IMAGE_EXT.search(urlparse(href).path):
            add(href, a, a.get("title", ""))
            continue
        full = urldefrag(urljoin(page_url, href))[0]
        p = urlparse(full)
        if p.netloc.endswith("techbuzz.com.pk") and PAGE_PATTERN.match(p.path):
            links.add(f"{SITE}{p.path if p.path.endswith('/') else p.path + '/'}")

    # <style> blocks (Elementor per element CSS) with background images
    for st in soup.find_all("style"):
        for m in re.finditer(r"url\(([^)]+)\)", st.get_text()):
            url = normalise(m.group(1), page_url)
            if url and "/wp-content/uploads/" in url:
                found.append(Found(url, page, "backgrounds", ""))

    return found, links


# ─── fetching ─────────────────────────────────────────────────────────────────

def fetch_static(session: requests.Session, url: str) -> str | None:
    try:
        r = session.get(url, timeout=30)
    except requests.RequestException as e:
        print(f"  ! {url}: {e}")
        return None
    if r.status_code != 200:
        print(f"  ! {url}: HTTP {r.status_code}")
        return None
    return r.text


class BrowserFetcher:
    """Renders the page in Chromium, scrolls to the bottom to trigger lazy loading, clicks every tab."""

    def __init__(self) -> None:
        ensure("playwright", "playwright")
        # downloads Chromium the first time (no-op afterwards)
        subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
        from playwright.sync_api import sync_playwright  # imported only when --browser is used

        self._pw = sync_playwright().start()
        self._browser = self._pw.chromium.launch()
        self._page = self._browser.new_page(viewport={"width": 1440, "height": 900}, user_agent=UA)

    def get(self, url: str) -> str | None:
        p = self._page
        try:
            p.goto(url, wait_until="networkidle", timeout=60000)
        except Exception as e:  # noqa: BLE001
            print(f"  ! {url}: {e}")
            return None
        last = -1
        for _ in range(60):  # scroll in steps until the height stops growing
            height = p.evaluate("document.body.scrollHeight")
            p.evaluate("window.scrollBy(0, window.innerHeight * 0.8)")
            p.wait_for_timeout(350)
            at_end = p.evaluate("window.scrollY + window.innerHeight >= document.body.scrollHeight - 4")
            if at_end and height == last:
                break
            last = height
        # open every tab / accordion so hidden galleries render
        for sel in ["[role=tab]", ".elementor-tab-title", ".e-n-tab-title", ".elementor-accordion-title"]:
            for el in p.query_selector_all(sel):
                try:
                    el.click(timeout=1500)
                    p.wait_for_timeout(400)
                except Exception:  # noqa: BLE001
                    pass
        p.wait_for_timeout(800)
        return p.content()

    def close(self) -> None:
        self._browser.close()
        self._pw.stop()


# ─── download ─────────────────────────────────────────────────────────────────

def original_candidates(url: str) -> list[str]:
    """WordPress thumbnails: try the full upload first, then -scaled, then the thumbnail itself."""
    base = WP_SIZE.sub("", url)
    out = []
    if base != url:
        out.append(base)
        stem, dot, ext = base.rpartition(".")
        out.append(f"{stem}-scaled{dot}{ext}")
    out.append(url)
    return out


def download(session: requests.Session, url: str, dest_dir: Path, index: int, min_size: int):
    for candidate in original_candidates(url):
        try:
            r = session.get(candidate, timeout=60)
        except requests.RequestException:
            continue
        ctype = r.headers.get("content-type", "")
        if r.status_code != 200 or not (ctype.startswith("image/") or IMAGE_EXT.search(candidate)):
            continue
        data = r.content
        if len(data) < min_size:
            return None  # icons, spacers, tracking pixels
        name = unquote(Path(urlparse(candidate).path).name)
        dest_dir.mkdir(parents=True, exist_ok=True)
        path = dest_dir / f"{index:03d}_{name}"
        path.write_bytes(data)
        return candidate, path, data
    return None


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # Windows consoles
    ap = argparse.ArgumentParser(description="Download every image from the TechBuzz portfolio pages.")
    ap.add_argument("--out", default="techbuzz_portfolio", help="output folder")
    ap.add_argument("--browser", action="store_true", help="render with Playwright Chromium (lazy loaded / JS galleries)")
    ap.add_argument("--url", action="append", default=[], help="extra start page (repeatable)")
    ap.add_argument("--min-size", type=int, default=3000, help="skip files smaller than this many bytes")
    ap.add_argument("--no-follow", action="store_true", help="only the start pages, do not follow other portfolio links")
    ap.add_argument("--delay", type=float, default=0.15, help="seconds between downloads")
    args = ap.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers.update({"User-Agent": UA, "Referer": SITE + "/"})

    browser = BrowserFetcher() if args.browser else None
    queue = list(dict.fromkeys(START_PAGES + args.url))
    seen_pages: set[str] = set()
    all_found: list[Found] = []

    try:
        while queue:
            page_url = queue.pop(0)
            if page_url in seen_pages:
                continue
            seen_pages.add(page_url)
            print(f"> {page_url}")
            html = browser.get(page_url) if browser else fetch_static(session, page_url)
            if not html:
                continue
            found, links = extract(html, page_url)
            print(f"  {len(found)} image references")
            all_found.extend(found)
            if not args.no_follow:
                queue.extend(l for l in sorted(links) if l not in seen_pages)
    finally:
        if browser:
            browser.close()

    # one entry per original image (first page/section where it appears wins)
    unique: dict[str, Found] = {}
    for f in all_found:
        unique.setdefault(WP_SIZE.sub("", f.url), f)
    print(f"\n{len(unique)} unique images across {len(seen_pages)} pages. Downloading...\n")

    # one folder per section, numbered in order of first appearance (same section on two pages = one folder)
    order: dict[str, str] = {}
    for f in unique.values():
        if f.section not in order:
            order[f.section] = f"{len(order) + 1:02d}_{f.section}"

    hashes: set[str] = set()
    counters: dict[Path, int] = {}
    rows = []
    for key, f in unique.items():
        folder = out / order[f.section]
        counters[folder] = counters.get(folder, 0) + 1
        res = download(session, f.url, folder, counters[folder], args.min_size)
        if res is None:
            counters[folder] -= 1
            continue
        src, path, data = res
        sha = hashlib.sha1(data).hexdigest()
        if sha in hashes:  # same file under another URL
            path.unlink()
            counters[folder] -= 1
            continue
        hashes.add(sha)
        rows.append([order[f.section], f.page, f.section, str(path.relative_to(out)), src, len(data), sha, f.alt])
        print(f"  + {path.relative_to(out)}  ({len(data) // 1024} KB)")
        time.sleep(args.delay)

    for folder in out.iterdir():  # drop section folders that ended up empty (all duplicates or icons)
        if folder.is_dir() and not any(folder.iterdir()):
            folder.rmdir()

    with open(out / "manifest.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["folder", "page", "section", "file", "source_url", "bytes", "sha1", "alt"])
        w.writerows(rows)

    print(f"\nDone: {len(rows)} images in {len(set(r[0] for r in rows))} section folders at {out.resolve()}")
    for folder in sorted(set(r[0] for r in rows)):
        print(f"  {folder}: {sum(1 for r in rows if r[0] == folder)}")
    if not args.browser and len(rows) < 10:
        print("Few images found. The galleries may load with JavaScript: run again with --browser.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
