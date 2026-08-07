# Remaining Feature Plan

## Phase 8: Search, Notes, Favorites
- **Business Loop**: Allow users to search for topics, take notes, and manage their favorite questions.
- **Involved Pages**: `search`, `wrong-topic-collection-component`, `my-idea-component`
- **Involved APIs**: `searchQuestions`, `getFavorites`, `addFavorite`
- **Dependencies**: Authentication, Practice Core
- **Exclusions**: Advanced text search filtering
- **Acceptance Criteria**: Users can search, favorite, and view notes.
- **Expected Commit Title**: `feat(search): implement search and favorites`

## Phase 9: Membership & Payment
- **Business Loop**: Allow users to purchase VIP access.
- **Involved Pages**: `my-vip-component`, `order-to-practice-component`
- **Involved APIs**: `buyVip`, `getOrderStatus`
- **Dependencies**: Authentication
- **Exclusions**: Apple Pay integration (Deferred)
- **Acceptance Criteria**: Users can view VIP status and generate order.
- **Expected Commit Title**: `feat(payment): implement VIP checkout`

## Phase 10: Wallet, Invitation, Profile
- **Business Loop**: Manage wallet balances, refer friends, and update user info.
- **Involved Pages**: `my-wallet-component`, `invite-user-component`, `user-info-component`, `withdrawal-component`
- **Involved APIs**: `getWallet`, `inviteUser`, `withdraw`
- **Dependencies**: Payment
- **Exclusions**: Custom avatar upload
- **Acceptance Criteria**: Users can view wallet balance and submit withdrawal request.
- **Expected Commit Title**: `feat(profile): implement wallet and invites`

## Phase 11: WebView & Release
- **Business Loop**: Surface legal pages and polish for release.
- **Involved Pages**: `simple-webview-component`, `user-agreement-component`
- **Involved APIs**: N/A
- **Dependencies**: All prior phases
- **Exclusions**: Device testing (Deferred)
- **Acceptance Criteria**: All webviews render correctly.
- **Expected Commit Title**: `feat(release): finalize webviews and release prep`
