import { Material } from './material.model';
import { Modification } from './modification.model';

export interface MaterialRevision {
    modifications: Modification[];
    material: Material;
    changed: boolean;
}
