import { State } from '../state'

export default function ForceRefresh() {
  State.forceRefresh$.next()
}
