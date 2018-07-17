import { TreeNode } from './tree-node'
import { TreeItem, TreeItemCollapsibleState } from 'vscode'
import { PipelineHistory } from '../../gocd-api/models/pipeline-history.model'
import { Stage } from '../../gocd-api/models/stage-history.model'
import { Pipeline } from '../../gocd-api/models/pipeline.model'
import { PipelineGroup } from '../../gocd-api/models/pipeline-group.model'
import { getIconFromStage } from './utils'
import { PipelineJobNode } from './pipeline-job.node'

export class PipelineStageNode implements TreeNode {
  constructor(
    public pipeline: Pipeline,
    public history: PipelineHistory,
    public stage: Stage
  ) {}

  toTreeItem(): TreeItem {
    const treeItem = new TreeItem(
      this.stage.name,
      this.stage.jobs.length
        ? TreeItemCollapsibleState.Collapsed
        : TreeItemCollapsibleState.None
    )
    treeItem.iconPath = getIconFromStage(this.stage)
    return treeItem
  }

  getChildren(): TreeNode[] | Thenable<TreeNode[]> {
    return this.stage.jobs.map(
      job => new PipelineJobNode(this.pipeline, this.history, this.stage, job)
    )
  }
}
