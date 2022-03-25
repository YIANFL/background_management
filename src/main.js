import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入插件
import ZkTable from 'vue-table-with-tree-grid'
// 导入全局样式表
import '@/assets/css/global.css'
// 引入element-ui按需引入的组件
import '@/plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'
// 引入iconfonts样式
import '@/assets/fonts/iconfont.css'

// 配置axios,导入axios,并将其挂载到vue的原型对象上面
import axios from 'axios'

// d导入富文本编辑器及相关的样式
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor /* { default global options } */)

// 注册插件
Vue.component('tree-table', ZkTable)
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('TOKEN')
  return config
})
// 注册全局的时间过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}-${mm}-${ss}`
})
Vue.prototype.$http = axios
// 设置axios的请求跟路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
