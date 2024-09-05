import { BehaviorSubject, Observable } from 'rxjs'

export interface Ctrl<Value extends Record<string, any> = {}> {
    /**
     * @deprecated
     * only developer use this
     */
    __anemia: Anemia<Value>
    keys: deep_keys<Value>
    default_value: () => default_value
    now(): Value
    set(setter: (val: Value) => void): void
    get$<T extends any = null>(getter: (val: Value) => T): Observable<T>
    init(): void
}

export interface Anemia<Value extends Record<string, any> = {}> {
    value$: BehaviorSubject<Value>
    default_value: () => default_value
}

// compute keys
type filter_never<T> = {
    [K in keyof T as T[K] extends never ? never : K]: T[K] extends Record<string, any> ? filter_never<T[K]> : T[K]
}
type deep_keys_step1<Value extends Record<string, any>> = {
    [K in keyof Value & string]: Value[K] extends number | string | boolean | null | undefined
        ? string
        : Value[K] extends any[]
        ? never
        : Value[K] extends Record<string, any>
        ? deep_keys_step1<Value[K]>
        : never
}
export type deep_keys<Value extends Record<string, any>> = filter_never<deep_keys_step1<Value>>

export type only_function<KV extends Record<string, any>> = {
    [K in keyof KV & string as KV[K] extends Function ? K : never]: Function
}
type OmitKeys<T, K> = {
    [P in keyof T & string as P extends keyof K ? never : P]: T[P]
}
export type without_function<KV extends Record<string, any> = {}> = OmitKeys<Ctrl<KV>, only_function<Ctrl<{}>>>
