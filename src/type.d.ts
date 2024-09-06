import { BehaviorSubject, Observable } from 'rxjs'

export interface Ctrl<Data extends Record<string, any> = {}> extends CtrlProtoPart<Data>, CtrlSelfPart<Data> {}

export interface CtrlSelfPart<Data extends Record<string, any> = {}> {
    keys: deep_keys<Data>
    /** 初始值 */
    original: () => Data
}

export interface CtrlProtoPart<Data extends Record<string, any> = {}> {
    now(): Data
    set(setter: (data: Data) => void): void
    get$(): Observable<Data>
    get$<T extends any = Data>(getter: (data: Data) => T): Observable<T>
    init(): void
}

export interface CtrlDevPart<Data extends Record<string, any> = {}> {
    _version: () => [number, number, number]
    _flag: () => 'qsoft'
    _value$: BehaviorSubject<Data>
}
export interface CtrlDev<Data extends Record<string, any> = {}> extends Ctrl<Data>, CtrlDevPart<Data> {}

// compute keys
type filter_never<T> = {
    [K in keyof T as T[K] extends never ? never : K]: T[K] extends Record<string, any> ? filter_never<T[K]> : T[K]
}
type deep_keys_step1<KV extends Record<string, any>> = {
    [K in keyof KV & string]: KV[K] extends number | string | boolean | null | undefined
        ? string
        : KV[K] extends any[]
        ? never
        : KV[K] extends Record<string, any>
        ? deep_keys_step1<KV[K]>
        : never
}
export type deep_keys<KV extends Record<string, any>> = filter_never<deep_keys_step1<KV>>

export type only_function<KV extends Record<string, any>> = {
    [K in keyof KV & string as KV[K] extends Function ? K : never]: Function
}
type OmitKeys<T, K> = {
    [P in keyof T & string as P extends keyof K ? never : P]: T[P]
}
export type without_function<KV extends Record<string, any> = {}> = OmitKeys<Ctrl<KV>, only_function<Ctrl<{}>>>
