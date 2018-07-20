import { showErrorAlert } from '../gui/alerts/show-error-alert'
import { RESET_GLOBAL_CONFIG, OK } from '../gui/alerts/named-actions'
import showPasswordInput from '../gui/inputs/show-password-input'
import showUsernameInput from '../gui/inputs/show-username-input'
import showUrlInput from '../gui/inputs/show-url-input'

export default function SetGlobalConfiguration() {
  showUrlInput(true)
    .then(() => showUsernameInput(true))
    .then(() => showPasswordInput(true))
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
