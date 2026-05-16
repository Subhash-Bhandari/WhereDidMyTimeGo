# Phase 4 — Capacitor Mobile Apps (Android + iOS)

## Summary

Wrap the **existing Nuxt frontend** in Capacitor native shells for Android and iOS. Reuse the same Hono backend (hosted URL); add native UX (bottom tabs, safe areas, haptics, push) without rewriting in Flutter/React Native.

**Depends on:** Phase 1 MVP; Phase 3 PWA/mobile UX strongly recommended (offline queue, install flow).

---

## Prerequisites

- Production or staging API URL (HTTPS) — mobile apps cannot use `localhost` on device without dev tooling
- Phase 3 offline queue stable (mobile users expect flaky networks)
- Apple Developer + Google Play accounts (for store release — dev builds can use local devices first)
- Frontend builds static output compatible with Capacitor (`nuxt generate` or `nuxt build` + preview static — verify Nuxt Capacitor guide for version in use)

---

## Product goal

One codebase ships **web + PWA + Android + iOS**. Mobile app feels native: bottom navigation, splash, icon, optional push reminders for reflection.

---

## Architecture

```
┌──────────────────────────────────────┐
│  Capacitor Shell (Android / iOS)      │
│  ┌────────────────────────────────┐  │
│  │  WebView → Nuxt static build    │  │
│  │  API calls → https://api.prod   │  │
│  └────────────────────────────────┘  │
│  Native plugins: Push, Haptics, etc.  │
└──────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  backend/ (Hono) — hosted separately  │
│  packages/db → PostgreSQL             │
└──────────────────────────────────────┘
```

**Important:** Backend remains `backend/` (Hono) in monorepo — **not** Nuxt server routes. Mobile app sets `NUXT_PUBLIC_API_BASE_URL` to production API at build time per flavor.

---

## User stories

| ID | As a user, I want to… | So that… |
|----|------------------------|----------|
| P4-US01 | Install from Play Store / App Store | I use it like a native app |
| P4-US02 | Navigate with bottom tabs | One-thumb use is easy |
| P4-US03 | Get a daily reflection reminder | I don't forget to log mood |
| P4-US04 | Feel haptic feedback on successful log | Actions feel responsive |
| P4-US05 | Unlock app with biometrics (optional) | My time data stays private |

---

## Capacitor project setup

### Location in monorepo

```
WhereDidMyTimeGo/
├── frontend/              # Nuxt app (source)
├── mobile/                # NEW — Capacitor config root (recommended)
│   ├── capacitor.config.ts
│   ├── android/
│   ├── ios/
│   └── package.json       # @capacitor/cli scripts
```

**Alternative:** Capacitor inside `frontend/` — acceptable if docs prefer single app folder; `mobile/` keeps native folders isolated.

### Init steps (reference)

```bash
cd frontend
npm run generate   # or build — verify output dir (e.g. .output/public)
cd ../mobile
npx cap init TimeGo com.yourdomain.timego ../frontend/.output/public
npx cap add android
npx cap add ios
```

Adjust `webDir` in `capacitor.config.ts` to match Nuxt output path.

### `capacitor.config.ts` essentials

```ts
{
  appId: 'com.yourdomain.timego',
  appName: 'TimeGo',
  webDir: '../frontend/.output/public',
  server: {
    // Dev only: live reload
    // url: 'http://YOUR_LAN_IP:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: { launchShowDuration: 2000, backgroundColor: '#0f172a' },
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] }
  }
}
```

### Environment flavors

| Flavor | `NUXT_PUBLIC_API_BASE_URL` |
|--------|----------------------------|
| dev | LAN IP or staging |
| staging | `https://api-staging.example.com` |
| production | `https://api.example.com` |

Build script per platform copies `.env.production` before `nuxt generate`.

---

## Mobile UX hardening

### Bottom tab navigation

Replace or duplicate desktop nav on `Capacitor.isNativePlatform()`:

| Tab | Route | Icon |
|-----|-------|------|
| Home | `/` | home |
| Add | `/add` | plus-circle |
| Analytics | `/analytics` | bar-chart |
| Reflection | `/reflection` | notebook |

- Fixed bottom bar, `padding-bottom: env(safe-area-inset-bottom)`
- Hide desktop top nav on native

Composable: `useCapacitor.ts` → `isNative`, `platform`

### Touch and layout

- Min tap target 48px on native
- Input font size ≥ 16px (prevents iOS zoom)
- Pull-to-refresh on dashboard (optional, `@capacitor-community/...` or custom)
- **Native polish:** Match or exceed web UI quality — native shell should not downgrade the design; use same tokens, shadows, and interactive patterns as PWA/web

