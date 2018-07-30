import { Configuration } from '../../configuration'
import * as vscode from 'vscode'

export default function showPasswordInput(global: boolean = true) {
  return vscode.window
    .showInputBox({
      password: true,
      placeHolder: 'Password',
      prompt: `Your ${global ? 'global' : 'workspace'} Go CD Password`,
      value: Configuration.getConfig().password,
      ignoreFocusOut: true
    })
    .then(value => {
      if (value) {
        Configuration.setPassword(value, global)
      }
    })
}
