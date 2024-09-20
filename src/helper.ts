import { map } from 'rxjs'
import type { CheckResult } from './type'

/**
 * 管道map, 报告中是否有坏结果
 * @see pipe_report_all_well 和pipe_report_all_well的值相反
 */
export const pipe_report_has_bad = map<Record<string, CheckResult | undefined>, boolean>((report) => {
    return Object.values(report).some((v) => {
        if (v === undefined) {
            return false
        }
        return !v.well
    })
})

/**
 * 管道map, 报告中是否所有结果都正确
 * @see pipe_report_has_bad 和pipe_report_has_bad的值相反
 */
export const pipe_report_all_well = map<Record<string, CheckResult | undefined>, boolean>((report) => {
    return Object.values(report).some((v) => {
        if (v === undefined) {
            return true
        }
        return v.well
    })
})
