import { produce } from 'immer'
import { map, Observable, of, switchMap, take, tap } from 'rxjs'
import {
    CheckResult,
    CtrlDev,
    ctrl_proto_check_param_make,
    ctrl_proto_check_param_options,
    ctrl_proto_check_return,
    ctrl_proto_report_param_options,
    ctrl_proto_report_return,
} from './type'

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
    make: ctrl_proto_check_param_make<Data>,
    options?: ctrl_proto_check_param_options<Data>,
): ctrl_proto_check_return<Data> {
    const take1 = options?.take_once ?? true
    const update_report = options?.update_report ?? true
    const pre_init_report = options?.pre_init_report ?? false

    const start = of(null)

    const publisher_li = start.pipe(
        switchMap(() => {
            const maked = make(this._value$.value)
            if ('pipe' in maked) {
                return maked
            }
            return of(maked)
        }),
        map((x) => (Array.isArray(x) ? x : [x])),
    )

    // 处理列表为对象
    const publisher_kv = publisher_li.pipe(
        map((li) => {
            const result: Record<string, CheckResult> = {}
            loop: for (const item of li) {
                const pre = result[item.path]
                if (!pre) {
                    result[item.path] = item
                } else {
                    switch (options?.same_path_merge) {
                        case 'use first':
                            continue loop
                            break
                        case 'use last':
                            result[item.path] = item
                            break
                        case 'some well':
                            if (pre.well) {
                                continue
                            }
                            break
                        case 'some bad':
                        default:
                            if (!pre.well) {
                                continue
                            }
                            break
                    }
                }
            }
            return result
        }),
    )
    // 处理是否只吐出一次
    const publisher_taked = take1 ? publisher_kv.pipe(take(1)) : publisher_kv
    // 处理是否初始化报告
    const publisher_pre_init = pre_init_report
        ? publisher_taked.pipe(tap(() => this._report$.next({})))
        : publisher_taked
    // 处理是否更新报告
    const publisher_report = update_report
        ? publisher_pre_init.pipe(
              tap((result) => {
                  const now_report = this._report$.value
                  const next_report = produce(now_report, (draft) => {
                      Object.assign(draft, result)
                  })
                  this._report$.next(next_report)
              }),
          )
        : publisher_pre_init

    return publisher_report
}

// #region report
export function _report$(this: CtrlDev<{}>): Observable<Record<string, CheckResult | undefined>> {
    return this._report$.pipe()
}

export function _report<ORAW extends boolean | undefined>(
    this: CtrlDev<{}>,
    options?: ctrl_proto_report_param_options<ORAW>,
): ctrl_proto_report_return<ORAW> {
    const only_report_all_well = options?.only_report_all_well ?? true
    const report = this._report$.value
    if (only_report_all_well) {
        return Object.values(report).every((x) => {
            if (!x) {
                return true
            }
            return x.well
        }) as ctrl_proto_report_return<ORAW>
    }
    return report as ctrl_proto_report_return<ORAW>
}
