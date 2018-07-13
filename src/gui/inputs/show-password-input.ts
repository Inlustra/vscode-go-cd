import { Configuration } from '../../configuration'
import { ConfigurationKeys } from '../../constants/configuration-keys.const'
import * as vscode from 'vscode'

export default function showPasswordInput(global: boolean = true) {
  return vscode.window
    .showInputBox({
      password: true,
      placeHolder: 'Password',
      prompt: `Your ${global ? 'global' : 'workspace'} Go CD Password`,
      value: Configuration.vscodeConfig.get<string>(ConfigurationKeys.PASSWORD),
      ignoreFocusOut: true
    })
    .then(value => {
      if (value) {
        Configuration.setPassword(value, global)
      }
    })
}
