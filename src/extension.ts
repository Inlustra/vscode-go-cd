'use strict'
import { GoCdStatusBar } from './gui/go-cd-status-bar'
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { Commands } from './commands'
import { GoCdTreeView } from './gui/go-cd-tree-view'
import { State } from './state'
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-go-cd" is now active!')

  Commands.forEach(command => context.subscriptions.push(command))
  new GoCdStatusBar().init()
  new GoCdTreeView().init()
  State.forceRefresh.next()
}

// this method is called when your extension is deactivated
export function deactivate() {}
