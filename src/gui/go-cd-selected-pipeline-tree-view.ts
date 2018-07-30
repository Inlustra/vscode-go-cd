import {
  window,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItem,
  ProviderResult,
  TreeView,
  Disposable
} from 'vscode'
import { State } from '../state'
import { distinctUntilChanged } from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { TreeNode } from './tree/tree-node'
import { Pipeline } from '../gocd-api/models/pipeline.model'
import { PipelineNode } from './tree/pipeline.node'
import { Logger } from '../logger'

export class GoCdSelectedPipelineTreeView
  implements TreeDataProvider<TreeNode>, Disposable {
  onChangeSubscription?: Subscription
  pipeline?: Pipeline
  private treeView: TreeView<TreeNode>

  constructor() {
    this.treeView = window.createTreeView('go-cd-selected-pipeline', {
      treeDataProvider: this
    })
  }

  dispose() {
    this.treeView.dispose()
  }

  init() {
    this.onChangeSubscription = State.selectedPipeline$
      .pipe(distinctUntilChanged())
      .subscribe(
        pipeline =>
          (this.pipeline = pipeline) && this._onDidChangeTreeData.fire()
      )
  }

  private _onDidChangeTreeData: EventEmitter<TreeNode> = new EventEmitter<
    TreeNode
  >()
  readonly onDidChangeTreeData: Event<TreeNode> = this._onDidChangeTreeData
    .event

  getTreeItem(element: TreeNode): TreeItem | Thenable<TreeItem> {
    try {
      return element.toTreeItem()
    } catch (e) {
      Logger.error(
        '[GoCdSelectedPipelineTreeView] Unable to call getTreeItem for element',
        e
      )
    }
    return new TreeItem('Loading...')
  }

  getChildren(element?: TreeNode | undefined): ProviderResult<TreeNode[]> {
    if (!element) {
      return this.pipeline ? new PipelineNode(this.pipeline).getChildren() : []
    }
    return element.getChildren()
  }
}
