import { PipelineHistory } from '../gocd-api/models/pipeline-history.model';
import * as vscode from 'vscode';
import { GoCdVscode } from '../gocd-vscode';
import { map, filter, last } from 'rxjs/operators';
import { Pipeline } from '../gocd-api/models/pipeline.model';

export class GoCdStatusBar {
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    0
  );

  constructor() {
    GoCdVscode.selectedPipeline$
      .pipe(
        filter(pipeline => !!pipeline),
        map(pipeline => pipeline && pipeline)
      )
      .subscribe(
        pipeline => this.resetStatus(pipeline),
        err => console.error(err)
      );
  }

  resetStatus(pipeline?: Pipeline) {
    console.log('Setting status!');
    console.log(pipeline);
    const lastInstance =
      pipeline && pipeline._embedded.instances.slice(-1).pop();
    const lastRunStage =
      lastInstance &&
      lastInstance._embedded.stages.filter(stage => !!stage.status).pop();
    if (pipeline && lastRunStage) {
      switch (lastRunStage.status) {
        case 'Passed':
          this.statusBar.text = '$(check) ';
          break;
        case 'Unknown':
          this.statusBar.text = '$(sync) ';
          break;
        case 'Failed':
          this.statusBar.text = '$(alert) ';
          break;
        default:
          this.statusBar.text = '';
      }
      if (pipeline.pause_info.paused) {
        this.statusBar.text = '$(watch)';
        this.statusBar.text += pipeline.name + 'paused';
      } else {
        this.statusBar.text += pipeline.name + (lastInstance && ' - ' + lastInstance.label);
      }
      this.statusBar.show();
    }
  }

  refresh() {
    GoCdVscode.forceRefresh.next();
  }
}
