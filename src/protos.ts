import { produce } from 'immer'
import { BehaviorSubject, map, Observable, take } from 'rxjs'
import { Ctrl, CtrlDev, CtrlDevPart, CtrlProtoPart, CtrlSelfPart, deep_path, CheckResult } from './type'

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
export function _check<Data extends Record<string, any> = {}>(
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

export function _check_once$<Data extends Record<string, any> = {}>(
    this: CtrlDev<Data>,
    checker: (data: Data) => Observable<CheckResult>,
    options?: {
        /** default true */
        update_report?: boolean
    },
): Observable<CheckResult> {
    const sub = checker(this._value$.value)
    if (options?.update_report ?? true) {
        sub.pipe(take(1)).subscribe((result) => {
            const now_report = this._report$.value
            const next_report = produce(now_report, (draft) => {
                draft[result.path] = result
            })
            this._report$.next(next_report)
        })
    }
    return sub.pipe(take(1))
}

export function _report(this: CtrlDev<any>, path: string): CheckResult | undefined {
    return this._report$.value[path]
}
export function _report$(this: CtrlDev<any>, path: string): Observable<CheckResult | undefined> {
    return this._report$.pipe(map((report) => report[path]))
}
