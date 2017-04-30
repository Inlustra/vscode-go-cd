import { configuration } from '../configuration';
import { PipelineHistory } from '../gocd-api/models/pipeline-history.model';
import { Pipeline } from '../gocd-api/models/pipeline.model';
import GoCdApi from '../gocd-api';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import * as vscode from 'vscode';

export class GoCdStatusBar {

    refresh$: Subject<void> = new BehaviorSubject<void>(null);
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);

    constructor() {

        const repeat = configuration.all$
            .switchMap((config) => Observable.interval(Math.max(config.refreshInterval, 5000)));

        Observable.combineLatest(configuration.all$, this.refresh$, repeat)
            .filter(([config]) => !!(config.url))
            .flatMap(([config]) => GoCdApi.getPipeline(config.pipeline, config.url, config.username, config.password))
            .filter(pipelines => !!(pipelines && pipelines.length))
            .map(pipelines => pipelines[0])
            .subscribe(pipeline => this.resetStatus(pipeline));
    }

    resetStatus(pipeline: PipelineHistory) {
        console.log(pipeline);
        const lastRunStage = pipeline.stages
            .filter(stage => !!stage.result)
            .pop();
        console.log(pipeline);
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

    refresh() {
        this.refresh$.next();
    }

}

