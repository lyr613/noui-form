import { produce } from 'immer'
import { BehaviorSubject, map, Observable } from 'rxjs'
import { Ctrl, CtrlDev, CtrlDevPart, CtrlProtoPart, CtrlSelfPart, deep_path } from './type'
import { _flag, _version } from './infor'
import { _now, _get$, _init, _set, _check, _check_once$, _report, _report$ } from './protos'
import { compute_path } from './self'

export function make<Data extends Record<string, any> = {}>(original: () => Data): Ctrl<Data> {
    const value0 = produce(original(), () => {})
    const value$ = new BehaviorSubject(value0)
    const selfs: CtrlSelfPart<Data> = {
        original: original,
        paths: compute_path(value0),
    }
    const dev_part: CtrlDevPart<Data> = {
        _value$: value$,
        _report$: new BehaviorSubject(produce({}, () => {})),
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
        check: _check,
        check_once$: _check_once$,
        report: _report,
        report$: _report$,
    }
    Object.setPrototypeOf(c, protos)

    return c as any
}
