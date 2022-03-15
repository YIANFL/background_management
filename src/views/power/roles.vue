<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdBottom', i1 == 0 ? 'bdTop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightTagById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染2级权限 -->
              <!-- 通过for循环进行二级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdTop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightTagById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级权限 -->
                    <el-tag
                      closable
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      @close="removeRightTagById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{ scope.row }}</pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRolesDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-search"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色对话框 -->
      <el-dialog
        title="添加角色对话框"
        :visible.sync="addRolesDialogVisible"
        width="50%"
        @close="addRolesDialogClosed"
      >
        <!-- 主要内容区 -->
        <el-form
          :model="addRoleForm"
          :rules="addRoleRules"
          ref="addRoleFormRef"
          label-width="80px"
        >
          <el-form-item label="角色" prop="roleName" size="medium">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc" size="medium">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoleConfirm">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑角色的对话框 -->
      <el-dialog
        title="编辑角色"
        :visible.sync="editRolesDialogVisible"
        width="50%"
        @close="editFormClose"
      >
        <!-- 主要内容区 -->
        <el-form
          :model="editRoleForm"
          :rules="editRoleRules"
          ref="editRef"
          label-width="110px"
        >
          <el-form-item label="编辑角色名称" prop="roleName" size="medium">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="编辑角色描述" prop="roleDesc" size="medium">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoleConfirm">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 展示设置权限的对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="showSetRightDialogVisble"
        width="50%"
      >
        <!-- 树形控件 -->
        <el-tree
          :data="rightsList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          :default-expand-all="true"
          :default-checked-keys="defKeys"
          @close="showSetRightDialogClosed"
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showSetRightDialogVisble = false">取 消</el-button>
          <el-button type="primary" @click="allRights"
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
    return {
      rolesList: [],
      addRolesDialogVisible: false,
      editRolesDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      editRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      editRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      editRoleId: 0,
      // 控制分配权限对话框的显示
      showSetRightDialogVisble: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选择的节点id值的数组
      defKeys: [],
      // 当前角色的id
      roleId: ''
    }
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      } else {
        this.rolesList = res.data
        // console.log(this.rolesList)
      }
    },
    // 监听添加角色对话框的显示
    addRolesDialog () {
      this.addRolesDialogVisible = true
    },
    // 确定添加角色
    addRoleConfirm () {
      this.$refs.addRoleFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败!')
        } else {
          // 关闭
          this.addRolesDialogVisible = false
          // 重新请求列表数据
          this.getRolesList()
          // 提示成功消息
          this.$message.success('添加角色成功!')
        }
      })
    },
    // 添加角色对话框关闭以后,重置表单
    addRolesDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 显示编辑对话框
    editRolesDialog (id) {
      this.editRolesDialogVisible = true
      this.editRoleId = id
      console.log(this.editRoleId)
    },
    // 编辑确定
    editRoleConfirm () {
      this.$refs.editRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleId,
          this.editRoleForm
        )
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑信息失败!')
        } else {
          this.editRolesDialogVisible = false
          this.getRolesList()
          this.$message.success('编辑角色信息成功!')
        }
      })
    },
    // 根据id进行删除
    async deleteRole (id) {
      // 先进行弹框询问是否删除数据
      // 用户确定删除,返回值是confirm,用户取消,返回cancel
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
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
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败!')
        } else {
          this.$message.success('删除用户成功!')
          this.getRolesList()
        }
      }
    },
    editFormClose () {
      this.$refs.editRef.resetFields()
    },
    // 删除权限标签
    async removeRightTagById (role, rightId) {
      // 弹框提示是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      } else {
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }
        role.children = res.data
      }
    },
    // 展示设置权限的对话框
    async showSetRightDialog (role) {
      console.log(role)
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户权限失败!')
      }
      // 获取到的权限数据保存到data中
      this.rightsList = res.data
      // console.log(res.data)
      // 调用递归函数,获取三级节点的id
      this.getLeafkeys(role, this.defKeys)
      this.roleId = role.id
      this.showSetRightDialogVisble = true
    },
    // 递归函数获取角色下的所有三级权限的id,并保存
    // 用node进行判断是不是为三级,arr保存id的值
    getLeafkeys (node, arr) {
      // 不含children,说明是三级节点,
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafkeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    // 关闭对话框后,应该清空dfkeys数组中的ids
    showSetRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为所有权限发起请求
    //
    async allRights () {
      // 数组中拿到了所有选中节点和半选中节点的id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedNodes()
      ]
      // console.log(keys)
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post('roles/' + this.roleId + '/rights', { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败!')
      }
      this.$message.success('分配权限成功!')
      this.getRolesList()
      this.showSetRightDialogVisble = false
    }
  },
  created () {
    this.getRolesList()
  }
}
</script>

<style lang="less" scoped>
.el-table-column {
  text-align: center;
}
.el-tag {
  margin: 7px;
}

.bdTop {
  border-top: 1px solid #eee;
}
.bdBottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
