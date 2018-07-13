import { MaterialRevision } from './material-revision.model'
export interface BuildCause {
  approver: string
  material_revisions: MaterialRevision[]
  trigger_forced: boolean
  trigger_message: string
}
