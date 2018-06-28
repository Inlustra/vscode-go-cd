import { Configuration } from '../configuration';
import { ShortPipelineInfo } from '../models/short-pipeline-info';
import * as vscode from 'vscode';

export default function showPipelineInput(pipelines: ShortPipelineInfo[], global: boolean = true) {
    return vscode.window.showQuickPick(
        pipelines.map(pipeline => ({
            label: pipeline.name,
            description: `[${pipeline.status}] - ${pipeline.label}`,
            detail: pipeline.stages.map(stage => stage.name).join(' -> ')
        })), {
            ignoreFocusOut: true
        }).then(input => {
            if(input) {
                Configuration.setPipeline(input.label, global);
            }
        });
}
