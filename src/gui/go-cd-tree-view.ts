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
import {
  first,
  map,
  distinctUntilChanged,
  tap,
  catchError
} from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { PipelineInstance } from '../api/models/pipeline-instance.model'
import { PipelineHistory } from '../api/models/pipeline-history.model'
import { Stage } from '../api/models/stage-history.model'
import { Icons } from './icons'
import { showErrorAlert } from './alerts/show-error-alert'
import { OK, REFRESH_PIPELINES } from './alerts/named-actions'
import { Job } from '../api/models/job.model'
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
    try {
    if (!!element.job) {
      const treeItem = new TreeItem(element.job.name)
      treeItem.iconPath = this.getIconFromStage(element.job.result)
      return treeItem
    } else if (element.stage) {
      const treeItem = new TreeItem(
        element.stage.name,
        TreeItemCollapsibleState.Collapsed
      )
      treeItem.iconPath = this.getIconFromStages(
        element.stage.jobs.map(job => job.result)
      )
      return treeItem
    } else if (element.history) {
      const treeItem = new TreeItem(
        element.history.label,
        TreeItemCollapsibleState.Collapsed
      )
      treeItem.iconPath = this.getIconFromStages(
        element.history.stages.map(stage => stage.result)
      )
      return treeItem
    } else if (element.pipeline) {
      const { pipeline } = element
      let label = pipeline.name
      const instance = pipeline._embedded.instances.slice(-1).pop()
      label += ` - ${(instance && instance.label) || 'Not yet run'}`
      const treeItem = new TreeItem(label, TreeItemCollapsibleState.Collapsed)
      treeItem.iconPath =
        instance &&
        this.getIconFromStages(
          instance._embedded.stages.map(stage => stage.status)
        )
      return treeItem
    } else if (element.group) {
      return new TreeItem(
        element.group.name,
        TreeItemCollapsibleState.Collapsed
      )
    }
  }catch(e){console.error(e)}
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
    } else if (!!element.stage) {
      return element.stage.jobs.map(job => ({
        group: element.group,
        pipeline: element.pipeline,
        history: element.history,
        stage: element.stage,
        job
      }))
    } else if (!!element.history) {
      return element.history.stages.map(stage => ({
        group: element.group,
        pipeline: element.pipeline,
        history: element.history,
        stage
      }))
    } else if (!!element.pipeline) {
      const name = element.pipeline.name
      return State.getPipelineHistory(name)
        .pipe(
          first(),
          map(paginated =>
            paginated.pipelines.map(history => ({
              group: element.group,
              pipeline: element.pipeline,
              history
            }))
          ),
          catchError(e => {
            showErrorAlert(
              e,
              `Error loading pipeline history for: ${name}`,
              REFRESH_PIPELINES,
              OK
            )
            return []
          })
        )
        .toPromise()
    } else if (!!element.group) {
      return element.group._embedded.pipelines.map(pipeline => ({
        group: element.group,
        pipeline
      }))
    }
  }

  getIconFromStage(stage: string) {
    switch (stage) {
      case 'Passed':
        return Icons.check
      case 'Failed':
        return Icons.times
      case 'Running':
        return Icons.sync
      case 'Cancelled':
        return Icons.ban
        case 'Unknown':
        return Icons.question
      default:
      case null:
      case undefined:
        return undefined
    }
  }

  getIconFromStages(stages: string[]) {
    return stages
      .map((stage, idx, arr) => {
        const icon = this.getIconFromStage(stage)
        if(icon === undefined && (stage !== undefined || stage !== null)) {
          console.log(stage)
        }
        if (icon === Icons.check && idx === arr.length - 1) {
          return Icons.checkDouble
        }
        return icon
      })
      .filter(x => !!x)
      .pop()
  }
}

interface GoCdTreeNode {
  group?: PipelineGroup
  pipeline?: Pipeline
  history?: PipelineHistory
  stage?: Stage
  job?: Job
}
