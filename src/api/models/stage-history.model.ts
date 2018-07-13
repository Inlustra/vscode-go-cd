import { Job } from './job.model'

export interface Stage {
  name: string
  approved_by: string
  jobs: Job[]
  can_run: boolean
  result: string
  approval_type: string
  counter: string
  id: number
  operate_permission: boolean
  rerun_of_counter?: any
  scheduled: boolean
}
