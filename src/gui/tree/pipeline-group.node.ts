import { TreeNode } from "./tree-node";
import { PipelineGroup } from "../../api/models/pipeline-group.model";
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { PipelineNode } from "./pipeline.node";

export class PipelineGroupNode implements TreeNode {
    
    constructor(public group: PipelineGroup) {}
  
    toTreeItem(): TreeItem {
      return new TreeItem(this.group.name, TreeItemCollapsibleState.Collapsed)
    }
  
    getChildren(): TreeNode[] {
      return this.group._embedded.pipelines.map(
        pipeline => new PipelineNode(pipeline)
      )
    }
  }
  