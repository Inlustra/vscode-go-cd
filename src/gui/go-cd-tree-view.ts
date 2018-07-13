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
import { PipelineHistory } from '../api/models/pipeline-history.model'

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
    if (element.history) {
      return new TreeItem(element.history.counter + '')
    } else if (element.instance) {
      return new TreeItem(element.instance.label, TreeItemCollapsibleState.None)
    } else if (element.pipeline) {
      const { pipeline } = element
      let label = pipeline.name
      const instance = pipeline._embedded.instances.slice(-1).pop()
      label += ` - ${(instance && instance.label) || 'Not yet run'}`
      return new TreeItem(label, TreeItemCollapsibleState.Collapsed)
    } else if (element.group) {
      return new TreeItem(
        element.group.name,
        TreeItemCollapsibleState.Collapsed
      )
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
    } else if (!!element.pipeline) {
      return State.getPipelineHistory(element.pipeline.name)
        .pipe(
          first(),
          map(paginated =>
            paginated.pipelines.map(history => ({
              group: element.group,
              pipeline: element.pipeline,
              history
            }))
          )
        )
        .toPromise()
    } else if (!!element.group) {
      return element.group._embedded.pipelines.map(pipeline => ({
        group: element.group,
        pipeline
      }))
    }
  }
}

interface GoCdTreeNode {
  group?: PipelineGroup
  pipeline?: Pipeline
  instance?: PipelineInstance
  history?: PipelineHistory
}
