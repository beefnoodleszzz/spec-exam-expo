# Foundation Device Verification

## Metadata

- Commit:
- Date:
- Tester:
- Platform:
- Device:
- Build profile:
- App variant:

## 1. Cold Start

### Anonymous

1. Clear application data.
2. Start the production build.
3. Confirm native Splash remains visible during bootstrap.
4. Confirm the sign-in screen appears.
5. Confirm there is no white screen.

Result: PASS / FAIL

### Authenticated

1. Prepare a valid persisted session.
2. Terminate the application.
3. Start the production build.
4. Confirm the protected application appears.
5. Confirm there is no sign-in screen flash.

Result: PASS / FAIL

## 2. Development UI Protection

### Anonymous

1. Open `/dev/ui` through a deep link.
2. Confirm the UI showcase is not displayed.
3. Confirm navigation reaches the public entry route.
4. Confirm no redirect loop occurs.

Result: PASS / FAIL

### Authenticated

1. Open `/dev/ui` through a deep link.
2. Confirm the UI showcase is not displayed.
3. Confirm navigation reaches the protected application.
4. Confirm no redirect loop occurs.

Result: PASS / FAIL

## 3. Route Guard

### Anonymous to Protected

1. Clear the session.
2. Open a protected deep link.
3. Confirm redirect to sign-in.
4. Confirm protected content never appears.

Result: PASS / FAIL

### Authenticated to Public

1. Restore a valid session.
2. Open the sign-in route.
3. Confirm redirect to the protected tabs.
4. Confirm sign-in content does not remain visible.

Result: PASS / FAIL

## 4. Logout Back Navigation

1. Sign in.
2. Open a protected detail screen.
3. Log out.
4. Confirm navigation reaches sign-in.
5. Press Android Back or perform iOS back gesture.
6. Confirm the protected screen cannot be restored.

Result: PASS / FAIL

## 5. Unauthorized Session

1. Sign in.
2. Trigger an HTTP 401 or envelope 401.
3. Confirm local session data is cleared.
4. Confirm navigation reaches sign-in.
5. Confirm system back does not restore protected content.

Result: PASS / FAIL

## Final Result

- Cold start:
- Dev UI:
- Route guard:
- Logout:
- Unauthorized:
- Overall: PASS / FAIL
