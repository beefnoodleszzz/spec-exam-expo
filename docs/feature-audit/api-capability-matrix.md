# API Capability Matrix

This matrix documents the backend capabilities based on the generated OpenAPI client (`src/shared/api/generated/`).

| Domain | Capability | Endpoint | Status | Notes |
|---|---|---|---|---|
| User | Login / Auth | `/api/examV2/app/user/login` (assumed) | SUPPORTED | Core functionality. |
| User | Profile Info | `/api/examV2/app/user/info` (assumed) | SUPPORTED | Standard profile. |
| Wallet | Assets Info | `/api/examV2/app/wallet/userAssetsInfo` | HIDE | API exists but UI loop is incomplete. |
| Wallet | Cash Out | `/api/examV2/app/wallet/userApplyCashOut` | HIDE | API exists but UI loop is incomplete. |
| Order | My Invites | `/api/examV2/app/order/myInviteRecordPagedList` | HIDE | Part of incomplete referral/payment loop. |
| Order | Delete/Change | `/api/examV2/app/order/changeCourse` | HIDE | Excluded. |
| Version | Update Check | N/A | NOT SUPPORTED | No clear version check API found in generated client. |
| Notice | System Notice | N/A | NOT SUPPORTED | No active notice capability found. |
