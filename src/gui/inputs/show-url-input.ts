import { Configuration } from '../../configuration'
import { ConfigurationKeys } from '../../constants/configuration-keys.const'
import { Validations } from '../../constants/validations.const'
import * as vscode from 'vscode'

export default function showUrlInput(global: boolean = true) {
  return vscode.window
    .showInputBox({
      validateInput: value =>
        Validations.URL.test(value) ? '' : 'Must be a valid URL',
      placeHolder: 'http://my-ci.myUrl.com/go/',
      prompt: `Your ${global ? 'global' : 'workspace'} Go CD url`,
      value: Configuration.vscodeConfig.get<string>(ConfigurationKeys.URL),
      ignoreFocusOut: true
    })
    .then(value => {
      if (value) {
        Configuration.setUrl(value, global)
      }
    })
}
