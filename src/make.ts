import { produce, enableMapSet } from 'immer'
import { BehaviorSubject } from 'rxjs'
import { _flag, _version } from './infor'
import {
    _check$,
    _get$,
    _init,
    _now,
    _report,
    _report$,
    _set,
    _require,
    _require$,
    _disable,
    _disable$,
} from './protos'
import { compute_path } from './self'
import type { Ctrl, CtrlDev, CtrlDevPart, CtrlProtoPart, CtrlSelfPart } from './type'
import { _helper } from './helper'
enableMapSet()
/**
 * 创建一个表单
 * @param original 函数, 返回表单的初始值
 */
export function make_form<Data extends Record<string, any> = {}>(original: () => Data): Ctrl<Data> {
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
        _requires$: new BehaviorSubject(new Map()),
        _disables$: new BehaviorSubject(new Map()),
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
        check$: _check$,
        report$: _report$,
        report: _report,
        helper: _helper,
        required: _require,
        required$: _require$,
        disabled: _disable,
        disabled$: _disable$,
    }
    Object.setPrototypeOf(_dev, proto_part)

    return _dev
}
