# API Capability Matrix

| Domain | Capability | Generated Function | HTTP Method | Real Path | Request DTO | Response DTO | Legacy File | New File | Loop Dependency | Conclusion | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Auth | Login | `login` | POST | `/login` | `LoginReq` | `LoginResp` | `LoginService` | `auth.ts` | None | IMPLEMENTED | Existing file |
| Practice | Get Subjects | `getSubjects` | GET | `/subjects` | `void` | `SubjectResp` | `SubjectService` | `practice.ts` | None | IMPLEMENTED | Existing file |
| VIP | Buy VIP | `buyVip` | POST | `/vip/buy` | `BuyVipReq` | `BuyVipResp` | `OrderToPractice` | None | VIP/Payment | HIDE | Missing loop |
| Wallet | Get Balance | `getBalance` | GET | `/wallet` | `void` | `WalletResp` | `MyWalletComponent` | None | Wallet | HIDE | Missing loop |
| History | Buy History | `getBuyHistory` | GET | `/history` | `HistoryReq` | `HistoryResp` | `BuyHistory` | None | Wallet/History | HIDE | Missing loop |
