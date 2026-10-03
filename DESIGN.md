# samu.quest

## Purpose

A personal website that helps teams evaluate Samuel Barnes for Head of Growth, Head of Community, CMO, founding-team, fractional, and project engagements. Professional experience leads. Independent music, gatherings, and botanicals remain visibly separate.

## Direction: ecological hacker zine

The previous corporate portfolio treatment was rejected. This design uses the intersection of Samuel's actual interests—networks, environmental intelligence, code, sound, and gatherings—as its visual source.

Three directions were considered:

| Direction | Strength | Risk |
| --- | --- | --- |
| Terminal dossier | Clear, compact, easy to scan | Familiar hacker cliché; can obscure the human identity |
| Cyberpunk club poster | Strong music connection and graphic energy | Can make the professional work feel secondary |
| Ecological hacker zine | Connects technology, living systems, and culture | Needs restrained navigation and concrete professional evidence |

The third direction is implemented. The signature image is a chrome branching sculpture, between mycelium and circuitry. It is decorative artwork, not a product photograph or evidence of technical work. A custom woven sigil connects the brand, favicon, and contact section. Functional icons are simple vector download and expand controls; company names are text, not invented logos.

## Visual system

- Ink black: `#090909`
- Chalk text: `#eeeee8`
- Supporting text: `#b7b7ae`
- Acid yellow: `#e5ff52`
- Dark professional surface: `#151613`
- Light professional surface: `#dfe1d7`
- Personal section pink: `#f3a2d9`

Tektur 700 carries the name and display headings: angular cuts, compact shapes, and an explicit technology vernacular. Bricolage Grotesque 400/600 gives body text, navigation, and factual labels a warmer, less uniform rhythm. Three pairings were rendered and compared: Oxanium/Spline Sans, Syne/Hanken Grotesk, and Tektur/Bricolage Grotesque. The third pairing is implemented; former production font assets were removed. Fonts are self-hosted WOFF2 files with their OFL licenses.

The opening composition pairs oversized SAMU typography with the original chrome artwork. The professional section uses a raised dark surface by default and a paper surface in light mode, with readable records: company, role, dates, scope, and expandable detail. Symbai Studio and Overshoot have project previews captured from their live websites, with external links. These records describe the projects without inventing an unconfirmed personal title or contribution. The UN talk is embedded directly on the homepage, with the verified event date (18 September 2025), descriptive frame title, explicit referrer policy, and direct YouTube link. The personal section uses staggered imagery, existing project artwork, and real event photography. The biography uses the third photograph from Samuel’s 9 September 2026 wedding carousel on Instagram (https://www.instagram.com/p/DdFjdGAGSXK/?img_index=3). The portrait shows his family together in golden-hour light, preserving the full 3:4 composition on desktop and mobile. The 1080×1440 JPEG is hosted locally; its natural colors and faces are unaltered. The caption links to the original post. The final acid-yellow section offers separate employment and project contact actions.

Dark is the default theme. A persistent header control switches between dark and light across all portfolio pages, and the independent Sacred/Saucy page shares the same saved preference while retaining its own visual system. The light palette uses dark olive link text and deeper pink to preserve contrast. The original chrome image is inverted and blended for the light composition. Actual Symbai and Overshoot previews were recaptured using their own dark-mode controls; no preview UI is fabricated.

Motion uses native browser animation APIs and CSS, with shared easing and duration tokens. The first session introduction sequences name, summary, and actions at 50ms intervals. Section groups reveal once, experience content animates when opened, project imagery and arrows respond to hover, and the chrome artwork follows pointer movement within a small range. A thin reading-progress line reflects page position. Native dialogs animate on opening. There is no idle animation or autoplay. Reduced-motion preferences disable transitions, entrances, pointer motion, and animated network drawing while preserving all content and controls.

Three deliberate Easter eggs keep playful interaction separate from professional copy: the hero name opens a Sun Rose music panel; the contact sigil opens an interactive network garden; typing SAMU switches a constellation treatment. Panels use native dialogs, keyboard focus containment, Escape dismissal, and focus restoration. Network growth is available by pointer and by a labelled button. Keyboard discovery ignores editable fields and open dialogs. With JavaScript disabled, the name links directly to the music page and ordinary navigation, CV access, and work records remain usable.

## Copy and evidence

The opening states “Growth, marketing, and community leadership for the agentic era.” It connects commercial leadership to hands-on agentic engineering, with a dedicated professional section showing concrete public repositories and production interfaces. Primary actions lead to professional experience and a CV download. Section labels use plain terms: professional experience, professional projects, personal projects, background, and contact. Professional detail pages use the same factual tone. The approved colors, fonts, imagery, and graphic identity are preserved. The homepage uses actual roles and concrete responsibilities. Worldcoin audience growth is explicitly attributed to the small marketing team during Samuel's tenure. The X result is visible in the collapsed record, while his personal responsibility for community leadership is explained inside it. Forta audience sizes are not framed as incremental acquisition. GAIA's five-figure monthly engagement is attributed to Samuel's commercial work. CMO is a target role, not a previous title.

Facts are grounded in the supplied September 2026 CV, matching `samuel-barnes-cv.pdf`. No testimonials, revenue amounts, acquisition results, senior engineering titles, or institutional endorsements are invented. Overlapping engagements are disclosed.

The inactive writing projects and their detail page have been removed at Samuel’s request. Unfurl is included as a professional project reference linking to the supplied app.unfurl.trade destination, with a neutral research, risk, and authorized-execution description. No personal title or contribution is invented. The former Symbiocene Labs domain did not resolve; functioning project destinations and email replace it.

## Implementation

Directly navigable HTML pages and shared CSS. Small scripts separate theme initialization, navigation/theme controls, motion, and Easter eggs. Changed assets use content-derived version parameters so an existing preview receives the latest files. No new libraries are introduced. A standard-library Python script and hourly GitHub Action maintain a public project feed; the website reads that feed from GitHub’s raw-content CDN. A separate Codex heartbeat checks public LinkedIn announcements through the existing browser session. Publishing criteria, attribution, source-error behavior, and operational limits are documented in SYNC.md. Native details support work records with keyboard and without JavaScript. The mobile menu exposes state, closes on Escape or selection, and returns focus on Escape. The skip link targets a focusable main element. The obsolete recruiter page was removed in the preceding pass; the homepage is canonical.

Sacred/Saucy remains an independent event and production site. Its separate layout and concurrent workspace work are preserved.

## Artwork provenance

`images/chrome-mycelium.webp` was generated with the built-in imagegen tool, then encoded as WebP. The prompt specified a branching liquid-chrome botanical/cybernetic sculpture, black photographic backdrop, sparse acid-yellow highlights, analog halftone grain, and no text, logo, person, globe, or UI. Its original generated PNG is preserved in the Codex generated-images directory.

Project descriptions were checked against the live Symbai site and the Overshoot README/live atlas. Symbai’s About page currently uses a different founder name; a user question is pending for the exact portfolio credit. Samuel’s public Overshoot launch post confirms his role building the atlas. Engineering examples were inspected against the public Overshoot and GHG Calculator repositories and Regen Heartbeat’s publishing workflow and successful runs. GHG Calculator exposes eight MCP tools in source. Regen Heartbeat is explicitly attributed to the GAIA AI team. No rankings or unsupported productivity claims are added.
