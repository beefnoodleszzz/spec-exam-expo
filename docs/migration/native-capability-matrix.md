# Native Capability Matrix — Phase 0

## Go/No-Go Gate (Phase 2)

All items below must be verified on real device before large-scale page work begins.

| Capability | Old Implementation | New Target | Status | Notes |
|-----------|-------------------|------------|--------|-------|
| 微信初始化 | react-native-wechat-lib | Custom Expo Module `app-wechat` | ❌ Pending | Must verify Universal Link on iOS |
| 微信登录 | react-native-wechat-lib | `modules/app-wechat` | ❌ Pending | OAuth code flow |
| 微信分享 | react-native-wechat-lib | `modules/app-wechat` | ❌ Pending | |
| 微信支付拉起与回调 | react-native-wechat-lib | `modules/app-wechat` | ❌ Pending | Critical — must verify callback |
| 阿里云一键登录 | react-native-aliyun-onepass | Custom Expo Module `app-onepass` | ❌ Pending | Android + iOS APPIDs differ |
| 高德定位 | react-native-amap-geolocation | Custom Expo Module `app-location` | ❌ Pending | Permission required |
| 隐私合规SDK | Custom native implementation | Config Plugin `app-privacy` | ❌ Pending | |
| WebView | react-native-webview | react-native-webview (Expo managed) | ✅ Available | Domain whitelist required |
| Splash Screen | react-native-splash-screen | expo-splash-screen | ✅ Available | |
| SecureStore | react-native-keychain | expo-secure-store | ✅ Available | |
| EAS Development Build | N/A | EAS Build | ❌ Pending | First build needed |
| New Architecture | Hermes only | New Arch + Hermes | ❌ Pending | RN 0.86 default |

## Module Architecture

Each custom native module must have:
- TypeScript API (`index.ts`)
- Kotlin implementation
- Swift implementation
- Config Plugin (`plugin/`)
- Error code mapping
- Event subscription cleanup
- Device verification screen

## Android-specific

| Item | Notes |
|------|-------|
| minSdkVersion | 23 (matches legacy) |
| targetSdkVersion | 34 (modern) |
| Aliyun AppId | `ANDROID_PRODUCTION_APPID` (see env/index.ts) |
| WeChat scheme | `wx<appId>` |

## iOS-specific

| Item | Notes |
|------|-------|
| Min iOS | 13.0 (Expo SDK 57 minimum) |
| Universal Link | `https://fch.i-cbao.com/specialworker/` |
| Aliyun AppId | `IOS_APPID` (see env/index.ts) |
| WeChat LSApplicationQueriesSchemes | `weixin`, `weixinULAPI` |

## Permissions Required

| Permission | Platform | Reason |
|-----------|----------|--------|
| ACCESS_FINE_LOCATION | Android | 高德定位 |
| ACCESS_COARSE_LOCATION | Android | 高德定位 |
| NSLocationWhenInUseUsageDescription | iOS | 高德定位 |
| CAMERA | Both | 一键登录身份验证 (if needed) |

## Decommissioned

| Old Library | Reason | Replacement |
|-------------|--------|-------------|
| CodePush | Microsoft discontinued | EAS Update |
| AppCenter Analytics | Going away | Sentry + PostHog |
| react-native-config | Not Expo-compatible | expo-constants extra |
| RxJS ajax | Heavy, no benefit | Native fetch |
| Custom DI framework | Overcomplicated | Direct imports |
| BackHandler exit | UX anti-pattern | Remove |
