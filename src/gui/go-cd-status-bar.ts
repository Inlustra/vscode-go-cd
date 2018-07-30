import * as vscode from 'vscode';
import { PipelineInstance } from '../gocd-api/models/pipeline-instance.model';
import { Pipeline } from '../gocd-api/models/pipeline.model';
import { State } from '../state';

export class GoCdStatusBar {
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    0
  )

  constructor() {}

  init() {
    State.selectedPipeline$.subscribe(pipeline => this.resetStatus(pipeline))
  }

  getIconStringFromPipeline(instance: PipelineInstance) {
    return (
      instance._embedded.stages
        .map(stage => stage.status)
        .map((status, idx, arr) => {
          switch (status) {
            case 'Failed':
              return '$(issue-opened)'
            case 'Passed':
              return '$(check)'
            case 'Building':
              return '$(sync)'
            case 'Cancelled':
              return '$(circle-slash)'
          }
        })
        .filter(x => !!x)
        .pop() || ''
    )
  }

  resetStatus(pipeline?: Pipeline) {
    if (pipeline) {
      const lastInstance = pipeline._embedded.instances.pop()
      this.statusBar.text = lastInstance
        ? this.getIconStringFromPipeline(lastInstance)
        : ''
      if (pipeline.pause_info.paused) {
        this.statusBar.text = `$(clock) ${pipeline.name} - Paused`
      } else {
        this.statusBar.text += ` ${pipeline.name} ${lastInstance &&
          lastInstance.label}`
      }
      this.statusBar.show()
    } else {
      this.statusBar.hide()
    }
  }

  refresh() {
    State.forceRefresh$.next()
  }
}
