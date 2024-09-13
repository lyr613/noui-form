import { produce } from 'immer'
import { map, Observable, take, tap } from 'rxjs'
import { CheckResult, CtrlDev } from './type'

export function _now<Data extends Record<string, any> = {}>(this: CtrlDev<Data>) {
    return this._value$.value
}

export function _init<Data extends Record<string, any> = {}>(this: CtrlDev<Data>) {
    const value0 = produce(this.original(), () => {})
    return this._value$.next(value0)
}

export function _set<Data extends Record<string, any> = {}>(this: CtrlDev<Data>, setter: (val: Data) => void) {
    const val$ = this._value$
    const next = produce(val$.value, setter)
    val$.next(next)
}
export function _get$<Data extends Record<string, any> = {}>(this: CtrlDev<Data>): Observable<Data>
export function _get$<Data extends Record<string, any> = {}, T extends any = Data>(
    this: CtrlDev<Data>,
    getter: (val: Data) => T,
): Observable<T>
export function _get$<Data extends Record<string, any> = {}, T extends any = Data>(
    this: CtrlDev<Data>,
    getter?: (val: Data) => T,
): Observable<T | Data> {
    const val$ = this._value$
    if (!getter) {
        return val$.pipe()
    }
    return val$.pipe(map(getter))
}

// #region check
export function _check_path<Data extends Record<string, any> = {}>(
    this: CtrlDev<Data>,
    checker: (data: Data) => CheckResult,
    options?: {
        /** default true */
        update_report?: boolean
    },
): CheckResult {
    const now = this._value$.value
    const result = checker(now)
    if (options?.update_report ?? true) {
        const now_report = this._report$.value
        const next_report = produce(now_report, (draft) => {
            draft[result.path] = result
        })
        this._report$.next(next_report)
    }
    return result
}

export function _check$<Data extends Record<string, any> = {}>(
    this: CtrlDev<Data>,
    make: (data: Data) => Observable<Record<string, CheckResult | undefined>>,
    options?: {
        /**
         * 预初始化报告, 设置true时, report$会先初始化为 {}
         * - default false
         */
        pre_init_report?: boolean
        /**
         * 更新报告, 设置true时, report$可以订阅到更新
         * - default true
         */
        update_report?: boolean
        /**
         * 仅吐出一次数据
         * - default true
         */
        take_once?: boolean
    },
): Observable<Record<string, CheckResult | undefined>> {
    const take1 = options?.take_once ?? true
    const update_report = options?.update_report ?? true
    const pre_init_report = options?.pre_init_report ?? false
    const null_tap = tap<Record<string, CheckResult | undefined>>(() => {})
    return make(this._value$.value).pipe(
        take1 ? take(1) : null_tap,
        pre_init_report
            ? tap(() => {
                  this._report$.next({})
              })
            : null_tap,
        update_report
            ? tap((result) => {
                  const now_report = this._report$.value
                  const next_report = produce(now_report, (draft) => {
                      Object.assign(draft, result)
                  })
                  this._report$.next(next_report)
              })
            : null_tap,
    )
}

export function _report$(this: CtrlDev<{}>, options?: {}): Observable<Record<string, CheckResult | undefined>> {
    return this._report$.pipe()
}
