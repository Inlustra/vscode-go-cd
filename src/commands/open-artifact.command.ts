import { window } from 'vscode'
import { GoCdDocumentStream } from '../gui/go-cd-document-stream'

interface OpenArtifactCommandArgs {
  pipelineName: string
  pipelineCounter: string
  stageName: string
  stageCounter: string
  jobName: string
  artifact: string
}

export default function OpenArtifact(args: OpenArtifactCommandArgs) {
  const message = window.setStatusBarMessage('Streaming ' + args.artifact)
  const stream = new GoCdDocumentStream(
    args.pipelineName,
    args.pipelineCounter,
    args.stageName,
    args.stageCounter,
    args.jobName,
    args.artifact
  )
  stream.onComplete$.subscribe(message.dispose)
  stream.start()
}
