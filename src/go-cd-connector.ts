import { PipelineStage } from './gocd-api/models/pipeline-stage.model';
import { Pipeline } from './gocd-api/models/pipeline.model';
import { PipelineInstance } from './gocd-api/models/pipeline-instance.model';
import GoCdApi from './gocd-api';
import { ConfigurationKeys } from './constants/configuration-keys.const';
import { ShortPipelineInfo, ShortPipelineStage } from './models/short-pipeline-info';
import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration(ConfigurationKeys.SECTION);

class GoCdConnector {

  static _instance: GoCdConnector;

  static getInstance() {
    GoCdConnector._instance = GoCdConnector._instance || new GoCdConnector();
    return GoCdConnector._instance;
  }

  api?: any;
  url: string;
  username?: string;
  password?: string;

  reinitialise() {
    this.url = config.get<string>(ConfigurationKeys.URL);
    this.username = config.get<string>(ConfigurationKeys.USERNAME);
    this.password = config.get<string>(ConfigurationKeys.PASSWORD);
  }

  getPipelines(): Thenable<ShortPipelineInfo[]> {
    return GoCdApi.getPipelines(this.url, this.username, this.password)
      .map(pipelines =>
        pipelines.map(pipeline => this.pipelineToShortPipelineInfo(pipeline))
      ).toPromise();
  }

  private pipelineToShortPipelineInfo(pipeline: Pipeline): ShortPipelineInfo {
    const shortInfo: ShortPipelineInfo = {
      name: pipeline.name,
      label: 'No Label',
      status: 'No Status',
      stages: []
    }
    const lastInstance = pipeline._embedded.instances.slice(-1).pop();
    if (!!lastInstance) {
      shortInfo.label = lastInstance.label;
      shortInfo.stages = lastInstance._embedded.stages;
      shortInfo.status = shortInfo.stages.slice(-1).pop().status || 'No Status'
    }
    return shortInfo;
  }


}

export const GoCd = GoCdConnector.getInstance();
