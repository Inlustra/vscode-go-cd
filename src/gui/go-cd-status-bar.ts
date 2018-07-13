import { PipelineHistory } from '../api/models/pipeline-history.model'
import * as vscode from 'vscode'
import { State } from '../state'
import { map, filter } from 'rxjs/operators'
import { Pipeline } from '../api/models/pipeline.model'
import { PipelineGroup } from '../api/models/pipeline-group.model';

export class GoCdStatusBar {
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    0
  )

  constructor() {}

  init() {
    State.selectedPipeline$
      .pipe(
        filter(pipeline => !!pipeline),
        map(pipeline => pipeline && pipeline)
      )
      .subscribe(
        pipeline => this.resetStatus(pipeline),
        err => console.error(err)
      )
  }

  resetStatus(pipeline?: Pipeline) {
    const lastInstance =
      pipeline && pipeline._embedded.instances.slice(-1).pop()
    const lastRunStage =
      lastInstance &&
      lastInstance._embedded.stages.filter(stage => !!stage.status).pop()
    if (pipeline && lastRunStage) {
      switch (lastRunStage.status) {
        case 'Passed':
          this.statusBar.text = '$(check) '
          break
        case 'Unknown':
          this.statusBar.text = '$(sync) '
          break
        case 'Failed':
          this.statusBar.text = '$(alert) '
          break
        default:
          this.statusBar.text = ''
      }
      if (pipeline.pause_info.paused) {
        this.statusBar.text = '$(watch)'
        this.statusBar.text += pipeline.name + 'paused'
      } else {
        this.statusBar.text +=
          pipeline.name + (lastInstance && ' - ' + lastInstance.label)
      }
      this.statusBar.show()
    }
  }

  refresh() {
    State.forceRefresh.next()
  }
}
