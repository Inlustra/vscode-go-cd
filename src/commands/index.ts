import * as vscode from 'vscode'
import SetGlobalConfiguration from './set-global-configuration.command'
import ForceRefresh from './refresh-pipeline.command'
import OpenArtifact from './open-artifact.command'
import { CommandKeys } from '../constants/command-keys.const'
import { DetermineGitPipelines } from './determine-git-pipelines.command';

export const Commands = [
  vscode.commands.registerCommand(
    CommandKeys.SET_GLOBAL_CONFIG_COMMAND,
    SetGlobalConfiguration
  ),
  vscode.commands.registerCommand(
    CommandKeys.FORCE_REFRESH_COMMAND,
    ForceRefresh
  ),
  vscode.commands.registerCommand(
    CommandKeys.OPEN_ARTIFACT_COMMAND,
    OpenArtifact
  ),
  vscode.commands.registerCommand(
    CommandKeys.DETERMINE_GIT_PIPELINES,
    DetermineGitPipelines
  )
]
