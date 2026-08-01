# Local development (foreground)
dev:
    npm run dev

# Local development (background — see AGENTS.md)
local:
    npx astro dev --background

dev-stop:
    npx astro dev stop

dev-status:
    npx astro dev status

dev-logs:
    npx astro dev logs

# Production build
build:
    npm run build

prod: build

# Preview production build locally
preview:
    npm run preview

# Type-check Astro files
check:
    npx astro check

# Sync content collections types
sync:
    npm run sync

# Code quality
lint:
    npm run lint

format:
    npm run format

format-check:
    npm run format:check
