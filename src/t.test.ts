import { describe, expect, test } from '@jest/globals'
import * as noui from './index'
import { map, of, take, timer } from 'rxjs'
import { compute_path } from './self'
jest.useFakeTimers()

describe('self', () => {
    interface Node1 {
        num: number
        str: string
        bool: boolean
        nil: null
        undef: undefined
        li: number[]
        obj: {
            num: number
            li: number[]
            node2: Node2
        }
        node2: Node2
        node1: Node1
    }
    interface Node2 extends Record<string, any> {
        node1: Node1
        str: string
    }
    const node1: Node1 = {
        num: 1,
        str: 'a',
        bool: true,
        nil: null,
        undef: undefined,
        li: [1, 2, 3],
        obj: {
            num: 2,
            li: [4, 5, 6],
            node2: null as any,
        },
        node2: null as any,
        node1: null as any,
    }
    const node2: Node2 = {
        node1,
        str: 'b',
    }
    node1.node1 = node1
    node1.node2 = node2
    node1.obj.node2 = node2

    const cpath = compute_path(node1)

    test('compute_path', () => {
        expect(cpath.num).toBe('num')
        expect(cpath.str).toBe('str')
        expect(cpath.bool).toBe('bool')
        expect(cpath.nil).toBe('nil')
        expect(cpath.undef).toBe('undef')
        expect(cpath.li).toBe('li')
        expect(cpath.obj.num).toBe('obj.num')
        expect(cpath.obj.li).toBe('obj.li')
        expect(cpath.node2.node1).toBe('node2.node1')
        expect(cpath.node2.str).toBe('node2.str')
        expect(cpath.node1).toBe('node1')
    })
})

interface Data {
    name: string
    age: number
    nil: null
    undef: undefined
    family: {
        link: string
        age: number
        links: string[]
    }[]
    other: {
        qqq: number
        www: string
        lll: number[]
    }
    sym: symbol
}

function data(): Data {
    return {
        name: 'orb',
        age: 18,
        nil: null,
        undef: undefined,
        family: [
            {
                link: 'father',
                age: 40,
                links: ['a', 'b'],
            },
            {
                link: 'mother',
                age: 41,
                links: ['a', 'b'],
            },
        ],
        other: {
            qqq: 2333,
            www: 'dddd',
            lll: [2, 3],
        },
        sym: Symbol(),
    }
}

describe('make', () => {
    test('get & set', () => {
        const ctrl = noui.make_form(data)

        expect(ctrl.now().age).toEqual(data().age)

        ctrl.set((f) => {
            f.age = 99
        })
        expect(ctrl.now().age).toBe(99)
        ctrl.init()
        expect(ctrl.now().age).toBe(18)

        ctrl.get$((f) => {
            return f.age
        }).subscribe((f) => {
            expect(f).toBe(18)
        })
    })
})

// #region check
describe('check & report', () => {
    const ctrl = noui.make_form(data)

    const checker$ = ctrl.check$((f) => {
        return [
            {
                note: 'age must > 18',
                path: ctrl.paths.age,
                well: f.age > 18,
            },
        ]
    }, {})
    test('check well', () => {
        ctrl.set((f) => {
            f.age = 19
        })
        checker$.subscribe((r) => {
            expect(r[ctrl.paths.age]?.well).toBe(true)
        })
        ctrl.report$()
            .pipe(take(1))
            .subscribe((f) => {
                expect(f[ctrl.paths.age]?.well).toBe(true)
            })
        ctrl.report$()
            .pipe(ctrl.helper.pipe_report_all_well, take(1))
            .subscribe((b) => {
                expect(b).toBe(true)
            })
        const all_well = ctrl.report({
            only_report_all_well: true,
        })
        expect(all_well).toBe(true)
    })
    test('check bad', () => {
        ctrl.set((f) => {
            f.age = 17
        })
        checker$.subscribe({
            next(value) {},
        })

        const all_well = ctrl.report({})

        expect(all_well).toBe(false)
    })
    test('check delay', () => {
        const checker$ = ctrl.check$((f) => {
            return timer(2000).pipe(
                map(() => ({
                    note: 'age must > 18',
                    path: ctrl.paths.age,
                    well: false,
                })),
            )
        })
        checker$.subscribe((r) => {
            expect(r[ctrl.paths.age]?.well).toBe(false)
        })
        jest.advanceTimersByTime(3000)
    })
})

// #region helper
describe('helper', () => {
    test('buil check result', () => {
        const ctrl = noui.make_form(data)

        const result = ctrl.helper.build_check_result('a', true)
        expect(result.path).toBe('a')
        expect(result.well).toBe(true)
        expect(result.note).toBe('')
    })
    test('pipe_report_has_bad', () => {
        const ctrl = noui.make_form(data)
        const checker$ = ctrl.check$((f) => {
            return ctrl.helper.build_check_result(ctrl.paths.age, false, 'always bad')
        })
        checker$.subscribe()
        ctrl.report$()
            .pipe(ctrl.helper.pipe_report_has_bad)
            .subscribe((b) => {
                expect(b).toBe(true)
            })
    })
    test('pipe_report_all_well', () => {
        const ctrl = noui.make_form(data)
        const checker$ = ctrl.check$((f) => {
            return ctrl.helper.build_check_result(ctrl.paths.age, true)
        })
        checker$.subscribe()
        ctrl.report$()
            .pipe(ctrl.helper.pipe_report_all_well)
            .subscribe((b) => {
                expect(b).toBe(true)
            })
    })
    test('pipe_report_path', () => {
        const ctrl = noui.make_form(data)
        const checker$ = ctrl.check$((f) => {
            return ctrl.helper.build_check_result(ctrl.paths.age, true)
        })
        checker$.subscribe()
        ctrl.report$()
            .pipe(ctrl.helper.pipe_report_path(ctrl.paths.age))
            .subscribe((r) => {
                expect(r.well).toBe(true)
            })
        ctrl.report()
    })
})

// #region require
describe('require', () => {
    test('require', () => {
        const ctrl = noui.make_form(data)
        const b0 = ctrl.required(ctrl.paths.other.qqq)
        expect(b0).toBe(false)
        ctrl.required(ctrl.paths.other.qqq, true)
        const b1 = ctrl.required(ctrl.paths.other.qqq)
        expect(b1).toBe(true)
        ctrl.required$(ctrl.paths.other.qqq).subscribe((b) => {
            expect(b).toBe(true)
        })
    })
})
