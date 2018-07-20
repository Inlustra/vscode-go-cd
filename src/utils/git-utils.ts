import { Uri, extensions } from 'vscode'
import { from, throwError, Observable, forkJoin } from 'rxjs'
import {
  map,
  filter,
  flatMap,
  concatAll,
  toArray,
  first,
  tap
} from 'rxjs/operators'
import { execSync } from 'child_process'

export namespace GitUtils {
  export function getGitPath(): Observable<string> {
    let gitExt = extensions.getExtension('vscode.git')
    if (gitExt) {
      return from(<Promise<string>>gitExt.exports.getGitPath())
    }
    return throwError(new Error('Could not get git extension, disabled? '))
  }

  type Repo = { rootUri: Uri }
  export function getGitRepositoryUris(): Observable<Uri[]> {
    let gitExt = extensions.getExtension('vscode.git')
    if (gitExt) {
      return from(<Promise<Repo[]>>gitExt.exports.getRepositories()).pipe(
        map((repos: Repo[]) => repos.map(repo => repo.rootUri)),
        filter(uri => !!uri)
      )
    }
    return throwError(new Error('Could not get git extension, disabled? '))
  }

  export function getGitOrigins(): Observable<string[]> {
    return forkJoin(getGitPath(), getGitRepositoryUris()).pipe(
      flatMap(([gitPath, uris]) =>
        uris.map(uri => {
          try {
            return execSync(
              `${gitPath} --git-dir=${uri.path}/.git config --get remote.origin.url`
            )
          } catch (e) {
            console.log('error executing...', e)
            return null
          }
        })
      ),
      tap(console.log),
      filter((x): x is Buffer => !!x),
      map(x => x.toString()),
      concatAll(),
      tap(console.log),
      toArray(),
      tap(console.log),
      first()
    )
  }
}
