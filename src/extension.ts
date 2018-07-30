'use strict'
import { GoCdStatusBar } from './gui/go-cd-status-bar'
import * as vscode from 'vscode'
import { GoCdTreeView } from './gui/go-cd-tree-view'
import { State } from './state'
import { Icons } from './gui/icons'
import { GoCdJobWatcher } from './gui/go-cd-job-watcher'
import { GoCdSelectedPipelineTreeView } from './gui/go-cd-selected-pipeline-tree-view'
import { Configuration } from './configuration'
import { first } from 'rxjs/operators'
import { GuessSelectedPipeline } from './commands/guess-selected-pipeline.command'
import { Logger, initLogger } from './logger'
import { CommandKeys } from './constants/command-keys.const'
import ForceRefresh from './commands/refresh-pipeline.command'
import SetGlobalConfiguration from './commands/set-global-configuration.command'
import OpenArtifact from './commands/open-artifact.command'
import { ManualSelectPipeline } from './commands/manual-select-pipeline.command'

export function activate(context: vscode.ExtensionContext) {
  Logger.info('Initialising vscode-go-cd 🙌')
  startLogger(context)
  registerCommands(context)
  Icons.setContext(context)
  initGui()
  State.forceRefresh$.next()
}

function startLogger(context: vscode.ExtensionContext) {
  const { logLevel } = Configuration.getConfig()
  initLogger(logLevel)
  Configuration.all$.subscribe(({ logLevel }) => initLogger(logLevel))
}

function registerCommands({ subscriptions }: vscode.ExtensionContext) {
  ;[
    { key: CommandKeys.SET_GLOBAL_CONFIG_COMMAND, fn: SetGlobalConfiguration },
    { key: CommandKeys.FORCE_REFRESH_COMMAND, fn: ForceRefresh },
    { key: CommandKeys.OPEN_ARTIFACT_COMMAND, fn: OpenArtifact },
    { key: CommandKeys.GUESS_SELECTED_PIPELINE, fn: GuessSelectedPipeline },
    { key: CommandKeys.MANUAL_SELECT_PIPELINE, fn: ManualSelectPipeline }
  ].forEach(({ key, fn }) => {
    Logger.verbose(`Registering Command: ${key}`)
    subscriptions.push(vscode.commands.registerCommand(key, fn))
  })
}

function initGui() {
  Logger.verbose(`Initialising Status Bar`)
  new GoCdStatusBar().init()
  Logger.verbose(`Initialising All Pipelines Tree View`)
  new GoCdTreeView().init()
  Logger.verbose(`Initialising Selected Pipeline Tree View`)
  new GoCdSelectedPipelineTreeView().init()
  Logger.verbose(`Initialising Job Watcher`)
  new GoCdJobWatcher().init()

  const { pipeline } = Configuration.getConfig()
  if (pipeline === '') {
    Logger.verbose(`Guessing pipeline for first time.`)
    State.pipelines$.pipe(first()).subscribe(() => GuessSelectedPipeline())
  }
}

export function deactivate() {
  Logger.warn(`Deactivated vscode-go-cd`)
  State.stop$.next()
}
