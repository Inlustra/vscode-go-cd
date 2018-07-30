import {
  Uri,
  window,
  workspace,
  TextDocument,
  WorkspaceEdit,
  Position,
  StatusBarAlignment
} from 'vscode'
import {
  first,
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
import { JobStatus } from '../gocd-api/models/job-status.model'
import { Api } from '../api';

// TODO Break this class out into GUI components and streaming
export class GoCdDocumentStream { 

  public onComplete$: Subject<void> = new Subject()
  private statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 1)

  public get uri() {
    return Uri.parse(`untitled:${this.pipelineName}-${this.jobName}-${this.jobId}.log`);
  }

  constructor(
    private pipelineName: string,
    private pipelineCounter: string,
    private stageName: string,
    private stageCounter: string,
    private jobName: string,
    private jobId: string,
    private artifact: string = 'cruise-output/console.log'
  ) {}

  start() {
    this.openDocument()
      .pipe(
        takeWhile(doc => !!doc),
        filter((doc): doc is TextDocument => !!doc),
        tap(doc => this.registerStatusBar(doc)),
        tap(doc => this.registerOnClose(doc)),
        switchMap(doc => merge(of(doc), interval(5000).pipe(mapTo(doc)))),
        takeUntil(this.onComplete$),
        exhaustMap(doc => this.performEdit(doc)),
        switchMap(() => this.getJobStatus()),
        tap(status => this.handleJobStatus(status))
      )
      .subscribe(() => {}, () => {}, this.onComplete$.next)
  }

  private registerStatusBar(doc: TextDocument) {
    this.statusBarItem.text = '$(sync)'
    this.statusBarItem.show()
    this.onComplete$.subscribe(
      () => this.statusBarItem && this.statusBarItem.dispose()
    )
  }

  private registerOnClose(doc: TextDocument) {
    const disposable = workspace.onDidCloseTextDocument(closedDoc => {
      if (closedDoc.uri.path === doc.uri.path) {
        this.onComplete$.next()
      }
    })
    this.onComplete$.subscribe(() => disposable.dispose())
  }

  private openDocument(): Observable<TextDocument | null> {
    return from(
      workspace.openTextDocument(this.uri)
    ).pipe(
      tap(doc => window.showTextDocument(doc)),
      catchError(e => {
        showErrorAlert(e, 'Error opening document', OK)
        this.onComplete$.next()
        return of(null)
      })
    )
  }

  private getJobStatus(): Observable<JobStatus[]> {
    return Api.getJobStatus(
      this.pipelineName,
      this.stageName,
      this.jobId
    ).pipe(
      first(),
      catchError(e => {
        showErrorAlert(e, 'Error getting job status', OK)
        this.onComplete$.next()
        return of([])
      })
    )
  }

  private getFile(lineStart?: number): Observable<any> {
    return Api.getArtifactFile(
      this.pipelineName,
      this.pipelineCounter,
      this.stageName,
      this.stageCounter,
      this.jobName,
      this.artifact,
      lineStart
    ).pipe(first())
  }

  private performEdit(doc: TextDocument) {
    return this.getFile(doc.lineCount).pipe(
      catchError(e => showErrorAlert(e, 'Error getting artifact', OK) || ''),
      flatMap(file => {
        const edit = new WorkspaceEdit()
        edit.insert(doc.uri, new Position(doc.lineCount, 0), file.toString())
        return workspace.applyEdit(edit)
      })
    )
  }

  private handleJobStatus(status: JobStatus[]) {
    const jobStatus = status.pop()
    if (jobStatus) {
      const { building_info } = jobStatus
      if (building_info.is_completed === 'true') {
        this.onComplete$.next()
      }

      if (this.statusBarItem) {
        const amountCompleted = Math.floor(
          (parseInt(building_info.current_build_duration) /
            parseInt(building_info.last_build_duration)) *
            100
        )
        this.statusBarItem.text = `$(sync) ${this.pipelineName} -> ${
          this.jobName
        }... ${amountCompleted}%`
      }
    }
  }

}
