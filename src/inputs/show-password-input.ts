import { ConfigurationKeys } from '../constants/configuration-keys.const';
import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration(ConfigurationKeys.SECTION);

export default function showPasswordInput(global: boolean = true) {
    return vscode.window.showInputBox({
        password: true,
        placeHolder: 'Password',
        prompt: `Your ${global ? 'global' : 'workspace'} Go CD Password`,
        value: config.get<string>(ConfigurationKeys.PASSWORD),
        ignoreFocusOut: true
    }).then((value) => {
        config.update(ConfigurationKeys.PASSWORD, value, global);
    });
}
