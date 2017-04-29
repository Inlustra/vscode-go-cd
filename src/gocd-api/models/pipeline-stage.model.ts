import { Link } from './link.model';
export interface PipelineStage {
    _links: {
        self: Link;
        doc: Link;
    }
    name: string;
    status: string;
}
