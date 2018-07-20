import * as vscode from 'vscode'
import { from, throwError, Observable, forkJoin } from 'rxjs'
import { map, filter, flatMap, concatAll, toArray } from 'rxjs/operators'
import { execSync } from 'child_process'

export namespace GitUtils {
  export function getGitPath(): Observable<string> {
    let gitExt = vscode.extensions.getExtension('vscode.git')
    if (gitExt) {
      return from(<string>gitExt.exports.getGitPath())
    }
    return throwError(new Error('Could not get git extension, disabled? '))
  }

  export function getGitRepositoryUris(): Observable<vscode.Uri[]> {
    let gitExt = vscode.extensions.getExtension('vscode.git')
    if (gitExt) {
      return from(gitExt.exports.getRepositories()).pipe(
        map((repo: any) => repo.rootUri),
        filter(uri => !!uri)
      )
    }
    return throwError(new Error('Could not get git extension, disabled? '))
  }

  export function getGitOrigins(): Observable<string[]> {
    return forkJoin(getGitPath(), getGitRepositoryUris()).pipe(
      flatMap(([gitPath, uris]) =>
        uris.map(repoPath => {
          try {
            return execSync(
              `${gitPath} --git-dir=${repoPath}/.git config --get remote.origin.url`
            )
          } catch (e) {
            return null
          }
        })
      ),
      filter((x): x is Buffer => !!x),
      map(x => x.toString()),
      concatAll(),
      toArray()
    )
  }
}
