import { TreeNode } from './tree/tree-node'
import { TreeView } from 'vscode'
import { GoCdPipelineTreeView } from './go-cd-pipeline-tree-view'

namespace TreeViews {
  let views: GoCdPipelineTreeView[] = []

  export function setViews(pipelineNames: string[]) {
    views.forEach(view => view.treeView.dispose())
    views = pipelineNames.map((pipeline, index) => {
      const view = new GoCdPipelineTreeView(
        'go-cd-selected-pipeline-' + index,
        pipeline
      )
      view.init()
      return view
    })
  }
}
