import { Configuration } from '../configuration';
import * as vscode from 'vscode';
import { GoCdVscode } from '../gocd-vscode';
import { first } from 'rxjs/operators';
import { Messaging } from '../gui/messaging';

function loadPipelines() {
  return GoCdVscode.getShortPipelineInfo()
    .pipe(first())
    .toPromise();
}

export default function showPipelineInput(global: boolean = true) {
  const src = new vscode.CancellationTokenSource();

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
          src.cancel();
          Messaging.showErrorWithButtons(
            err,
            'Error attempting to load pipelines',
            Messaging.RESET_GLOBAL_CONFIG,
            Messaging.OK
          );
          return [];
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
        console.log('Set it ');
        Configuration.setPipeline(input.label, global);
      }
    });
}
