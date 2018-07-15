import {
  window,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItem,
  ProviderResult,
  TreeItemCollapsibleState,
  ThemeIcon,
  Uri,
  Command
} from 'vscode'
import { PipelineGroup } from '../api/models/pipeline-group.model'
import { Pipeline } from '../api/models/pipeline.model'
import { State } from '../state'
import {
  first,
  map,
  distinctUntilChanged,
  tap,
  catchError
} from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { Icons } from './icons'
import { TreeNode } from './tree/tree-node'
import { PipelineGroupNode } from './tree/pipeline-group.node'
export class GoCdTreeView implements TreeDataProvider<TreeNode> {
  onChangeSubscription: Subscription | null = null
  groups: PipelineGroup[] = []

  init() {
    window.registerTreeDataProvider('go-cd-pipelines', this)
    this.onChangeSubscription = State.pipelineGroups$
      .pipe(distinctUntilChanged())
      .subscribe(
        groups => (this.groups = groups) && this._onDidChangeTreeData.fire()
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
      return this.groups.map(group => new PipelineGroupNode(group))
    }
    return element.getChildren()
  }
}
