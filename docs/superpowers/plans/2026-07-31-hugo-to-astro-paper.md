# Hugo → Astro Paper Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Hugo (typo) blog with Astro Paper so all 8 posts, about, tags, RSS, and Pagefind search work locally via `npm run dev` / `npm run build`.

**Architecture:** Scaffold stock Astro Paper into a staging directory with `create astro`, merge into the `astro-port` branch root, configure `astro-paper.config.ts`, migrate Hugo Markdown → MDX under `src/content/posts/`, copy static images, then delete Hugo sources. Do **not** touch GitHub Actions / deploy.

**Tech Stack:** Astro Paper v6 (Astro 7), TypeScript, Tailwind CSS 4, MDX, Pagefind, npm, Node `>=22.12.0`

## Global Constraints

- Package manager: **npm** only
- Content format: **MDX** (`.mdx`) for posts
- Posts live in: **`src/content/posts/<slug>.mdx`** (Astro Paper v6; not `src/data/blog`)
- About page: **`src/content/pages/about.md`**
- `features.editPost.enabled`: **`false`**
- Socials: GitHub + LinkedIn only
- Site URL: `https://rafaelbroseghini.com/`
- Do **not** modify `.github/workflows/hugo.yml` or add deploy workflows
- Out of scope: Umami, Giscus, math, Cloudflare, React, Bun
- If a Hugo feature does not map cleanly, leave a short note in the PR/commit message and continue — do not force it
- Branch: `astro-port`
- Spec: `docs/superpowers/specs/2026-07-31-hugo-to-astro-paper-design.md`

## File map

| Path | Role |
|------|------|
| `_astro_scaffold/` | Temporary create-astro output; delete after merge |
| `package.json`, `package-lock.json`, `astro.config.ts`, `astro-paper.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.prettierignore` | Astro Paper app root (from scaffold) |
| `src/**` | Theme + content collections |
| `src/content/posts/*.mdx` | Migrated posts |
| `src/content/pages/about.md` | About page body |
| `public/img/*` | Post images (from `static/img/`) |
| `public/favicon.svg` (+ other favicon files as needed) | Branding from `static/favicon/` |
| `content/`, `static/`, `hugo.toml`, `themes/` | Hugo sources — remove only after local verify |
| `.github/workflows/hugo.yml` | **Leave untouched** |
| `docs/superpowers/**` | Spec + this plan — keep |

---

### Task 1: Scaffold Astro Paper and merge into repo root

**Files:**
- Create (via CLI): `_astro_scaffold/**`
- Create/overwrite at repo root: Astro Paper project files (`package.json`, `src/`, `public/` from scaffold, configs, etc.)
- Preserve: `content/`, `static/`, `hugo.toml`, `themes/`, `docs/`, `.github/workflows/hugo.yml`, `.git/`

**Interfaces:**
- Consumes: empty-enough working tree on `astro-port`; Node `>=22.12.0`; npm
- Produces: runnable Astro Paper app at repo root with stock demo content

- [ ] **Step 1: Confirm branch and Node**

```bash
cd /home/tortellini/site
git checkout astro-port
node -v   # expect v22.12+ (v24.x is fine)
npm -v
```

Expected: on `astro-port`, Node version prints successfully.

- [ ] **Step 2: Scaffold into staging directory (non-interactive)**

```bash
cd /home/tortellini/site
npm create astro@latest _astro_scaffold -- --template satnaing/astro-paper --install --no-git --typescript strict --yes
```

If the CLI still prompts, answer: template already set, TypeScript strict, install deps yes, no git init.

Expected: `_astro_scaffold/package.json` exists and references `astro` / Astro Paper scripts (`dev`, `build` with pagefind).

- [ ] **Step 3: Prefer npm lockfile**

```bash
cd /home/tortellini/site/_astro_scaffold
rm -f pnpm-lock.yaml bun.lockb yarn.lock
npm install
```

Expected: `package-lock.json` created; `npm run build` works inside `_astro_scaffold` (may take a minute).

- [ ] **Step 4: Verify stock scaffold builds**

```bash
cd /home/tortellini/site/_astro_scaffold
npm run build
```

