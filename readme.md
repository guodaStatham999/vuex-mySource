### 解释部分:
- 这个git项目是讲解vuex源码,会带着讲一遍功能,然后一点点实现一遍.

- vuex4-lesson-cli是一个可执行项目,没配置路由,只是假如了babel和vuex4

- vuex解决的是不同组件间的通信



vuex4流程解释: 
总解释: vuex4的是把一个公用的对象(store),会把他放到每个使用的容器上,这样每个容器就可以使用了.

provide和inject的实现原理: 
    组价的创建肯定是先创建父亲,再创建儿子吧
    在父亲创建的时候,儿子创建的时候就可以拿到父亲的数据.  也就是永远可以拿到前辈的数据.

