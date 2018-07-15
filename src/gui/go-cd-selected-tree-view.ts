import {
  window,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItem,
  ProviderResult
} from 'vscode'
import { State } from '../state'
import { distinctUntilChanged } from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { TreeNode } from './tree/tree-node'
import { Pipeline } from '../api/models/pipeline.model'
import { PipelineNode } from './tree/pipeline.node'

export class GoCdSelectedTreeView implements TreeDataProvider<TreeNode> {
  onChangeSubscription?: Subscription
  pipeline?: Pipeline

  init() {
    window.registerTreeDataProvider('go-cd-selected-pipeline', this)
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
      console.error(e)
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
