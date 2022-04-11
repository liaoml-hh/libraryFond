<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" :inline="true">
      <el-form-item label="分类名称" prop="keywordName">
        <el-input
          v-model="queryParams.keywordName"
          placeholder="请输入分类名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="父类名称" prop="keywordName">
        <el-input
          v-model="queryParams.keywordName"
          placeholder="请输入父类名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
       
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="classificationList" @selection-change="handleSelectionChange"
      row-key="id" 
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="分类编号" prop="id" />
      <el-table-column label="分类名称" prop="className" :show-overflow-tooltip="true" />
      <el-table-column label="分类简介" prop="brief" :show-overflow-tooltip="true" width="220px"/>
      <el-table-column label="父类节点" prop="parentPath" :show-overflow-tooltip="true" v-show="false" />
      <el-table-column label="创建时间" align="center" prop="createTime" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
             icon="el-icon-plus"
            @click="handleAdd(scope.row)"
          >新增</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="className">
          <el-input v-model="form.className" placeholder="请输入分类名称" />
        </el-form-item>
         <el-form-item label="分类简介" prop="brief">
          <el-input v-model="form.brief" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="所属父类" prop="parentId" >
              <el-cascader
                  v-model="parentId"
                  :options="parentPathOptions"
                  :props="{ checkStrictly: true }"
                  :show-all-levels="false"
                  clearable
                  @change="handleChange"></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listClassification,getClassification,delClassification,updateClassification,addClassification,getTreeselect } from "@/api/lib/classification";

export default {
  name: "Classification",
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 角色表格数据
      classificationList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      //所属父类
      parentId: [],
      //所属父类参数
      parentPathOptions:[],
  
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        className:undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        className: [
          { required: true, message: "角色名称不能为空", trigger: "blur" }
        ]
      },
    }

  },
  created() {
    this.getList();
    
  },
  methods: {
    /** 查询角色列表 */
    getList() {
     this.loading = true;
     listClassification(this.queryParams).then(response => {
        this.classificationList = this.handleTree(response.rows, "id");
        this.loading = false;
      });
    },
  
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.openDataScope = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        className: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.ids)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
   
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.treeselect()
      this.parentId = []
      this.open = true
      let classificationId = row.id
        
       if (row != null && classificationId) {
        let dataStrArr=row.parentPath.split(",");  //分割成字符串数组  
        let dataIntArr=[];//保存转换后的整型字符串  
        if(row.parentPath !=""){
          dataStrArr.forEach(item => {  
          dataIntArr.push(parseInt(item));  
          });  
        }
        dataIntArr.push(parseInt(classificationId));
        this.form.parentId = dataIntArr;
        this.parentId = dataIntArr;
      } else {
        this.form.parentId = 0;
      }
      this.title = "添加分类";
    },
    /** 获取树形父类*/
    treeselect(){
      getTreeselect().then(response=>{
        this.parentPathOptions = response.data;
      })
    },

    /**树形父类changes事件 */
     handleChange(value) {
        console.log(value);
      },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.treeselect();
      const classificationId = row.id || this.ids
      getClassification(classificationId).then(response => {
        this.form = response.data;
        if(response.data.parentPath){
          let dataStrArr=response.data.parentPath.split(",");  //分割成字符串数组  
          let dataIntArr=[];//保存转换后的整型字符串  
          dataStrArr.forEach(item => {  
          dataIntArr.push(parseInt(item));  
          });  
          this.form.parentId = dataIntArr;
          this.parentId = dataIntArr;
        }
        this.open = true;
        this.title = "修改分类";
      });
    },

   
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.parentId = parseInt(this.parentId[this.parentId.length-1])
           this.form.parentPath = this.parentId.toString();
          if (this.form.id != undefined) {
            updateClassification(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addClassification(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
         this.parentId = [];
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const keywordId = row.id || this.ids;
      this.$confirm('是否确认删除分类编号为"' + keywordId + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delClassification(keywordId);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(() => {});
    },
  }
};
</script>