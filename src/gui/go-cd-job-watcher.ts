import { Subject, BehaviorSubject } from 'rxjs'
import { State } from '../state'
import { map, withLatestFrom, tap, skipWhile } from 'rxjs/operators'
import { PipelineInstance } from '../gocd-api/models/pipeline-instance.model'
import { Pipeline } from '../gocd-api/models/pipeline.model'
import { EventEmitter } from 'vscode'
import { showErrorAlert } from './alerts/show-error-alert'
import { OK } from './alerts/named-actions'

interface WatchedPipeline {
  name: string
  instance: string
}

export class GoCdJobWatcher {
  _onPipelineFailure = new EventEmitter<{
    pipeline: Pipeline
    instance: PipelineInstance
  }>()
  readonly onPipelineFailure = this._onPipelineFailure.event

  watchedPipelines$: Subject<WatchedPipeline[]> = new BehaviorSubject(<
    WatchedPipeline[]
  >[])

  runner$ = State.pipelines$.pipe(
    withLatestFrom(this.watchedPipelines$),
    tap(([pipelines, watchedPipelines]) => {
      pipelines.forEach(pipeline => {
        const watchedPipeline = watchedPipelines.find(
          watchedPipeline => pipeline.name === watchedPipeline.name
        )
        if (watchedPipeline) {
          this.handlePipelineStatusChange(
            pipeline,
            pipeline._embedded.instances.find(
              instance => instance.label === watchedPipeline.instance
            )
          )
        }
      })
    }),
    tap(([pipelines]) => {
      const pipelinesToWatch = this.getPipelinesToWatch(pipelines)
      console.log('Watching pipelines: ' + pipelinesToWatch)
      this.watchedPipelines$.next(pipelinesToWatch)
    })
  )

  constructor() {}

  init() {
    this.runner$.subscribe()
  }

  isWatchedPipeline(pipeline: Pipeline, watchedPipelines: WatchedPipeline[]) {
    return watchedPipelines.find(
      watchedPipeline => pipeline.name === watchedPipeline.name
    )
  }

  isPipelineRunning(instance: PipelineInstance) {
    return instance._embedded.stages.some(stage => stage.status === 'Building')
  }

  getPipelinesToWatch(pipeline: Pipeline[]) {
    const watchedPipelines: WatchedPipeline[] = []
    return watchedPipelines.concat(
      ...pipeline.map(pipeline =>
        pipeline._embedded.instances
          .filter(instance => this.isPipelineRunning(instance))
          .map((instance, idx) => ({
            instance: instance.label,
            name: pipeline.name
          }))
      )
    )
  }
  handlePipelineStatusChange(pipeline: Pipeline, instance?: PipelineInstance) {
    if (instance) {
      const stages = instance._embedded.stages.map(stage => stage.status)
      const didFail = stages.some(stage => stage === 'Failed')
      if (didFail) {
        showErrorAlert(null, pipeline.name + ' failed!', OK)
        this._onPipelineFailure.fire({ pipeline, instance })
      }
    } else {
      console.error('Lost instance for pipeline... ' + pipeline)
    }
  }
}
