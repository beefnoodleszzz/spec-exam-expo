# Legacy Feature Inventory

| Feature ID | Name | Legacy Route | Legacy Page | Legacy Service | Legacy API | Entry Location | Login Required | Platform Constraints | New Project Status |
|---|---|---|---|---|---|---|---|---|---|
| F-01 | Splash Screen | Splash | splash-component | N/A | N/A | App Start | No | None | PENDING |
| F-02 | Home (Tabs) | Home | home-component | N/A | N/A | App Start | No | None | IMPLEMENTED |
| F-03 | Practice Main | DoExamMain | do-exam-main-component | N/A | N/A | Home | Yes | None | IMPLEMENTED |
| F-04 | Choose City | ChooseCity | city-component | N/A | N/A | Profile/Settings | No | None | DEFERRED |
| F-05 | Login | Login | login-component | LoginService | Various | Auth | No | None | IMPLEMENTED |
| F-06 | Subject Choose | SubjectChoose | subject-choose-component | SubjectService | Various | Home | Yes | None | IMPLEMENTED |
| F-07 | Register | RegisterForExamination | register-for-examination-component | N/A | N/A | Login | No | None | DEFERRED |
| F-08 | Search | Search | search-component | N/A | N/A | Tabs | Yes | None | PENDING |
| F-09 | Wrong Topics | WrongTopicSetComponent | wrong-topic-set-component | N/A | N/A | Profile | Yes | None | DEFERRED |
| F-10 | Transcripts | TheTranscriptComponent | the-transcript-component | N/A | N/A | Profile | Yes | None | DEFERRED |
| F-11 | Simulation Test | SimulationTestComponent | simulation-test-component | N/A | N/A | Home | Yes | None | IMPLEMENTED |
| F-12 | Mine (Profile) | mine | mine-component | N/A | N/A | Tabs | Yes | None | IMPLEMENTED |
| F-13 | VIP | MyVipComponent | my-vip-component | N/A | N/A | Profile | Yes | Payments | PENDING |
| F-14 | Wallet | MyWalletComponent | my-wallet-component | N/A | N/A | Profile | Yes | Payments | PENDING |
| F-15 | Payments / Order | OrderToPracticeComponent | order-to-practice-component | N/A | N/A | VIP | Yes | Payments | PENDING |
| F-16 | Notice/Idea | MyIdeaComponent | my-idea-component | N/A | N/A | Profile | Yes | None | NOT FOUND IN LEGACY |
| F-17 | Apple Login | LoginIndex | login-index-component | N/A | N/A | Login | No | iOS Only | DEFERRED |
| F-18 | Buy History | BuyHistoryComponent | buy-history-component | N/A | N/A | Wallet | Yes | Payments | PENDING |
| F-19 | Invite User | InviteUserComponent | invite-user-component | N/A | N/A | Profile | Yes | None | PENDING |
| F-20 | Input Invite Code | InputInviteCodeComponent | input-invite-code-component | N/A | N/A | Profile | Yes | None | PENDING |
| F-21 | User Info | UserInfoComponent | user-info-component | N/A | N/A | Profile | Yes | None | PENDING |
| F-22 | Settings | SettingComponent | setting-component | N/A | N/A | Profile | Yes | None | IMPLEMENTED |
| F-23 | Withdrawal | WithdrawalComponent | withdrawal-component | N/A | N/A | Wallet | Yes | None | PENDING |

## New Project Entry Audit

- Tabs (`index`, `search`, `me`, `profile`): Reachable and partially complete.
- Home Actions: Navigation to Practice and Simulation is set up.
- User Center (`profile`): Contains links to settings, some profile actions.
- Settings: Feedback and Legal routes exist. Need to hide or complete pending features like VIP and Wallet.
