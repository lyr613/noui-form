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
        /** default true */
        update_report?: boolean
        /** default true */
        take_once?: boolean
    },
): Observable<Record<string, CheckResult | undefined>> {
    const take1 = options?.take_once ?? true
    const update_report = options?.update_report ?? true
    const null_tap = tap<Record<string, CheckResult | undefined>>(() => {})
    return make(this._value$.value).pipe(
        take1 ? take(1) : null_tap,
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

export function _report(
    this: CtrlDev<{}>,
    options?: {
        /** default true */
        only_bad?: boolean
    },
): Record<string, CheckResult | undefined> {
    const only_bad = options?.only_bad ?? true
    const report = this._report$.value
    return filter_report_only_bad(report, only_bad)
}

export function _report$(
    this: CtrlDev<{}>,
    options?: {
        /** default true */
        only_bad?: boolean
    },
): Observable<Record<string, CheckResult | undefined>> {
    return this._report$.pipe(
        map((report) => {
            const only_bad = options?.only_bad ?? true
            return filter_report_only_bad(report, only_bad)
        }),
    )
}

function filter_report_only_bad(
    report: Record<string, CheckResult | undefined>,
    only_bad: boolean,
): Record<string, CheckResult | undefined> {
    if (!only_bad) {
        return report
    }
    return produce({}, (draft: Record<string, CheckResult | undefined>) => {
        Object.keys(report).forEach((key) => {
            const v = report[key]
            if (v?.well === false) {
                draft[key] = v
            }
        })
    })
}

export function _report_has_bad(this: CtrlDev<{}>): boolean {
    return Object.values(this._report$.value).some((v) => {
        if (v === undefined) {
            return false
        }
        if (v.well === false) {
            return true
        }
        return false
    })
}
