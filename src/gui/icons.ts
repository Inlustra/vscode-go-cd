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
}
