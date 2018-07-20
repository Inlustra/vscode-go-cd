import { GitUtils } from '../utils/git-utils'
import { showErrorAlert } from '../gui/alerts/show-error-alert'

export function DetermineGitPipelines() {
  GitUtils.getGitOrigins().subscribe(origins =>
    showErrorAlert(null, 'Origins: ' + origins.join(', '))
  )
}
