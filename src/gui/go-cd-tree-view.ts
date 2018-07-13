import {
  window,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItem,
  ProviderResult,
  TreeItemCollapsibleState,
  ThemeIcon,
  Uri
} from 'vscode'
import { PipelineGroup } from '../api/models/pipeline-group.model'
import { Pipeline } from '../api/models/pipeline.model'
import { State } from '../state'
import { first, map, distinctUntilChanged, tap } from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { PipelineInstance } from '../api/models/pipeline-instance.model'
import { PipelineHistory } from '../api/models/pipeline-history.model'
import { Stage } from '../api/models/stage-history.model'
import * as path from 'path'
import { Icons } from './icons'
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
    if (element.stage) {
      return new TreeItem(element.stage.name)
    } else if (element.history) {
      return new TreeItem(
        element.history.label + ' ' + this.getHistorySummary(element.history),
        TreeItemCollapsibleState.Collapsed
      )
    } else if (element.pipeline) {
      const { pipeline } = element
      let label = pipeline.name
      const instance = pipeline._embedded.instances.slice(-1).pop()
      label += ` - ${(instance && instance.label) || 'Not yet run'}`
      const treeItem = new TreeItem(label, TreeItemCollapsibleState.Collapsed)
      treeItem.iconPath = Icons.check()
      return treeItem
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
    } else if (!!element.history) {
      return element.history.stages.map(stage => ({
        group: element.group,
        pipeline: element.pipeline,
        history: element.history,
        stage
      }))
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

  getHistorySummary(history: PipelineHistory) {
    return history.stages
      .map(stage => {
        switch (stage.result) {
          case 'Passed':
            return '$(check)'
          case 'Failed':
            return '$(x)'
          case 'Running':
            return '$(triangle-right)'
          case 'Cancelled':
            return '$(stop)'
          default:
            return stage.result
        }
      })
      .filter(x => !!x)
      .join(' ')
  }
}

interface GoCdTreeNode {
  group?: PipelineGroup
  pipeline?: Pipeline
  history?: PipelineHistory
  stage?: Stage
}
