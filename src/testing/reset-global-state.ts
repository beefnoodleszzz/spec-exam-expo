import { useAuthUserStore } from '../features/auth/state/auth-user.store'
import { usePracticeSessionStore } from '../features/question-bank/state/practice-session.store'
import { useSimulationSessionStore } from '../features/simulation/state/simulation-session.store'
import { appStore } from '../shared/auth/app-store'
import { sessionStore } from '../shared/auth/session-store'
import { queryClient } from '../shared/query/query-client'

const initialAuthUserState = useAuthUserStore.getState()
const initialPracticeSessionState = usePracticeSessionStore.getState()
const initialSimulationSessionState = useSimulationSessionStore.getState()
const initialAppState = appStore.getState()
const initialSessionState = sessionStore.getState()

export function resetGlobalState() {
  useAuthUserStore.setState(initialAuthUserState, true)
  usePracticeSessionStore.setState(initialPracticeSessionState, true)
  useSimulationSessionStore.setState(initialSimulationSessionState, true)
  appStore.setState(initialAppState, true)
  sessionStore.setState(initialSessionState, true)
  queryClient.clear()
}
