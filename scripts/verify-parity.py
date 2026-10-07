#!/usr/bin/env python3
"""
Content-parity check: every text block on every legacy page (git ref `main`) must appear in the
corresponding built page in ./dist, after applying the owner-approved identity changes.

  python3 -I scripts/verify-parity.py [ref]

Exit code 1 when any legacy text is missing. Known/expected differences are listed in ALLOWED.
"""
import datetime
import re
import subprocess
import sys
from pathlib import Path

from bs4 import BeautifulSoup, Comment

REF = sys.argv[1] if len(sys.argv) > 1 else "origin/main"
ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
YEAR = datetime.date.today().year

SUBST = [
    ("(512) 885-3062", "(512) 877-2577"),
    ("4717 Priem Ln Suite 303, Pflugerville, TX 78660", "1801 Maple Vista Dr, Pflugerville, TX 78660, USA"),
]
# Legacy chrome strings that the redesign deliberately replaces (not page content)
ALLOWED = {
    "getquote", "call", "tel", "p",            # old header buttons / logo initial
}


def git(*a):
    return subprocess.run(["git", *a], cwd=ROOT, check=True, capture_output=True, text=True).stdout


def alnum(s: str) -> str:
    s = s.lower().replace("&", "and")
    return re.sub(r"[^a-z0-9]+", "", s)


ALLOWED = {alnum(x) for x in ALLOWED}


def apply(s: str) -> str:
    for a, b in SUBST:
        s = s.replace(a, b)
    return s.replace("© 2025", f"© {YEAR}")


def clean_old(html: str) -> BeautifulSoup:
    soup = BeautifulSoup(html, "lxml")
    for c in soup.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    for t in soup(["script", "style", "noscript", "iframe", "svg"]):
        t.decompose()
    return soup


def blocks(soup):
    out = []
    for el in soup.body.find_all(["h1", "h2", "h3", "h4", "p", "li", "td", "th", "blockquote", "figcaption", "a", "button", "span", "div"]):
        # only leaf blocks: containers are covered by the elements inside them
        if el.name in ("div", "span", "a", "li") and el.find(["p", "div", "li", "ul", "h1", "h2", "h3", "h4", "table", "section"]):
            continue
        if el.name == "div" and el.find(True):
            continue
        t = alnum(apply(el.get_text(" ")))
        if t:
            out.append((el.name, t, re.sub(r"\s+", " ", apply(el.get_text(" "))).strip()))
    return out


def new_text(path: Path) -> str:
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "lxml")
    for t in soup(["script", "style", "noscript", "svg"]):
        t.decompose()
    return alnum(soup.body.get_text(" ")) + alnum(" ".join(soup.title.stripped_strings)) + alnum(" ".join(m.get("content", "") for m in soup.find_all("meta")))


def pairs():
    names = git("ls-tree", "-r", "--name-only", REF).splitlines()
    for n in names:
        if not n.endswith(".html"):
            continue
        if n == "index.html":
            yield n, DIST / "index.html"
        elif n == "blog/index.html":
            yield n, DIST / "blog" / "index.html"
        else:
            yield n, DIST / n


missing_total = 0
pages = 0
for old, new in pairs():
    pages += 1
    if not new.exists():
        print(f"MISSING PAGE  {old} -> {new}")
        missing_total += 1
        continue
    raw_old = BeautifulSoup(git("show", f"{REF}:{old}"), "lxml")
    new_soup = BeautifulSoup(new.read_text(encoding="utf-8"), "lxml")
    # <title>, meta description and <h1> must be byte-for-byte the legacy values (after identity substitution)
    def md(sp):
        m = sp.find("meta", attrs={"name": "description"})
        return re.sub(r"\s+", " ", m["content"]).strip() if m else ""
    for label, a, b in [
        ("title", re.sub(r"\s+", " ", apply(raw_old.title.get_text())).strip(), re.sub(r"\s+", " ", new_soup.title.get_text()).strip()),
        ("meta description", apply(md(raw_old)), md(new_soup)),
        ("h1", re.sub(r"\s+", " ", apply(raw_old.find("h1").get_text())).strip(), re.sub(r"\s+", " ", new_soup.find("h1").get_text()).strip()),
    ]:
        if a != b:
            print(f"\n{old}: {label} differs\n   old: {a}\n   new: {b}")
            missing_total += 1
    soup = clean_old(git("show", f"{REF}:{old}"))
    hay = new_text(new)
    miss = []
    seen = set()
    for name, t, raw in blocks(soup):
        if t in seen or t in ALLOWED:
            continue
        seen.add(t)
        if t not in hay:
            miss.append((name, raw))
    if miss:
        print(f"\n{old}: {len(miss)} legacy text block(s) not found")
        for name, raw in miss[:12]:
            print(f"   <{name}> {raw[:150]}")
        missing_total += len(miss)
print(f"\nchecked {pages} legacy pages; {missing_total} issue(s)")
sys.exit(1 if missing_total else 0)
