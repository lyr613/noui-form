import { BehaviorSubject, Observable, OperatorFunction } from 'rxjs'

// #region ctrl func
export type ctrl_proto_check_param_make<Data extends Record<string, any> = {}> = (
    data: Data,
) => Observable<CheckResult[] | CheckResult> | CheckResult[] | CheckResult
export type ctrl_proto_check_param_options<Data extends Record<string, any> = {}> = {
    /**
     * 预初始化报告, 设置true时, report$会先初始化为 {}
     * - default true
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
}
export type ctrl_proto_check_return<Data extends Record<string, any> = {}> = Observable<
    Record<string, CheckResult | undefined>
>
export type ctrl_proto_report_param_options<ORAW extends boolean | undefined> = {
    /** 仅报告是否所有结果都正确
     * - default true
     */
    only_report_all_well?: ORAW
}
export type ctrl_proto_report_return<ORAW extends boolean | undefined> = ORAW extends false
    ? Record<string, CheckResult | undefined>
    : boolean

// #region ctrl

export interface Ctrl<Data extends Record<string, any> = {}> extends CtrlProtoPart<Data>, CtrlSelfPart<Data> {}

/** 开发库内部使用 */
export interface CtrlDev<Data extends Record<string, any> = {}> extends Ctrl<Data>, CtrlDevPart<Data> {}

// #region ctrl part

/** 每个ctrl自己持有 */
export interface CtrlSelfPart<Data extends Record<string, any> = {}> {
    /**
     * ## 路径树
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
     * 通过参数make返回一个可订阅检查结果, 可多次订阅
     * @param make 创建一个检查函数, 返回一个可订阅检查结果, 可多次订阅
     * @param options
     */
    check$(
        make: ctrl_proto_check_param_make<Data>,
        options?: ctrl_proto_check_param_options<Data>,
    ): ctrl_proto_check_return<Data>
    /**
     * ## 订阅检查结果
     * - 仅需要报告中是否有错误 ctrl.report$().pipe(noui.helper.pipe_report_has_bad)
     *
     * @param options
     */
    report$(): Observable<Record<string, CheckResult | undefined>>
    /**
     * 当前报告
     * - 如果未设置参数, 将返回一个boolean, 表示是否所有结果都正确
     */
    report<ORAW extends boolean | undefined>(
        options?: ctrl_proto_report_param_options<ORAW>,
    ): ctrl_proto_report_return<ORAW>
    /** 辅助方法 */
    helper: CtrlHelper
}

export interface CtrlHelper {
    build_check_result(path: string, well: boolean, note?: string): CheckResult
    /**
     * 管道map, 报告中是否有坏结果
     * @see pipe_report_all_well 和pipe_report_all_well的值相反
     */
    pipe_report_has_bad: OperatorFunction<Record<string, CheckResult | undefined>, boolean>
    /**
     * 管道map, 报告中是否所有结果都正确
     * @see pipe_report_has_bad 和pipe_report_has_bad的值相反
     */
    pipe_report_all_well: OperatorFunction<Record<string, CheckResult | undefined>, boolean>
    pipe_report_path(path: string): OperatorFunction<Record<string, CheckResult | undefined>, CheckResult>
    clear_path_report(ctrl: Ctrl<any>, path: string): void
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

// #region compute keys
type filter_never<T> = {
    [K in keyof T as T[K] extends never ? never : K]: T[K] extends Record<string, any> ? filter_never<T[K]> : T[K]
}
type deep_path_step1<KV extends Record<string, any>> = {
    [K in keyof KV & string]: KV[K] extends number | string | boolean | null | undefined
        ? string
        : KV[K] extends any[]
        ? string
        : KV[K] extends Record<string, any>
        ? deep_path_step1<KV[K]>
        : never
}
export type deep_path<KV extends Record<string, any>> = filter_never<deep_path_step1<KV>>
