import {
  PipelineHistory,
  PaginatedPipelineHistory
} from './models/pipeline-history.model'
import { Pipeline } from './models/pipeline.model'
import { DashboardPipelineGroup } from './models/dashboard-pipeline-group.model'
import { Observable, from, asapScheduler } from 'rxjs'
import { map, observeOn } from 'rxjs/operators'
import * as requestPromise from 'request-promise-native'
import { JobStatus } from './models/job-status.model'
import { PipelineGroup } from './models/pipeline-groups.model'

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
        json
      })
    ).pipe(observeOn(asapScheduler))
  }

  export function getHealth(host: string): Observable<{ health: string }> {
    return performFetch(`${host}/api/v1/health`)
  }

  export function getDashboardPipelineGroups(
    host: string,
    username?: string,
    password?: string
  ): Observable<DashboardPipelineGroup[]> {
    return performFetch(
      `${host}/api/dashboard`,
      'GET',
      undefined,
      username,
      password
    ).pipe(
      map(
        pipeline =>
          pipeline._embedded.pipeline_groups as DashboardPipelineGroup[]
      )
    )
  }

  export function getPipelineGroups(
    host: string,
    username?: string,
    password?: string
  ): Observable<PipelineGroup[]> {
    return performFetch(
      `${host}/api/config/pipeline_groups`,
      'GET',
      undefined,
      username,
      password,
      false
    )
  }

  export function getPipelines(
    host: string,
    username?: string,
    password?: string
  ): Observable<Pipeline[]> {
    return getDashboardPipelineGroups(host, username, password).pipe(
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
    startLineNumber: number | undefined,
    host: string,
    username?: string,
    password?: string
  ) {
    let url = `${host}/files/${pipelineName}/${pipelineCounter}/${stageName}/${stageCounter}/${jobName}/${artifact}`
    if (startLineNumber !== undefined) {
      url = `${url}?startLineNumber=${startLineNumber}`
    }
    return performFetch(url, 'GET', undefined, username, password, true, false)
  }

  export function getJobStatus(
    pipelineName: string,
    stageName: string,
    jobId: string,
    host: string,
    username?: string,
    password?: string
  ): Observable<JobStatus[]> {
    // http://cd.tooling.amazebills.com/go/jobStatus.json?pipelineName=lumo-app&stageName=build-libs&jobId=29181
    return performFetch(
      `${host}/jobStatus.json?pipelineName=${pipelineName}&stageName=${stageName}&jobId=${jobId}`,
      'GET',
      undefined,
      username,
      password,
      true,
      true
    )
  }
}
