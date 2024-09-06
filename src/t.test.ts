import { describe, expect, test } from '@jest/globals'
import { noui } from './index'
import { take } from 'rxjs'

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

describe('sum module', () => {
    test('qqq', () => {
        const ctrl = noui.make(data)
        // console.log('---')
        // console.log(
        //     'keys',
        //     Object.getPrototypeOf(ctrl).now,
        //     Object.getPrototypeOf(ctrl2).now,
        //     Object.getPrototypeOf(ctrl).now === Object.getPrototypeOf(ctrl2).now,
        //     ctrl.now(),
        // )

        // console.log('---')

        expect(ctrl.now().age).toEqual(data().age)

        ctrl.set((f) => {
            f.age = 99
        })
        expect(ctrl.now().age).toBe(99)
        // ctrl.get$((f) => f.age)
        //     .pipe(take(1))
        //     .subscribe((val) => {
        //         expect(val).toBe(99)
        //     })
        ctrl.init()
        expect(ctrl.now().age).toBe(18)

        ctrl.get$((f) => {
            return f.age
        }).subscribe((f) => {
            console.log(f)
        })
    })
})
