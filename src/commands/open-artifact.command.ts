import { window } from 'vscode'
import { GoCdDocumentStream } from '../gui/go-cd-document-stream'

interface OpenArtifactCommandArgs {
  pipelineName: string
  pipelineCounter: string
  stageName: string
  stageCounter: string
  jobName: string
  jobId: string
  artifact?: string
}

export default function OpenArtifact(args: OpenArtifactCommandArgs) {
  new GoCdDocumentStream(
    args.pipelineName,
    args.pipelineCounter,
    args.stageName,
    args.stageCounter,
    args.jobName,
    args.jobId,
    args.artifact
  ).start()
}
