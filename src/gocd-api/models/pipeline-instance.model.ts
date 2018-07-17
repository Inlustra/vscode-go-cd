import { PipelineStage } from './pipeline-stage.model'
import { Link } from './link.model'

export interface PipelineInstance {
  label: string
  schedule_at: string
  triggered_by: string
  _embedded: {
    stages: PipelineStage[]
  }
  _links: {
    self: Link
    doc: Link
    history_url: Link
    vsm_url: Link
    compare_url: Link
    build_cause_url: Link
  }
}
