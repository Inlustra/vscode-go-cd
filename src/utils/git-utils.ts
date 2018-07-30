import { Uri, extensions } from 'vscode'
import { from, throwError, Observable, forkJoin } from 'rxjs'
import {
  map,
  filter,
  flatMap,
  concatAll,
  toArray,
  first,
  tap,
  retry,
  retryWhen,
  take,
  delay
} from 'rxjs/operators'
import { execSync } from 'child_process'
import { RxUtils } from './rx-utils'
import { Logger } from '../logger';

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
    return forkJoin(
      getGitPath().pipe(RxUtils.retryWithDelay(1000, 2)),
      getGitRepositoryUris().pipe(RxUtils.retryWithDelay(1000, 2))
    ).pipe(
      flatMap(([gitPath, uris]) =>
        uris.map(uri => {
          try {
            return execSync(
              `${gitPath} --git-dir=${
                uri.path
              }/.git config --get remote.origin.url`
            )
          } catch (e) {
            Logger.log('[GitUtils] getGitOrigins, error executing...', e)
            return null
          }
        })
      ),
      filter((x): x is Buffer => !!x),
      map(x => x.toString().trim()),
      toArray(),
      first()
    )
  }
}
