# noui-form

## 基本使用

创建一个表单

```typescript
import { make_form } from '@lyr613/noui-form'

interface User {
    id: string
    name: string
    age: number
}

function make_user(): User {
    return {
        id: '1',
        name: 'aa',
        age: 12,
    }
}

const ctrl = make_form(make_user)
// ctrl自动获取了User类型, 在之后修改和获取值时即可获取到类型提示
```

获取当前值/修改值

```typescript
const now = ctrl.now() // { id: '1', name: 'aa', age: 12 }
// now.age = 13 // throw error
// 获取到的值是只读的, 无法修改

const now_age = ctrl.now().age // 12
ctrl.set((f) => {
    f.age = 13
})
const now_age2 = ctrl.now().age // 13
```

订阅值(创建一个 rxjs 的订阅对象)

```typescript
ctrl.get$().subscribe((user) => {
    console.log(user)
})
ctrl.get$((f) => f.age).subscribe((age) => {
    console.log(age)
})
// 通过订阅对象可以获取到当前值, 并且在值发生变化时会触发回调
// 在react等框架中, 使用 useObservable 等hook可以方便的订阅值
```

## 检查表单

```typescript
const check_add = ctrl.check$((f) => {
    return ctrl.helper.build_check_result(ctrl.paths.age, f.age > 18, '年龄必须大于18')
})
const check_update = ctrl.check$((f) => {
    return [
        ctrl.helper.build_check_result(ctrl.paths.age, f.age > 18, '年龄必须大于18'),
        ctrl.helper.build_check_result(ctrl.paths.id, Boolean(f.id), 'id不能为空'),
    ]
})
// 提前声明检查添加/更新, 此时并不执行检查
check_add.subscribe()
check_update.subscribe((r) => {
    console.log(r)
})
// 在任意地方执行检查
ctrl.report({
    only_report_all_well: false,
}) // 获取当前的检查结果
ctrl.report$().subscribe((r) => {
    console.log(r)
})
// 通过订阅对象可以获取到当前的检查结果, 并且在值发生变化时会触发回调
```

## 必填

```typescript
ctrl.required(ctrl.paths.id, true) // void 设置id为必填
ctrl.required(ctrl.paths.id) // true 获取id是否必填
ctrl.required$(ctrl.paths.id).subscribe((r) => {
    console.log(r)
}) // 订阅id是否必填
```

## 禁用

```typescript
ctrl.disabled(ctrl.paths.id, true) // void 禁用id
ctrl.disabled(ctrl.paths.id) // true 获取id是否禁用
ctrl.disabled$(ctrl.paths.id).subscribe((r) => {
    console.log(r)
}) // 订阅id是否禁用
```
