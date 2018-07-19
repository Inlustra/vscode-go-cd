import * as vscode from 'vscode'
import { exec, execSync } from 'child_process'

export class GoCdJobWatcher {
  gitPath: string | undefined

  constructor() {}

  async init() {
    let gitExt = vscode.extensions.getExtension('vscode.git')
    if (gitExt) {
      let importedGitApi = gitExt.exports
      this.gitPath = await importedGitApi.getGitPath()
      let repos = await importedGitApi.getRepositories()
      const repoPaths: string[] = repos.map(
        (repo: any) => repo.rootUri && repo.rootUri.path
      )
      const result = await Promise.all(repoPaths.map(path => this.getRemoteUrl(path).catch(x => console.error(x))))
      console.log(result)
    }
  }

  async getRemoteUrl(repoPath: string) {
    if (!this.gitPath) {
      console.error('[GoCdJobWatcher] No git path specified')
      return undefined
    }
    const exec = await execSync(
      `${
        this.gitPath
      } --git-dir=${repoPath}/.git config --get remote.origin.url`
    )
    return exec.toString().trim()
  }
}
