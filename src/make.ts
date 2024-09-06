import { produce } from 'immer'
import { BehaviorSubject, map, Observable } from 'rxjs'
import { Ctrl, CtrlDev, CtrlDevPart, CtrlProtoPart, CtrlSelfPart, deep_keys } from './type'
import { _flag, _version } from './infor'
import { _now, _get$, _init, _set } from './protos'

export function make<Data extends Record<string, any> = {}>(original: () => Data): Ctrl<Data> {
    const value0 = produce(original(), (v0) => {
        return v0
    })
    const value$ = new BehaviorSubject(value0)
    const selfs: CtrlSelfPart<Data> = {
        original: original,
        keys: compute_keys(value0),
    }
    const dev_part: CtrlDevPart<Data> = {
        _value$: value$,
        _flag: _flag,
        _version,
    }
    const c = {
        ...selfs,
        ...dev_part,
    }

    const protos: CtrlProtoPart<Data> = {
        now: _now,
        set: _set,
        get$: _get$,
        init: _init,
    }
    Object.setPrototypeOf(c, protos)

    return c as any
}

function compute_keys<Data extends Record<string, any> = {}>(value: Data): deep_keys<Data> {
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
