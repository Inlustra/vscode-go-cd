import { Pipeline } from './pipeline.model';
export interface PipelineGroup {
    name: string;
    _embedded: {
        pipelines: Pipeline[];
    }
}
