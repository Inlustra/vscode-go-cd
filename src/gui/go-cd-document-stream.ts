import * as tmp from 'tmp-promise'
import {
  Uri,
  window,
  workspace,
  TextDocument,
  WorkspaceEdit,
  Position
} from 'vscode'
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
  public onComplete$: Subject<void> = new Subject()

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
        takeUntil(this.onComplete$),
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
              return workspace.applyEdit(edit).then(doc.save)
            })
          )
        })
      )
      .subscribe(() => {}, () => {}, this.onComplete$.next)
  }

  private registerOnClose(doc: TextDocument) {
    console.log('registered!')
    const disposable = workspace.onDidCloseTextDocument(closedDoc => {
      console.log('CLOSED!')
      console.log(closedDoc)
      if (closedDoc.uri.path === doc.uri.path) {
        console.log('COMPLETE!')
        this.onComplete$.next()
      }
    })
    this.onComplete$.subscribe(() => disposable.dispose())
  }

  private openDocument(): Observable<TextDocument> {
    const randomString =
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15)
    return from(
      workspace.openTextDocument(
        Uri.parse('untitled:/tmp/' + randomString + '.log')
      )
    ).pipe(tap(doc => window.showTextDocument(doc)))
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
