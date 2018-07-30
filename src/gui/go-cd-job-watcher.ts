import { of } from 'rxjs'
import { State } from '../state'
import { map, catchError } from 'rxjs/operators'
import { PipelineInstance } from '../gocd-api/models/pipeline-instance.model'
import { Pipeline } from '../gocd-api/models/pipeline.model'
import { EventEmitter } from 'vscode'
import { showErrorAlert } from './alerts/show-error-alert'
import { OK } from './alerts/named-actions'
import { Api } from '../api'
import { MaterialRevision } from '../gocd-api/models/material-revision.model'
import { Logger } from '../logger'
import { window } from 'vscode'

export class GoCdJobWatcher {
  _onPipelineFailure = new EventEmitter<{
    pipeline: Pipeline
    instance: PipelineInstance
  }>()
  readonly onPipelineFailure = this._onPipelineFailure.event

  runner$ = State.failedPipelines$

  constructor() {}

  init() {
    State.buildingPipelines$.subscribe(diff => {
      window.showInformationMessage(
        'Building: ' + diff.map(m => m.name).join(',')
      )
    })
    this.runner$.subscribe(diff => {
      window.showInformationMessage(
        'Diff: ' + diff.map(m => m.name).join(',')
      )
    })
  }

  buildDescriptionFromMaterialRevisions(materialRevs: MaterialRevision[]) {
    materialRevs
      .filter(rev => rev.material.type.toLowerCase() === 'git')
      .map(material => {
        const materialDescription = material.material.description.match(
          /git@(.+?\.git)/
        )
        return (
          (materialDescription
            ? materialDescription[0]
            : material.material.description) +
          '\n' +
          material.modifications.map(mod => mod.comment).join('\n')
        )
      })
      .join('\n')
  }

  handlePipelineStatusChange(pipeline: Pipeline, instance?: PipelineInstance) {
    if (instance) {
      const stages = instance._embedded.stages.map(stage => stage.status)
      const didFail = stages.some(stage => stage === 'Failed')
      if (didFail) {
        this._onPipelineFailure.fire({ pipeline, instance })
        Api.getPipelineHistory(pipeline.name)
          .pipe(
            map(paginated => paginated.pipelines),
            map(history =>
              history.find(history => history.label === instance.label)
            ),
            catchError(() => of(undefined))
          )
          .subscribe(history => {
            if (!history) {
              showErrorAlert(null, `Pipeline Failed: ${pipeline.name}`, OK)
            } else {
              showErrorAlert(
                null,
                `Pipeline Failed: ${
                  pipeline.name
                } \n ${this.buildDescriptionFromMaterialRevisions(
                  history.build_cause.material_revisions
                )}`,
                OK
              )
            }
          })
      }
    } else {
      Logger.error('[GoCdJobWatcher] Lost instance for pipeline')
    }
  }
}
