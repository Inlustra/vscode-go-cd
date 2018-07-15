import { Icons } from '../icons'

export function getIconFromStage(stage: string) {
  switch (stage) {
    case 'Passed':
      return Icons.check
    case 'Failed':
      return Icons.times
    case 'Running':
      return Icons.sync
    case 'Cancelled':
      return Icons.ban
    case 'Unknown':
    case null:
    case undefined:
    default:
      return undefined
  }
}

export function getIconFromStages(stages: string[]) {
  return stages
    .map((stage, idx, arr) => {
      const icon = getIconFromStage(stage)
      if (icon === Icons.check && idx === arr.length - 1) {
        return Icons.checkDouble
      }
      return icon
    })
    .filter(x => !!x)
    .pop()
}
