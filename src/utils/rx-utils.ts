import { Observable } from 'rxjs'
import { retryWhen, delay, take } from 'rxjs/operators'

export namespace RxUtils {
  export const retryWithDelay = (delayMs: number, retries: number) => <T>(
    source: Observable<T>
  ) =>
    source.pipe(
      retryWhen(errors =>
        errors.pipe(
          delay(delayMs),
          take(retries)
        )
      )
    )
}
