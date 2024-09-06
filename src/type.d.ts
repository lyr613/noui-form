import { BehaviorSubject, Observable } from 'rxjs'

export interface Ctrl<Data extends Record<string, any> = {}> {
    /**
     * @deprecated
     * only developer use this
     */
    __anemia: Anemia<Data>
    keys: deep_keys<Data>
    default_value: () => default_value
    now(): Data
    set(setter: (val: Data) => void): void
    get$(): Observable<Data>
    get$<T extends any = Data>(getter: (val: Data) => T): Observable<T>
    init(): void
}
// #region private
type version = () => [number, number, number]

export interface Anemia<Data extends Record<string, any> = {}> {
    value$: BehaviorSubject<Data>
    default_value: () => default_value
}

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
