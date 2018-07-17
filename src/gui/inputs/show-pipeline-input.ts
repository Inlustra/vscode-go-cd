import { Configuration } from '../../configuration'
import * as vscode from 'vscode'
import { State } from '../../state'
import { first } from 'rxjs/operators'
import { showErrorAlert } from '../alerts/show-error-alert'
import { RESET_GLOBAL_CONFIG, OK } from '../alerts/named-actions'

function loadPipelines() {
  return State.getShortPipelineInfo()
    .pipe(first())
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
