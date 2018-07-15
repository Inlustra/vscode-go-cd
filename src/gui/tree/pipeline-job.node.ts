import { TreeNode } from './tree-node'
import { PipelineGroup } from '../../api/models/pipeline-group.model'
import { Pipeline } from '../../api/models/pipeline.model'
import { PipelineHistory } from '../../api/models/pipeline-history.model'
import { Stage } from '../../api/models/stage-history.model'
import * as vscode from 'vscode'
import { TreeItem } from 'vscode'
import { Job } from '../../api/models/job.model'
import { getIconFromStage } from './utils'
import { OPEN_ARTIFACT_COMMAND } from '../../commands'

export class PipelineJobNode implements TreeNode {
  constructor(
    public group: PipelineGroup,
    public pipeline: Pipeline,
    public history: PipelineHistory,
    public stage: Stage,
    public job: Job
  ) {}

  toTreeItem(): TreeItem {
    const treeItem = new TreeItem(this.job.name)
    treeItem.iconPath = getIconFromStage(this.job.result)
    treeItem.command = {
      title: 'Go CD: Open Artifact',
      command: OPEN_ARTIFACT_COMMAND,
      arguments: [
        {
          pipelineName: this.pipeline.name,
          pipelineCounter: this.history.counter,
          stageName: this.stage.name,
          stageCounter: this.stage.counter,
          jobName: this.job.name,
          artifact: 'cruise-output/console.log'
        }
      ]
    }
    return treeItem
  }

  getChildren(): TreeNode[] | Thenable<TreeNode[]> {
    return []
  }
}
