export interface ShortPipelineInfo {
  name: string
  label: string
  status: string
  stages: ShortPipelineStage[]
}

export interface ShortPipelineStage {
  name: string
  status: string
}
