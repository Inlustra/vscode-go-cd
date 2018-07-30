import { Configuration } from '../../configuration'
import { Validations } from '../../constants/validations.const'
import * as vscode from 'vscode'
import { GoCdApi } from '../../gocd-api'

function formatUrl(url: string) { // TODO: Can we make this smarter?
  if (url.endsWith('/')) {
    url = url.slice(0, -1)
  }
  return url
}

export default function showUrlInput(global: boolean = true) {
  return vscode.window
    .showInputBox({
      validateInput: value =>
        Validations.URL.test(value) ? '' : 'Must be a valid URL',
      placeHolder: 'http://my-ci.myUrl.com/go/',
      prompt: `Your ${global ? 'global' : 'workspace'} Go CD url`,
      value: Configuration.getConfig().url,
      ignoreFocusOut: true
    })
    .then(value => {
      if (value) {
        return GoCdApi.getHealth(formatUrl(value))
          .toPromise()
          .then(() => Configuration.setUrl(value, global))
      }
    })
}
