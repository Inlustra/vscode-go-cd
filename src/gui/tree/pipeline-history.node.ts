import { TreeNode } from './tree-node'
import { TreeItem, TreeItemCollapsibleState } from 'vscode'
import { Pipeline } from '../../api/models/pipeline.model'
import { PipelineHistory } from '../../api/models/pipeline-history.model'
import { PipelineGroup } from '../../api/models/pipeline-group.model'
import { getIconFromStages } from './utils'
import { PipelineStageNode } from './pipeline-stage.node'

export class PipelineHistoryNode implements TreeNode {
  constructor(
    public group: PipelineGroup,
    public pipeline: Pipeline,
    public history: PipelineHistory,
    public label?: string,
    public displayIcon: boolean = true
  ) {}

  toTreeItem(): TreeItem {
    const treeItem = new TreeItem(
      this.label || this.history.label,
      TreeItemCollapsibleState.Collapsed
    )
    treeItem.iconPath = this.displayIcon && getIconFromStages(
      this.history.stages.map(stage => stage.result)
    )
    return treeItem
  }

  getChildren(): TreeNode[] | Thenable<TreeNode[]> {
    return this.history.stages.map(
      stage =>
        new PipelineStageNode(this.group, this.pipeline, this.history, stage)
    )
  }
}
