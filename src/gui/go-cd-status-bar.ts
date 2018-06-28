import { PipelineHistory } from '../gocd-api/models/pipeline-history.model';
import * as vscode from 'vscode';
import { GoCdVscode } from '../gocd-vscode';
import { map, filter } from 'rxjs/operators';

export class GoCdStatusBar {

    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);

    constructor() {
        GoCdVscode.selectedPipeline$.pipe(
            filter(pipeline => !!pipeline),
            map(pipeline => pipeline && pipeline)
        ).subscribe((pipeline) => this.resetStatus(pipeline))
    }

    resetStatus(pipeline: any) {
        console.log(pipeline)
        const lastRunStage = pipeline && pipeline.stages
        .filter((stage: any) => !!stage.result)
        .pop();
        if (pipeline && lastRunStage) {
            switch (lastRunStage.result) {
                case 'Passed':
                    this.statusBar.text = '$(checklist) ';
                    break;
                case 'Unknown':
                    this.statusBar.text = '$(sync) ';
                    break;
                case 'Failed':
                    this.statusBar.text = '$(alert) ';
                    break;
                default: this.statusBar.text = '';
            }
            this.statusBar.tooltip = pipeline.build_cause.trigger_message;
            this.statusBar.text += `${pipeline.name} - ${pipeline.label}`;
            this.statusBar.show();
        }
    }

    refresh() {
        GoCdVscode.forceRefresh.next();
    }

}

