# Legacy Feature Inventory

This document maps legacy application features to their current status in the new architecture.

| Feature | Legacy Component | Status | Notes |
|---|---|---|---|
| VIP / Membership | `my-vip-component` | HIDE | Payment flow incomplete, hiding for now. |
| Wallet / Payment | `my-wallet.service.ts`, `pay.service.ts` | HIDE | Hiding to avoid broken features. |
| Notice / Top Set | `top-set.service.ts` | NOT SUPPORTED | Excluded from current scope. |
| App Routes | `app.routes.tsx` | MAPPED | Migrated to Expo Router file-based routing. |
| Mine (Profile) | `mine.service.ts` | MAPPED | Merged into new profile architecture. |
| Splash Screen | `splash-component` | MAPPED | Handled by Expo Splash Screen plugin. |
| Apple Login | `apple.login.tsx` | DEFERRED | Auth flow pending complete integration. |
