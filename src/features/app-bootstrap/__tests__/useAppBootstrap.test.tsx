import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAppBootstrap } from '../hooks/useAppBootstrap'
import { sessionStore } from '@/shared/auth/session-store'
import { appStore } from '@/shared/auth/app-store'
import * as SplashScreen from 'expo-splash-screen'

vi.mock('@/shared/auth/session-store', () => {
  const state = { restoreSession: vi.fn(), status: 'booting', accessToken: null, userId: null }
  const store = (selector: (s: typeof state) => unknown) => selector(state)
  store.getState = () => state
  store.setState = (newState: Partial<typeof state>) => Object.assign(state, newState)
  return { sessionStore: store }
})

vi.mock('@/shared/auth/app-store', () => {
  const state = { restoreExamProfile: vi.fn(), currentExamProfile: null }
  const store = (selector: (s: typeof state) => unknown) => selector(state)
  store.getState = () => state
  store.setState = (newState: Partial<typeof state>) => Object.assign(state, newState)
  return { appStore: store }
})

let states: unknown[] = []
let effects: (() => void | (() => void))[] = []
let stateIdx = 0

vi.mock('react', () => {
  return {
    useState: (initial: unknown) => {
      const idx = stateIdx++
      if (states[idx] === undefined) {
        states[idx] = typeof initial === 'function' ? (initial as Function)() : initial
      }
      const set = (val: unknown) => { states[idx] = typeof val === 'function' ? (val as Function)(states[idx]) : val }
      return [states[idx], set]
    },
    useEffect: (fn: () => void | (() => void), _deps: unknown) => {
      effects.push(fn)
    },
    useCallback: (fn: unknown) => fn,
    useRef: (initial: unknown) => ({ current: initial }),
    default: { createElement: () => ({}) },
    createElement: () => ({}),
  }
})

vi.mock('expo-splash-screen', () => ({
  hideAsync: vi.fn().mockResolvedValue(true)
}))
vi.mock('@/shared/logging/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn() }
}))

describe('useAppBootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    states = []
    effects = []
    stateIdx = 0
    sessionStore.setState({ status: 'booting', accessToken: null, userId: null })
    appStore.setState({ currentExamProfile: null })
  })

  it('runs successfully on first try and hides splash', async () => {
    vi.spyOn(sessionStore.getState(), 'restoreSession').mockResolvedValue()
    vi.spyOn(appStore.getState(), 'restoreExamProfile').mockResolvedValue()

    stateIdx = 0
    const hook = useAppBootstrap()
    expect(hook.status).toBe('running')

    for (const eff of effects) eff()
    await new Promise(r => setTimeout(r, 10))

    stateIdx = 0
    const hook2 = useAppBootstrap()
    expect(hook2.status).toBe('ready')
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1)
  })

  it('sets error status and handles splash hide on failure', async () => {
    vi.spyOn(sessionStore.getState(), 'restoreSession').mockResolvedValue()
    vi.spyOn(appStore.getState(), 'restoreExamProfile').mockRejectedValue(new Error('Test DB failed'))

    stateIdx = 0
    const hook = useAppBootstrap()
    expect(hook.status).toBe('running')

    for (const eff of effects) eff()
    await new Promise(r => setTimeout(r, 10))

    stateIdx = 0
    const hook2 = useAppBootstrap()
    expect(hook2.status).toBe('error')
    expect(hook2.errorMessage).toBe('本地配置加载失败，请重新尝试')
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1)
  })

  it('only runs one promise when retry is called concurrently', async () => {
    const restoreSessionSpy = vi.spyOn(sessionStore.getState(), 'restoreSession').mockResolvedValue()
    vi.spyOn(appStore.getState(), 'restoreExamProfile').mockResolvedValue()

    stateIdx = 0
    const hook = useAppBootstrap()

    for (const eff of effects) eff()
    await new Promise(r => setTimeout(r, 10))
    
    restoreSessionSpy.mockClear()
    hook.retry()
    hook.retry()
    hook.retry()
    await new Promise(r => setTimeout(r, 10))

    expect(restoreSessionSpy).toHaveBeenCalledTimes(1)
  })

  it('does not update state if unmounted before promise resolves', async () => {
    let resolveSession: () => void
    const sessionPromise = new Promise<void>((r) => { resolveSession = r })
    
    vi.spyOn(sessionStore.getState(), 'restoreSession').mockReturnValue(sessionPromise)
    vi.spyOn(appStore.getState(), 'restoreExamProfile').mockResolvedValue()

    stateIdx = 0
    useAppBootstrap()

    // simulate unmount by running the cleanup function returned by useEffect
    for (const eff of effects) {
      const cleanup = eff()
      if (typeof cleanup === 'function') cleanup()
    }

    resolveSession!()
    await new Promise(r => setTimeout(r, 10))

    stateIdx = 0
    const hook2 = useAppBootstrap()
    expect(hook2.status).toBe('running') // because unmounted, state wasn't updated to ready
  })
})
