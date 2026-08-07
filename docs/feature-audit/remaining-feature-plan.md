# Remaining Feature Plan

Based on the feature audit, the following features remain to be addressed, segmented into manageable phases.

## Phase 10A: UI Polish & Core User Flows
- Implement standard user profile settings (name, avatar, basic preferences).
- Polish the "Mine" (Profile) screen layout.
- Finalize the authentication loops (including handling Apple Login if supported).
- Ensure all screens properly handle loading, error, and empty states.

## Phase 10B: Hiding Unsupported / Incomplete Features
- Implement UI toggles or completely remove entry points for **VIP / Membership**.
- Hide **Wallet** and **Payment** related buttons from the profile screen.
- Mark **Notices** and **Version Update** as `NOT SUPPORTED` in code, ensuring no broken UI interactions.

## Phase 11: Production Readiness
- Complete E2E testing for all core routes.
- Address TestFlight / Play Store deployment prerequisites.
- Validate environment configurations in a production build.
- Perform a final review against legacy behavioral requirements.
