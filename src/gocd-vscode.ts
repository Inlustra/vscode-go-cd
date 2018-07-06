import { merge, interval, Subject, from, of, asapScheduler } from 'rxjs';
import {
  map,
  switchMap,
  mapTo,
  skipWhile,
  publishReplay,
  tap,
  withLatestFrom,
  catchError,
  exhaustMap,
  observeOn
} from 'rxjs/operators';
import { Configuration } from './configuration';
import { GoCdApi } from './gocd-api';
import { Pipeline } from './gocd-api/models/pipeline.model';
import { ShortPipelineInfo } from './models/short-pipeline-info';

export namespace GoCdVscode {
  export let paused: boolean = false;

  export const forceRefresh = new Subject<void>();

  const configuration$ = Configuration.all$.pipe(
    skipWhile(config => !config.url),
    switchMap(config =>
      merge(
        forceRefresh.pipe(tap(() => console.log('Forced Refresh'))),
        interval(config.refreshInterval).pipe(
          tap(() => console.log('Regular Refresh'))
        )
      ).pipe(
        mapTo(config)
      )
    ),
    skipWhile(() => paused),
    tap(() => console.log('out!'))
  );

  export const pipelines$ = configuration$.pipe(
    observeOn(asapScheduler),
    exhaustMap(({ url, username, password }) =>
      GoCdApi.getPipelines(url, username, password).pipe(tap(() => console.log('Done')))
    ),
  );

  export const shortPipelineInfo$ = pipelines$.pipe(
    map(pipelines => pipelines.map(pipelineToShortPipelineInfo)),
  );

  export const selectedPipeline$ = pipelines$.pipe(
    withLatestFrom(configuration$),
    map(([pipelines, config]) =>
      pipelines.find(pipeline => pipeline.name === config.pipeline)
    )
  );

  export function getPipeline$(name: string) {
    return pipelines$.pipe(
      map(pipelines => pipelines.find(pipeline => pipeline.name === name)),
      publishReplay(1)
    );
  }

  export function getPipeline(name: string) {
    return Configuration.all$.pipe(
      switchMap(config =>
        GoCdApi.getPipeline(name, config.url, config.username, config.password)
      )
    );
  }

  export function getPipelines() {
    return Configuration.all$.pipe(
      switchMap(config =>
        GoCdApi.getPipelines(config.url, config.username, config.password)
      )
    );
  }

  export function getShortPipelineInfo() {
    return Configuration.all$.pipe(
      switchMap(config =>
        GoCdApi.getPipelines(config.url, config.username, config.password)
      ),
      map(pipelines => pipelines.map(pipelineToShortPipelineInfo))
    );
  }

  function pipelineToShortPipelineInfo(pipeline: Pipeline): ShortPipelineInfo {
    const shortInfo: ShortPipelineInfo = {
      name: pipeline.name,
      label: 'No Label',
      status: 'No Status',
      stages: []
    };
    const lastInstance = pipeline._embedded.instances.slice(-1).pop();
    if (!!lastInstance) {
      const lastStage = lastInstance._embedded.stages.slice(-1).pop();
      shortInfo.label = lastInstance.label;
      shortInfo.stages = lastInstance._embedded.stages;
      shortInfo.status = (lastStage && lastStage.status) || 'No Status';
    }
    return shortInfo;
  }
}
