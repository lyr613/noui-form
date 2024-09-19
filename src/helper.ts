import { map } from 'rxjs'
import type { CheckResult } from './type'

export const pipe_report_has_bad = map<Record<string, CheckResult | undefined>, boolean>((report) => {
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
