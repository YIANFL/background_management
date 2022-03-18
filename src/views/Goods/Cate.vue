<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="6">
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        class="treeTable"
        :data="categoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        :show-row-hover="false"
      >
        <!-- 自定义插槽 -->
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            class="el-icon-edit"
            @click="showEditDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button type="danger" size="mini" class="el-icon-delete" @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加分类的对话框 -->
      <el-dialog
        title="添加分类的对话框"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
      >
        <!-- -->
        <el-form
          :model="addForm"
          :rules="addCateRules"
          ref="addFormRef"
          label-width="80px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!-- 级联选择框 -->
            <!-- options指定数据源 -->
            <el-cascader
              v-model="selectedKeys"
              :options="currentCateList"
              :props="cascaderProps"
              @change="parentCateChange"
              class="cascater"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑分类的对话框 -->
      <el-dialog
        title="修改分类"
        :visible.sync="editCateDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <el-form
          :model="editForm"
          :rules="editCateRules"
          ref="editFormRef"
          label-width="80px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate"
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
      // 商品分类的数据列表
      categoryList: [],
      queryInfo: {
        pagenum: 1,
        pagesize: 5,
        type: 3
      },
      // 总数据条数
      total: 0,
      // 为table指定列的数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加表单的数据
      addForm: {
        cat_pid: 0,
        cat_name: '',
        // 分类的等级默认的是一级分类
        cat_level: 0
      },
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      currentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中的父子的分类的id数组
      selectedKeys: [],
      // 编辑分类对话框显示
      editCateDialogVisible: false,
      // 编辑对话框数据
      editForm: {
        cat_name: ''
      },
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 编辑商品的id
      editId: 0
    }
  },
  methods: {
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      // console.log(res.data)
      // 把数据列表赋值给
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange (newsize) {
      // 为queryInfo赋值
      this.queryInfo.pagesize = newsize
      this.getCategoryList()
    },
    // 监听当前页码值发生变化的函数
    handleCurrentChange (newpage) {
      this.queryInfo.pagenum = newpage
      this.getCategoryList()
    },
    // 点击显示对话框
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败!')
      } else {
        this.currentCateList = res.data
        return this.$message.success('获取分类列表成功!')
      }
    },
    // 选择项发生变化触发这个函数
    // 如果选择项数组中的长度大于0,说明选择了父级分类
    parentCateChange () {
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    // 点击添加分类
    addCate () {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addForm)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败!')
        } else {
          this.$message.success('添加分类成功!')
          this.getCategoryList()
          this.addCateDialogVisible = false
        }
      })
    },
    // 关闭事件
    addCateDialogClosed () {
      this.$refs.addFormRef.resetFields()
      // 选择的key的空数组需要重新置空
      this.selectedKeys = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    },
    // 显示编辑对话框
    async showEditDialog (id) {
      // console.log(scope)
      this.editId = id
      const { data: res } = await this.$http.get('categories/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类失败!')
      } else {
        // console.log(res.data.cat_name)
        this.editForm.cat_name = res.data.cat_name
      }
      this.editCateDialogVisible = true
    },
    // 编辑对话框
    editCate () {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editId, this.editForm)
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败!')
        } else {
          this.$message.success('修改分类成功!')
          this.getCategoryList()
          this.editCateDialogVisible = false
        }
      })
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    async deleteCate (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败!')
        } else {
          this.$message.success('删除分类成功!')
          this.getCategoryList()
        }
      } else {
        this.$message.error('删除操作已取消!')
      }
    }

  },
  created () {
    this.getCategoryList()
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.cascater {
  width: 100%;
}
</style>
