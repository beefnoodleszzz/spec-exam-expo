/**
 * React tests for route guards — public and protected layouts.
 */

import React from 'react'
import { render } from '@testing-library/react-native'

// Mock expo-router — include Stack.Screen to avoid displayName crash
const mockRedirect = jest.fn()
const ScreenComponent = () => null
const StackComponent = ({ children }: { children?: React.ReactNode }) =>
  children ? (children as React.ReactElement) : null
StackComponent.Screen = ScreenComponent

jest.mock('expo-router', () => ({
  get Stack() {
    return StackComponent
  },
  Redirect: (props: { href: string }) => {
    mockRedirect(props.href)
    return null
  },
}))

// Mock session store — we control the status
let mockStatus = 'booting'

jest.mock('@/shared/auth/session-store', () => ({
  sessionStore: (selector: (s: { status: string }) => unknown) =>
    selector({ status: mockStatus }),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PublicLayout = require('@/app/(public)/_layout').default
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ProtectedLayout = require('@/app/(protected)/_layout').default

describe('PublicLayout (route guard)', () => {
  beforeEach(() => {
    mockRedirect.mockClear()
  })

  it('renders null while booting', () => {
    mockStatus = 'booting'
    const { toJSON } = render(React.createElement(PublicLayout))
    expect(toJSON()).toBeNull()
  })

  it('redirects authenticated users to protected tabs', () => {
    mockStatus = 'authenticated'
    render(React.createElement(PublicLayout))
    expect(mockRedirect).toHaveBeenCalledWith('/(protected)/(tabs)')
  })

  it('renders Stack for anonymous users without redirecting', () => {
    mockStatus = 'anonymous'
    render(React.createElement(PublicLayout))
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})

describe('ProtectedLayout (route guard)', () => {
  beforeEach(() => {
    mockRedirect.mockClear()
  })

  it('renders null while booting', () => {
    mockStatus = 'booting'
    const { toJSON } = render(React.createElement(ProtectedLayout))
    expect(toJSON()).toBeNull()
  })

  it('redirects anonymous users to sign-in', () => {
    mockStatus = 'anonymous'
    render(React.createElement(ProtectedLayout))
    expect(mockRedirect).toHaveBeenCalledWith('/(public)/sign-in')
  })

  it('renders Stack for authenticated users without redirecting', () => {
    mockStatus = 'authenticated'
    render(React.createElement(ProtectedLayout))
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
