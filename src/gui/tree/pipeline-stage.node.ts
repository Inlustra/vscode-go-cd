import { TreeNode } from './tree-node'
import { TreeItem, TreeItemCollapsibleState } from 'vscode'
import { PipelineHistory } from '../../gocd-api/models/pipeline-history.model'
import { Stage } from '../../gocd-api/models/stage-history.model'
import { Pipeline } from '../../gocd-api/models/pipeline.model'
import { PipelineJobNode } from './pipeline-job.node'
import { getStatusFromStage, GoCdPipelineStatus, getIconFromStatus } from '../../utils/go-cd-utils'

export class PipelineStageNode implements TreeNode {
  status: GoCdPipelineStatus

  constructor(
    public pipeline: Pipeline,
    public history: PipelineHistory,
    public stage: Stage
  ) {
    this.status = getStatusFromStage(stage)
  }

  toTreeItem(): TreeItem {
    const treeItem = new TreeItem(
      this.stage.name,
      this.stage.jobs.length
        ? TreeItemCollapsibleState.Collapsed
        : TreeItemCollapsibleState.None
    )
    treeItem.iconPath = getIconFromStatus(this.status)
    return treeItem
  }

  getChildren(): TreeNode[] | Thenable<TreeNode[]> {
    return this.stage.jobs.map(
      job => new PipelineJobNode(this.pipeline, this.history, this.stage, job)
    )
  }
}
