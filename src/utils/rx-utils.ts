import { Observable } from 'rxjs'
import { retryWhen, delay, take, tap } from 'rxjs/operators'
import * as winston from 'winston'

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

  export const log = (logger: winston.Logger, level: string) => <T>(
    source: Observable<T>
  ) =>
    source.pipe(
      tap(message =>
        logger.log(
          level,
          typeof message !== 'string' ? JSON.stringify(message) : message
        )
      )
    )
}
