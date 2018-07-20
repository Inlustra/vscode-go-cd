import { GitUtils } from '../utils/git-utils'
import { showErrorAlert } from '../gui/alerts/show-error-alert'

export function DetermineGitPipelines() {
  console.log('starting command')
  GitUtils.getGitOrigins().subscribe(
    origins => showErrorAlert(null, 'Origins: ' + origins.join(', ')),
    error => showErrorAlert(error, 'Error determining git pipelines')
  )
}
