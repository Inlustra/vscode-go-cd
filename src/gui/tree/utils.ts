import { Icons } from '../icons'
import { Stage } from '../../api/models/stage-history.model'
import { Result } from '../../api/models/result.model'
import { Job, JobState } from '../../api/models/job.model'
import { PipelineHistory } from '../../api/models/pipeline-history.model'
import { PipelineInstance } from '../../api/models/pipeline-instance.model'

export function getIconFromResult(result: Result) {
  switch (result) {
    case 'Failed':
      return Icons.issueOpened
    case 'Passed':
      return Icons.check
    case 'Cancelled':
      return Icons.circleSlash
    case 'Unknown':
    default:
      return undefined
  }
}

export function getIconFromJobState(state: JobState) {
  switch (state) {
    case 'Building':
      return Icons.sync
    case 'Scheduled':
      return Icons.clock
  }
}

export function getIconFromJob(job: Job) {
  return getIconFromResult(job.result) || getIconFromJobState(job.state);
}

export function getIconFromStage(stage: Stage) {
  switch (stage.result) {
    case 'Failed':
      return Icons.issueOpened
    case 'Passed':
      return stage.jobs.every(job => job.result === 'Passed')
        ? Icons.verified
        : Icons.check
    case 'Cancelled':
      return Icons.circleSlash
    case 'Unknown':
      const x = stage.jobs.map(
        job => (job.result === 'Unknown' ? job.state : job.result)
      )
      if (x.every(state => state === 'Building' || state === 'Scheduled')) {
        return Icons.sync
      } else if (x.indexOf('Failed') >= -1) {
        return Icons.issueReopened
      }
  }
}

export function getIconFromPipelineInstance(instance: PipelineInstance) {
  return instance._embedded.stages
    .map(stage => stage.status)
    .map((status, idx, arr) => {
      switch (status) {
        case 'Failed':
          return Icons.issueOpened
        case 'Passed':
          return arr.every(status => status === 'Passed')
            ? Icons.verified
            : Icons.check
        case 'Cancelled':
          return Icons.circleSlash
      }
    })
    .pop()
}

export function getIconFromHistory(history: PipelineHistory) {
  return history.stages.map(getIconFromStage).pop()
}
