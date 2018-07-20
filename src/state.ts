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
  filter,
  catchError,
  distinctUntilChanged
} from 'rxjs/operators'
import { Configuration } from './configuration'
import { GoCdApi } from './gocd-api'
import {
  PipelineHistory,
  PaginatedPipelineHistory
} from './gocd-api/models/pipeline-history.model'
import { GitUtils } from './utils/git-utils'
import { PipelineGroupPipeline } from './gocd-api/models/pipeline-groups.model'

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
    skipWhile(() => paused)
  )

  export const gitUrls$ = GitUtils.getGitOrigins().pipe(
    catchError(err => of(null)),
    share()
  )

  export const openPipelines$ = configuration$.pipe(
    exhaustMap(({ url, username, password }) =>
      GoCdApi.getPipelineGroups(url, username, password)
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
      }
      return []
    }),
    distinctUntilChanged(),
    share()
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