Expected: exit 0; `dist/` created; Pagefind step runs as part of `build` script.

- [ ] **Step 5: Merge scaffold into repo root without wiping Hugo sources**

From `/home/tortellini/site`:

```bash
# Backup Hugo-generated public away from the merge
mv public public_hugo_backup

# Move Astro app files up (do NOT move _astro_scaffold/.git if any)
shopt -s dotglob
for item in _astro_scaffold/*; do
  base="$(basename "$item")"
  case "$base" in
    .|..) continue ;;
  esac
  # Never clobber preserved Hugo/docs paths
  case "$base" in
    content|static|hugo.toml|themes|docs|.github) echo "skip $base"; continue ;;
  esac
  rm -rf "./$base"
  mv "$item" "./$base"
done
shopt -u dotglob
rmdir _astro_scaffold 2>/dev/null || rm -rf _astro_scaffold
```

Expected: `package.json`, `src/`, `astro-paper.config.ts` at repo root; `content/`, `static/`, `hugo.toml`, `themes/`, `docs/` still present; `public/` is Astro’s (small), not Hugo’s built site.

- [ ] **Step 6: Install and build at repo root**

```bash
cd /home/tortellini/site
npm install
npm run build
```

Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add -A
# Ensure we did not stage secrets; do stage new Astro files + public_hugo_backup deletion/move as intended
git status
git commit -m "$(cat <<'EOF'
Scaffold Astro Paper theme on astro-port.

EOF
)"
```

---

### Task 2: Configure site identity and disable editPost

**Files:**
- Modify: `astro-paper.config.ts`

**Interfaces:**
- Consumes: scaffolded `defineAstroPaperConfig` API
- Produces: site config matching Hugo identity; `editPost.enabled: false`; GitHub + LinkedIn socials

- [ ] **Step 1: Replace `astro-paper.config.ts` with site-specific config**

Set the file contents to:

```ts
import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://rafaelbroseghini.com/",
    title: "rafaelbroseghini.com",
    description: "til",
    author: "Rafael Broseghini",
    profile: "https://github.com/rafaelbroseghini",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "America/Chicago",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/rafaelbroseghini" },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/rafaelbroseghini/",
    },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
```

- [ ] **Step 2: Verify config typechecks via build**

```bash
npm run build
```

Expected: exit 0. Failure here usually means invalid `editPost` shape or unknown social icon `name` — social `name` must match an SVG in `src/assets/icons/socials/` (`github`, `linkedin` exist).

- [ ] **Step 3: Commit**

```bash
git add astro-paper.config.ts
git commit -m "$(cat <<'EOF'
Configure Astro Paper for rafaelbroseghini.com.

