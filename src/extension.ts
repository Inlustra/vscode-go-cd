'use strict'
import { GoCdStatusBar } from './gui/go-cd-status-bar'
import * as vscode from 'vscode'
import { Commands } from './commands'
import { GoCdTreeView } from './gui/go-cd-tree-view'
import { State } from './state'
import { Icons } from './gui/icons'
import { GoCdJobWatcher } from './gui/go-cd-job-watcher'
import { GoCdSelectedPipelineTreeView } from './gui/go-cd-selected-pipeline-tree-view'
import { Configuration } from './configuration'
import { first } from 'rxjs/operators'
import { GuessSelectedPipeline } from './commands/guess-selected-pipeline.command'

export function activate(context: vscode.ExtensionContext) {
  Icons.setContext(context)
  Commands.forEach(command => context.subscriptions.push(command))
  new GoCdStatusBar().init()
  new GoCdTreeView().init()
  new GoCdSelectedPipelineTreeView().init()
  new GoCdJobWatcher().init()
  State.forceRefresh$.next()
  const { pipeline } = Configuration.getConfig()
  if (pipeline === '') {
    State.pipelines$.pipe(first()).subscribe(() => GuessSelectedPipeline())
  }
}

export function deactivate() {}
