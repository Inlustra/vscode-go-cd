import { GoCdConfiguration } from './models/go-cd-config.model';
import { RefreshSubject } from './util/refresh-subject';
import * as vscode from 'vscode';
import { ConfigurationKeys } from './constants/configuration-keys.const';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs/Rx';


class Configuration {

    private static _instance: Configuration;

    public static getInstance(): Configuration {
        return this._instance = this._instance || new Configuration();
    }

    public vscodeConfig = vscode.workspace.getConfiguration(ConfigurationKeys.SECTION);
    public all$: Observable<GoCdConfiguration>;
    private url$: Subject<string>;
    private username$: Subject<string>;
    private password$: Subject<string>;
    private pipeline$: Subject<string>;
    private refreshInterval$: Subject<number>;

    constructor() {
        this.url$ = new BehaviorSubject<string>(this.vscodeConfig.get<string>(ConfigurationKeys.URL))
        this.username$ = new BehaviorSubject<string>(this.vscodeConfig.get<string>(ConfigurationKeys.USERNAME));
        this.password$ = new BehaviorSubject<string>(this.vscodeConfig.get<string>(ConfigurationKeys.PASSWORD));
        this.pipeline$ = new BehaviorSubject<string>(this.vscodeConfig.get<string>(ConfigurationKeys.PIPELINE));
        this.refreshInterval$ = new BehaviorSubject<number>(this.vscodeConfig.get<number>(ConfigurationKeys.REFRESH_INTERVAL));
        this.all$ = Observable.combineLatest(
            this.url$, this.username$, this.password$, this.pipeline$, this.refreshInterval$
        ).distinctUntilChanged()
            .map(([url, username, password, pipeline, refreshInterval]) =>
                ({ url, username, password, pipeline, refreshInterval }))
    }


    public setUrl(url: string, global: boolean = true) {
        console.log('SETTING', url);
        this.vscodeConfig.update(ConfigurationKeys.URL, url, global)
            .then(() => this.url$.next(url));
    }

    public setUsername(username: string, global: boolean = true) {
        console.log('SETTING', username)
        this.vscodeConfig.update(ConfigurationKeys.USERNAME, username, global)
            .then(() => this.username$.next(username));
    }

    public setPassword(password: string, global: boolean = true) {
        this.vscodeConfig.update(ConfigurationKeys.PASSWORD, password, global)
            .then(() => this.password$.next(password));
    }

    public setPipeline(pipeline: string, global: boolean = true) {
        this.vscodeConfig.update(ConfigurationKeys.PIPELINE, pipeline, global)
            .then(() => this.pipeline$.next(pipeline));
    }

    public setRefreshInterval(refreshInterval: number, global: boolean = true) {
        this.vscodeConfig.update(ConfigurationKeys.REFRESH_INTERVAL, refreshInterval, global)
            .then(() => this.refreshInterval$.next(refreshInterval));
    }

}

export const configuration = Configuration.getInstance();
