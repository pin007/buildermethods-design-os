# design-sync notes — Trading Squad Design System

Project: `5587f1e6-ed7e-4911-8ba8-df9d28f19df9` (claude.ai/design). Shape: **package**.

## This repo is a Vite app, not a library — how the build is synthesized
- No library build / no `.d.ts` tree ships. `cfg.buildCmd` = `sh .design-sync/build.sh`, which:
  1. `node .design-sync/gen-entry.mjs` — regenerates `src/ds-entry.ts` (a barrel `export *`-ing the 9 section `components/` barrels + `shell/components`) from the existing export barrels. Uses **relative** `./sections/...` specifiers (NOT `@/` — the converter's esbuild alias plugin resolves `@/x` to a directory without index resolution and fails).
  2. `tsc -p tsconfig.dts.json` (best-effort; `noEmitOnError:false` — the app has pre-existing type errors) → emits real `.d.ts` to `dist/types/`, then `tsc-alias` rewrites `@/` imports to relative so the converter's ts-morph (no paths config) resolves cross-module types.
  3. writes `dist/types/package.json` `{name, types:"src/ds-entry.d.ts"}` so `findTypesRoot`→`dist/types` and `loadDts` resolves the barrel entry (that's what makes prop extraction work — props/JSDoc come out real, not stubs).
  4. `vite build` + copy hashed `dist/assets/index-*.css` → stable `dist/ds-styles.css` (= `cfg.cssEntry`), then **prepend the app's Google Fonts `@import`** (DM Sans + JetBrains Mono) so brand fonts load at runtime (mirrors the `<link>` in index.html; without it → `[FONT_MISSING]`, with it → `[FONT_REMOTE]`, non-blocking).
- `componentSrcMap` (62 entries) is the authoritative component list (no `.d.ts` exports for the converter to auto-discover) AND pins src paths for correct grouping. Regenerate with `gen-entry.mjs` if components are added/removed, then re-merge into config.
- `dist/` is gitignored — types + stable CSS are rebuilt each sync by `build.sh`. `src/ds-entry.ts` is gitignored (regenerated).

## Converter invocation
```
node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle
node .ds-sync/package-validate.mjs ./ds-bundle
```
- `.ds-sync` deps: `esbuild ts-morph @types/react tsc-alias playwright` (tsc-alias + playwright added beyond the skill's default 3). Chromium: `npx playwright install chromium` (chromium-1228 / playwright 1.61.1).
- **DesignSync `finalize_plan` needs an ABSOLUTE `localDir`** (`./ds-bundle` failed with a doubled path).

## Render / rendering facts
- **No provider needed** — all 62 components mount without a Router/Theme wrapper (render check clean, no context errors). `cfg.provider` unset.
- Sample data for authoring previews lives in `product/sections/<section>/data.json` + `types.ts` — import/adapt it, don't invent `foo`/`bar`.

## Known render warns (triaged legitimate, non-blocking)
- `[TOKENS_MISSING]` 12 vars: `--radix-*` (Radix runtime), `--sidebar-width`/`--header-height` (layout vars set at runtime by AppShell), `--color-danger`/`--color-success`/`--bg-primary`/`--bg-secondary` (not used in src — spurious compiled refs). Verified non-issues via render.
- `[FONT_REMOTE]` DM Sans / JetBrains Mono — served via the Google Fonts `@import` (intentional, see build.sh step 4).

## build.sh ordering (important)
- `vite build` MUST run BEFORE the `tsc` .d.ts emit. Vite's `emptyOutDir` wipes `dist/`, so tsc-first means vite deletes the freshly emitted `dist/types` (build.sh then reports "0 d.ts"). Order: gen-entry → vite build + CSS → tsc + tsc-alias → dist/types/package.json.

## Re-sync risks
- `dist/ds-styles.css` content depends on the vite/Tailwind build scanning source for used classes — if a component uses a class no other file uses, rebuild before trusting the CSS.
- The Google Fonts `@import` is a runtime network dependency; fonts fall back to system if offline.
- Emitted `.d.ts` are best-effort (app has type errors); a new type error could weaken a prop body — spot-check new/changed components' `.d.ts` after re-emit.

## Product source bugs surfaced during preview authoring — NOW FIXED
- `JournalEntryEditor.tsx`: literal `→`/`·` in JSX text — FIXED in commit 1ce12c3 (real chars). Verified rendering.
- `WalkForwardResults.tsx`: Sharpe bar chart collapsed (missing height) — FIXED in commit a206def (`h-full` on the group div). Verified rendering (all 13 windows show Train/Validation bars).
- Both fixes are in the compiled bundle; the uploaded bundle already matches (bundleSha `f09c68ea7a74`).

## Preview authoring patterns (all 62 authored — for re-sync / re-authoring)
- Standard pattern: `import { X } from 'trading-squad-ds'` + `import data from '../../product/sections/<section>/data.json'`; compose with real objects matched by id, `as any` casts, all required props, callbacks `() => {}`, no provider.
- Shell has NO data.json — compose inline props ported from `src/shell/ShellPreview.tsx` / `ShellWrapper.tsx`; `navigationGroups` imports from the bundle and drives MainNav/AppShell.
- Overlay/modal/toast components (CommandPalette, EmergencyCloseModal, OrderPanel, ToastContainer) use `fixed inset-0`/`fixed right-4 top-4`. Contain them by wrapping the preview cell in `position:relative; height:<N>; overflow:hidden` — captures cleanly, NO cfg.overrides needed.
- `UserMenu` dropdown open state is internal useState (no `open`/`defaultOpen` prop) — previews show the trigger state only. An open-dropdown card would need a `defaultOpen` prop added in src.
- Settings atoms (FormRow, FormSection, MaskedField, ToggleSwitch, SettingsCategoryCard, SettingsDetailLayout) are re-exported from SettingsDetailLayout.tsx but export cleanly from the bundle root; compose them with real labels/children + sibling components, sweep their state axis.
