import { Stage } from './stage-history.model';
import { BuildCause } from './build-cause.model';
export interface PipelineHistory {
    build_cause: BuildCause;
    name: string;
    natural_order: number;
    can_run: boolean;
    comment?: any;
    stages: Stage[];
    counter: number;
    id: number;
    preparing_to_schedule: boolean;
    label: string;
}
