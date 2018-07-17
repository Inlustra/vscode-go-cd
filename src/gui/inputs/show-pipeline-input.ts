import { Configuration } from '../../configuration'
import * as vscode from 'vscode'
import { first, map } from 'rxjs/operators'
import { showErrorAlert } from '../alerts/show-error-alert'
import { RESET_GLOBAL_CONFIG, OK } from '../alerts/named-actions'
import { Api } from '../../api';

export interface ShortPipelineInfo {
  name: string
  label: string
  status: string
  stages: {
    name: string
    status: string
  }[]
}

function loadPipelines() {
  return Api.getPipelines()
    .pipe(
      first(),
      map(pipelines =>
        pipelines.map(pipeline => {
          const shortInfo: ShortPipelineInfo = {
            name: pipeline.name,
            label: 'No Label',
            status: 'No Status',
            stages: []
          }
          const lastInstance = pipeline._embedded.instances.slice(-1).pop()
          if (!!lastInstance) {
            const lastStage = lastInstance._embedded.stages.slice(-1).pop()
            shortInfo.label = lastInstance.label
            shortInfo.stages = lastInstance._embedded.stages
            shortInfo.status = (lastStage && lastStage.status) || 'No Status'
          }
          return shortInfo
        })
      )
    )
    .toPromise()
}

export default function showPipelineInput(global: boolean = true) {
  const src = new vscode.CancellationTokenSource()

  return vscode.window
    .showQuickPick(
      loadPipelines().then(
        pipelines =>
          pipelines.map(pipeline => ({
            label: pipeline.name,
            description: `[${pipeline.status}] - ${pipeline.label}`,
            detail: pipeline.stages.map(stage => stage.name).join(' -> ')
          })),
        err => {
          src.cancel()
          showErrorAlert(
            err,
            'Error attempting to load pipelines',
            RESET_GLOBAL_CONFIG,
            OK
          )
          return []
        }
      ),
      {
        ignoreFocusOut: true,
        canPickMany: false,
        placeHolder: 'Loading pipelines...'
      },
      src.token
    )
    .then(input => {
      if (input) {
        Configuration.setPipeline(input.label, global)
      }
    })
}