EOF
)"
```

---

### Task 3: Copy images and favicons into `public/`

**Files:**
- Create: `public/img/*` (from `static/img/`)
- Modify/replace: `public/favicon.svg` and copy other favicon assets from `static/favicon/` into `public/`
- Keep: Astro `public/default-og.jpg` unless you intentionally replace it

**Interfaces:**
- Consumes: `static/img/*`, `static/favicon/*`
- Produces: `/img/...` URLs resolvable in posts; site favicon from existing brand assets

- [ ] **Step 1: Copy post images**

```bash
mkdir -p public/img
cp -a static/img/. public/img/
ls public/img
```

Expected files include: `argo.png`, `funnel.jpeg`, `ghwatch.png`, `hetzner.png`, `netalert.png`, `node.png`, `notification.png`, `pihole.jpeg`, `raspi.jpeg`, `server.png`, `widget.jpeg`.

- [ ] **Step 2: Copy favicons**

```bash
cp -a static/favicon/. public/
# Astro Paper ships public/favicon.svg — overwrite with brand SVG if present
ls public/favicon.svg public/favicon.ico public/apple-touch-icon.png
```

Expected: brand favicon files present under `public/`.

- [ ] **Step 3: Smoke-check paths exist (no server needed)**

```bash
test -f public/img/raspi.jpeg && test -f public/favicon.svg && echo OK
```

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add public/
git commit -m "$(cat <<'EOF'
Add post images and favicons to Astro public assets.

EOF
)"
```

---

### Task 4: Remove Astro Paper demo posts and migrate all 8 Hugo posts to MDX

**Files:**
- Delete: all demo content under `src/content/posts/` that ships with the theme (including `_releases/`, `_color-schemes/`, `examples/`, and top-level demo `.md`/`.mdx` files)
- Create:
  - `src/content/posts/ha-grafana-prometheus.mdx`
  - `src/content/posts/netalertx.mdx`
  - `src/content/posts/ntfy.mdx`
  - `src/content/posts/nyr.mdx`
  - `src/content/posts/op-viper.mdx`
  - `src/content/posts/pi.mdx`
  - `src/content/posts/tailscale.mdx`
  - `src/content/posts/uuid7.mdx`
- Read sources: `content/posts/*.md`

**Interfaces:**
- Consumes: Hugo TOML frontmatter + Markdown body; figure shortcodes; `public/img/*`
- Produces: 8 valid Astro Paper posts matching `src/content.config.ts` schema (`title`, `description`, `pubDatetime` required; `tags` optional)

**Frontmatter conversion rules (every post):**

| Hugo | MDX YAML |
|------|----------|
| `title` | `title` |
| `summary` | `description` |
| `date` | `pubDatetime` (ISO-8601 string Astro can parse as date) |
| `tags` | `tags` YAML list; omit if absent (uuid7 → default `others`) |
| `readTime`, `math`, `showTags`, `hideBackToTop` | **omit** |

**Figure conversion rule:**

Hugo:

```hugo
{{< figure
  src="/img/example.png"
  alt="Alt text"
  caption="Caption text"
>}}
```

MDX (caption optional — include italic line when caption existed):

```mdx
![Alt text](/img/example.png)

*Caption text*
```

Without caption:

```mdx
![Alt text](/img/example.png)
```

**Per-post metadata to write:**

| Slug / file | title | description | pubDatetime | tags |
|-------------|-------|-------------|-------------|------|
| `ha-grafana-prometheus.mdx` | Homelab - Part 2 - High Availability + Grafana & Prometheus | HA + metrics & dashboards | `2026-01-04T17:56:11-06:00` | `homelab` |
| `netalertx.mdx` | Watching the LAN with Netalertx | network topology | `2025-04-29T22:12:06-05:00` | `homelab` |
| `ntfy.mdx` | git & ntfy | Tracking third-party content changes with git scraping and ntfy.sh | `2025-12-20` → use `2025-12-20T00:00:00-06:00` | `homelab` |
| `nyr.mdx` | Keeping up with my New Year's resolutions | on being more consistent | `2025-02-01T00:00:00-06:00` | `productivity` |
| `op-viper.mdx` | 1Password and Go Configuration | injecting 1Password values securely at runtime | `2025-09-25T00:00:00-05:00` | `go`, `1Password` |
| `pi.mdx` | Raspberry Pi Homelab - Part 1 - ArgoCD | managing continuous delivery with ArgoCD & k3s | `2025-02-16T00:00:00-06:00` | `homelab` |
| `tailscale.mdx` | Tailscale: Magic DNS, and Funnels | Accessing my homelab from anywhere in the world | `2025-03-23T00:00:00-05:00` | `homelab` |
| `uuid7.mdx` | uuid7 - indexable and time sortable | 50 nanosecond resolution | `2025-09-02T00:00:00-05:00` | *(omit — defaults to others)* |

**Exact figure replacements:**

- `ntfy`: `/img/ghwatch.png` (alt+caption GitHub Watch); `/img/notification.png` (alt+caption Notifications History)
- `ha-grafana-prometheus`: `/img/hetzner.png` (Hetzner); `/img/server.png` (HP EliteDesk 800); `/img/node.png` (Grafana Monitoring) — no captions
- `tailscale`: `/img/pihole.jpeg`; `/img/funnel.jpeg` — with captions matching alt
- `nyr`: `/img/widget.jpeg` alt `widget` — no caption
- `pi`: `/img/raspi.jpeg`; `/img/argo.png` — with captions
- `netalertx`: `/img/netalert.png` — with caption
- `op-viper`, `uuid7`: no figures

- [ ] **Step 1: Delete demo posts**

```bash
rm -rf src/content/posts/*
# ensure directory remains
mkdir -p src/content/posts
ls src/content/posts
```

Expected: empty `src/content/posts/` (no demo leftovers).

- [ ] **Step 2: Write each migrated `.mdx` file**

For each row in the metadata table:

1. Read `content/posts/<slug>.md`
2. Write `src/content/posts/<slug>.mdx` with YAML frontmatter (not TOML `+++`)
3. Copy body Markdown after Hugo frontmatter
4. Replace every `figure` shortcode using the rule above
5. Do **not** add `import` lines unless a post needs a component (none of these do after figure conversion)

Example frontmatter shape (`pi.mdx`):

```yaml
---
title: "Raspberry Pi Homelab - Part 1 - ArgoCD"
description: "managing continuous delivery with ArgoCD & k3s"
pubDatetime: 2025-02-16T00:00:00-06:00
tags:
  - homelab
---
```

Example figure replacement in `pi.mdx`:

```mdx
![One Node Home Server - Raspberry Pi 5](/img/raspi.jpeg)

*One Node Home Server - Raspberry Pi 5*
```

- [ ] **Step 3: Assert no Hugo shortcodes remain and eight posts exist**

```bash
test "$(find src/content/posts -name '*.mdx' | wc -l)" -eq 8
! rg -n '\{\{<' src/content/posts || echo 'FAIL: shortcodes remain'
rg -l . src/content/posts/*.mdx | wc -l
```

Expected: 8 files; no `{{<` matches.

- [ ] **Step 4: Build to validate content schema**

```bash
npm run build
```

Expected: exit 0. If `astro check` / content collection validation fails, fix the named post’s frontmatter (`pubDatetime` parse, missing `description`, etc.) and rebuild.

- [ ] **Step 5: Commit**

```bash
git add src/content/posts
git commit -m "$(cat <<'EOF'
Migrate Hugo posts to Astro Paper MDX.

EOF
)"
```

---

### Task 5: Port the about page

**Files:**
- Modify: `src/content/pages/about.md`
- Source: `content/about/index.md`

**Interfaces:**
- Consumes: existing about prose
- Produces: Astro Paper about page with `title` + `description` frontmatter

- [ ] **Step 1: Replace about content**

Write `src/content/pages/about.md`:

```md
---
title: "About"
description: "whoami"
---

# whoami

Hello! My name is Rafael Broseghini! I am a Platform Engineer at Trimble, Inc.

My current professional focus is designing and building workflows that enable self-service capabilities for software engineering teams, leveraging the cloud-native ecosystem. I specialize in solutions that accelerate deployment cycles by abstracting operational complexity while ensuring enterprise-grade security and compliance.

I am a huge [football](https://en.wikipedia.org/wiki/Football) fan and travel enthusiast. I enjoy biking, reading, cliff jumping, skydiving and have recently started to get into home automation.
```

Note: Astro Paper already uses the frontmatter `title` as page heading in some layouts — if the rendered about page shows a duplicated H1, remove the `# whoami` heading and keep `whoami` only in `description` or as the first paragraph lead-in. Prefer whatever looks correct in `npm run dev`; do not fight the theme.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: exit 0; `dist/about/index.html` (or equivalent about route) exists.

- [ ] **Step 3: Commit**

```bash
git add src/content/pages/about.md
git commit -m "$(cat <<'EOF'
Port about page content to Astro Paper.

EOF
)"
```

---

### Task 6: Local verification checklist

**Files:**
- None required (read-only verification). Optionally delete `public_hugo_backup/` if it still exists after confirming Astro `public/` is correct.

**Interfaces:**
- Consumes: complete Astro site from Tasks 1–5
- Produces: confirmation that success criteria are met (no deploy changes)

- [ ] **Step 1: Production build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 2: Assert migrated routes exist in `dist/`**

```bash
for p in \
  dist/index.html \
  dist/about/index.html \
  dist/posts/index.html \
  dist/tags/index.html \
  dist/rss.xml \
  dist/posts/pi/index.html \
  dist/posts/ntfy/index.html \
  dist/posts/ha-grafana-prometheus/index.html \
  dist/posts/netalertx/index.html \
  dist/posts/nyr/index.html \
  dist/posts/op-viper/index.html \
  dist/posts/tailscale/index.html \
  dist/posts/uuid7/index.html \
  dist/img/raspi.jpeg
 do
  test -e "$p" || { echo "MISSING $p"; exit 1; }
 done
 echo "all paths present"
```

Expected: `all paths present`.

- [ ] **Step 3: Assert demo posts are gone**

```bash
! test -e dist/posts/adding-new-posts-in-astropaper-theme/index.html
! ls src/content/posts | rg -i 'astropaper|example|giscus|latex|tailwind'
echo "no demo posts"
```

Expected: `no demo posts`.

- [ ] **Step 4: Manual spot-check with preview**

```bash
npm run preview
```

In the browser (or curl):

1. Home shows site title `rafaelbroseghini.com` and recent posts
2. Open `/posts/pi/` — Raspberry Pi image renders
3. `/about/` shows your bio
4. `/tags/homelab/` lists homelab posts
5. `/search/` loads (Pagefind UI; full search needs the build you already ran)
6. `/rss.xml` returns feed XML
7. Header social icons: GitHub + LinkedIn only
8. No “edit post” control on post pages

Expected: all eight checks pass.

- [ ] **Step 5: Remove Hugo public backup if present**

```bash
rm -rf public_hugo_backup
```

- [ ] **Step 6: Commit only if Step 5 produced changes**

```bash
git add -A
git status
git commit -m "$(cat <<'EOF'
Remove Hugo public backup after Astro verify.

EOF
)" || true
```

---

### Task 7: Remove Hugo sources (keep deploy workflow)

**Files:**
- Delete: `hugo.toml`, `content/`, `static/`, `themes/` (including typo git submodule metadata), any leftover `_astro_scaffold/`
- Do **not** delete or modify: `.github/workflows/hugo.yml`
- Keep: `docs/superpowers/**`

**Interfaces:**
- Consumes: verified Astro site
- Produces: Astro-only content/tooling in the working tree (CI still Hugo until user updates it)

- [ ] **Step 1: Remove Hugo project files**

```bash
# If themes/typo is a git submodule, deinit first
if [ -f .gitmodules ] && grep -q 'themes/typo' .gitmodules; then
  git submodule deinit -f themes/typo || true
  git rm -f themes/typo || true
  rm -rf .git/modules/themes/typo
fi

rm -rf content static themes
rm -f hugo.toml
# optional hugo leftovers
rm -f go.mod go.sum 2>/dev/null || true

test ! -e hugo.toml
test ! -d content
test -f .github/workflows/hugo.yml   # must still exist
test -f package.json
test -f src/content/posts/pi.mdx
```

Expected: Hugo sources gone; workflow file still present; Astro posts still present.

- [ ] **Step 2: Final build after cleanup**

```bash
npm run build
```

Expected: exit 0 (must not depend on deleted Hugo paths).

- [ ] **Step 3: Commit**

```bash
git add -A
git status   # confirm hugo.yml is NOT deleted
git commit -m "$(cat <<'EOF'
Remove Hugo sources after Astro Paper migration.

EOF
)"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Scaffold via `create astro` + staging dir | Task 1 |
| npm | Global + Task 1 |
| Configure site / socials / editPost false | Task 2 |
| MDX posts + frontmatter map + figures | Task 4 |
| About page | Task 5 |
| Images + favicons | Task 3 |
| Remove demo posts | Task 4 |
| Local verify (dev/build/preview, routes, search, RSS) | Task 6 |
| Hugo cleanup | Task 7 |
| Do not touch deploy workflow | Task 7 explicit assert |
| Deferred awkward feature mappings | Global Constraints |

**Path correction vs earlier draft:** posts are `src/content/posts/*.mdx` (Astro Paper v6), not `src/data/blog/` (wicksipedia-era path). Spec updated to match.
