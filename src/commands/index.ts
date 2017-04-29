import * as vscode from 'vscode';
import SetGlobalConfiguration from './set-global-configuration.command';

export const Commands = [
    vscode.commands.registerCommand('goCdPipelines.setGlobalConfig', SetGlobalConfiguration)
]

