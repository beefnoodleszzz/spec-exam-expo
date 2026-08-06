/**
 * Sign-in route (public).
 *
 * Thin route file — delegates all logic to SignInScreen feature component.
 */

import { SignInScreen } from '@/features/auth/ui/SignInScreen'

export default function SignInRoute() {
  return <SignInScreen />
}
