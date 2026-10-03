# Automatic portfolio updates

Samuel authorized automatic publication when these criteria match. Static case studies remain editorially maintained; automatic updates add concise, linked records to the appropriate section.

## GitHub production projects

GitHub Actions checks the public `starrybodies` account hourly at minute 17. Scheduled runs can be delayed by GitHub. Manual runs are available under **Actions → Sync production projects**.

A project qualifies only when:

- It is public, owned by `starrybodies`, original (not a fork), and not archived.
- It has an HTTPS homepage that returns 200.
- Its newest production deployment has a latest status of `success`. Explicit `Production`, `prod`, and `github-pages` environments are accepted; preview, staging, test, and development environments are rejected even when marked production.
- It is not this portfolio and does not carry `portfolio-hidden`.

For deployment hosts that do not report GitHub deployments, add the `portfolio-live` repository topic as an explicit declaration that the homepage is production. A failed recorded production deployment cannot be overridden by that topic. Set a useful GitHub description: it becomes the project summary.

Code projects default to professional work. The `portfolio-personal` topic places a project in the separate personal section. `portfolio-hidden` excludes a project. Reviewed case studies are deduplicated from the automatic project list.

The script completes all source checks before replacing `data/production-projects.json`. A request error fails the run and leaves the published file intact. It makes no changes to other repositories. Metadata is treated as data; no repository instructions or code are executed.

The website reads the public JSON files directly from this repository’s `main` branch through GitHub’s raw-content CDN. Updates do not require rebuilding Vercel or keeping this computer on. CDN caches may delay visibility briefly. This adds no API credentials or GitHub API requests to the browser. If a feed cannot be loaded, reviewed static content remains available.

## LinkedIn announcements

LinkedIn’s personal-post read permission is closed to new applicants. The existing signed-in Chrome profile **Samuel** can read Samuel’s activity, and the Overshoot launch post was independently verified in a signed-out browser. A Codex heartbeat uses that browser session to check for new qualifying posts hourly. Chrome, the browser extension, and Codex must be available; this is not an always-on LinkedIn API integration.

Baseline: activity `7509278307239067649` was the newest post on 3 October 2026. Only newer posts qualify for subsequent automatic ingestion. Existing post IDs in `data/announcements.json` prevent duplicates. Editing an older post is not a new announcement.

Publish only original announcements by Samuel about a shipped product or project, a new role, a delivered engagement, a published talk, or a concrete professional milestone. Music releases, launched personal projects, and confirmed public events go in the personal section. Verify that the post is public, inspect the linked evidence, and use a brief factual summary plus the permanent LinkedIn source URL. Do not publish drafts, future-release teasers, ordinary commentary, reactions, third-party reposts, private posts, messages, analytics, or unverified performance claims. Never infer sole authorship of team projects.

The heartbeat publishes qualifying announcements by updating only `data/announcements.json` on GitHub `main`, using the current file SHA to avoid overwriting concurrent edits. It never posts, comments, reacts, or messages on LinkedIn. If access fails or a CAPTCHA appears, retain existing records and request user attention once; do not bypass access controls. Remain quiet while nothing actionable changes.

## Verification

`python3 -m unittest discover -s tests` checks private/fork/archive exclusions, production versus preview environments, latest failure behavior, explicit production declarations, personal segregation, unsafe URLs, and source-error handling. `python3 scripts/sync_projects.py` performs the actual source and homepage checks. Browser checks verify feed rendering, mobile layout, theme switching, and safe text rendering.
