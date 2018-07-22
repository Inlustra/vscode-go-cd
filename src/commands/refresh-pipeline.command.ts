import { State } from '../state'
import { window, ProgressLocation } from 'vscode'
import { first } from 'rxjs/operators'

export default function ForceRefresh() {
  window.withProgress(
    {
      cancellable: false,
      location: ProgressLocation.Notification,
      title: 'Refreshing pipelines'
    },
    async promise => {
      State.forceRefresh$.next()
      return State.pipelines$.pipe(first()).toPromise()
    }
  )
}
