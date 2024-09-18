import { BehaviorSubject, Observable } from 'rxjs'

export interface Ctrl<Data extends Record<string, any> = {}> extends CtrlProtoPart<Data>, CtrlSelfPart<Data> {}

/** 每个ctrl自己持有 */
export interface CtrlSelfPart<Data extends Record<string, any> = {}> {
    /**
     * ## 所有路径
     * 仅处理基本类型(number, string, boolean, null, undefined)和kv的object对象
     * - e. g. {a: 1, b: {c: 2}} => {a: 'a', b: {c: 'b.c'}}
     */
    paths: deep_path<Data>
    /** 初始值 */
    original: () => Data
}

/** 挂在原型上的方法 */
export interface CtrlProtoPart<Data extends Record<string, any> = {}> {
    /** 获取当前值
     * - 返回一个冻结对象, 无法修改
     */
    now(): Data
    /**
     * 更新值
     * @param setter 传入一个函数, 该函数接收当前值, 返回新值
     */
    set(setter: (data: Data) => void): void
    /**
     * 订阅当前值
     */
    get$(): Observable<Data>
    get$<T extends any = Data>(getter: (data: Data) => T): Observable<T>
    /** 初始化值, 使用构建ctrl时的函数 */
    init(): void

    /**
     *
     * @param make 创建一个检查函数, 返回一个可订阅检查结果, 可多次使用
     * @param options
     */
    check$(
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
    ): Observable<Record<string, CheckResult | undefined>>
    /**
     * ## 订阅检查结果
     * - 仅需要报告中是否有错误 ctrl.report$().pipe(noui.helper.report_has_bad)
     *
     * @param options
     */
    report$(options?: {}): Observable<Record<string, CheckResult | undefined>>
}

export interface CheckResult {
    path: string
    well: boolean
    note: string
}

/** 开发库内部使用 */
export interface CtrlDevPart<Data extends Record<string, any> = {}> {
    _version: () => [number, number, number]
    _flag: () => '@lyr613/noui-form'
    _value$: BehaviorSubject<Data>
    _report$: BehaviorSubject<Record<string, CheckResult | undefined>>
}
/** 开发库内部使用 */
export interface CtrlDev<Data extends Record<string, any> = {}> extends Ctrl<Data>, CtrlDevPart<Data> {}

// compute keys
type filter_never<T> = {
    [K in keyof T as T[K] extends never ? never : K]: T[K] extends Record<string, any> ? filter_never<T[K]> : T[K]
}
type deep_path_step1<KV extends Record<string, any>> = {
    [K in keyof KV & string]: KV[K] extends number | string | boolean | null | undefined
        ? string
        : KV[K] extends any[]
        ? never
        : KV[K] extends Record<string, any>
        ? deep_path_step1<KV[K]>
        : never
}
export type deep_path<KV extends Record<string, any>> = filter_never<deep_path_step1<KV>>
