import { ExtensionContext } from 'vscode'

interface Icon {
  light: string
  dark: string
}

export namespace Icons {
  let context: ExtensionContext

  export let check: Icon
  export let checkDouble: Icon
  export let ellipsis: Icon
  export let lock: Icon
  export let pause: Icon
  export let sync: Icon
  export let times: Icon
  export let ban: Icon
  export let question: Icon

  export function setContext(ctx: ExtensionContext) {
    context = ctx

    function getIcon(name: string) {
      return {
        light: context.asAbsolutePath('assets/icons/light/' + name),
        dark: context.asAbsolutePath('assets/icons/dark/' + name)
      }
    }

    check = getIcon('check.svg')
    checkDouble = getIcon('check-double.svg')
    ellipsis = getIcon('ellipsis.svg')
    lock = getIcon('lock.svg')
    pause = getIcon('pause.svg')
    sync = getIcon('sync.svg')
    times = getIcon('times.svg')
    ban = getIcon('ban.svg')
    question = getIcon('question.svg')
  }
}
