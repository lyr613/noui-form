import { produce } from 'immer'
import { map, Observable, of, take, tap } from 'rxjs'
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
    make: (data: Data) => Observable<CheckResult[] | CheckResult> | CheckResult[] | CheckResult,
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
        /**
         * 同路径如何合并结果
         * - default 'some bad'
         * - 'some bad' 有一个坏就坏
         * - 'some well' 有一个好就好
         * - 'use first' 优先使用第一个
         * - 'use last' 优先使用最后一个
         */
        same_path_merge?: 'some bad' | 'some well' | 'use first' | 'use last'
    },
): Observable<Record<string, CheckResult | undefined>> {
    const take1 = options?.take_once ?? true
    const update_report = options?.update_report ?? true
    const pre_init_report = options?.pre_init_report ?? false

    const maked = make(this._value$.value)
    const publish_start = 'pipe' in maked ? maked : of(maked)
    const publisher_li = publish_start.pipe(map((x) => (Array.isArray(x) ? x : [x])))
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

export function _report$(this: CtrlDev<{}>, options?: {}): Observable<Record<string, CheckResult | undefined>> {
    return this._report$.pipe()
}
