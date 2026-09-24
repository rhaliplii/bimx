"""Copiază bimx.md în src/bimx-mirror/: paginile RO în ro/, resursele în shared/ (catalogul i18n/ nu e atins).

Rulare:  python3 tools/mirror_bimx.py [dosar-destinație]   (implicit src/bimx-mirror)
Paginile din ro/ trimit la resurse prin ../wp-content/…, pe care tools/build.py le mapează spre shared/.
bimx.md nu are versiune engleză: paginile EN se generează din cele RO cu catalogul i18n/en.json.
"""
import os, re, sys, time, html, posixpath, urllib.request, urllib.parse
from pathlib import Path

HOST = "bimx.md"
BASE = f"https://{HOST}"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "src" / "bimx-mirror"
OUT_RO, OUT_SHARED = OUT / "ro", OUT / "shared"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh) BIMx-replica"}
SKIP = re.compile(r"/(wp-admin|wp-login\.php|wp-json|xmlrpc\.php|feed|comments/feed|contul-meu|calendar)(/|$)|/feed/?$|\?|/wp-content/plugins/.*\.php")
ASSET_EXT = re.compile(r"\.(css|js|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot|otf|pdf|mp4|webm|json)$", re.I)
DROP_SCRIPTS = re.compile(r'<script[^>]*id="cookieyes"[^>]*>\s*</script>', re.I)

def get(url, binary=False):
    for i in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                data = r.read(); ctype = r.headers.get("Content-Type", "")
                return data if binary else data.decode("utf-8", "replace"), ctype, r.geturl()
        except urllib.error.HTTPError as e:
            if e.code == 404: return None, "", url
            time.sleep(2 + 2 * i)
        except Exception:
            time.sleep(2 + 2 * i)
    return None, "", url

def norm(url, base):
    url = html.unescape(url.strip())
    if not url or url.startswith(("#", "mailto:", "tel:", "javascript:", "data:")): return None
    u = urllib.parse.urljoin(base, url)
    p = urllib.parse.urlsplit(u)
    if p.netloc not in (HOST, "www." + HOST): return None
    return urllib.parse.urlunsplit(("https", HOST, p.path or "/", p.query, ""))

def is_en(path): return path == "/en" or path.startswith("/en/")

def page_file(path):
    """/foo/bar/ -> foo/bar/index.html ; / -> index.html. EN paths drop the /en prefix."""
    if is_en(path): path = path[3:] or "/"
    path = urllib.parse.unquote(path)
    if path.endswith("/") or "." not in posixpath.basename(path): path = path.rstrip("/") + "/index.html"
    return path.lstrip("/")

def asset_file(path):
    return urllib.parse.unquote(path).lstrip("/")

def rel(from_file, to_file):
    r = posixpath.relpath(to_file, posixpath.dirname(from_file) or ".")
    return r

# ------------------------------------------------------------------ crawl pages
seeds = []
for sm in ["wp-sitemap-posts-post-1", "wp-sitemap-posts-page-1", "wp-sitemap-taxonomies-category-1", "en/wp-sitemap-posts-page-1"]:
    body, _, _ = get(f"{BASE}/{sm}.xml")
    seeds += re.findall(r"<loc>([^<]+)</loc>", body or "")
seeds = [BASE + "/"] + seeds
queue, seen, pages, assets = list(dict.fromkeys(seeds)), set(), {}, set()
while queue:
    url = queue.pop(0)
    path = urllib.parse.urlsplit(url).path or "/"
    if url in seen or SKIP.search(url): continue
    seen.add(url)
    if ASSET_EXT.search(path): assets.add(url); continue
    body, ctype, final = get(url)
    time.sleep(0.3)
    if body is None or "text/html" not in ctype: continue
    pages[url] = body
    print(f"page {len(pages):3d} {path}", flush=True)
    for m in re.finditer(r'(?:href|src|data-src|srcset|content)=["\']([^"\']+)["\']', body):
        for part in m.group(1).split(","):
            u = norm(part.strip().split(" ")[0], url)
            if not u: continue
            pth = urllib.parse.urlsplit(u).path
            if ASSET_EXT.search(pth) or "/wp-content/" in pth or "/wp-includes/" in pth:
                assets.add(u.split("?")[0])
            elif not SKIP.search(u) and u not in seen:
                queue.append(u)
    for m in re.finditer(r"url\(\s*['\"]?([^'\")]+)", body):
        u = norm(m.group(1), url)
        if u: assets.add(u.split("?")[0])

