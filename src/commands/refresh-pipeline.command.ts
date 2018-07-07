import { GoCdVscode } from '../gocd-vscode';
import * as vscode from 'vscode';
import { first, tap } from 'rxjs/operators';

export default function ForceRefresh() {
  const refresh$ = GoCdVscode.pipelines$.pipe(first(), tap(() => console.log('Done force')));
  vscode.window.setStatusBarMessage('Refreshing Go CD', refresh$.toPromise());
  GoCdVscode.forceRefresh.next();
}
