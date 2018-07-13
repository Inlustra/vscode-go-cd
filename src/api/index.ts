import { PipelineHistory } from './models/pipeline-history.model'
import { Pipeline } from './models/pipeline.model'
import { PipelineGroup } from './models/pipeline-group.model'
import { Observable, from } from 'rxjs'
import { map, flatMap, tap } from 'rxjs/operators'
import * as request from 'request-promise-native'

export namespace GoCdApi {
  function performFetch(
    url: string,
    method?: string,
    body?: any,
    username?: string,
    password?: string
  ) {
    const headers: any = { Accept: 'application/vnd.go.cd.v1+json' }
    console.log()
    console.log(url)
    console.log(method)
    console.log(body)
    console.log(username)
    console.log(password)
    console.log()
    return from(
      request(url, {
        method,
        headers,
        json: true
      })
    )
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
    console.log('Getting Pipelines!')
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

  export function getPipeline(
    name: string,
    host: string,
    username?: string,
    password?: string
  ): Observable<PipelineHistory[]> {
    return performFetch(
      `${host}/api/pipelines/${name}/history`,
      'GET',
      undefined,
      username,
      password
    )
  }
}
