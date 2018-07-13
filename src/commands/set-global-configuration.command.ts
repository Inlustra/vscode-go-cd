import { Inputs } from '../gui/inputs'
import { showErrorAlert } from '../gui/alerts/show-error-alert'
import { RESET_GLOBAL_CONFIG, OK } from '../gui/alerts/named-actions'

export default function SetGlobalConfiguration() {
  Inputs.showUrlInput(true)
    .then(() => Inputs.showUsernameInput(true))
    .then(() => Inputs.showPasswordInput(true))
    .then(() => Inputs.showPipelineInput(true))
    .then(
      () => {},
      err => {
        showErrorAlert(
          err,
          'Error setting global configuration',
          RESET_GLOBAL_CONFIG,
          OK
        )
      }
    )
}
