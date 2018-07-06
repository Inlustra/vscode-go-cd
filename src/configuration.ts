import { GoCdConfiguration } from './models/go-cd-config.model';
import * as vscode from 'vscode';
import { ConfigurationKeys } from './constants/configuration-keys.const';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

export namespace Configuration {

    export const vscodeConfig = vscode.workspace.getConfiguration(ConfigurationKeys.SECTION);
    export const url$ = new BehaviorSubject<string>(vscodeConfig.get<string>(ConfigurationKeys.URL) || '');
    export const username$ = new BehaviorSubject<string>(vscodeConfig.get<string>(ConfigurationKeys.USERNAME) || '');
    export const password$ = new BehaviorSubject<string>(vscodeConfig.get<string>(ConfigurationKeys.PASSWORD) || '');
    export const pipeline$ = new BehaviorSubject<string>(vscodeConfig.get<string>(ConfigurationKeys.PIPELINE) || '');
    export const refreshInterval$ = new BehaviorSubject<number>(vscodeConfig.get<number>(ConfigurationKeys.REFRESH_INTERVAL) || 5000);
    
    export const all$: Observable<GoCdConfiguration> = combineLatest(
        url$, username$, password$, pipeline$, refreshInterval$
    ).pipe(
        distinctUntilChanged(),
        map(([url, username, password, pipeline, refreshInterval]) =>
            ({ url, username, password, pipeline, refreshInterval }))
    );

    export function setUrl(url: string, global: boolean = true) {
        vscodeConfig.update(ConfigurationKeys.URL, url.replace(/\/$/, ""), global)
            .then(() => url$.next(url));
    }

    export function setUsername(username: string, global: boolean = true) {
        vscodeConfig.update(ConfigurationKeys.USERNAME, username, global)
            .then(() => username$.next(username));
    }

    export function setPassword(password: string, global: boolean = true) {
        vscodeConfig.update(ConfigurationKeys.PASSWORD, password, global)
            .then(() => password$.next(password));
    }

    export function setPipeline(pipeline: string, global: boolean = true) {
        vscodeConfig.update(ConfigurationKeys.PIPELINE, pipeline, global)
            .then(() => pipeline$.next(pipeline));
    }

    export function setRefreshInterval(refreshInterval: number, global: boolean = true) {
        vscodeConfig.update(ConfigurationKeys.REFRESH_INTERVAL, refreshInterval, global)
            .then(() => refreshInterval$.next(refreshInterval));
    }

}
