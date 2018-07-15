import { TreeItem } from 'vscode'

export interface TreeNode {
  toTreeItem(): TreeItem
  getChildren(): TreeNode[] | Thenable<TreeNode[]>
}

