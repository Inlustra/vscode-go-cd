import { merge, interval, Subject, of } from 'rxjs'
import {
  map,
  switchMap,
  mapTo,
  skipWhile,
  publishReplay,
  tap,
  withLatestFrom,
  exhaustMap,
  share,
  filter
} from 'rxjs/operators'
import { Configuration } from './configuration'
import { GoCdApi } from './gocd-api'
import {
  PipelineHistory,
  PaginatedPipelineHistory
} from './gocd-api/models/pipeline-history.model'
import { GitUtils } from './utils/git-utils'

export namespace State {
  export let paused: boolean = false

  export const forceRefresh$ = new Subject<void>()

  const configuration$ = Configuration.all$.pipe(
    skipWhile(config => !config.url),
    switchMap(config =>
      merge(
        of(null),
        forceRefresh$.pipe(tap(() => console.log('Forced Refresh'))),
        interval(Math.max(config.refreshInterval, 5000)).pipe(
          tap(() => console.log('Regular Refresh'))
        )
      ).pipe(mapTo(config))
    ),
    skipWhile(() => paused),
    tap(() => console.log('out!'))
  )

  export const watchedPipelines$ = configuration$.pipe(
    exhaustMap(({ url, username, password }) =>
      GoCdApi.getDashboardPipelineGroups(url, username, password)
    ),
    withLatestFrom(GitUtils.getGitOrigins().pipe(share())),
    map(([groups, gitUrls]) => {})
  )

  export const dashboardPipelineGroups$ = configuration$.pipe(
    exhaustMap(({ url, username, password }) =>
      GoCdApi.getDashboardPipelineGroups(url, username, password)
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

  export const selectedPipeline$ = pipelines$.pipe(
    withLatestFrom(configuration$),
    filter(([pipelines$, config]) => !!config.pipeline),
    map(([pipelines, config]) =>
      pipelines.find(pipeline => pipeline.name === config.pipeline)
    ),
    share()
  )

  export function getPipeline$(name: string) {
    return pipelines$.pipe(
      map(pipelines => pipelines.find(pipeline => pipeline.name === name)),
      share()
    )
  }
}
