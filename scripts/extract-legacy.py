#!/usr/bin/env python3
"""
Extract the legacy static site (git ref `main`) into structured JSON under
src/data/legacy/. Content is copied verbatim; only the business identity values
the owner supplied for the rebrand are substituted (phone, address, domain).

Run from the repo root:   python3 -I scripts/extract-legacy.py
Source is read with `git show <ref>:<path>` so it keeps working after the old
HTML files are removed from the Astro branch.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

from bs4 import BeautifulSoup

REF = sys.argv[1] if len(sys.argv) > 1 else "origin/main"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "legacy"

OLD_PHONE = "(512) 885-3062"
NEW_PHONE = "(512) 877-2577"
OLD_ADDR = "4717 Priem Ln Suite 303, Pflugerville, TX 78660"
NEW_ADDR = "1801 Maple Vista Dr, Pflugerville, TX 78660, USA"


def git(*args: str) -> str:
    return subprocess.run(["git", *args], cwd=ROOT, check=True, capture_output=True, text=True).stdout


def read(path: str) -> BeautifulSoup:
    html = git("show", f"{REF}:{path}")
    # Legacy bug: <a href='/service-area/sarah's-creek-78660'> — the apostrophe ends the attribute, so the
    # old link pointed at /service-area/sarah (404). Repair it to the intended URL.
    html = html.replace("href='/service-area/sarah's-creek-78660'", "href=\"/service-area/sarah's-creek-78660\"")
    return BeautifulSoup(html, "lxml")


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def T(el) -> str:
    return norm(el.get_text()) if el is not None else ""


def inner(el) -> str:
    return "".join(str(c) for c in el.contents).strip()


def meta(soup, name):
    m = soup.find("meta", attrs={"name": name})
    return m["content"].strip() if m and m.get("content") else ""


def head(soup):
    return {
        "title": norm(soup.title.get_text()),
        "description": meta(soup, "description"),
    }


def sections(soup):
    return soup.body.find_all("section", recursive=False)


def h_with(root, tag, startswith=None, contains=None):
    """First matching heading that is template chrome (i.e. not inside the free-form prose body)."""
    for h in root.find_all(tag):
        if h.find_parent("div", class_="prose"):
            continue
        t = T(h)
        if (startswith and t.startswith(startswith)) or (contains and contains in t):
            return h
    return None


def link_list(root):
    return [{"label": T(a), "href": a["href"]} for a in root.find_all("a") if a.get("href")]


def faq(section):
    out = []
    for h in section.find_all("h4"):
        p = h.find_next("p")
        out.append({"q": T(h), "a": T(p)})
    return out


def contact_card(section):
    """The 'Contact Information' card of the map section (labels only; values are templated)."""
    card = h_with(section, "h3", "Contact Information")
    card = card.parent
    ps = [T(p) for p in card.find_all("p")]
    return ps


def items_in(block, with_p=True):
    out = []
    for h in block.find_all("h4"):
        p = h.parent.find("p")
        out.append({"title": T(h), "text": T(p) if (p is not None and with_p) else ""})
    return out


def items_after(h2, with_p=True):
    """h4 items (with optional following <p>) between this h2 and the next h2/h3, in document order."""
    out = []
    for el in h2.find_all_next(["h2", "h3", "h4"]):
        if el.name != "h4":
            break
        p = el.parent.find("p")
        out.append({"title": T(el), "text": T(p) if (p is not None and with_p) else ""})
    return out


def parse_service(path):
    soup = read(path)
    secs = sections(soup)
    hero, details = secs[0], secs[1]
    faq_sec = next(s for s in secs if h_with(s, "h2", "Frequently Asked Questions"))
    map_sec = next(s for s in secs if h_with(s, "h2", contains="Service Areas") and s.find("iframe"))
    prose = details.select_one("div.prose")
    ben_h2 = h_with(details, "h2", "Why Choose")
    proc_h2 = h_with(details, "h2", "Our Process")
    cta_h3 = h_with(details, "h3", "Ready to Get Started?")
    areas_h3 = h_with(details, "h3", contains="Service Areas")
    cta = cta_h3.parent
    areas_card = areas_h3.parent
    map_h2 = h_with(map_sec, "h2", contains="Service Areas")
    data = {
        **head(soup),
        "h1": T(hero.find("h1")),
        "subtitle": T(hero.find("p")),
        "prose": inner(prose),
        "benefitsHeading": T(ben_h2),
        "benefits": items_after(ben_h2),
        "processHeading": T(proc_h2),
        "process": items_after(proc_h2),
        "cta": {"title": T(cta_h3), "text": T(cta.find("p"))},
        "areasCard": {
            "title": T(areas_h3),
            "text": T(areas_card.find("p")),
            "links": link_list(areas_card),
        },
        "faqHeading": T(faq_sec.find("h2")),
        "faq": faq(faq_sec),
        "faqClosing": {
            "text": T(next(p for p in faq_sec.find_all("p") if "more questions" in p.get_text())),
            "button": T(next(a for a in faq_sec.find_all("a") if a.get("href", "").startswith("tel:"))),
        },
        "map": {
            "title": T(map_h2),
            "subtitle": T(map_h2.find_next("p")),
            "iframe": map_sec.find("iframe")["src"],
            "contact": contact_card(map_sec),
        },
    }
    return data


def parse_area(path):
    soup = read(path)
    secs = sections(soup)
    hero, details = secs[0], secs[1]
    map_sec = next(s for s in secs if s.find("iframe") and h_with(s, "h2", "Find Us in"))
    prose = details.select_one("div.prose")
    why_h2 = h_with(details, "h2", "Why Choose Us in")
    cov_h3 = h_with(details, "h3", "Our Service Coverage in")
    cta_h3 = h_with(details, "h3", "Local Roofing Services Pflugerville TX Experts")
    info_h3 = h_with(details, "h3", contains="Service Info")
    svc_h4 = h_with(details, "h4", "Our Roofing Services Pflugerville TX Services")
    info_card = info_h3.parent
    rows = []
    for row in info_card.select("div.flex.justify-between"):
        spans = row.find_all("span")
        rows.append({"label": T(spans[0]), "value": T(spans[1])})
    map_h2 = h_with(map_sec, "h2", "Find Us in")
    near_h3 = h_with(map_sec, "h3", contains="Nearby Areas")
    near_card = near_h3.parent
    return {
        **head(soup),
        "h1": T(hero.find("h1")),
        "subtitle": T(hero.find("p")),
        "prose": inner(prose),
        "whyHeading": T(why_h2),
        "why": items_after(why_h2),
        "coverage": {"title": T(cov_h3), "text": T(cov_h3.find_next("p"))},
        "cta": {"title": T(cta_h3), "text": T(cta_h3.find_next("p"))},
        "infoTitle": T(info_h3),
        "infoRows": rows,
        "servicesHeading": T(svc_h4),
        "serviceLinks": link_list(svc_h4.parent),
        "map": {
            "title": T(map_h2),
            "subtitle": T(map_h2.find_next("p")),
            "iframe": map_sec.find("iframe")["src"],
            "contact": contact_card(map_sec),
        },
        "nearbyTitle": T(near_h3),
        "nearbyLinks": [l for l in link_list(near_card) if "/service-area/" in l["href"]],
        "viewAllLabel": T(next(a for a in near_card.find_all("a") if a["href"] == "/")),
    }


def parse_blog_post(path):
    soup = read(path)
    main = soup.find("main")
    art = main.find("article")
    hdr = art.find("header")
    spans = [T(s) for s in hdr.find_all("span")]
    lead = hdr.select_one("div.italic")
    prose = art.select_one("div.prose")
    cta_h3 = art.find_all("h3")[-1]
    cta = cta_h3.parent
    return {
        **head(soup),
        "h1": T(art.find("h1")),
        "author": spans[0],
        "date": spans[1],
        "lead": T(lead),
        "prose": inner(prose),
        "cta": {"title": T(cta_h3), "text": T(cta.find("p")), "button": T(cta.find("a"))},
    }


def parse_blog_index():
    soup = read("blog/index.html")
    main = soup.find("main")
    h1 = main.find("h1")
    intro = h1.find_next("p")
    posts = []
    for art in main.find_all("article"):
        h2 = art.find("h2")
        a = h2.find("a")
        byline = T(art.select_one("div.text-sm"))
        author, _, date = (x.strip() for x in byline.partition("•"))
        posts.append(
            {
                "href": a["href"],
                "title": T(h2),
                "author": author,
                "date": date,
                "excerpt": T(art.find("p")),
                "readMore": T(art.find_all("a")[-1]),
            }
        )
    cta_h3 = main.find_all("h3")[-1]
    cta = cta_h3.parent
    return {
        **head(soup),
        "h1": T(h1),
        "intro": T(intro),
        "posts": posts,
        "cta": {"title": T(cta_h3), "text": T(cta.find("p")), "button": T(cta.find("a"))},
    }


def parse_home():
    soup = read("index.html")
    body = soup.body
    hero = soup.find("section", id="home")
    about = soup.find("section", id="about")
    services = soup.find("section", id="services")
    contact = soup.find("section", id="contact")
    why_h2 = h_with(soup, "h2", "Why Customers Choose Us")
    why = why_h2.find_parent("section")
    find_h2 = h_with(soup, "h2", "Find Us in")
    find = find_h2.find_parent("section")

    # hero
    stat_divs = hero.select("div.grid.grid-cols-3 > div")
    stats = [{"value": T(d.find_all("div")[0]), "label": T(d.find_all("div")[1])} for d in stat_divs]
    est_h3 = h_with(hero, "h3", "Get Your Free Estimate")
    est_items = [{"title": T(h), "text": T(h.find_next("p"))} for h in est_h3.parent.find_all("h4")]
    cta_btn = next(a for a in hero.find_all("a") if a["href"].startswith("tel:"))
    hero_data = {
        "badge": T(hero.select_one("span.text-lg.font-semibold")),
        "h1": T(hero.find("h1")),
        "subtitle": T(hero.find("h1").find_next("p")),
        "ctaLabel": T(cta_btn),
        "secondaryLabel": T(next(a for a in hero.find_all("a") if a["href"] == "#services")),
        "stats": stats,
        "estimateTitle": T(est_h3),
        "estimateItems": est_items,
    }

    # about
    about_prose = about.select_one("div.prose")
    feats = [
        {"title": T(h), "text": T(h.find_next("p"))}
        for h in about.find_all("h3")
        if h.find_parent("div", class_="text-center") and h.find_next("p")
    ]
    about_data = {
        "badge": T(about.select_one("div.inline-flex")),
        "h2": T(about.find("h2")),
        "prose": inner(about_prose),
        "features": [
            {"title": T(h), "text": T(h.find_next("p"))}
            for h in about.select("div.grid.md\\:grid-cols-3 h3, div.grid.grid-cols-1.md\\:grid-cols-3 h3")
        ],
    }

    # services
    cards = []
    for h3 in services.select("div.group h3"):
        grp = h3.find_parent("div", class_="group")
        a = grp.find("a")
        cards.append({"title": T(h3), "text": T(h3.find_next("p")), "href": a["href"], "cta": T(a)})
    add_h3 = h_with(services, "h3", "Additional Services")
    add_links = link_list(add_h3.parent)
    services_data = {
        "h2": T(services.find("h2")),
        "subtitle": T(services.find("h2").find_next("p")),
        "cards": cards,
        "additionalTitle": T(add_h3),
        "additional": add_links,
    }

    # why
    why_items = [{"title": T(h), "text": T(h.find_next("p"))} for h in why.find_all("h3")]
    why_data = {
        "badge": T(why.select_one("div.inline-flex")),
        "h2": T(why_h2),
        "subtitle": T(why_h2.find_next("p")),
        "items": why_items,
    }

    # find us
    emg_h3 = h_with(find, "h3", "Emergency Service")
    find_data = {
        "h2": T(find_h2),
        "subtitle": T(find_h2.find_next("p")),
        "iframe": find.find("iframe")["src"],
        "contact": contact_card(find),
        "emergencyTitle": T(emg_h3),
        "emergencyText": T(emg_h3.find_next("p")),
        "emergencyCta": T(emg_h3.parent.find("a")),
    }

    # contact
    c_h2 = contact.find("h2")
    form_h3 = h_with(contact, "h3", "Request Free Estimate")
    contact_data = {
        "h2": T(c_h2),
        "subtitle": T(c_h2.find_next("p")),
        "labels": [T(h) for h in contact.select("h3.font-semibold")],
        "formTitle": T(form_h3),
        "formText": T(form_h3.find_next("p")),
    }

    footer = soup.find("footer")
    return {
        **head(soup),
        "hero": hero_data,
        "about": about_data,
        "services": services_data,
        "why": why_data,
        "find": find_data,
        "contact": contact_data,
        "footer": {
            "tagline": T(footer.find("p")),
            "rating": [T(s) for s in footer.find_all("span") if "Rating" in T(s) or "⭐" in T(s)],
        },
    }


def parse_shared():
    soup = read("index.html")
    nat = next(s for s in sections(soup) if h_with(s, "h2", "Roofing Contractor Serving across USA"))
    h2 = nat.find("h2")
    why_h3 = h_with(nat, "h3", "Why Choose Nationwide Service?")
    states_h3 = h_with(nat, "h3", "States We Serve")
    states = []
    for a in states_h3.parent.find_all("a"):
        m = re.match(r"https://([a-z]+)\.jncroofing\.com/", a["href"])
        states.append({"code": m.group(1), "name": T(a)})
    blog = read("blog/index.html")
    return {
        "nationwide": {
            "badge": T(nat.select_one("div.inline-flex")),
            "h2": T(h2),
            "text": T(h2.find_next("p")),
            "iframe": nat.find("iframe")["src"],
            "whyTitle": T(why_h3),
            "why": [{"title": T(h), "text": T(h.find_next("p"))} for h in why_h3.parent.find_all("h4")],
            "statesTitle": T(states_h3),
        },
        "legacyStates": states,
        "footerTaglineBlog": T(blog.find("footer").find("p")),
    }


def slugs(prefix):
    names = git("ls-tree", "--name-only", REF, f"{prefix}/").splitlines()
    return sorted(n.split("/", 1)[1][: -len(".html")] for n in names if n.endswith(".html") and not n.endswith("index.html"))


def substitute(obj):
    """Apply the owner's rebrand identity values to every string."""
    if isinstance(obj, str):
        s = obj.replace(OLD_PHONE, NEW_PHONE).replace(OLD_ADDR, NEW_ADDR)
        return s
    if isinstance(obj, list):
        return [substitute(x) for x in obj]
    if isinstance(obj, dict):
        return {k: substitute(v) for k, v in obj.items()}
    return obj


def dump(name, obj):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_text(json.dumps(substitute(obj), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main():
    services = []
    for slug in slugs("services"):
        d = parse_service(f"services/{slug}.html")
        services.append({"slug": slug, **d})
    areas = []
    for slug in slugs("service-area"):
        d = parse_area(f"service-area/{slug}.html")
        areas.append({"slug": slug, **d})
    posts = []
    for slug in slugs("blog"):
        d = parse_blog_post(f"blog/{slug}.html")
        posts.append({"slug": slug, **d})
    dump("home.json", parse_home())
    dump("services.json", services)
    dump("areas.json", areas)
    dump("blog-posts.json", posts)
    dump("blog-index.json", parse_blog_index())
    dump("shared.json", parse_shared())
    print(f"services={len(services)} areas={len(areas)} posts={len(posts)}")


if __name__ == "__main__":
    main()
