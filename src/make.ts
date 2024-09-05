import { BehaviorSubject, map, Observable, take } from 'rxjs'
import { Ctrl, Anemia, deep_keys, without_function, only_function } from './type'
import { produce } from 'immer'

export function make<Value extends Record<string, any> = {}>(default_value: () => Value): Ctrl<Value> {
    const value0 = produce(default_value(), (def) => {
        return def
    })
    const value$ = new BehaviorSubject(value0)
    const c: without_function<Value> = {
        __anemia: {
            value$,
            default_value,
        },
        keys: make_keys(value0),
    }
    const funs: only_function<Ctrl<{}>> = {
        default_value,
        now: _now,
        set: _set,
        get$: _get$,
        init: _init,
    }
    Object.setPrototypeOf(c, funs)

    return c as any
}

function _now<Value extends Record<string, any> = {}>(this: without_function<Value>) {
    return this.__anemia.value$.value
}
function _init<Value extends Record<string, any> = {}>(this: without_function<Value>) {
    const value0: any = produce(this.__anemia.default_value(), (def: any) => {
        return def
    })
    return this.__anemia.value$.next(value0)
}

function _set<Value extends Record<string, any> = {}>(this: without_function<Value>, setter: (val: Value) => void) {
    const val$ = this.__anemia.value$
    const next = produce(val$.value, setter)
    val$.next(next)
}
function _get$<Value extends Record<string, any> = {}, T extends any = null>(
    this: without_function<Value>,
    getter: (val: Value) => T,
): Observable<T> {
    const val$ = this.__anemia.value$
    return val$.pipe(map(getter))
}

function make_keys<Value extends Record<string, any> = {}>(value: Value): deep_keys<Value> {
    const r: any = {}
    let key_queue = Object.keys(value).map((key) => ({
        from: value,
        to: r,
        key,
        pre_key: '',
    }))
    while (key_queue.length) {
        const cur = key_queue.shift()!
        const cur_from_value = cur.from[cur.key]
        const cur_key = cur.pre_key ? cur.pre_key + '.' + cur.key : cur.key

        switch (typeof cur_from_value) {
            case 'boolean':
            case 'number':
            case 'undefined':
            case 'string':
                cur.to[cur.key] = cur_key
                break
            case 'object':
                if (cur_from_value === null) {
                    cur.to[cur.key] = cur_key
                } else if (Object.prototype.toString.call(cur_from_value).toLowerCase() === '[object object]') {
                    cur.to[cur.key] = {}

                    Object.keys(cur_from_value).forEach((child_key) => {
                        key_queue.push({
                            from: cur_from_value,
                            to: cur.to[cur.key],
                            key: child_key,
                            pre_key: cur_key,
                        })
                    })
                }

            default:
                break
        }
    }
    return r
}
