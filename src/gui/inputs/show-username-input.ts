import { Configuration } from '../../configuration'
import { ConfigurationKeys } from '../../constants/configuration-keys.const'
import * as vscode from 'vscode'

const config = vscode.workspace.getConfiguration(ConfigurationKeys.SECTION)

export default function showUsernameInput(global: boolean = true) {
  return vscode.window
    .showInputBox({
      placeHolder: 'Username',
      prompt: `Your ${global ? 'global' : 'workspace'} Go CD Username`,
      value: config.get<string>(ConfigurationKeys.USERNAME),
      ignoreFocusOut: true
    })
    .then(value => {
      if (value) {
        Configuration.setUsername(value, global)
      }
    })
}
