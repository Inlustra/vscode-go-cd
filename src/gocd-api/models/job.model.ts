import { Result } from './result.model'

export type JobState = 'Building' | 'Scheduled' | 'Completed' 
export interface Job {
  name: string
  result: Result
  state: JobState
  id: number
  scheduled_date: any
}
