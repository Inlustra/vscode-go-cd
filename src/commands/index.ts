import * as vscode from 'vscode'
import SetGlobalConfiguration from './set-global-configuration.command'
import ForceRefresh from './refresh-pipeline.command'
import OpenArtifact from './open-artifact.command'

export const SET_GLOBAL_CONFIG_COMMAND = 'gocd.setGlobalConfig'
export const FORCE_REFRESH_COMMAND = 'gocd.forceRefresh'
export const OPEN_ARTIFACT_COMMAND = 'gocd.openArtifact'

export const Commands = [
  vscode.commands.registerCommand(
    SET_GLOBAL_CONFIG_COMMAND,
    SetGlobalConfiguration
  ),
  vscode.commands.registerCommand(FORCE_REFRESH_COMMAND, ForceRefresh),
  vscode.commands.registerCommand(OPEN_ARTIFACT_COMMAND, OpenArtifact)
]
