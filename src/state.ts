import { empty, interval, merge, of, Subject, forkJoin, from } from 'rxjs'
import {
  catchError,
  map,
  mapTo,
  share,
  skipWhile,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
  pairwise,
  filter,
  reduce
} from 'rxjs/operators'
import { Configuration } from './configuration'
import { GoCdApi } from './gocd-api'
import { PipelineGroupPipeline } from './gocd-api/models/pipeline-groups.model'
import { Logger } from './logger'
import { GitUtils } from './utils/git-utils'
import { Api } from './api'
import { PipelineHistory } from './gocd-api/models/pipeline-history.model'
import { PipelineInstance } from './gocd-api/models/pipeline-instance.model'
import { Pipeline } from './gocd-api/models/pipeline.model'
import {
  getStatusFromHistory,
  getStatusFromPipelineInstance
} from './utils/go-cd-utils'

export namespace State {
  export const stop$: Subject<void> = new Subject()

  export const forceRefresh$ = new Subject<void>()

  const configuration$ = Configuration.all$.pipe(
    skipWhile(config => !config.url),
    switchMap(config =>
      merge(
        of(null),
        forceRefresh$.pipe(tap(() => Logger.debug('[State] Force Refresh'))),
        interval(Math.max(config.refreshInterval, 5000)).pipe(
          tap(() => Logger.debug('[State] Interval Refresh'))
        )
      ).pipe(mapTo(config))
    ),
    takeUntil(stop$)
  )

  export const gitUrls$ = GitUtils.getGitOrigins().pipe(
    catchError(err => of(null)),
    share()
  )

  export const dashboardPipelineGroups$ = configuration$.pipe(
    switchMap(({ url, username, password }) =>
      GoCdApi.getDashboardPipelineGroups(url, username, password).pipe(
        catchError(e => empty()) // TODO: Handle this properly
      )
    ),
    share()
  )

  export const pipelines$ = dashboardPipelineGroups$.pipe(
    map(
      pipelineGroups =>
        pipelineGroups &&
        pipelineGroups
          .map(pipeline => pipeline._embedded.pipelines)
          .reduce((previousValue = [], currentPipelines) =>
            previousValue.concat(currentPipelines)
          )
    ),
    share()
  )

  export const openPipelines$ = configuration$.pipe(
    switchMap(({ url, username, password }) =>
      GoCdApi.getPipelineGroups(url, username, password).pipe(
        catchError(e => []) // TODO: Handle this properly
      )
    ),
    withLatestFrom(gitUrls$),
    map(([groups, gitUrls]) => {
      if (gitUrls) {
        const arr: PipelineGroupPipeline[] = []
        return arr
          .concat(...groups.map(groups => groups.pipelines))
          .filter(pipeline =>
            pipeline.materials
              .map(material => material.description)
              .some(description =>
                gitUrls.some(url => description.includes(url))
              )
          )
      } else {
        Logger.info(`[State] openPipelines, couldn't find any git repositories`)
      }
      return []
    }),
    map(pipelines => pipelines.map(pipeline => pipeline.name)),
    withLatestFrom(pipelines$),
    map(([names, pipelines]) => {
      return pipelines.filter(pipeline =>
        names.some(name => pipeline.name === name)
      )
    }),
    share()
  )

  export const selectedPipeline$ = pipelines$.pipe(
    withLatestFrom(configuration$),
    map(
      ([pipelines, config]) =>
        config.pipeline
          ? pipelines.find(pipeline => pipeline.name === config.pipeline)
          : undefined
    ),
    share()
  )

  type PipelineAndInstance = { pipeline: Pipeline; instance: PipelineInstance }

  export const buildingPipelineInstances$ = pipelines$.pipe(
    switchMap(pipelines =>
      from(pipelines).pipe(
        reduce((acc: PipelineAndInstance[], pipeline: Pipeline) => {
          const instance = pipeline._embedded.instances.find(
            instance => getStatusFromPipelineInstance(instance) === 'Building'
          )
          return instance ? [...acc, { pipeline, instance }] : acc
        }, [])
      )
    )
  )

  export const pipelineFailed$ = buildingPipelineInstances$.pipe(
    pairwise(),
    map(([previousPipelines, currentPipelines]) =>
      previousPipelines.filter(
        previousPipeline =>
          !currentPipelines.some(
            currentPipeline =>
              previousPipeline.pipeline.name === currentPipeline.pipeline.name
          )
      )
    ),
    map(pipelines =>
      pipelines.map(({ instance }) =>
        Api.followLink<PipelineHistory>(instance._links.self.href).pipe(
          catchError(x => of(undefined))
        )
      )
    ),
    switchMap(histories$ => forkJoin(histories$)),
    switchMap(histories =>
      from(histories).pipe(
        filter((history): history is PipelineHistory => !!history),
        filter(history => getStatusFromHistory(history) === 'Failed')
      )
    )
  )

  export function getPipeline$(name: string) {
    return pipelines$.pipe(
      map(pipelines => pipelines.find(pipeline => pipeline.name === name)),
      share()
    )
  }
}