# ------------------------------------------------------------------ download assets (+ css deps)
asset_data = {}
pending = sorted(assets)
while pending:
    u = pending.pop(0)
    if u in asset_data: continue
    data, ctype, _ = get(u, binary=True)
    if data is None: asset_data[u] = None; continue
    asset_data[u] = data
    if u.endswith(".css"):
        css = data.decode("utf-8", "replace")
        for m in re.finditer(r"url\(\s*['\"]?([^'\")]+)", css):
            d = norm(m.group(1), u)
            if d and d.split("?")[0] not in asset_data: pending.append(d.split("?")[0])
        for m in re.finditer(r"@import\s+['\"]([^'\"]+)", css):
            d = norm(m.group(1), u)
            if d: pending.append(d.split("?")[0])
print(f"assets: {sum(1 for v in asset_data.values() if v)} ok, {sum(1 for v in asset_data.values() if v is None)} missing", flush=True)

# ------------------------------------------------------------------ write
def rewrite(text, from_file, lang, is_css=False, css_url=None):
    other_root = "../en/" if lang == "ro" else "../ro/"
    depth_root = posixpath.relpath(".", posixpath.dirname(from_file) or ".")
    def target(u):
        pth = urllib.parse.urlsplit(u).path or "/"
        key = u.split("?")[0]
        if key in asset_data and asset_data[key] is not None:
            return rel(from_file, asset_file(pth))
        if u in pages or u.rstrip("/") + "/" in pages:
            f = page_file(pth)
            if is_en(pth) == (lang == "en"): return rel(from_file, f)
            return posixpath.join(depth_root, "..", ("en" if lang == "ro" else "ro"), f)
        return None
    def sub_attr(m):
        attr, q, val = m.group(1), m.group(2), m.group(3)
        if val.strip().startswith("data:"): return m.group(0)  # base64 conține virgule
        out = []
        for part in val.split(","):
            bits = part.strip().split(" ")
            u = norm(bits[0], BASE + "/" + ("en/" if lang == "en" else "") + from_file) if bits[0] else None
            t = target(u) if u else None
            frag = ("#" + urllib.parse.urlsplit(html.unescape(bits[0])).fragment) if "#" in bits[0] and t else ""
            if t: bits[0] = t + frag
            elif u: bits[0] = u  # external page not mirrored: keep absolute live link
            out.append(" ".join(bits))
        return f'{attr}={q}{", ".join(out) if attr == "srcset" else ",".join(out)}{q}'
    if not is_css:
        text = DROP_SCRIPTS.sub("", text)
        text = re.sub(r'(href|src|data-src|srcset)=(["\'])([^"\']*)\2', sub_attr, text)
    base = css_url or (BASE + "/" + from_file)
    def sub_url(m):
        u = norm(m.group(1), base)
        t = target(u.split("?")[0]) if u else None
        return f"url('{t}')" if t else m.group(0)  # ghilimele simple: url() apare și în style="…"
    text = re.sub(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", sub_url, text)
    return text

for out, lang in ((OUT_RO, "ro"),):
    out.mkdir(parents=True, exist_ok=True)
    for url, body in pages.items():
        pth = urllib.parse.urlsplit(url).path or "/"
        if is_en(pth) != (lang == "en"): continue
        f = page_file(pth)
        (out / f).parent.mkdir(parents=True, exist_ok=True)
        (out / f).write_text(rewrite(body, f, lang), encoding="utf-8")
    print(f"{lang}: written to {out}", flush=True)

# assets: o singură copie, comună ambelor limbi
for u, data in asset_data.items():
    if data is None: continue
    f = asset_file(urllib.parse.urlsplit(u).path)
    dest = OUT_SHARED / f; dest.parent.mkdir(parents=True, exist_ok=True)
    if f.endswith(".css"):
        dest.write_text(rewrite(data.decode("utf-8", "replace"), f, "ro", is_css=True, css_url=u), encoding="utf-8")
    else:
        dest.write_bytes(data)
print(f"shared: written to {OUT_SHARED}", flush=True)
print("DONE", len(pages), "pages")
