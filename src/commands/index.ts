import * as vscode from 'vscode';
import SetGlobalConfiguration from './set-global-configuration.command';
import ForceRefresh from './refresh-pipeline.command';

export const Commands = [
    vscode.commands.registerCommand('goCdPipelines.setGlobalConfig', SetGlobalConfiguration),
    vscode.commands.registerCommand('goCdPipelines.forceRefresh', ForceRefresh)
];

