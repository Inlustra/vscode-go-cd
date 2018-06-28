import { GoCdVscode } from '../gocd-vscode';
import { ConfigurationKeys } from '../constants/configuration-keys.const';
import { Validations } from '../constants/validations.const';
import * as vscode from 'vscode';
import { Inputs } from '../inputs'

const config = vscode.workspace.getConfiguration(ConfigurationKeys.SECTION);
export default function SetGlobalConfiguration() {

    Inputs.showUrlInput(true)
        .then(() => Inputs.showUsernameInput(true))
        .then(() => Inputs.showPasswordInput(true))
        .then(() => GoCdVscode.getShortPipelineInfo().toPromise())
        .then((pipelines) => Inputs.showPipelineInput(pipelines, true))
        .then(() => {}, (err) => {
            console.log(err);
        });

};
