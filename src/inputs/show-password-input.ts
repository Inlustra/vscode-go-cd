import { configuration } from '../configuration';
import { ConfigurationKeys } from '../constants/configuration-keys.const';
import * as vscode from 'vscode';


export default function showPasswordInput(global: boolean = true) {
    return vscode.window.showInputBox({
        password: true,
        placeHolder: 'Password',
        prompt: `Your ${global ? 'global' : 'workspace'} Go CD Password`,
        value: configuration.vscodeConfig.get<string>(ConfigurationKeys.PASSWORD),
        ignoreFocusOut: true
    }).then((value) => {
        configuration.setPassword(value, global)
    });
}
