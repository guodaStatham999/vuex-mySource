import { forEachValue } from '../utils'

export default // 添加孩子或者获取孩子的操作都抽离到这个类上面
class Module {
    // 使用类的原因,方便扩展. 对象和方法都写在一起了.
    constructor(rawModule) {
        this._raw = rawModule
        this.state = rawModule.state
        this._children = {}
        this.namespaced = rawModule.namespaced; // 自己是否有命名空间
    }

    addChild(key, module) {
        this._children[key] = module;
    }

    getChild(key) {
        return this._children[key]
    }

    forEachChild(fn){
        return forEachValue(this._children,fn)
    }

    forEachGetter(fn){
        if(this._raw.getters){
            forEachValue(this._raw.getters,fn)
        }
    }
    forEachMutation(fn){
        if(this._raw.mutations){
            forEachValue(this._raw.mutations,fn)
        }
    }
    forEachAction(fn){
        if(this._raw.actions){
            forEachValue(this._raw.actions,fn)
        }
    }


}