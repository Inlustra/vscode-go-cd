import { TreeNode } from "./tree-node";
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { PipelineNode } from "./pipeline.node";
import { DashboardPipelineGroup } from "../../gocd-api/models/dashboard-pipeline-group.model";

export class PipelineGroupNode implements TreeNode {
    
    constructor(public group: DashboardPipelineGroup) {}
  
    toTreeItem(): TreeItem {
      return new TreeItem(this.group.name, TreeItemCollapsibleState.Collapsed)
    }
  
    getChildren(): TreeNode[] {
      return this.group._embedded.pipelines.map(
        pipeline => new PipelineNode(pipeline)
      )
    }
  }
  