"""Căile proiectului, configurația site-ului și datele Academy încărcate din src/academy/."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src"
DIST = ROOT / "dist"

ACADEMY_SRC = SRC / "academy"
CONTENT = ACADEMY_SRC / "content"
MIRROR = SRC / "bimx-mirror"                 # ro/ – paginile bimx.md; i18n/en.json – traducerea; shared/ – resurse
ACADEMY_ASSETS = DIST / "academy" / "assets"

BIMX = "https://bimx.md"

LANGS = {
    "ro": {"content": CONTENT / "ro", "out": DIST / "academy", "template": ACADEMY_SRC / "templates" / "index.ro.html"},
    "en": {"content": CONTENT / "en", "out": DIST / "en" / "academy", "template": ACADEMY_SRC / "templates" / "index.en.html"},
}

# Paginile bimx.md din meniul „BIMX ACADEMY”, înlocuite de secțiunile Academy.
ACADEMY_REDIRECTS = {
    "resurse-educationale": "#directii",
    "glosar": "#glosar",
    "formare": "#formare",
    "evenimente": "#evenimente",
    "publicatii": "#publicatii",
    "baza-cunostintelor": "#directii",
}


def _load(path):
    return json.loads(path.read_text(encoding="utf-8"))


# Textele interfeței (chei identice în ambele limbi) și catalogul primei pagini Academy.
T = {lang: _load(ACADEMY_SRC / "i18n" / f"{lang}.json") for lang in LANGS}
CATALOG = _load(ACADEMY_SRC / "catalog.json")
LEVELS = CATALOG["levels"]
LIVE = CATALOG["live_label"]
DIRECTION_META = CATALOG["directions"]
HOME_COURSES = CATALOG["home_courses"]
PUBLICATIONS = CATALOG["publications"]
