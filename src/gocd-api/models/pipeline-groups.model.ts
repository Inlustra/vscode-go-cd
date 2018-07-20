export interface PipelineGroupMaterial {
  fingerprint: string
  type: string
  description: string
}

export interface PipelineGroupStage {
  name: string
}

export interface PipelineGroupPipeline {
  label: string
  materials: PipelineGroupMaterial[]
  stages: PipelineGroupStage[]
  name: string
}

export interface PipelineGroup {
  name: string
  pipelines: PipelineGroupPipeline[]
}
