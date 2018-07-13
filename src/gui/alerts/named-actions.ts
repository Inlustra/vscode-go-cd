import SetGlobalConfiguration from '../../commands/set-global-configuration.command'

export interface NamedAction {
  title: string
  onClick?: Function
}

export const RESET_GLOBAL_CONFIG: NamedAction = {
  title: 'Reset Global Config',
  onClick: () => SetGlobalConfiguration()
}

export const OK: NamedAction = {
  title: 'Ok',
  onClick: () => {}
}
