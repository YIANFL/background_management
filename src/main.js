import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入全局样式表
import '@/assets/css/global.css'
// 引入element-ui按需引入的组件
import '@/plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'
// 引入iconfonts样式
import '@/assets/fonts/iconfont.css'

// 配置axios,导入axios,并将其挂载到vue的原型对象上面
import axios from 'axios'
Vue.prototype.$http = axios
// 设置axios的请求跟路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
