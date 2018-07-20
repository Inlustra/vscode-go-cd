import { Configuration } from './configuration'
import { switchMap, exhaustMap, flatMap } from 'rxjs/operators'
import { GoCdApi } from './gocd-api'

export namespace Api {

  export function getPipelineGroups() {
    return Configuration.all$.pipe(
      switchMap(config =>
        GoCdApi.getPipelineGroups(
          config.url,
          config.username,
          config.password
        )
      )
    )
  }

  export function getPipelineHistory(name: string) {
    return Configuration.all$.pipe(
      switchMap(config =>
        GoCdApi.getPipelineHistory(
          name,
          config.url,
          config.username,
          config.password
        )
      )
    )
  }

  export function getPipelines() {
    return Configuration.all$.pipe(
      switchMap(config =>
        GoCdApi.getPipelines(config.url, config.username, config.password)
      )
    )
  }

  export function getPipelineInstance(
    pipelineName: string,
    pipelineCounter: string
  ) {
    return Configuration.all$.pipe(
      switchMap(config =>
        GoCdApi.getPipelineInstance(
          pipelineName,
          pipelineCounter,
          config.url,
          config.username,
          config.password
        )
      )
    )
  }

  export function getArtifactFile(
    pipelineName: string,
    pipelineCounter: string,
    stageName: string,
    stageCounter: string,
    jobName: string,
    artifact: string,
    startLineNumber?: number
  ) {
    return Configuration.all$.pipe(
      exhaustMap(config => {
        return GoCdApi.getArtifactFile(
          pipelineName,
          pipelineCounter,
          stageName,
          stageCounter,
          jobName,
          artifact,
          startLineNumber,
          config.url,
          config.username,
          config.password
        )
      })
    )
  }

  export function getJobStatus(
    pipelineName: string,
    stageName: string,
    jobId: string
  ) {
    return Configuration.all$.pipe(
      flatMap(config => {
        return GoCdApi.getJobStatus(
          pipelineName,
          stageName,
          jobId,
          config.url,
          config.username,
          config.password
        )
      })
    )
  }
}
