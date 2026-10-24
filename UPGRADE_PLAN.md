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
- Move unit tests to Vitest (done).
- Out of scope: `@import` → `@use`, bootstrap 4 → 5, zoneless.

## Risks / manual verification

- **Nebular theming**: custom `@theme/styles` from ngx-admin depends on Nebular SCSS internals. Check the theme switcher (default/dark/cosmic/corporate/material) visually.
- **OIDC login flow**: only verifiable against the real Auth0 tenant.

## Outcome / deviations

- **CDK pinned to `@angular/cdk@~21.0.6`** on purpose. Nebular 17.0.0 imports `_VIEW_REPEATER_STRATEGY`, which CDK 21.1+ removed. Do not bump CDK until Nebular ships a fix.
- **Lockfile / npm**: the lockfile was generated with `npx npm@latest install` (npm 12). Plain `npm install` on npm 11.5.2 crashes (`Cannot read properties of null (reading 'edgesOut')`) when `@angular/build` is a direct dependency. Use `npx npm@latest install` when adding or removing packages. `npm ci` with npm 11 works against the lockfile.
- **`angular-auth-oidc-client` 22.0.2** (instead of 21.x) was used; the existing code already used the modern API, so the only change was `authorize(null, …)` → `authorize(undefined, …)`.
- **`_angular-material.scss` deleted**: its `~` imports are unsupported by the esbuild builder and the material theme was not otherwise needed.
- **`outputPath` kept at `dist/`** (not `dist/<project>/browser`) so the Azure deploy step (`CopyFiles` from `dist`) keeps working.
- **`ionicons` kept** (still used for icons in the footer and search input), contrary to the Phase 0 cleanup list.
- **Lint**: `eslint.config.js` uses the angular-eslint 21 flat config (ESLint 9, typescript-eslint). Rules that would need large or risky rewrites of legacy ngx-admin code (`prefer-inject`, `prefer-standalone`, selector prefixes, `no-explicit-any`, `no-negated-async`, a11y template rules, etc.) are off or `warn`. `npm run lint` exits 0 with warnings only; `npm run lint:styles` (stylelint 13) works. `lint:ci` is now enabled in the Azure pipeline.
- **Test runner: migrated to Vitest** (`@angular/build:unit-test`, jsdom). The two specs are pure TypeScript, so the migration was trivial: only `jasmine.any` and Jasmine failure-message arguments needed changes. Karma, Jasmine, `karma.conf.js` and the Chrome requirement are gone. JUnit goes to `test-results/junit.xml`, Cobertura to `coverage/ngx-admin-demo/cobertura-coverage.xml`; the pipeline paths were updated. `typeRoots` in `src/tsconfig.spec.json` includes `../node_modules` so `vitest/globals` resolves. `declare var` in `typings.d.ts` must stay `var` (conflicts with `@types/node` otherwise).
- `rimraf` kept (used by `test:coverage`), bumped to 6.

## Manual verification still needed

- [ ] OIDC login / logout / callback against the real Auth0 tenant. Watch for strict issuer validation errors; if it fails, set `strictIssuerValidationOnWellKnownRetrievalOff: true` in the OIDC config.
- [ ] Visual check of the theme switcher in all themes (default, dark, cosmic, corporate, material).
- [ ] reCAPTCHA on the dashboard (`ng-recaptcha-2`).
- [ ] Google Analytics events (`AnalyticsService` now calls `window.gtag` directly).
