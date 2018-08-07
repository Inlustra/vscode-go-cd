import { ExtensionContext } from 'vscode'

export interface Icon {
  light: string
  dark: string
}

export namespace Icons { // TODO: Rewrite this ugliness.
  let context: ExtensionContext

  export let alert: Icon
  export let check: Icon
  export let circleSlash: Icon
  export let clock: Icon
  export let gear: Icon
  export let issueOpened: Icon
  export let issueReopened: Icon
  export let shield: Icon
  export let sync: Icon
  export let verified: Icon
  export let x: Icon

  export function setContext(ctx: ExtensionContext) {
    context = ctx

    function getIcon(name: string) {
      return {
        light: context.asAbsolutePath('assets/icons/light/' + name),
        dark: context.asAbsolutePath('assets/icons/dark/' + name)
      }
    }

    alert = getIcon('alert.svg')
    check = getIcon('check.svg')
    circleSlash = getIcon('circle-slash.svg')
    clock = getIcon('clock.svg')
    gear = getIcon('gear.svg')
    issueOpened = getIcon('issue-opened.svg')
    issueReopened = getIcon('issue-reopened.svg')
    shield = getIcon('shield.svg')
    sync = getIcon('sync.svg')
    verified = getIcon('verified.svg')
    x = getIcon('x.svg')
  }
}
