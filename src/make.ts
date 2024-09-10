import { produce } from 'immer'
import { BehaviorSubject, map, Observable } from 'rxjs'
import { Ctrl, CtrlDev, CtrlDevPart, CtrlProtoPart, CtrlSelfPart, deep_path } from './type'
import { _flag, _version } from './infor'
import { _now, _get$, _init, _set, _check_path, _check$, _report, _report$, _report_has_bad } from './protos'
import { compute_path } from './self'

export function make<Data extends Record<string, any> = {}>(original: () => Data): Ctrl<Data> {
    const value0 = produce(original(), () => {})
    const value$ = new BehaviorSubject(value0)
    const self_part: CtrlSelfPart<Data> = {
        original: original,
        paths: compute_path(value0),
    }
    const dev_part: CtrlDevPart<Data> = {
        _value$: value$,
        _report$: new BehaviorSubject(produce({}, () => {})),
        _flag: _flag,
        _version,
    }
    const _dev = {
        ...self_part,
        ...dev_part,
    } as CtrlDev<Data>

    const proto_part: CtrlProtoPart<Data> = {
        now: _now,
        set: _set,
        get$: _get$,
        init: _init,
        check_path: _check_path,
        check$: _check$,
        report: _report,
        report$: _report$,
        report_has_bad: _report_has_bad,
    }
    Object.setPrototypeOf(_dev, proto_part)

    return _dev
}
