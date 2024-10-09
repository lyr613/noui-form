import { map } from 'rxjs'
import type { CheckResult, Ctrl } from './type'

export function build_check_result(path: string, well: boolean, note?: string): CheckResult {
    return {
        well,
        path,
        note: note || '',
    }
}

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

export const pipe_report_path = (path: string) =>
    map<Record<string, CheckResult | undefined>, CheckResult>((report) => {
        return report[path] || build_check_result(path, true)
    })

export const clear_path_report = (ctrl: Ctrl<any>, path: string) => {
    ctrl.check$(
        () => {
            return build_check_result(path, true)
        },
        {
            pre_init_report: false,
        },
    ).subscribe()
}

export const _helper = {
    build_check_result,
    pipe_report_has_bad,
    pipe_report_all_well,
    pipe_report_path,
    clear_path_report,
}
