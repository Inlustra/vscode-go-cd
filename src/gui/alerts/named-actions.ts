import SetGlobalConfiguration from '../../commands/set-global-configuration.command'
import ForceRefresh from '../../commands/refresh-pipeline.command';

export interface NamedAction {
  title: string
  onClick?: Function
}

export const REFRESH_PIPELINES: NamedAction = {
  title: 'Refresh Pipelines',
  onClick: () => ForceRefresh()
}

export const RESET_GLOBAL_CONFIG: NamedAction = {
  title: 'Reset Global Config',
  onClick: () => SetGlobalConfiguration()
}

export const OK: NamedAction = {
  title: 'Ok',
  onClick: () => {}
}
