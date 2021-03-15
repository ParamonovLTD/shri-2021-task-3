import {
  EMPTY,
  interval,
  merge,
  MonoTypeOperatorFunction,
  Observable,
  of,
} from 'rxjs'
import { filter, mapTo, mergeMap, take, withLatestFrom } from 'rxjs/operators'
import {
  Action,
  actionMessage,
  actionNext,
  actionPrev,
  actionRestart,
  actionTimer,
  actionUpdate,
} from './actions'
import { DELAY, INTERVAL, Slide, State } from './types'

import { stories } from '../data' // импортирую, чтобы понять, сколько раз должен делаться переход на следующую сторис

export function ofType<T extends Action>(
  type: Action['type']
): MonoTypeOperatorFunction<T> {
  return filter(a => type === a.type)
}

export function createEffects(
  actions$: Observable<Action>,
  state$: Observable<State>
): Observable<Action> {
  const timerEffect$ = interval(INTERVAL).pipe(mapTo(actionTimer()))

  const changeSlideEffect$ = timerEffect$.pipe(
    withLatestFrom(state$),
    mergeMap(([a, s]) => (s.progress >= DELAY ? of(actionNext()) : EMPTY)),
    take(stories.length - 1) // повторяется столько раз, сколько сторис, а не фиксированное значение
  )

  const messageEffect$ = actions$.pipe(
    ofType<ReturnType<typeof actionMessage>>('message'),
    mergeMap(a => {
      switch (a.action) {
        case 'go-prev':
          return of(actionPrev())
        case 'go-next':
          return of(actionNext())
        case 'restart':
          return of(actionRestart())
        case 'update':
          const data: Partial<Slide> = JSON.parse(a.params)
          return of(actionUpdate(data))
        default:
          return EMPTY
      }
    })
  )

  return merge(timerEffect$, changeSlideEffect$, messageEffect$)
}
