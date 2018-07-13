import { State } from '../state'
import * as vscode from 'vscode'
import { first, tap } from 'rxjs/operators'

export default function ForceRefresh() {
  const refresh$ = State.pipelines$.pipe(first())
  State.forceRefresh.next()
}
