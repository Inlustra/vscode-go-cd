export interface Material {
  fingerprint: string
  type: string
  description: string
}

export interface Stage {
  name: string
}

export interface Pipeline {
  label: string
  materials: Material[]
  stages: Stage[]
  name: string
}

export interface PipelineGroup {
  name: string
  pipelines: Pipeline[]
}
