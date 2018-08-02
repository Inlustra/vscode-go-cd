import { TreeNode } from './tree-node'
import { Pipeline } from '../../gocd-api/models/pipeline.model'
import { PipelineHistory } from '../../gocd-api/models/pipeline-history.model'
import { Stage } from '../../gocd-api/models/stage-history.model'
import { TreeItem } from 'vscode'
import { Job } from '../../gocd-api/models/job.model'
import { CommandKeys } from '../../constants/command-keys.const'
import {
  GoCdPipelineStatus,
  getStatusFromJob,
  getIconFromStatus
} from '../../utils/go-cd-utils'

export class PipelineJobNode implements TreeNode {
  status: GoCdPipelineStatus

  constructor(
    public pipeline: Pipeline,
    public history: PipelineHistory,
    public stage: Stage,
    public job: Job
  ) {
    this.status = getStatusFromJob(job)
  }

  toTreeItem(): TreeItem {
    const treeItem = new TreeItem(this.job.name)
    treeItem.iconPath = getIconFromStatus(this.status)
    treeItem.command = {
      title: 'Go CD: Open Artifact',
      command: CommandKeys.OPEN_ARTIFACT_COMMAND,
      arguments: [
        {
          pipelineName: this.pipeline.name,
          pipelineCounter: this.history.counter,
          stageName: this.stage.name,
          stageCounter: this.stage.counter,
          jobName: this.job.name,
          jobId: this.job.id
        }
      ]
    }
    return treeItem
  }

  getChildren(): TreeNode[] | Thenable<TreeNode[]> {
    return []
  }
}
