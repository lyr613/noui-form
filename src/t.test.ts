import { describe, expect, test } from '@jest/globals'
import { noui } from './index'
import { map, of, take, timer } from 'rxjs'
import { compute_path } from './self'

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
    console.log(cpath)

    test('compute_path', () => {
        expect(cpath.num).toBe('num')
        expect(cpath.str).toBe('str')
        expect(cpath.bool).toBe('bool')
        expect(cpath.nil).toBe('nil')
        expect(cpath.undef).toBe('undef')
        // expect(cpath.li).toBe('li')
        expect(cpath.obj.num).toBe('obj.num')
        // expect(cpath.obj.li).toBe('obj.li')
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
        const ctrl = noui.make(data)

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
    const ctrl = noui.make(data)
    ctrl.set((f) => {
        f.age = 19
    })
    const ter = ctrl.check$((f) => {
        return of({
            [ctrl.paths.age]: {
                note: 'age must > 18',
                path: ctrl.paths.age,
                well: true,
            },
        })
    })
    ter.subscribe((r) => {
        expect(r[ctrl.paths.age]?.well).toBe(true)
    })
    test('check', () => {
        ctrl.report$().subscribe((f) => {
            expect(f[ctrl.paths.age]?.well).toBe(true)
        })
        ctrl.report$()
            .pipe(noui.helper.report_has_bad)
            .subscribe((b) => {
                expect(b).toBe(false)
            })
    })
})
