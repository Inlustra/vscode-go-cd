import { State } from '../state'
import { MaterialRevision } from '../gocd-api/models/material-revision.model'
import { window } from 'vscode'
import { Logger } from '../logger'

export class GoCdJobWatcher {
  constructor() {}

  init() {
    State.pipelineFailed$.subscribe(pipeline => {
      Logger.warn('Pipeline Failed: ' + pipeline.name)
      window.showErrorMessage('Pipeline Failed: ' + pipeline.name)
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
}
