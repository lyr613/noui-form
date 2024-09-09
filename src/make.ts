import { produce } from 'immer'
import { BehaviorSubject, map, Observable } from 'rxjs'
import { Ctrl, CtrlDev, CtrlDevPart, CtrlProtoPart, CtrlSelfPart, deep_path } from './type'
import { _flag, _version } from './infor'
import { _now, _get$, _init, _set } from './protos'
import { compute_path } from './self'

export function make<Data extends Record<string, any> = {}>(original: () => Data): Ctrl<Data> {
    const value0 = produce(original(), (v0) => {
        return v0
    })
    const value$ = new BehaviorSubject(value0)
    const selfs: CtrlSelfPart<Data> = {
        original: original,
        paths: compute_path(value0),
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
