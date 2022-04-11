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
      <el-form-item label="关键词名称" prop="keywordName">
        <el-input
          v-model="queryParams.keywordName"
          placeholder="请输入关键词名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="文件名称" prop="keywordName">
        <el-input
          v-model="queryParams.keywordName"
          placeholder="请输入文件名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
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
        >上传</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="classificationList" @selection-change="handleSelectionChange"
      row-key="id" 
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="文件编号" prop="id" />
      <el-table-column label="文件名称" prop="fileName" :show-overflow-tooltip="true" />
      <el-table-column label="文件大小" prop="fileSize" :show-overflow-tooltip="true" />
      <el-table-column label="文件类型" prop="fileStyle" :show-overflow-tooltip="true">
         <template slot-scope="scope">
          <span v-if="scope.fileExt =='pdf'">PDF文件</span>
          <span v-if="scope.fileExt =='word'">word文件</span>
          <span v-if="scope.fileExt =='war'">WAR压缩包</span>
        </template>
      </el-table-column>
       <el-table-column label="文件后缀标识" prop="fileExt" :show-overflow-tooltip="true"/>
      <el-table-column label="文件唯一标识" prop="fileUuid" :show-overflow-tooltip="true" v-show="false" />
      <el-table-column label="文件分类" prop="fileClassId" :show-overflow-tooltip="true" v-show="false" />
      <el-table-column label="文件地址" prop="filePath" :show-overflow-tooltip="true" v-show="false" />
      <el-table-column label="文件简介" prop="fileBrief" :show-overflow-tooltip="true" v-show="false" />
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

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-upload
                class="upload-demo"
                action="http://192.168.0.133:8080/file/upload"
                :headers="headers"
                :on-preview="handlePreview"   
                :on-remove="handleRemove"   
                :before-remove="beforeRemove"      
                :before-upload="beforeAvatarUpload"  
                :on-success="handleAvatarSuccess" 
                
                 multiple
                :limit="3"   
                :on-exceed="handleExceed"  
                :file-list="fileList">  
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传xlsx/xls文件，且不超过2MB</div>
        </el-upload>
      </el-form>
    </el-dialog>

    <el-dialog :title="title" :visible.sync="updateDialog" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="className">
          <el-input v-model="form.className" placeholder="请选择分类名称" />
        </el-form-item>
         <el-form-item label="文件简介" prop="brief">
          <el-input v-model="form.brief" placeholder="请输入文件简介" />
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
import { listFile,getFile,delFile,updateFile,addFile,getTreeselect,uploadFiles} from "@/api/lib/file";
import { getToken } from '@/utils/auth'
export default {
  name: "File",
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
      //完善文件对话框
      updateDialog:false,
  
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
          { required: true, message: "文件名称不能为空", trigger: "blur" }
        ]
      },
      //上传文件的list
       fileList: [],
       config :{
         Authorization:  'Bearer ' + getToken() ,
       }
    }

  },
  created() {
    this.getList();
    
  },
  computed: {
         headers() {
            return {
                'Authorization': 'Bearer ' + getToken() ,
            }
        },
},
  methods: {
    /** 查询角色列表 */
    getList() {
     this.loading = true;
     listFile(this.queryParams).then(response => {
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
    handleAdd() {
      this.reset();
      this.open = true
      this.title = "上传文件";
    },
    

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const classificationId = row.id || this.ids
      getFile(classificationId).then(response => {
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
      debugger
        if (this.fileList.length >0) {
          let files = []
          this.fileList.forEach(item => {
            let file = {}
            file.fileName = item.name;
            file.fileSize = item.size;
            file.fileExt = item.name.split(".")[1]
            file.fileUuid = item.uid
            files.push(file)
          });
          uploadFiles(files).then(response => {
            this.msgSuccess("新增成功");
            this.open = false;
            this.getList();
          });
        }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const keywordId = row.id || this.ids;
      this.$confirm('是否确认删除分类编号为"' + keywordId + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delFile(keywordId);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(() => {});
    },
    handleChange(file, fileList) {
        this.fileList = fileList.slice(-3);
      },
      //test
      handleRemove(file, fileList) {
            console.log(file, fileList);
        },
        handlePreview(file) {
            console.log(file);
        },
        handleExceed(files, fileList) {
            this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
        },
        beforeRemove(file, fileList) {
            return this.$confirm(`确定移除 ${ file.name }？`);
        },
        handleAvatarSuccess(res, file) {
          debugger
          if(res.code === 200){
            let fileInfo = {}
            fileInfo.fileName = file.name
            fileInfo.fileSize = file.size
            fileInfo.fileExt = file.name.split('.')[1]
            fileInfo.fileUuid = file.uid
            fileInfo.filePath  = res.data.url
            addFile(fileInfo).then(response => {
                        this.msgSuccess("新增成功");
                        this.open = false;
                        this.getList();
                      });
          }
           
          
        },
        beforeAvatarUpload(file) {
            // 文件类型进行判断
            // const isXlsx = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            // const isXls = file.type === "application/vnd.ms-excel";
            // const isLt2M = file.size / 1024 / 1024 < 2;
            // if (!(isXlsx||isXls)) {
            //     this.$message.error("上传头像图片只能是 xlsx/xls 格式!");
            // }
            // if (!isLt2M) {
            //     this.$message.error("上传头像图片大小不能超过 2MB!");
            // }
            // return (isXlsx||isXls) && isLt2M;
            return true;
        },
    
  }
};
</script>