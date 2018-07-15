import { State } from '../state'
import { window } from 'vscode'
import * as vscode from 'vscode'
import { flatMap, first } from 'rxjs/operators'
import * as path from 'path'
import { showErrorAlert } from '../gui/alerts/show-error-alert'
import { OK } from '../gui/alerts/named-actions'
import * as tmp from 'tmp-promise'

interface OpenArtifactCommandArgs {
  pipelineName: string
  pipelineCounter: string
  stageName: string
  stageCounter: string
  jobName: string
  artifact: string
}

export default function OpenArtifact(args: OpenArtifactCommandArgs) {
  const message = window.setStatusBarMessage('Downloading ' + args.artifact)
  tmp
    .file({
      postfix: '.log'
    })
    .then(file => vscode.Uri.parse('file:' + file.path))
    .then(uri => vscode.workspace.openTextDocument(uri))
    .then(
      doc => {
        vscode.window.showTextDocument(doc)
        State.getArtifactFile(
          args.pipelineName,
          args.pipelineCounter,
          args.stageName,
          args.stageCounter,
          args.jobName,
          args.artifact
        )
          .pipe(
            first(),
            flatMap(file => {
              const edit = new vscode.WorkspaceEdit()
              edit.insert(doc.uri, new vscode.Position(0, 0), file.toString())
              return vscode.workspace.applyEdit(edit)
            })
          )
          .subscribe(
            console.log,
            err => showErrorAlert(err, 'Error appending to document', OK),
            () => message.dispose()
          )
      },
      err => showErrorAlert(err, 'Error appending to document', OK)
    )
}
