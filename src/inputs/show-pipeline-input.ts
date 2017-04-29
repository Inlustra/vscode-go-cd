import { ShortPipelineInfo } from '../models/short-pipeline-info';
import { Pipeline } from '../gocd-api/models/pipeline.model';
import { ConfigurationKeys } from '../constants/configuration-keys.const';
import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration(ConfigurationKeys.SECTION);

export default function showPipelineInput(pipelines: ShortPipelineInfo[], global: boolean = true) {
    return vscode.window.showQuickPick(
        pipelines.map(pipeline => ({
            label: pipeline.name,
            description: `[${pipeline.status}] - ${pipeline.label}`,
            detail: pipeline.stages.map(stage => stage.name).join(' -> ')
        })), {
            ignoreFocusOut: true
        });
}
