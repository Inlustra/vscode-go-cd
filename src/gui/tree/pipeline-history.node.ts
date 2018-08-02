import { TreeNode } from './tree-node'
import { TreeItem, TreeItemCollapsibleState } from 'vscode'
import { Pipeline } from '../../gocd-api/models/pipeline.model'
import { PipelineHistory } from '../../gocd-api/models/pipeline-history.model'
import { PipelineStageNode } from './pipeline-stage.node'
import {
  getStatusFromHistory,
  getIconFromStatus,
  GoCdPipelineStatus
} from '../../utils/go-cd-utils'

export class PipelineHistoryNode implements TreeNode {
  status: GoCdPipelineStatus

  constructor(
    public pipeline: Pipeline,
    public history: PipelineHistory,
    public label?: string,
    public displayIcon: boolean = true
  ) {
    this.status = getStatusFromHistory(history)
  }

  toTreeItem(): TreeItem {
    const treeItem = new TreeItem(
      this.label || this.history.label,
      TreeItemCollapsibleState.Collapsed
    )
    treeItem.iconPath = this.displayIcon && getIconFromStatus(this.status)
    return treeItem
  }

  getChildren(): TreeNode[] | Thenable<TreeNode[]> {
    return this.history.stages.map(
      stage => new PipelineStageNode(this.pipeline, this.history, stage)
    )
  }
}
