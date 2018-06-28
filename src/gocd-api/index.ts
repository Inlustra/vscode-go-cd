import { PipelineHistory } from './models/pipeline-history.model';
import { Pipeline } from './models/pipeline.model';
import { PipelineGroup } from './models/pipeline-group.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

export namespace GoCdApi {


    export function getPipelineGroups(host: string, username?: string, password?: string): Observable<PipelineGroup[]> {
        return ajax({
            url: `${host}api/dashboard`,
            method: 'GET',
            async: true,
            user: username,
            password: password,
            crossDomain: false,
            headers: {
                'Accept': 'application/vnd.go.cd.v1+json'
            }
        }).pipe(
            map(value => value.response as any), // TODO look at the models and make sure they're correct
            map(pipeline => pipeline._embedded.pipeline_groups as PipelineGroup[])
        );
    }

    export function getPipelines(host: string, username?: string, password?: string): Observable<Pipeline[]> {
        return getPipelineGroups(host, username, password)
            .pipe(
                map(pipelineGroups => pipelineGroups && pipelineGroups
                    .map(pipeline => pipeline._embedded.pipelines)
                    .reduce((previousValue = [], currentPipelines) => previousValue.concat(currentPipelines))
                ));
    }

    export function getPipeline(name: string, host: string, username?: string, password?: string): Observable<PipelineHistory[]> {
        return ajax({
            url: `${host}api/pipelines/${name}/history`,
            method: 'GET',
            async: true,
            user: username,
            password: password,
            headers: {
                'Accept': 'application/vnd.go.cd.v1+json'
            }
        }).pipe(
            map(value => value.response)
        );
    }

}
