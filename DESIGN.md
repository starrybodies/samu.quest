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

The third direction is implemented. Following the October 11 feedback, the signature is original woven-light artwork: copper, blue, and rose filaments connect into a tactile flowing form. Layered motion gives the image depth without moving text or controls. Authentic project marks live beside their descriptions. A cut-corner SB monogram uses Samuel Barnes’s initials and reads at navigation size. Functional icons are simple vector download, pause, and expand controls. Authentic company logos appear in a compact career strip and link to the corresponding experience records.

## Visual system

- Ink black: `#090909`
- Chalk text: `#eeeee8`
- Supporting text: `#b7b7ae`
- Peach actions/contact: `#f7b79e`
- Blue engineering: `#9cc9ee`
- Mint applied systems: `#9ad3b2`
- Acid yellow (hidden network): `#e5ff52`
- Dark professional surface: `#151613`
- Light professional surface: `#dfe1d7`
- Personal section pink: `#f3a2d9`

Tektur 700 carries the name and display headings: angular cuts, compact shapes, and an explicit technology vernacular. Bricolage Grotesque 400/600 gives body text, navigation, and factual labels a warmer, less uniform rhythm. Three pairings were rendered and compared: Oxanium/Spline Sans, Syne/Hanken Grotesk, and Tektur/Bricolage Grotesque. The third pairing is implemented; former production font assets were removed. Fonts are self-hosted WOFF2 files with their OFL licenses.

