# Hugo → Astro Paper Migration Design

**Date:** 2026-07-31  
**Branch:** `astro-port`  
**Status:** Approved

## Goal

Migrate `rafaelbroseghini.com` from Hugo (typo theme) to Astro using the [Astro Paper](https://github.com/satnaing/astro-paper) theme. Success is local `dev`/`build`/`preview` with migrated content. Deploy/CI is owned by the user and must not be changed as part of this work.

## References

- [Migrating from Hugo](https://docs.astro.build/en/guides/migrate-to-astro/from-hugo/)
- [Astro Paper](https://github.com/satnaing/astro-paper) — template
- [wicksipedia.com](https://github.com/wicksipedia/wicksipedia.com) — pattern reference only (not the project base)

## Decisions

| Topic | Choice |
|-------|--------|
| Approach | In-repo cutover on `astro-port` |
| Bootstrap | `npm create astro@latest -- --template satnaing/astro-paper` via staging dir |
| Package manager | npm |
| Content format | MDX (`.mdx`) |
| URL preservation | Not required |
| Features in scope | Core blog: posts, about, tags, RSS, Pagefind search, social links |
| Hosting / deploy | **Out of scope** — user verifies locally and owns deploy changes |
| Out of scope | GitHub Pages / CI deploy, Umami, Giscus, math, Cloudflare, React, Bun (for now) |

## Current Hugo inventory

- **8 posts** in `content/posts/*.md` (TOML frontmatter)
- **About** page at `content/about/index.md`
- **Images** in `static/img/`
- **Favicons** in `static/favicon/`
- **Shortcodes:** Hugo `figure` in several posts
- **Deploy:** `.github/workflows/hugo.yml` → GitHub Pages
- **Config:** `hugo.toml` (site URL, socials, menu, Umami — Umami not carried over)

## Architecture

### Bootstrap

1. On `astro-port`, run:

   ```bash
   npm create astro@latest -- --template satnaing/astro-paper
   ```

2. Scaffold into a **staging directory** (e.g. `_astro_scaffold/`) because the repo is not empty.
3. Move generated project files to the repo root (keep Hugo sources until content is migrated and verified).
4. `npm install`, then confirm stock theme works with `npm run dev` and `npm run build`.

### Target layout (Astro Paper)

- `astro-paper.config.ts` — site metadata, socials, features
- `src/data/blog/<slug>/index.mdx` — posts
- `src/pages/`, `src/components/`, `src/layouts/` — theme
- `public/img/` — post images
- `public/` — favicons and other static assets

### Site config

Configure via `astro-paper.config.ts`:

- **site.url:** `https://rafaelbroseghini.com/`
- **site.title / description / author:** from current site identity (`rafaelbroseghini.com`, “til”, Rafael Broseghini)
- **socials:** GitHub + LinkedIn only (remove template placeholders for X/mail unless added later)
- **features.editPost.enabled:** `false` (do not allow edit-post links)
- **features:** keep theme defaults for light/dark mode, dynamic OG images, Pagefind search, archives, back button
- **posts.perPage / perIndex:** leave theme defaults for v1; denser listing can be tuned later

**Deferred:** If any Hugo feature does not map cleanly onto Astro Paper, note it during implementation and fix in a follow-up — do not force awkward mappings into v1.

## Content migration

### Posts

Convert each Hugo post → `src/data/blog/<slug>/index.mdx`.

**Frontmatter mapping:**

| Hugo | Astro Paper |
|------|-------------|
| `title` | `title` |
| `summary` | `description` |
| `date` | `pubDatetime` |
| `tags` | `tags` |
| `readTime`, `math`, `showTags`, `hideBackToTop` | drop |

### Shortcodes

Replace every:

```hugo
{{< figure src="..." alt="..." caption="..." >}}
```

with Markdown/MDX image markup (and caption if present). Keep public paths under `/img/...` after copying assets to `public/img/`.

### About

Port `content/about/index.md` copy into Astro Paper’s about page/content.

### Assets

- `static/img/*` → `public/img/`
- Favicon files from `static/favicon/` → Astro Paper’s expected public favicon locations

### Demo content

Remove or replace Astro Paper sample posts so only the migrated posts ship.

## Verification (local)

1. `npm run dev` serves the site
2. `npm run build` succeeds (`astro check` + Pagefind as shipped by Astro Paper)
3. Spot-check: home, post list, individual posts (images), about, tags, search, RSS
4. No demo posts remain; all 8 migrated posts present

## Hugo cleanup (after local verification)

Remove:

- `hugo.toml`
- `themes/` (including typo submodule)
- `content/`
- Hugo-era generated `public/` build output (careful not to delete new Astro `public/` assets)
- Staging dir `_astro_scaffold/` if still present
- Leave `.github/workflows/hugo.yml` untouched (user owns deploy)

## Deploy

**Not part of this migration work.** Do not change `.github/workflows/hugo.yml` or add an Astro Pages workflow. The user will verify locally and make any deploy/CI changes themselves.

(Optional note for later, not to implement now: Astro Paper’s `dist/` output can replace Hugo’s `public/` artifact in a GitHub Pages workflow when ready.)

## Testing notes

- Frontmatter schema mismatches should fail `astro check` — fix per post
- Broken image paths after shortcode conversion — catch in spot-check
- Staging merge may conflict with existing root files — resolve deliberately; prefer Astro Paper files for app code, keep Hugo content until migrated

## Success criteria

- Astro Paper site runs locally with all current posts, about page, tags, RSS, and search
- Hugo site sources removed from the branch once verified (workflow/deploy left alone)
