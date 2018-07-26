import { merge, interval, Subject, of, empty } from 'rxjs'
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
  catchError,
  takeUntil
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

  export const stop$: Subject<void> = new Subject();

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
        console.error('No Git urls...')
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

  export function getPipeline$(name: string) {
    return pipelines$.pipe(
      map(pipelines => pipelines.find(pipeline => pipeline.name === name)),
      share()
    )
  }
}
