//  导入vue
import Vue from 'vue'
// 导入需要的组件
import { Button, FormItem, Input, Form, Message } from 'element-ui'

// 注册为全局组件
Vue.component(Button.name, Button)
Vue.component(FormItem.name, FormItem)
Vue.component(Input.name, Input)
Vue.component(Form.name, Form)

Vue.prototype.$message = Message
