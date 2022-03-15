<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            clearable
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4"
          ><el-button type="primary" @click="isAddDialog = true"
            >添加用户</el-button
          ></el-col
        >
      </el-row>
      <!-- 用户模版列 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <!-- 直接向默认存在的插槽放置内容,而且默认插槽已经传递了一个数据scope,获得一行的数据
            通过scope.row获得一行的数据
           -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- {{ scope.row }} -->
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->

            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加用户的对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="isAddDialog"
        width="50%"
        @close="addDialogClosed"
      >
        <!-- 内容主体区域 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isAddDialog = false">取 消</el-button>
          <el-button type="primary" @click="adduser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户的对话框 -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <!-- 内容主体 -->
        <el-form
          :model="editForm"
          :rules="editRules"
          ref="editRef"
          label-width="70px"
        >
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="editForm.email" prop="email"></el-input>
          </el-form-item>
          <el-form-item label="手机">
            <el-input v-model="editForm.mobile" prop="mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
      <el-dialog
        title="设置用户的角色"
        :visible.sync="showSetRoleDialogVisble"
        ref="setRoleDialogRef"
        width="50%"
        @close="setRoleDialogClosed"
      >
        <div>
          <p>当前用户：{{ userInfo.username }}</p>
          <p>当前角色：{{ userInfo.role_name }}</p>
          <p>分配角色</p>
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showSetRoleDialogVisble = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义校验规则,验证邮箱规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail =
        /^[A-Za-zd0-9]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,5}$/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱!'))
    }
    // 验证手机规则
    var checkMobile = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号!'))
    }
    return {
      // 获取用户列表的参数对象get查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加对话框的显示与隐藏
      isAddDialog: false,
      // 添加用户的数据对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 10,
            message: '长度在 6 到 10 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户对话框的显示与隐藏
      editDialogVisible: false,

      // 查询到的用户信息保存
      editForm: {},
      // 修改用户信息的校验规则
      editRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 显示分配角色对话框的显示与隐藏
      showSetRoleDialogVisble: false,
      // 当前角色的信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      selectedRoleId: ''
    }
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      } else {
        this.userList = res.data.users
        this.total = res.data.total
      }
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      // 重新获取数据
      this.getUserList()
    },
    // 当前页码切换的函数
    handleCurrentChange (newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 开关发生变化的时候触发函数
    async userStateChanged (userState) {
      // console.log(userState)
      // userInfo中的mg_state就是switch状态
      const { data: res } = await this.$http.put(
        `users/${userState.id}/state/${userState.mg_state}`
      )
      // console.log(res)
      if (res.meta.status !== 200) {
        // 更改失败之后,页面要保持原来的状态
        userState.mg_state = !userState.mg_state
        return this.$$message.error('用户更新状态失败')
      } else {
        this.$message.success('更新状态成功！')
      }
    },
    // 关闭添加表单之后,清空表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮添加新用户
    adduser () {
      // 为表单添加预校验
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return
        // 发起添加用户的请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status === 201) {
          this.$message.success('添加用户成功！')
          this.isAddDialog = false
          this.getUserList()
        } else {
          this.$message.error('添加用户失败！')
        }
      })
    },
    // 展示编辑修改对话框
    async showEditDialog (id) {
      this.editDialogVisible = true
      // console.log(id)
      // 通过id发送请求
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('查询用户失败!')
      this.editForm = res.data
    },
    // 监听用户修改对话框的关闭
    editDialogClosed () {
      this.$refs.editRef.resetFields()
    },
    // 点击确定-->预验证-->提交信息
    editUserInfo () {
      this.$refs.editRef.validate(async (valid) => {
        if (!valid) return
        // 发起修改用户信息的请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户失败!')
        } else {
          // 关闭对话框
          this.editDialogVisible = false
          // 获取用户信息
          this.getUserList()
          // 提示成功
          this.$message.success('修改用户信息成功!')
        }
      })
    },
    // 根据id删除用户的id值
    async removeUserById (id) {
      // 先进行弹框询问是否删除数据
      // 用户确定删除,返回值是confirm,用户取消,返回cancel
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => {
        return err
      })
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除!')
      } else {
        // 确认了删除
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败!')
        } else {
          this.$message.success('删除用户成功!')
          this.getUserList()
        }
      }
    },
    // 展示分配角色的对话框
    async showSetRoleDialog (userInfo) {
      this.userInfo = userInfo
      // 获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户角色列表失败！')
      }
      this.$message.success('获取用户角色列表成功！')
      // 保存
      this.rolesList = res.data
      this.showSetRoleDialogVisble = true
    },
    // 点击确定按钮,提交用户的角色
    async saveRoleInfo () {
      // 先判断是不是选择了
      if (!this.selectedRoleId) {
        return this.$message.error('请选择一个角色!')
      }
      const { data: res } = await this.$http.put('users/' + this.userInfo.id + '/role', { rid: this.selectedRoleId })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('更新用户角色失败!')
      }

      this.$message.success('更新用户角色成功!')
      this.getUserList()
      this.showSetRoleDialogVisble = false
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = ''
    }
  },
  created () {
    // 发起请求
    this.getUserList()
  }
}
</script>

<style lang="less " scoped></style>
