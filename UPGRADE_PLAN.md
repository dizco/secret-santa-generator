# Angular 14 → 21 upgrade plan

## Target

Angular **21**, not 22. `@nebular/*@17` (latest) peers on `@angular/*` `^21.0.0`, so 21 is the ceiling until Nebular 18 ships.
Nebular has tracked Angular one-to-one:

| Angular | 15 | 16 | 17 | 18 | 19 | 20 | 21 |
|---|---|---|---|---|---|---|---|
| Nebular | 11 | 12 | 13 | 14 | 15 | 16 | 17 |

Node 22.16 already satisfies Angular 21.

## Known breakages

1. **`angular-gtag`** is View Engine only (needs `ngcc`); `ngcc` is removed in Angular 16, so it breaks at v16. Unmaintained since 2022. Replace with a small `GtagService` around `window.gtag` (only used in `app.module.ts`).
2. **`ngcc` postinstall** script must go at v16.
3. **`ng-recaptcha`** is abandoned (max Angular 17). Switch to the `ng-recaptcha-2` fork (same API), used in `dashboard.module.ts`.
4. **`angular-auth-oidc-client` 15 → 21**: API changes in `checkAuth()`, `userData$`, `authorize()`, `getConfiguration()`. Affects `src/app/@core/auth/auth0-auth-strategy.ts` and `src/app/@core/core.module.ts`. Versions ≥20 need Angular ≥20, so this lands late.
5. **rxjs 6.6 → 7.8**; drop `rxjs-compat` (unused).
6. **SCSS**: `~` imports are not supported by the esbuild builder (`_angular-material.scss`). `@import` deprecation warnings from Dart Sass are non-blocking.
7. **TypeScript** 4.6 → ~5.9, **zone.js** 0.11 → 0.15+.

## Phase 0 — prep (still on Angular 14)

- Remove dead ngx-admin leftovers from `package.json` and `angular.json` styles: `@asymmetrik/ngx-leaflet`, `@angular/google-maps`, `rxjs-compat`, `ionicons`, `socicon`, `nebular-icons`, `intl`; IE polyfills `classlist.js`, `web-animations-js`, `core-js` (clean `polyfills.ts`); `codelyzer`, `tslint` + `tslint.json`, `@types/jasminewd2`, `ts-node@3`.
- Pin `cypress` (currently `"latest"`), drop/replace `husky@0.13`.
- Replace `angular-gtag` with a local service.
- Baseline: `npm run build:prod`, `npm run test:once`, lint.

## Phase 1 — one major at a time, 14 → 21

For each N:

```
npx ng update @angular/core@N @angular/cli@N @angular/cdk@N
npm i @nebular/{theme,auth,security,eva-icons}@<matching> @angular-eslint/*@N
```

Build, test, commit. Per-step notes:

- **v15**: move to rxjs 7.
- **v16**: delete `ngcc` postinstall.
- **v17**: switch to `ng-recaptcha-2` (or defer to v21 and use `ng-recaptcha-2@21`).
- **v19**: migration adds `standalone: false` to NgModule components — expected, no standalone conversion.
- **v20**: `angular-auth-oidc-client` → latest compatible; rewrite auth strategy for the new API.
- **v21**: run `use-application-builder` migration (browser → esbuild `application` builder), fix `~` imports.

## Phase 2 — cleanup

- angular-eslint flat config (`eslint.config.js`).
- Keep Karma working (or move to Vitest if cheap; only 2 specs).
- Out of scope: `@import` → `@use`, bootstrap 4 → 5, zoneless.

## Risks / manual verification

- **Nebular theming**: custom `@theme/styles` from ngx-admin depends on Nebular SCSS internals. Check the theme switcher (default/dark/cosmic/corporate/material) visually.
- **OIDC login flow**: only verifiable against the real Auth0 tenant.
