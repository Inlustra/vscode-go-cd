import { Link } from './link.model'
import { PipelineInstance } from './pipeline-instance.model'
export interface Pipeline {
  name: string
  locked: boolean
  pause_info: {
    paused: boolean
    paused_by?: string
    pause_reason?: string
  }
  _embedded: {
    instances: PipelineInstance[]
  }
  _links: {
    self: Link
    doc: Link
    settings_path: Link
    trigger: Link
    trigger_with_options: Link
    pause: Link
    unpause: Link
  }
}
