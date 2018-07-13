import {
  window,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItem,
  ProviderResult,
  TreeItemCollapsibleState
} from 'vscode'
import { PipelineGroup } from '../api/models/pipeline-group.model'
import { Pipeline } from '../api/models/pipeline.model'
import { State } from '../state'
import { first, map, distinctUntilChanged } from 'rxjs/operators'
import { Subscription } from 'rxjs'

export class GoCdTreeView implements TreeDataProvider<GoCdTreeNode> {
  onChangeSubscription: Subscription | null = null

  init() {
    window.registerTreeDataProvider('go-cd-pipelines', this)
    this.onChangeSubscription = State.pipelineGroups$
      .pipe(distinctUntilChanged())
      .subscribe(() => this._onDidChangeTreeData.fire())
  }

  private _onDidChangeTreeData: EventEmitter<GoCdTreeNode> = new EventEmitter<
    GoCdTreeNode
  >()
  readonly onDidChangeTreeData: Event<GoCdTreeNode> = this._onDidChangeTreeData
    .event

  getTreeItem(element: GoCdTreeNode): TreeItem | Thenable<TreeItem> {
    if (element.group) {
      return new TreeItem(
        element.group.name,
        TreeItemCollapsibleState.Collapsed
      )
    } else if (element.pipeline) {
      return new TreeItem(element.pipeline.name, TreeItemCollapsibleState.None)
    } else {
      return new TreeItem('Error')
    }
  }

  getChildren(
    element?: GoCdTreeNode | undefined
  ): ProviderResult<GoCdTreeNode[]> {
    if (!element) {
      return State.pipelineGroups$
        .pipe(
          first(),
          map(group => group.map(group => ({ group })))
        )
        .toPromise()
    } else if (!!element.group) {
      return element.group._embedded.pipelines.map(pipeline => ({ pipeline }))
    }
  }
}

interface GoCdTreeNode {
  group?: PipelineGroup
  pipeline?: Pipeline
}
