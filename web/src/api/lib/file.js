import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/common";

// 查询文件列表
export function listFile(query) {
  return request({
    url: '/library/file/list',
    method: 'get',
    params: query
  })
}

// 查询文件详细
export function getFile(id) {
  return request({
    url: '/library/file/' + praseStrEmpty(id),
    method: 'get'
  })
}


// 上传文件
export function uploadFiles(data) {
  return request({
    url: '/library/file/upload',
    method: 'POST',
    data: data
  })
}
// 新增文件
export function addFile(data) {
  return request({
    url: '/library/file',
    method: 'post',
    data: data
  })
}

// 修改文件
export function updateFile(data) {
  return request({
    url: '/library/file',
    method: 'put',
    data: data
  })
}

// 删除文件
export function delFile(id) {
  return request({
    url: '/library/file/' + id,
    method: 'delete'
  })
}

// 查询部门下拉树结构
export function getTreeselect() {
  return request({
    url: '/library/file/treeselect',
    method: 'get'
  })
}

// 上传文件到服务器
export function uploadFileToLocal(data) {
  return request({
    url: 'file/upload',
    method: 'post',
    data: data
  })
}





