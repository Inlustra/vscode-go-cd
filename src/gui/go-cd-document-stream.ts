import * as tmp from 'tmp-promise'
import { Uri, workspace, TextDocument, WorkspaceEdit, Position } from 'vscode'
import { State } from '../state'
import {
  first,
  map,
  flatMap,
  switchMap,
  mapTo,
  exhaustMap,
  catchError,
  filter,
  tap,
  takeUntil,
  takeWhile
} from 'rxjs/operators'
import { Observable, from, merge, interval, of, Subject } from 'rxjs'
import { showErrorAlert } from './alerts/show-error-alert'
import { OK } from './alerts/named-actions'

export class GoCdDocumentStream {
  private stopped$: Subject<void> = new Subject()

  constructor(
    private pipelineName: string,
    private pipelineCounter: string,
    private stageName: string,
    private stageCounter: string,
    private jobName: string,
    private artifact: string
  ) {}

  start() {
    this.openDocument()
      .pipe(
        catchError(
          e => showErrorAlert(e, 'Error opening document', OK) || null
        ),
        takeWhile(doc => !!doc),
        filter((doc): doc is TextDocument => !!doc),
        tap(doc => this.registerOnClose(doc)),
        switchMap(doc => merge(of(doc), interval(5000).pipe(mapTo(doc)))),
        takeUntil(this.stopped$),
        exhaustMap(doc => {
          return this.getFile(doc.lineCount).pipe(
            catchError(
              e => showErrorAlert(e, 'Error getting artifact', OK) || ''
            ),
            flatMap(file => {
              const edit = new WorkspaceEdit()
              edit.insert(
                doc.uri,
                new Position(doc.lineCount, 0),
                file.toString()
              )
              return workspace.applyEdit(edit)
            })
          )
        })
      )
      .subscribe()
  }

  private registerOnClose(doc: TextDocument) {
    const disposable = workspace.onDidCloseTextDocument(closedDoc => {
      if (closedDoc.uri === doc.uri) {
        this.stopped$.next()
      }
    })
    this.stopped$.subscribe(() => disposable.dispose())
  }

  private openDocument(): Observable<TextDocument> {
    return from(tmp.file({ postfix: '.log' })).pipe(
      map(file => Uri.parse('file:' + file.path)),
      flatMap(uri => workspace.openTextDocument(uri))
    )
  }

  private getFile(lineStart?: number): Observable<any> {
    return State.getArtifactFile(
      this.pipelineName,
      this.pipelineCounter,
      this.stageName,
      this.stageCounter,
      this.jobName,
      this.artifact,
      lineStart
    ).pipe(first())
  }
}
