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
import { first, map, distinctUntilChanged, tap } from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { PipelineInstance } from '../api/models/pipeline-instance.model'

export class GoCdTreeView implements TreeDataProvider<GoCdTreeNode> {
  onChangeSubscription: Subscription | null = null
  groups: PipelineGroup[] | null = null

  init() {
    window.registerTreeDataProvider('go-cd-pipelines', this)
    this.onChangeSubscription = State.pipelineGroups$
      .pipe(distinctUntilChanged())
      .subscribe(
        groups => (this.groups = groups) && this._onDidChangeTreeData.fire()
      )
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
      return new TreeItem(
        element.pipeline.name,
        TreeItemCollapsibleState.Collapsed
      )
    } else if (element.instance) {
      return new TreeItem(element.instance.label, TreeItemCollapsibleState.None)
    }
    return new TreeItem('Loading...')
  }

  getChildren(
    element?: GoCdTreeNode | undefined
  ): ProviderResult<GoCdTreeNode[]> {
    if (this.groups === null) {
      return null
    }
    if (!element) {
      return this.groups.map(group => ({ group }))
    } else if (!!element.group) {
      return element.group._embedded.pipelines.map(pipeline => ({ pipeline }))
    } else if (!!element.pipeline) {
      return element.pipeline._embedded.instances.map(instance => ({
        instance
      }))
    }
  }
}

interface GoCdTreeNode {
  group?: PipelineGroup
  pipeline?: Pipeline
  instance?: PipelineInstance
}
