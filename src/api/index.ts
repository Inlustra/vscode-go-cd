import {
  PipelineHistory,
  PaginatedPipelineHistory
} from './models/pipeline-history.model'
import { Pipeline } from './models/pipeline.model'
import { PipelineGroup } from './models/pipeline-group.model'
import { Observable, from, asapScheduler } from 'rxjs'
import { map, flatMap, tap, observeOn } from 'rxjs/operators'
import * as request from 'request'
import * as requestPromise from 'request-promise-native'
import { Stage } from './models/stage-history.model'

export namespace GoCdApi {
  function performFetch(
    url: string,
    method?: string,
    body?: any,
    username?: string,
    password?: string,
    includeHeaders: boolean = true,
    json: boolean = true
  ) {
    const headers: any = includeHeaders
      ? { Accept: 'application/vnd.go.cd.v1+json' }
      : {}
    console.log()
    console.log(url)
    console.log(method)
    console.log(body)
    console.log(username)
    console.log(password)
    console.log()
    return from(
      requestPromise(url, {
        method,
        headers,
        json,
      })
    ).pipe(observeOn(asapScheduler))
  }

  export function getPipelineGroups(
    host: string,
    username?: string,
    password?: string
  ): Observable<PipelineGroup[]> {
    return performFetch(
      `${host}/api/dashboard`,
      'GET',
      undefined,
      username,
      password
    ).pipe(
      map(pipeline => pipeline._embedded.pipeline_groups as PipelineGroup[])
    )
  }

  export function getPipelines(
    host: string,
    username?: string,
    password?: string
  ): Observable<Pipeline[]> {
    return getPipelineGroups(host, username, password).pipe(
      map(
        pipelineGroups =>
          pipelineGroups &&
          pipelineGroups
            .map(pipeline => pipeline._embedded.pipelines)
            .reduce((previousValue = [], currentPipelines) =>
              previousValue.concat(currentPipelines)
            )
      )
    )
  }

  export function getPipelineHistory(
    name: string,
    host: string,
    username?: string,
    password?: string
  ): Observable<PaginatedPipelineHistory> {
    return performFetch(
      `${host}/api/pipelines/${name}/history`,
      'GET',
      undefined,
      username,
      password,
      false
    )
  }

  export function getPipelineInstance(
    pipelineName: string,
    pipelineCounter: string,
    host: string,
    username?: string,
    password?: string
  ): Observable<PipelineHistory> {
    return performFetch(
      `${host}/api/pipelines/${pipelineName}/instance/${pipelineCounter}`,
      'GET',
      undefined,
      username,
      password
    )
  }

  export function getArtifactFile(
    pipelineName: string,
    pipelineCounter: string,
    stageName: string,
    stageCounter: string,
    jobName: string,
    artifact: string,
    host: string,
    username?: string,
    password?: string
  ) {
    return performFetch(
      `${host}/files/${pipelineName}/${pipelineCounter}/${stageName}/${stageCounter}/${jobName}/${artifact}`,
      'GET',
      undefined,
      username,
      password,
      true,
      false
    )
  }

}