The opening composition pairs oversized SAMU typography with woven-light artwork. The professional section uses a raised dark surface by default and a paper surface in light mode, with readable records: company, role, dates, scope, and expandable detail. Symbai Studio and Overshoot use their official brand marks in spacious dark panels, with external links. Refinery’s modular mark replaces the former infrastructure image, and the GAIA AI detail page uses the official GAIA logo. Artwork is sourced from the projects’ own sites: Symbai’s logo.png, Overshoot’s overshoot-lockup.png, Refinery’s header SVG, and gaiaai.xyz/gaia-logo.png. Overshoot’s black wordmark receives a monochrome white CSS treatment on the dark panel; source artwork remains unchanged. These records describe the projects without inventing an unconfirmed personal title or contribution. The UN talk is embedded directly on the homepage, with the verified event date (18 September 2025), descriptive frame title, explicit referrer policy, and direct YouTube link. The creative section uses varied image proportions and authentic project artwork. The biography uses the third photograph from Samuel’s 9 September 2026 wedding carousel on Instagram (https://www.instagram.com/p/DdFjdGAGSXK/?img_index=3). The portrait shows his family together in golden-hour light, preserving the full 3:4 composition on desktop and mobile. The 1080×1440 JPEG is hosted locally; its natural colors and faces are unaltered. The caption links to the original post. The final peach section offers separate employment and project contact actions.

Dark is the default theme. A persistent header control switches between dark and light across all portfolio pages, and the independent Sacred/Saucy page shares the same saved preference while retaining its own visual system. The light palette uses deep terracotta, blue, green, and pink link text to preserve contrast. The hero image blends into the dark canvas and occupies a deliberate dark photographic field in light mode. Brand panels stay dark in both themes so the marks retain a consistent presentation.

Motion uses native browser animation APIs and CSS, with shared easing and duration tokens. The first session introduces the name over 600ms with 50ms letter intervals, followed by context, actions, and artwork using 400ms entrances with 60ms intervals. Sections and individual project records reveal once with 8px of travel. Native experience records interpolate measured heights on opening and closing, preserving keyboard use and supporting rapid reversals. Hover transitions, directional arrows, theme icons, and native dialogs keep interaction feedback responsive.

The hero has three independently moving visual layers with slow 12–18 second cycles, a shallow pointer perspective on fine pointers, and a restrained scroll offset. An explicit keyboard-accessible pause control remembers the visitor’s choice for the session. Ambient motion stops when the artwork is off-screen or the tab is hidden; there is no continuous JavaScript rendering loop. Without JavaScript the artwork is static. Reduced-motion preferences disable every animated layer, perspective, transition, entrance, and scroll effect. Reading progress, existing Easter eggs, and native scrolling remain available as appropriate to the preference.

Three deliberate Easter eggs keep playful interaction separate from professional copy: the hero name opens a Sun Rose music panel; the contact mark opens an interactive network garden; typing SAMU switches a constellation treatment. Panels use native dialogs, keyboard focus containment, Escape dismissal, and focus restoration. Network growth is available by pointer and by a labelled button. Keyboard discovery ignores editable fields and open dialogs. With JavaScript disabled, the name links directly to the music page and ordinary navigation, CV access, and work records remain usable.

## Copy and evidence

The opening states “Growth, marketing, and community leadership for the agentic era.” It connects commercial leadership to hands-on agentic engineering, with a dedicated professional section showing concrete public repositories and production interfaces. Primary actions lead to professional experience and a CV download. Section labels use plain terms: professional experience, professional projects, personal projects, background, and contact. Professional detail pages use the same factual tone. The approved colors, fonts, family photography, and section structure are preserved. The homepage uses actual roles and concrete responsibilities. Worldcoin audience growth is explicitly attributed to the small marketing team during Samuel's tenure. The collapsed Worldcoin record names global community leadership during the launch. Audience results and personal responsibility are explained inside the record. Forta audience sizes are not framed as incremental acquisition. GAIA's five-figure monthly engagement is attributed to Samuel's commercial work. CMO is a target role, not a previous title.

Facts are grounded in the supplied September 2026 CV, matching `samuel-barnes-cv.pdf`. No testimonials, revenue amounts, acquisition results, senior engineering titles, or institutional endorsements are invented. Overlapping engagements are disclosed.

The inactive writing projects and their detail page have been removed at Samuel’s request. Unfurl has a full professional project entry linking to the supplied app.unfurl.trade destination, with a factual research, risk, and authorized-execution description. No personal title or contribution is invented. The former Symbiocene Labs domain did not resolve; functioning project destinations and email replace it.

## Implementation

Directly navigable HTML pages and shared CSS. Small scripts separate theme initialization, navigation/theme controls, motion, and Easter eggs. Changed assets use content-derived version parameters so an existing preview receives the latest files. No new libraries are introduced. A standard-library Python script and hourly GitHub Action maintain a public project feed; the website reads that feed from GitHub’s raw-content CDN. A separate Codex heartbeat checks public LinkedIn announcements through the existing browser session. Publishing criteria, attribution, source-error behavior, and operational limits are documented in SYNC.md. Native details support work records with keyboard and without JavaScript. The mobile menu exposes state, closes on Escape or selection, and returns focus on Escape. The skip link targets a focusable main element. The obsolete recruiter page was removed in the preceding pass; the homepage is canonical.

Sacred/Saucy remains an independent event and production site. Its separate layout and concurrent workspace work are preserved.

## Artwork provenance

The rejected chrome sculpture has been removed from the site and social preview. The share image is a typographic composition using the site’s existing fonts, monogram, palette, and exact approved positioning.

Project descriptions were checked against the live Symbai site and the Overshoot README/live atlas. Symbai’s About page currently uses a different founder name; a user question is pending for the exact portfolio credit. Samuel’s public Overshoot launch post confirms his role building the atlas. Engineering examples were inspected against the public Overshoot and GHG Calculator repositories. GHG Calculator exposes eight MCP tools in source. Regen Heartbeat was removed at Samuel’s request. GAIA AI Web was removed from the production feed and its repository received the existing portfolio-hidden topic to prevent future automatic inclusion. No rankings or unsupported productivity claims are added.

## October 2026 refinement

The copy leads with teams, products, launches, and specific technical examples. Shorter introductions reduce repetition while preserving the exact approved subheading, professional/personal distinction, team attribution, fonts, palette, family photograph, and Easter eggs.

gAIas is included as an AI builder community, linking to https://gaias.symbai.studio. Its public site confirms news sharing, project feedback, launch support, member/project directories, and guided intake. The orbital galaxy mark is sourced from that site’s header asset, locally stored at 256px (17KB). The portfolio describes the project without inventing an unconfirmed personal title.

### Company artwork provenance

- Worldcoin: official World RGB logomark from https://world.org/brand, downloaded from the linked Logomark archive. Current guidelines explicitly allow the World mark to represent Worldcoin. The SVG path is preserved; its viewBox is trimmed to the visible artwork bounds to eliminate the source canvas padding. The visible company name remains Worldcoin, matching the CV.
- Daylight: official header wordmark at https://godaylight.com/_next/static/media/logo-main.417b1780.svg. The source SVG is unchanged; CSS uses monochrome presentation per theme.
- Power Finance: official mark at https://powerfinance.io/logo/static-logo-red-round.svg. The red original is retained.
- Forta: official inline header wordmark from https://forta.org/. Its vector paths are preserved, with a monochrome CSS treatment.

No new dependencies or compatibility layers were added. The obsolete sigil asset and hook were removed.

### October 8 identity and project refinement

The rejected signal-path S and chrome hero have been replaced throughout. Company marks now use consistent optical proportions, with each previous role shown underneath. Professional projects include two concise capability rows and explicit exploration links. Existing section order, routes, family photo, CV, UN video, and Easter eggs remain intact. Native HTML links and CSS power the work map; no library or additional interactive state is needed.

### October 8 spectrum, texture, and motion

Samuel requested less lime and a more joyful visit. Peach now anchors actions/contact; blue marks engineering, mint marks applied systems, and pink carries community/personal work. The monogram is chalk; the favicon is peach. Fine static grain gives the surfaces a tactile character, with faint contour lines behind the hero. No texture overlays sit above readable text or controls.

The first-visit name arrives letter by letter. Hover choreography adds a small colored wave across the name. Project connections draw on hover and keyboard focus, coordinated with each node’s color and lift. Decorative orbit rings rotate with the hero’s scroll progress; personal imagery settles into its section using CSS view timelines. Brand panels use subtle corner rings that respond to interaction. Native scrolling, stable content, and all existing contact/navigation paths remain intact. Reduced motion disables every new animation while keeping all content and feedback available. No new dependencies, pointer polling, continuous animation loop, or autoplay media are added.


## October 11 artwork and recent projects

The hero replaces the project-map composition with an original image generated for this portfolio using the built-in image-generation tool. Its specification uses fine woven optical filaments, a dark open aperture, and restrained copper/blue/rose color. No stock photograph or generic chrome sculpture is used. The original remains outside the repository; production uses 1536px and 960px WebP encodings (330KB and 131KB), explicit dimensions, responsive selection, and high-priority loading.

NOOG and Unfurl have complete project entries. NOOG’s official wordmark comes from https://noog.symbai.studio/assets/noog-wordmark.png; the experimental alpha and local-processing descriptions were checked against its live site. Unfurl's current approved sculptural mark comes from the supplied https://unfurl-brand.gaiaai.chatgpt.site/brand/ reference. The obsolete SVG mark has been removed. No unverified role or trading result is claimed.

Cosmic Conference links to https://cosmic.symbai.studio with its authentic logo, confirmed October 31, 2026 event date, and the digital work Samuel publicly announced. The logo is saved as a new portfolio-specific asset, preserving the separate event site’s existing file. Sacred/Saucy links directly to https://saucy.samu.quest and uses its existing identity artwork. Alchememes appears in a restrained publishing row linking to the verified daily publication at https://alchememes.vercel.app; no audience size is inferred.

The automatic project feed suppresses duplicates by curated source ID and normalized live URL. Distinct projects on another path of the same host remain eligible. LinkedIn announcements remain visible even when their projects have static entries. If a remote feed expands above a visible hash-linked section, the page preserves that section’s position instead of shifting the visitor’s reading location.

## October 12 Unfurl and daylight artwork

Unfurl spans the product grid with its approved botanical winged U on the reference site's graphite mineral stage. The mark retains its original proportions and transparent background, encoded at 800px for this surface. The source material plate is preserved unchanged. Portfolio typography and factual copy describe quantitative research, allocation, execution, review, and invitation-based access. The app link remains https://app.unfurl.trade. No investment-return claim is repeated. NOOG and gAIas now form a paired row, avoiding an empty grid cell around the full-width Unfurl feature.

The hero's dark image, crop, and motion controller remain unchanged. A daylight edit of the same weave supplies copper, slate-blue, and rose filaments on the light page's pale background. Both versions use the existing radial edge mask. CSS selects the image using the current theme; the daylight image loads lazily and has 1536px and 960px encodings. No additional state controller, animation loop, or dependency is introduced. Motion controls, saved-theme behavior, and reduced-motion handling apply to both artworks.
