import * as vscode from 'vscode';
import { Pipeline } from '../../gocd-api/models/pipeline.model';
import { GoCdVscode } from '../../gocd-vscode';
import { distinctUntilChanged, first, map, tap } from 'rxjs/operators';
import { PipelineGroup } from '../../gocd-api/models/pipeline-group.model';

export class PipelineNodeProvider
  implements vscode.TreeDataProvider<GoCdTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    GoCdTreeItem | undefined
  > = new vscode.EventEmitter<GoCdTreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<GoCdTreeItem | undefined> = this
    ._onDidChangeTreeData.event;

  constructor() {
    GoCdVscode.pipelineGroups$
      .pipe(distinctUntilChanged())
      .subscribe(() => console.log('fired!') || this._onDidChangeTreeData.fire());
  }

  getTreeItem(
    element: GoCdTreeItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: GoCdTreeItem | undefined
  ): vscode.ProviderResult<PipelineGroupItem[] | PipelineItem[]> {
    if (!element) {
      return GoCdVscode.pipelineGroups$
        .pipe(
          first(),
          map(group => group.map(group => new PipelineGroupItem(group)))
        )
        .toPromise();
    } else if (element instanceof PipelineGroupItem) {
      return element.group._embedded.pipelines.map(
        pipeline => new PipelineItem(pipeline)
      );
    } else if (element instanceof PipelineItem) {
      return [];
    }
  }
}

type GoCdTreeItem = PipelineGroupItem | PipelineItem;

class PipelineGroupItem extends vscode.TreeItem {
  constructor(public group: PipelineGroup) {
    super(group.name, vscode.TreeItemCollapsibleState.Collapsed);
  }
}

class PipelineItem extends vscode.TreeItem {
  constructor(public pipeline: Pipeline) {
    super(pipeline.name, vscode.TreeItemCollapsibleState.None);
  }
}
