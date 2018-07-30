import * as vscode from 'vscode'
import { ConfigurationKeys } from './constants/configuration-keys.const'
import { Observable, Subject, BehaviorSubject } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'
import { Logger } from './logger'

type FailureDisplayOption = 'none' | 'all' | 'causedByMe'
type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'

interface GoCDConfig {
  url: string
  username: string
  password: string
  pipeline: string
  refreshInterval: number
  failureDisplay: FailureDisplayOption
  logLevel: LogLevel
}

export namespace Configuration {
  const {
    SECTION,
    URL,
    USERNAME,
    PASSWORD,
    PIPELINE,
    REFRESH_INTERVAL,
    FAILURE_DISPLAY,
    LOG_LEVEL
  } = ConfigurationKeys

  const config$: Subject<GoCDConfig> = new BehaviorSubject<GoCDConfig>(
    getConfig()
  )

  export const all$: Observable<GoCDConfig> = config$.pipe(
    distinctUntilChanged()
  )

  vscode.workspace.onDidChangeConfiguration(config => {
    if (
      config.affectsConfiguration(SECTION + '.' + URL) ||
      config.affectsConfiguration(SECTION + '.' + USERNAME) ||
      config.affectsConfiguration(SECTION + '.' + PASSWORD) ||
      config.affectsConfiguration(SECTION + '.' + PIPELINE) ||
      config.affectsConfiguration(SECTION + '.' + REFRESH_INTERVAL) ||
      config.affectsConfiguration(SECTION + '.' + FAILURE_DISPLAY) ||
      config.affectsConfiguration(SECTION + '.' + LOG_LEVEL)
    ) {
      config$.next(getConfig())
    }
  })

  export function getConfig(): GoCDConfig {
    const vscodeConfig = vscode.workspace.getConfiguration(
      ConfigurationKeys.SECTION
    )
    return {
      url: vscodeConfig.get(URL) || '',
      username: vscodeConfig.get(USERNAME) || '',
      password: vscodeConfig.get(PASSWORD) || '',
      pipeline: vscodeConfig.get(PIPELINE) || '',
      failureDisplay: vscodeConfig.get(FAILURE_DISPLAY) || 'causedByMe',
      refreshInterval: vscodeConfig.get(REFRESH_INTERVAL) || 20000,
      logLevel: vscodeConfig.get(LOG_LEVEL) || 'info'
    }
  }

  export function setUrl(url: string, global: boolean = true) {
    vscode.workspace
      .getConfiguration(ConfigurationKeys.SECTION)
      .update(ConfigurationKeys.URL, url.replace(/\/$/, ''), global)
    Logger.info(`[Configuration] Set url to: ${url}`)
  }

  export function setUsername(username: string, global: boolean = true) {
    vscode.workspace
      .getConfiguration(ConfigurationKeys.SECTION)
      .update(ConfigurationKeys.USERNAME, username, global)
    Logger.info(`[Configuration] Set username to: ${username}`)
  }

  export function setPassword(password: string, global: boolean = true) {
    vscode.workspace
      .getConfiguration(ConfigurationKeys.SECTION)
      .update(ConfigurationKeys.PASSWORD, password, global)
    Logger.info(`[Configuration] Set password`)
  }

  export function setPipeline(pipeline: string, global: boolean = true) {
    vscode.workspace
      .getConfiguration(ConfigurationKeys.SECTION)
      .update(ConfigurationKeys.PIPELINE, pipeline, global)
    Logger.info(`[Configuration] Set pipeline to: ${pipeline}`)
  }

  export function setRefreshInterval(
    refreshInterval: number,
    global: boolean = true
  ) {
    vscode.workspace
      .getConfiguration(ConfigurationKeys.SECTION)
      .update(ConfigurationKeys.REFRESH_INTERVAL, refreshInterval, global)
    Logger.info(`[Configuration] Set refreshInterval to: ${refreshInterval}`)
  }

  export function setFailureDisplay(
    failureDisplayOption: FailureDisplayOption,
    global: boolean = true
  ) {
    vscode.workspace
      .getConfiguration(ConfigurationKeys.SECTION)
      .update(ConfigurationKeys.FAILURE_DISPLAY, failureDisplayOption, global)
    Logger.info(
      `[Configuration] Set failureDisplay to: ${failureDisplayOption}`
    )
  }
}
