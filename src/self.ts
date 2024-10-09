import { deep_path } from './type'

export function compute_path<Data extends Record<string, any> = {}>(value: Data): deep_path<Data> {
    const r: any = {}
    let key_queue = Object.keys(value).map((key) => ({
        from: value,
        to: r,
        key,
        pre_key: '',
    }))
    // 防止循环引用
    const check_graph = new Set()
    check_graph.add(value)
    let limit_rest = 2000
    while (key_queue.length) {
        limit_rest--
        if (limit_rest <= 0) {
            break
        }
        const cur = key_queue.shift()!
        const cur_from_value = cur.from[cur.key]
        const cur_key = cur.pre_key ? cur.pre_key + '.' + cur.key : cur.key

        switch (typeof cur_from_value) {
            case 'boolean':
            case 'number':
            case 'undefined':
            case 'string':
                cur.to[cur.key] = cur_key
                break
            case 'object':
                if (cur_from_value === null) {
                    cur.to[cur.key] = cur_key
                } else if (Array.isArray(cur_from_value)) {
                    cur.to[cur.key] = cur_key
                } else if (Object.prototype.toString.call(cur_from_value).toLowerCase() === '[object object]') {
                    cur.to[cur.key] = {}

                    if (check_graph.has(cur_from_value)) {
                        cur.to[cur.key] = cur_key
                        break
                    }
                    check_graph.add(cur_from_value)
                    Object.keys(cur_from_value).forEach((child_key) => {
                        key_queue.push({
                            from: cur_from_value,
                            to: cur.to[cur.key],
                            key: child_key,
                            pre_key: cur_key,
                        })
                    })
                }
                break

            default:
                cur.to[cur.key] = cur_key
                break
        }
    }
    return r
}
