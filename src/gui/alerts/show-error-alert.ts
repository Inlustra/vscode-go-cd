import * as vscode from 'vscode'
import { NamedAction } from './named-actions'

export function showErrorAlert(
  err: any,
  title: string,
  ...actions: NamedAction[]
) {
  let message = title
  if (err.status) {
    message = message + ': ' + err.status
  }
  if (err.message) {
    message = message + '\n ' + err.message
  }
  const buttons = actions.map(action => action.title)
  return vscode.window.showErrorMessage(message, ...buttons).then(button => {
    const option = actions.find(action => action.title === button)
    if (option && option.onClick) {
      option.onClick()
    }
  })
}
