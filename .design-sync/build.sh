#!/bin/sh
# Reproducible build inputs for design-sync (package shape — this repo is a
# Vite app with no library build, so we synthesize a barrel entry + real .d.ts).
# Referenced by cfg.buildCmd; re-run before the converter on every sync.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 1. Regenerate the bundle barrel (src/ds-entry.ts) from the section/shell
#    export barrels (also refreshes .cache/srcmap.json for reference).
mkdir -p .design-sync/.cache
node .design-sync/gen-entry.mjs . .design-sync/.cache/srcmap.json

# 2. Stable, complete Tailwind CSS (all utilities + tokens) from the real vite
#    build. MUST run before the .d.ts emit: `vite build` empties dist/
#    (emptyOutDir), which would wipe dist/types if it ran afterward.
npx vite build >/dev/null 2>&1
cp dist/assets/index-*.css dist/ds-styles.css
# Prepend the app's own Google Fonts @import (DM Sans + JetBrains Mono) so the
# real brand fonts load at runtime in preview cards AND in designs — mirrors the
# <link> the app ships in index.html. Must be the first rule in the stylesheet.
GF="@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap');"
printf '%s\n' "$GF" | cat - dist/ds-styles.css > dist/ds-styles.css.tmp && mv dist/ds-styles.css.tmp dist/ds-styles.css
# Annotate Tailwind utility internals (--tw-*) with /* @kind other */ so the
# design-system token check doesn't report them as unclassified theme tokens —
# they are compilation artifacts, not part of the design language.
node -e '
const fs=require("fs");const p="dist/ds-styles.css";
const css=fs.readFileSync(p,"utf8");
fs.writeFileSync(p,css.replace(/(--tw-[\w-]+\s*:[^;{}]*)/g,"$1/* @kind other */"));
' && echo "  annotated --tw-* internals (@kind other)"

# 3. Emit real .d.ts (best-effort — the app carries pre-existing type errors,
#    noEmitOnError:false lets tsc emit anyway) and resolve @/ aliases to
#    relative paths so the converter's ts-morph can follow them. AFTER vite so
#    dist/types survives.
npx tsc -p tsconfig.dts.json || true
npx --yes tsc-alias -p tsconfig.dts.json

# 4. Types-root package.json so the converter's loadDts resolves the barrel
#    (findTypesRoot -> dist/types; this gives it a named pkg + types entry).
printf '{"name":"trading-squad-ds","version":"0.0.0","types":"src/ds-entry.d.ts"}\n' > dist/types/package.json
echo "build.sh: done ($(find dist/types -name '*.d.ts' | wc -l | tr -d ' ') d.ts, $(du -h dist/ds-styles.css | cut -f1) css)"
