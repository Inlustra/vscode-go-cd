import { TreeNode } from './tree-node'
import { PipelineGroup } from '../../api/models/pipeline-group.model'
import { Pipeline } from '../../api/models/pipeline.model'
import { TreeItem, TreeItemCollapsibleState } from 'vscode'
import { Icons } from '../icons'
import { getIconFromStages, getIconFromStage } from './utils'
import { State } from '../../state'
import { first, map, catchError } from 'rxjs/operators'
import { showErrorAlert } from '../alerts/show-error-alert'
import { PipelineHistoryNode } from './pipeline-history.node'
import { REFRESH_PIPELINES, OK } from '../alerts/named-actions'
import { PipelineStage } from '../../api/models/pipeline-stage.model'

export class PipelineNode implements TreeNode {
  constructor(public group: PipelineGroup, public pipeline: Pipeline) {}

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
    const instance = this.getLatestInstance()
    const historyNode = new PipelineHistoryTextNode(this.group, this.pipeline)
    if (instance) {
      return [new PipelineStageTextNode(instance._embedded.stages), historyNode]
    }
    return [historyNode]
  }
}

class PipelineStageTextNode implements TreeNode {
  constructor(private stages: PipelineStage[]) {}

  toTreeItem(): TreeItem {
    // TODO: Make this auto expand when #30918 is fixed
    return new TreeItem('Stages', TreeItemCollapsibleState.Collapsed)
  }

  getChildren(): TreeNode[] | Thenable<TreeNode[]> {
    return this.stages.map(stage => ({
      toTreeItem: () => {
        const treeItem = new TreeItem(stage.name)
        treeItem.iconPath = getIconFromStage(stage.status)
        return treeItem
      },
      getChildren: () => []
    }))
  }
}

class PipelineHistoryTextNode implements TreeNode {
  constructor(private group: PipelineGroup, private pipeline: Pipeline) {}
  toTreeItem(): TreeItem {
    return new TreeItem('History', TreeItemCollapsibleState.Collapsed)
  }
  getChildren(): TreeNode[] | Thenable<TreeNode[]> {
    const name = this.pipeline.name
    return State.getPipelineHistory(name)
      .pipe(
        first(),
        map(paginated =>
          paginated.pipelines.map(
            history =>
              new PipelineHistoryNode(this.group, this.pipeline, history)
          )
        ),
        catchError(e => {
          showErrorAlert(
            e,
            `Error loading pipeline history for: ${name}`,
            REFRESH_PIPELINES,
            OK
          )
          return []
        })
      )
      .toPromise()
  }
}
