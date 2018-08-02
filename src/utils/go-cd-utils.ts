import { Icons } from '../gui/icons'
import { Stage } from '../gocd-api/models/stage-history.model'
import { Job } from '../gocd-api/models/job.model'
import { PipelineHistory } from '../gocd-api/models/pipeline-history.model'
import { PipelineInstance } from '../gocd-api/models/pipeline-instance.model'
import { Pipeline } from '../gocd-api/models/pipeline.model'

export type GoCdPipelineStatus =
  | 'Passed'
  | 'Failed'
  | 'Cancelled'
  | 'Building'
  | 'Failing'
  | 'Unknown'
  | 'Scheduled'

export function getIconFromStatus(status: GoCdPipelineStatus) {
  switch (status) {
    case 'Passed':
      return Icons.check
    case 'Building':
      return Icons.sync
    case 'Failing':
      return Icons.issueReopened
    case 'Failed':
      return Icons.issueOpened
    case 'Cancelled':
      return Icons.circleSlash
    case 'Scheduled':
      return Icons.clock
  }
}

export function getStatusFromStage(stage: Stage): GoCdPipelineStatus {
  switch (stage.result) {
    case 'Failed':
    case 'Passed':
    case 'Cancelled':
      return stage.result
    default:
      const x = stage.jobs.map(
        job => (job.result === 'Unknown' ? job.state : job.result)
      )
      if (x.every(state => state === 'Scheduled')) {
        return 'Scheduled'
      } else if (
        x.every(
          state =>
            state === 'Building' || state === 'Passed' || state === 'Scheduled'
        )
      ) {
        return 'Building'
      } else if (x.some(state => state === 'Failed')) {
        return 'Failing'
      }
      return 'Unknown'
  }
}

export function getStatusFromJob(job: Job): GoCdPipelineStatus {
  return job.state === 'Completed' ? job.result : job.state
}

export function getStatusFromPipelineInstance(instance: PipelineInstance) {
  return (instance._embedded.stages
    .map(stage => stage.status)
    .filter(x => !!x)
    .filter(x => x !== 'Unknown')
    .pop() || 'Unknown') as GoCdPipelineStatus
}

export function getStatusFromHistory(history: PipelineHistory) {
  return (history.stages
    .map(getStatusFromStage)
    .filter(x => !!x)
    .filter(x => x !== 'Scheduled')
    .pop() || 'Unknown') as GoCdPipelineStatus
}

export function getLatestPipelineInstance(pipeline: Pipeline) {
  return pipeline._embedded.instances.slice(-1).pop()
}
