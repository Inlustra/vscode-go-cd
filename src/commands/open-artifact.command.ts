import { State } from '../state'
import { switchMap } from 'rxjs/operators'

interface OpenArtifactCommandArgs {
  pipelineName: string
  pipelineCounter: string
  stageName: string
  stageCounter: string
  jobName: string
  artifact: string
}

export default function OpenArtifact(args: OpenArtifactCommandArgs) {
  State.getArtifactFile(
    args.pipelineName,
    args.pipelineCounter,
    args.stageName,
    args.stageCounter,
    args.jobName,
    args.artifact
  )
    .pipe(switchMap(file => console.log(file) || file))
    .subscribe()
}
