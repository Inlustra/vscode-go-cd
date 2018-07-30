import * as vscode from 'vscode'
import * as winston from 'winston'
import { Writable } from 'stream'

let channel: vscode.OutputChannel
export let Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.cli(),
    winston.format.uncolorize(),
  ),
  transports: [new winston.transports.Console()]
})

export function initLogger(level: string) {
  channel = channel || vscode.window.createOutputChannel('Go CD')
  const stream = new VscodeOutputChannelStream(channel)
  Logger.clear().add(new winston.transports.Stream({ stream }))
  Logger.level = level
  Logger.log(level, `Initialised logger with level: ${level}`)
}

export class VscodeOutputChannelStream extends Writable {
  constructor(private channel: vscode.OutputChannel) {
    super({ objectMode: false })
  }

  _write(chunk: any, encoding: string, next: Function) {
    this.channel.append(chunk.toString())
    next()
  }
}

