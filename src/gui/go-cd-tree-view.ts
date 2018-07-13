import * as vscode from 'vscode'
import { PipelineNodeProvider } from './tree-view/pipeline-node-provider'

export class GoCdTreeView {
  private provider: vscode.TreeDataProvider<any> = new PipelineNodeProvider()

  init() {
    vscode.window.registerTreeDataProvider('go-cd-pipelines', this.provider)
  }
}
