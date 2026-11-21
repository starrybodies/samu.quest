"""Publish the project catalogue as static HTML for both reading and walking."""
from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data/island-projects.json").read_text())
PLACES = {p["id"]: p for p in DATA["places"]}
PROJECTS = {p["id"]: p for p in DATA["projects"]}

# These line drawings identify a place even without colour, photography or WebGL.
SYMBOLS = {
    "observatory": '<path d="M5 21h22M7 18h18v3H7zM8 17a8 8 0 0 1 16 0M12 16c0-4 2-7 4-8m2 0 5-5 2 2-5 5M10 24v3m12-3v3"/>',
    "field-station": '<path d="M3 21c4-1 5-6 9-6 3 0 4 3 7 3s4-4 9-4M3 25c4 0 6-4 10-4 5 0 6 3 13-1M6 14l4-7 4 7M17 11l4-8 5 9"/>',
    "workshop": '<path d="M4 25h24V12l-7 4V9l-8 6V7l-6 4-3 5Zm4-5h3m4 0h3m4 0h3"/>',
    "stage": '<path d="M4 23h24M7 21V10a9 9 0 0 1 18 0v11M10 19v-8a6 6 0 0 1 12 0v8m-8-1v-4m4 4v-6M6 27h20"/>',
    "glasshouse": '<path d="M4 25h24M6 24V13l10-8 10 8v11M6 14h20M11 24V12l5-7 5 7v12m-6 0v-5h3v5"/>',
    "library": '<path d="M3 7c6-1 9 0 13 3 4-3 7-4 13-3v17c-6-1-9 0-13 3-4-3-7-4-13-3Zm13 3v17M6 11l6 2m8 0 6-2"/>'
}

def icon(place):
    return ('<svg class="place-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" '
            'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
            + SYMBOLS[place] + '</svg>')

def action(url, label):
    return f'<a href="{escape(url)}">{escape(label)}</a>'

def actions(project):
    return ' '.join(action(url, label) for label, url in (
        ([[project["action"], project["url"]]] if project.get("url") else []) + project.get("related", [])
    ))

def art(project):
    if project.get("image"):
        return (f'<img src="{escape(project["image"])}" alt="{escape(project["alt"])}" '
                'width="720" height="420" loading="lazy" decoding="async">')
    return icon(project["place"])

def featured(project):
    return f'''<article class="exhibit" data-place="{project["place"]}">
 <a href="{escape(project["url"])}"><div class="exhibit-art">{art(project)}</div>
 <div class="exhibit-caption"><div><p class="art-kind">{escape(project["kind"])}</p><h3>{escape(project["title"])}</h3></div></div>
 <p class="exhibit-summary">{escape(project["summary"])}</p><span class="exhibit-action">{escape(project["action"])}</span></a>
</article>'''

def record(project):
    place = project["place"]
    links = actions(project)
    return f'''<article class="project-record" id="{project["id"]}" data-place="{place}">
 <div class="record-art{' symbol-art' if not project.get("image") else ''}">{art(project)}</div>
 <div class="record-body"><p class="art-kind">{escape(project["kind"])}</p><h2>{escape(project["title"])}</h2>
 <p class="record-summary">{escape(project["summary"])}</p>
 {f'<div class="record-links">{links}</div>' if links else ''}</div>
</article>'''

def place_section(place):
    projects = [p for p in PROJECTS.values() if p["place"] == place["id"]]
    records = []
    for p in projects:
        links = actions(p)
        records.append(f'''<article><p class="island-kind">{escape(p["kind"])}</p><h3>{escape(p["title"])}</h3><p>{escape(p["summary"])}</p>
 {f'<div class="record-links">{links}</div>' if links else ''}</article>''')
    return f'''<section class="place-section" id="place-{place["id"]}" data-place="{place["id"]}" data-color="{place["color"]}" aria-labelledby="heading-{place["id"]}">
 <p class="quest-kicker">{escape(place["category"])}</p><h2 id="heading-{place["id"]}">{escape(place["name"])}</h2>
 <p class="place-intro">{escape(place["intro"])}</p><div class="island-projects">{chr(10).join(records)}</div>
</section>'''

def replace_region(path, name, chunks):
    file = ROOT / path
    source = file.read_text()
    start, end = f"<!-- {name}:start -->", f"<!-- {name}:end -->"
    pattern = re.escape(start) + r".*?" + re.escape(end)
    result, count = re.subn(pattern, lambda _: '\n'.join([start, *chunks, end]), source, flags=re.S)
    if count != 1:
        raise ValueError(f"Expected one {name} region in {path}")
    file.write_text(result)

if __name__ == "__main__":
    if len(PROJECTS) != len(DATA["projects"]) or len(PLACES) != len(DATA["places"]):
        raise ValueError("Project and place IDs must be unique")
    for p in PROJECTS.values():
        if p["place"] not in PLACES or (p.get("image") and not (ROOT / p["image"].lstrip("/")).is_file()):
            raise ValueError(p["id"])
    replace_region("index.html", "featured", (featured(PROJECTS[key]) for key in DATA["featured"]))
    replace_region("projects/index.html", "catalog", map(record, PROJECTS.values()))
    replace_region("projects/index.html", "filters", (
        f'<button type="button" data-filter="{p["id"]}" aria-pressed="false">{escape(p["category"])}</button>'
        for p in PLACES.values()))
    replace_region("world/index.html", "directory", (
        f'<a href="#place-{p["id"]}" data-go="{p["id"]}">{icon(p["id"])}<span>{escape(p["name"])}<small>{escape(p["category"])}</small></span></a>'
        for p in PLACES.values()))
    replace_region("world/index.html", "places", map(place_section, PLACES.values()))
