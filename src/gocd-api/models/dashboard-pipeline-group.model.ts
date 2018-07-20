import { Pipeline } from './pipeline.model'
export interface DashboardPipelineGroup {
  name: string
  _embedded: {
    pipelines: Pipeline[]
  }
}
