import { Job } from './job.model'
import { Result } from './result.model';

export interface Stage {
  name: string
  approved_by: string
  jobs: Job[]
  can_run: boolean
  result: Result
  approval_type: string
  counter: string
  id: number
  operate_permission: boolean
  rerun_of_counter?: any
  scheduled: boolean
}
