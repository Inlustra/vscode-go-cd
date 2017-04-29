import { ConfigurationKeys } from '../constants/configuration-keys.const';
import { Validations } from '../constants/validations.const';
import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration(ConfigurationKeys.SECTION);

export default function showUrlInput(global: boolean = true) {
    return vscode.window.showInputBox({
        validateInput: (value) => Validations.URL.test(value) ? '' : 'Must be a valid URL',
        placeHolder: 'http://my-ci.myUrl.com/go/',
        prompt: `Your ${global ? 'global' : 'workspace'} Go CD url`,
        value: config.get<string>(ConfigurationKeys.URL),
        ignoreFocusOut: true
    }).then(value => {
        return config.update(ConfigurationKeys.URL, value.endsWith('/') ? value : value + '/', global);
    });
}
