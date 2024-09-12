import type { Ctrl, CtrlDev, CtrlDevPart, CtrlProtoPart, CtrlSelfPart, deep_path, CheckResult } from './type'
import { map } from 'rxjs'

export const report_has_bad = map<Record<string, CheckResult | undefined>, boolean>((report) => {
    return Object.values(report).some((v) => {
        if (v === undefined) {
            return false
        }
        if (v.well === false) {
            return true
        }
        return false
    })
})
