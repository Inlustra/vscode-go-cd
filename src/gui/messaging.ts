import * as vscode from 'vscode';
import SetGlobalConfiguration from '../commands/set-global-configuration.command';

export namespace Messaging {
  export interface ButtonAction {
    title: string;
    onClick?: Function;
  }

  export const RESET_GLOBAL_CONFIG: ButtonAction = {
    title: 'Reset Global Config',
    onClick: () => SetGlobalConfiguration()
  };

  export const OK: ButtonAction = {
    title: 'Ok',
    onClick: () => {}
  };

  export function showError(err: any, title: string, ...inputs: string[]) {
    let message = title;
    if (err.status) {
      message = message + ': ' + err.status;
    }
    if (err.message) {
      message = message + '\n ' + err.message;
    }
    return vscode.window.showErrorMessage(message, ...inputs);
  }

  export function showErrorWithButtons(
    err: any,
    title: string,
    ...options: Messaging.ButtonAction[]
  ) {
    const buttons = options.map(option => option.title);
    return Messaging.showError(err, title, ...buttons).then(button => {
      const option = options.find(option => option.title === button);
      if (option && option.onClick) {
        option.onClick();
      }
    });
  }
}
