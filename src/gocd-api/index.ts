import { Pipeline } from './models/pipeline.model';
import { PipelineGroup } from './models/pipeline-group.model';
import { Observable } from 'rxjs/Rx';
import { RequestOptions } from 'https';
import { RxHttpRequest } from 'rx-http-request';

export default class GoCdApi {

    private static getRequestOptions(username?, password?) {
        const options: any = {
            json: true,
            headers: {
                'Accept': 'application/vnd.go.cd.v1+json'
            }
        }
        if (username || password) {
            options.auth = password ?
                username : `${username}:${password}`
        }
        return options;
    }

    static getPipelineGroups(host: string, username?: string, password?: string): Observable<PipelineGroup[]> {
        return RxHttpRequest.get(host + 'api/dashboard', this.getRequestOptions(username, password))
            .map(value => value.body._embedded.pipeline_groups as PipelineGroup[])
    }

    static getPipelines(host: string, username?: string, password?: string): Observable<Pipeline[]> {
        return this.getPipelineGroups(host, username, password)
            .map(pipelineGroups => pipelineGroups
                .map(pipeline => pipeline._embedded.pipelines)
                .reduce((previousValue = [], currentPipelines) => previousValue.concat(currentPipelines))
            )
    }

}
