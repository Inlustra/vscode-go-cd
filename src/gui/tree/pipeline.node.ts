import { TreeNode } from './tree-node'
import { PipelineGroup } from '../../api/models/pipeline-group.model'
import { Pipeline } from '../../api/models/pipeline.model'
import { TreeItem, TreeItemCollapsibleState } from 'vscode'
import { Icons } from '../icons'
import { getIconFromStages } from './utils'
import { State } from '../../state'
import { first } from 'rxjs/operators'
import { showErrorAlert } from '../alerts/show-error-alert'
import { PipelineHistoryNode } from './pipeline-history.node'
import { REFRESH_PIPELINES, OK } from '../alerts/named-actions'
import { PaginatedPipelineHistory } from '../../api/models/pipeline-history.model'

export class PipelineNode implements TreeNode {
  constructor(public pipeline: Pipeline) {}

  getLatestInstance() {
    return this.pipeline._embedded.instances.slice(-1).pop()
  }

  toTreeItem(): TreeItem {
    const treeItem = new TreeItem(
      this.pipeline.name,
      TreeItemCollapsibleState.Collapsed
    )
    const instance = this.getLatestInstance()
    if (instance) {
      const stages = instance._embedded.stages.map(stage => stage.status)
      treeItem.iconPath = getIconFromStages(stages)
      treeItem.label += ` - ${instance && instance.label}`
    }
    if (this.pipeline.locked) {
      treeItem.iconPath = Icons.lock
    }
    return treeItem
  }

  getChildren(): TreeNode[] | Thenable<TreeNode[]> {
    return this.getPipelineHistory()
      .then(
        x => x,
        err => {
          showErrorAlert(
            err,
            `Error loading pipeline history for: ${name}`,
            REFRESH_PIPELINES,
            OK
          )
          return undefined
        }
      )
      .then(paginated => {
        if (!paginated) {
          return []
        }
        const latestItem = paginated.pipelines.shift()
        return [
          ...(latestItem
            ? [
                new PipelineHistoryNode(
                  this.pipeline,
                  latestItem,
                  'Stages',
                  false
                )
              ]
            : []),
          new PipelineHistoryListNode(this.pipeline, paginated)
        ]
      })
  }

  getPipelineHistory(): Promise<PaginatedPipelineHistory> {
    return State.getPipelineHistory(this.pipeline.name)
      .pipe(first())
      .toPromise()
  }
}

class PipelineHistoryListNode implements TreeNode {
  constructor(
    private pipeline: Pipeline,
    private paginated: PaginatedPipelineHistory
  ) {}
  toTreeItem(): TreeItem {
    return new TreeItem('History', TreeItemCollapsibleState.Collapsed)
  }
  getChildren(): TreeNode[] | Thenable<TreeNode[]> {
    return this.paginated.pipelines.map(
      history => new PipelineHistoryNode(this.pipeline, history)
    )
  }
}
