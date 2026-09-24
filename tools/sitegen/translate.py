"""Traducerea paginilor bimx.md pe baza unui catalog: textul RO al fiecărei unități → textul EN.

O unitate e textul unui bloc (paragraf, titlu, element de listă, celulă, link etc.), inclusiv marcajul inline
din interiorul lui. Tag-urile inline devin marcaje numerotate {1}, {2}, … ca traducerea să nu depindă de
căile relative ale paginii: „Citește <a href="…">regulamentul</a>” are cheia „Citește {1}regulamentul{2}”.
Se traduc și atributele vizibile (alt, title, placeholder, aria-label, value la butoane, meta description).
"""
import html
import re
from html.parser import HTMLParser

INLINE = {"a", "span", "strong", "b", "em", "i", "u", "small", "sup", "sub", "br", "mark", "abbr", "code",
          "time", "s", "del", "ins", "q", "cite", "font", "wbr"}
OPAQUE = {"svg", "img", "input", "picture", "video", "audio", "canvas", "iframe", "object", "math"}  # atomi în text
RAW = {"script", "style", "noscript", "template", "textarea"}                     # conținut netradus
TEXT_ATTRS = {"alt", "title", "placeholder", "aria-label"}
META_NAMES = {"description", "og:title", "og:description", "og:site_name", "twitter:title", "twitter:description"}
LETTER = re.compile(r"[^\W\d_]")
PLACEHOLDER = re.compile(r"\{(\d+)\}")


def norm(text):
    return re.sub(r"\s+", " ", text).strip()


class _Tokens(HTMLParser):
    """Lista de tokenuri (tip, tag, start, end) cu pozițiile lor în textul sursă."""

    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.text, self.tokens = text, []
        self._lines = [0]
        for m in re.finditer("\n", text):
            self._lines.append(m.end())
        self.feed(text)
        self.close()

    def _pos(self):
        line, col = self.getpos()
        return self._lines[line - 1] + col

    def _add(self, kind, tag=None, attrs=None):
        start = self._pos()
        raw = self.get_starttag_text() if kind in ("start", "startend") else None
        if raw is None:
            # handle_endtag / data: lungimea se află din poziția următorului token (completată în finalize)
            self.tokens.append([kind, tag, start, None, attrs])
        else:
            self.tokens.append([kind, tag, start, start + len(raw), attrs])

    def handle_starttag(self, tag, attrs): self._add("start", tag, attrs)
    def handle_startendtag(self, tag, attrs): self._add("startend", tag, attrs)
    def handle_endtag(self, tag): self._add("end", tag)
    def handle_data(self, data): self._add("data")
    def handle_entityref(self, name): self._add("data")
    def handle_charref(self, name): self._add("data")
    def handle_comment(self, data): self._add("other")
    def handle_decl(self, decl): self._add("other")
    def handle_pi(self, data): self._add("other")
    def unknown_decl(self, data): self._add("other")

    def finalize(self):
        for i, tok in enumerate(self.tokens):
            if tok[3] is None:
                nxt = self.tokens[i + 1][2] if i + 1 < len(self.tokens) else len(self.text)
                if tok[0] == "end":
                    tok[3] = self.text.index(">", tok[2]) + 1
                else:
                    tok[3] = nxt
        return self.tokens


def _units(text):
    """Unitățile de text: listă de (start, end, cheie, tag-uri) – start/end delimitează textul înlocuit."""
    tokens = _Tokens(text).finalize()
    units, cur, raw_depth, opaque = [], [], None, None

    def flush():
        # păstrăm doar porțiunea dintre primul și ultimul fragment de text
        idx = [i for i, t in enumerate(cur) if t[0] == "data" and text[t[2]:t[3]].strip()]
        if idx:
            part = cur[idx[0]:idx[-1] + 1]
            key, tags, n = [], {}, 0
            for t in part:
                if t[0] == "data":
                    key.append(html.unescape(text[t[2]:t[3]]))
                else:
                    n += 1
                    tags[n] = text[t[2]:t[3]]
                    key.append(f"{{{n}}}")
            k = norm("".join(key))
            if LETTER.search(PLACEHOLDER.sub("", k)):
                units.append((part[0][2], part[-1][3], k, tags))
        cur.clear()

    for tok in tokens:
        kind, tag = tok[0], tok[1]
        if raw_depth is not None:                      # în <script>/<style>: sărim până la închidere
            if kind == "end" and tag == raw_depth:
                raw_depth = None
            continue
        if opaque is not None:                          # în <svg>: tot conținutul e un singur atom
            opaque[1] = tok[3]
            if kind == "start" and tag == opaque[2]:
                opaque[3] += 1
            elif kind == "end" and tag == opaque[2]:
                opaque[3] -= 1
                if not opaque[3]:
                    cur.append(["atom", tag, opaque[0], opaque[1], None])
                    opaque = None
            continue
        if kind == "start" and tag in RAW:
            flush()
            raw_depth = tag
        elif kind == "start" and tag in OPAQUE and tag not in ("img", "input"):
            opaque = [tok[2], tok[3], tag, 1]
        elif kind in ("data",) or (tag in INLINE and kind in ("start", "end", "startend")) or tag in ("img", "input"):
            cur.append(tok)
        else:
            flush()
    flush()
    return units, tokens


def _attr_sites(text, tokens):
    """Atributele traductibile: (start, end, valoare) pentru valoarea din interiorul ghilimelelor."""
    sites = []
    for kind, tag, start, end, attrs in tokens:
        if kind not in ("start", "startend") or not attrs:
            continue
        names = {k for k, _ in attrs}
        wanted = set(TEXT_ATTRS)
        if tag == "input" and dict(attrs).get("type") in ("submit", "button", "reset"):
            wanted.add("value")
        if tag == "meta" and ({"name", "property"} & names):
            key = dict(attrs).get("name") or dict(attrs).get("property")
            if key in META_NAMES:
                wanted.add("content")
        raw = text[start:end]
        for name in wanted & names:
            m = re.search(rf'\s{name}=(["\'])(.*?)\1', raw, re.S)
            if m and LETTER.search(m.group(2)):
                sites.append((start + m.start(2), start + m.end(2), norm(html.unescape(m.group(2)))))
    return sites


def extract(text):
    """Toate cheile de tradus dintr-o pagină."""
    units, tokens = _units(text)
    return [u[2] for u in units] + [s[2] for s in _attr_sites(text, tokens)]


def _render(translation, tags):
    out, last = [], 0
    for m in PLACEHOLDER.finditer(translation):
        out.append(html.escape(translation[last:m.start()], quote=False))
        out.append(tags.get(int(m.group(1)), ""))
        last = m.end()
    out.append(html.escape(translation[last:], quote=False))
    return "".join(out)


def apply(text, catalog):
    """Pagina tradusă și lista cheilor care lipsesc din catalog (rămân în română)."""
    units, tokens = _units(text)
    edits, missing = [], []
    for start, end, key, tags in units:
        if key in catalog:
            edits.append((start, end, _render(catalog[key], tags)))
        else:
            missing.append(key)
    for start, end, key in _attr_sites(text, tokens):
        if key in catalog:
            edits.append((start, end, html.escape(catalog[key], quote=True)))
        else:
            missing.append(key)
    for start, end, new in sorted(edits, reverse=True):
        text = text[:start] + new + text[end:]
    return text, missing


def check_placeholders(key, value):
    """Traducerea trebuie să conțină exact aceleași marcaje {n} ca originalul."""
    return sorted(PLACEHOLDER.findall(key)) == sorted(PLACEHOLDER.findall(value))
