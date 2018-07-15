import { TreeNode } from './tree-node'
import { PipelineGroup } from '../../api/models/pipeline-group.model'
import { Pipeline } from '../../api/models/pipeline.model'
import { PipelineHistory } from '../../api/models/pipeline-history.model'
import { Stage } from '../../api/models/stage-history.model'
import { TreeItem } from 'vscode'
import { Job } from '../../api/models/job.model'
import { getIconFromStage } from './utils'

export class PipelineJobNode implements TreeNode {
  constructor(
    public group: PipelineGroup,
    public pipeline: Pipeline,
    public history: PipelineHistory | null,
    public stage: Stage,
    public job: Job
  ) {}

  toTreeItem(): TreeItem {
    const treeItem = new TreeItem(this.job.name)
    treeItem.iconPath = getIconFromStage(this.job.result)
    return treeItem
  }

  getChildren(): TreeNode[] | Thenable<TreeNode[]> {
    return []
  }
}
