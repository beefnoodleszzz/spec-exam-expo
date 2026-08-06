/**
 * React tests for route guards — public and protected layouts.
 */

import React from 'react'
import { render } from '@testing-library/react-native'

const mockRedirect = jest.fn()
const mockUseSegments = jest.fn().mockReturnValue(['(protected)', '(tabs)'])
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
  useSegments: () => mockUseSegments(),
}))

let mockCurrentExamProfile: unknown = { id: 'mock-exam' }

jest.mock('@/shared/auth/app-store', () => ({
  appStore: (selector: (state: Record<string, unknown>) => unknown) => {
    return selector({
      currentExamProfile: mockCurrentExamProfile
    })
  },
}))

let mockStatus: 'booting' | 'authenticated' | 'anonymous' = 'booting'

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
    mockUseSegments.mockReturnValue(['(public)', 'sign-in'])
  })

  it('renders null while booting', () => {
    mockStatus = 'booting'
    const { toJSON } = render(React.createElement(PublicLayout))
    expect(toJSON()).toBeNull()
  })

  it('redirects authenticated users to protected tabs', () => {
    mockStatus = 'authenticated'
    render(React.createElement(PublicLayout))
    expect(mockRedirect).toHaveBeenCalledWith('/(protected)')
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
    mockCurrentExamProfile = { id: 'mock-exam' }
    mockUseSegments.mockReturnValue(['(protected)', '(tabs)'])
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

  it('renders Stack for authenticated users with profile without redirecting', () => {
    mockStatus = 'authenticated'
    mockCurrentExamProfile = { id: 'mock-exam' }
    mockUseSegments.mockReturnValue(['(protected)', '(tabs)'])
    render(React.createElement(ProtectedLayout))
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects to /exam-profile if authenticated but no profile', () => {
    mockStatus = 'authenticated'
    mockCurrentExamProfile = null
    mockUseSegments.mockReturnValue(['(protected)', '(tabs)'])
    render(React.createElement(ProtectedLayout))
    expect(mockRedirect).toHaveBeenCalledWith('/(protected)/exam-profile')
  })

  it('does not redirect if authenticated, no profile, but already on exam-profile', () => {
    mockStatus = 'authenticated'
    mockCurrentExamProfile = null
    mockUseSegments.mockReturnValue(['(protected)', 'exam-profile'])
    render(React.createElement(ProtectedLayout))
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