### Splash and icons

- Native splash: dark slate background + logo
- App icons: use `@capacitor/assets` to generate from 1024×1024 source

### Performance

- Lazy-load ECharts on analytics route
- Limit chart data points on mobile (aggregate by day only)
- Avoid heavy animations on low-end Android

---

## Native plugins (incremental)

### Phase 4a — Required

| Plugin | Purpose |
|--------|---------|
| `@capacitor/app` | Back button, app state |
| `@capacitor/splash-screen` | Launch splash |
| `@capacitor/status-bar` | Style status bar to match theme |
| `@capacitor/haptics` | Light impact on successful log |

### Phase 4b — Push notifications

| Plugin | Purpose |
|--------|---------|
| `@capacitor/push-notifications` | Register device token |

**Backend additions:**

- Table `push_tokens`: `user_id`, `token`, `platform` (`ios`|`android`), `updated_at`
- `POST /api/push/register` — save token (auth required)
- Cron or manual job: send reflection reminder at user-local 8pm (defer full scheduler to later; MVP: document manual trigger)

**iOS:** APNs key in backend env; **Android:** FCM project.

**Non-goal for first mobile release:** full scheduler infra — can use Firebase console test messages.

### Phase 4c — Optional privacy

| Plugin | Purpose |
|--------|---------|
| `@capacitor-community/privacy-screen` or biometric | Blur app in task switcher |
| `@capgo/capacitor-native-biometric` | Unlock gate before app use |

Store preference in `user_settings.require_biometric`.

---

## Offline on mobile

- Reuse Phase 3 IndexedDB queue — works inside WebView
- Test: airplane mode → log entry → sync on reconnect
- iOS WebView: Background Sync limited — rely on `online` event + `App.addListener('appStateChange')` to sync when app foregrounds

---

## Backend readiness (future scale)

Stay on Hono until:

- Analytics jobs exceed request timeout (>30s aggregates)
- Need event stream / realtime aggregation
- Background workers for push at scale

**Then:** extract `analytics-worker` (Go or Node worker) — Nuxt/Capacitor clients unchanged.

Document triggers in `CONSTITUTION.md` when met — not part of Phase 4 delivery.

---

## Build and release pipeline

### Android

1. `cd frontend && npm run generate`
2. `cd mobile && npx cap sync android`
3. Open Android Studio → Build signed AAB
4. Play Console: internal testing track first

### iOS

1. Same sync for `ios`
2. Xcode → Archive → TestFlight
3. Requires Mac + Apple Developer account

### CI (optional)

GitHub Action: on tag `v*`, build web → cap sync → upload artifacts (fastlane later).

---

## Files to create

```
mobile/
├── capacitor.config.ts
├── package.json
├── android/...
├── ios/...
└── README.md              # device run instructions

frontend/
├── composables/useCapacitor.ts
├── components/nav/MobileTabBar.vue
└── plugins/capacitor.client.ts   # register listeners

backend/src/routes/push.ts        # token registration
packages/db/...                   # push_tokens migration
```

---

## Implementation order

1. Verify `nuxt generate` output works in Capacitor WebView
2. Init `mobile/` + android platform; test on emulator
3. Mobile tab bar + safe areas + status bar
4. Splash + app icons
5. Haptics on log success
6. Production API URL in build flavors
7. iOS platform + TestFlight internal
8. Push token registration API + client plugin (basic)
9. (Optional) Biometric gate

---

## Acceptance criteria

- [ ] Android debug build opens app, loads UI, calls production/staging API
- [ ] iOS simulator or device build runs same flows
- [ ] Bottom tabs work; safe area respected on notched devices
- [ ] Log entry + haptic feedback on native
- [ ] Offline entry from Phase 3 syncs after app resume
- [ ] No regression on web/PWA builds (Capacitor code tree-shaken on web)
- [ ] Native builds match web UI quality — interactive, polished, not a degraded WebView experience
- [ ] Store-ready signed build instructions documented in `mobile/README.md`

---

## Non-goals (Phase 4)

- Flutter / React Native rewrite
- Go microservices (unless analytics triggers met separately)
- Full push campaign scheduler
- Widgets (home screen) — future
- Automatic screen time / app usage tracking
- In-app purchases

---

## Deliverables

- `mobile/` Capacitor project with Android + iOS targets
- Native tab navigation and safe-area layout
- Icons + splash screens
- Build/run documentation
- Push token API (registration only; sending can be manual at first)
- Optional biometric lock
- Updated root README with mobile dev commands
