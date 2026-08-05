# Storage Key Inventory — Phase 0

## Legacy Keys (spec-exam-pure)

From `src/framework/util/storage/key.ts`:

| Key | Type | Content | New Location |
|-----|------|---------|--------------|
| `SUBJECT_CHOOSED` | SyncStorage | Selected subject | `async_exam_profile_summary` |
| `WECHAT_USER_INFO` | SyncStorage | WeChat user info | Not needed (use token) |
| `USER_TOKEN` | SyncStorage | Auth token | `sec_access_token` (SecureStore) |
| `VIP_STATE` | SyncStorage | VIP status | Server state (TanStack Query) |
| `LESSION` | SyncStorage | Current lesson | Merged into exam profile |
| `HAD_READ_PRIVATE` | SyncStorage | Privacy accepted flag | `async_privacy_version` |
| `USER_INFO_DETAIL` | SyncStorage | Full user JSON + token | Split: token→SecureStore, rest→Query |
| `REGISTER_FOR_EXAMINATION_INFO` | SyncStorage | Exam project selection | `async_exam_profile_summary` |
| `ISFIRSTOPENAPP` | SyncStorage | First launch done | `async_first_launch_done` |
| `SEARCH_HISTORY` | SyncStorage | Search history | `async_search_history` |
| `HAVE_SHARE` | SyncStorage | Share state | Not needed |
| `DOSUBJECTNUMBER` | SyncStorage | Free trial count | Not persisted (compute from server) |
| `APP_VERSION_CONTROL` | SyncStorage | Version check | Not needed (Expo handles this) |

## New Keys (spec-exam-expo)

### SecureStore (`expo-secure-store`)

| Key | Type | Content |
|-----|------|---------|
| `sec_access_token` | string | Auth token |
| `sec_user_id` | string | User ID |

### AsyncStorage (`@react-native-async-storage/async-storage`)

| Key | Type | Content |
|-----|------|---------|
| `async_privacy_version` | string | Accepted privacy version |
| `async_first_launch_done` | boolean | First launch completed |
| `async_exam_profile_summary` | ExamProfileSummary JSON | Current exam type + region + subject |
| `async_search_history` | string[] JSON | Recent search terms |
| `async_practice_snapshot` | PersistedPracticeSnapshot JSON | Current in-progress practice |
| `async_simulation_snapshot` | PersistedSimulationSnapshot JSON | Current in-progress exam |
| `async_theme_mode` | 'light' \| 'dark' | UI theme |

## Migration Notes

1. `USER_INFO_DETAIL` stored both token AND user data — this is wrong. New app separates them.
2. `SyncStorage` was a synchronous AsyncStorage wrapper — replaced by proper async patterns.
3. `REGISTER_FOR_EXAMINATION_INFO` maps to `ExamProfileSummary` format.
4. All SyncStorage keys are gone — there is no synchronous storage in the new app.
