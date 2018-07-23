import { flatMap, first } from 'rxjs/operators'
import { State } from '../state'
import { of } from 'rxjs'
import { window } from 'vscode'
import { Configuration } from '../configuration'
import { showErrorAlert } from '../gui/alerts/show-error-alert'
import { OK } from '../gui/alerts/named-actions'
import showPipelineInput from '../gui/inputs/show-pipeline-input'

export function GuessSelectedPipeline(silent: boolean = true) {
  console.log('Running guess!!')
  State.openPipelines$
    .pipe(
      first(),
      flatMap(pipelines => {
        console.log('GOT')
        console.log(pipelines)
        if (pipelines.length === 0) {
          return of(undefined)
        } else if (pipelines.length === 1) {
          return of(pipelines[0].name)
        }
        return window.showQuickPick(pipelines.map(pipeline => pipeline.name), {
          canPickMany: false,
          ignoreFocusOut: true,
          placeHolder: 'Select pipeline'
        })
      })
    )
    .subscribe(pipeline => {
      if (pipeline) {
        Configuration.setPipeline(pipeline, false)
      } else if (!silent) {
        showErrorAlert(
          null,
          'Could not automatically determine a pipeline. ',
          OK,
          {
            title: 'Choose from all pipelines',
            onClick: () => showPipelineInput(false)
          }
        )
      }
    })
}
