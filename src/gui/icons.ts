import { ExtensionContext } from 'vscode'

export namespace Icons {
  let context: ExtensionContext

  export function setContext(ctx: ExtensionContext) {
    context = ctx
  }

  function getIcon(name: string) {
    return () => ({
      light: context.asAbsolutePath('assets/icons/light/' + name),
      dark: context.asAbsolutePath('assets/icons/dark/' + name)
    })
  }

  export const check = getIcon('check.svg')
  export const checkDouble = getIcon('checkDouble.svg')
  export const ellipsis = getIcon('ellipsis.svg')
  export const lock = getIcon('lock.svg')
  export const pause = getIcon('pause.svg')
  export const sync = getIcon('sync.svg')
  export const times = getIcon('times.svg')
}
