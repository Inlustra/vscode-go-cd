import { GitUtils } from '../utils/git-utils'
import { showErrorAlert } from '../gui/alerts/show-error-alert'
import { flatMap } from 'rxjs/operators'
import { Api } from '../api';

export function DetermineGitPipelines() {
  GitUtils.getGitOrigins()
    .pipe(flatMap(
      origins => Api.getPipelineGroups()
    ))
    .subscribe(
      origins => {
        showErrorAlert(null, 'Origins: ' + origins.join(', '))
      },
      error => showErrorAlert(error, 'Error determining git pipelines')
    )
}
