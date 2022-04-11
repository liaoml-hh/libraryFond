import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/common";

// 查询分类列表
export function listClassification(query) {
  return request({
    url: '/library/classification/list',
    method: 'get',
    params: query
  })
}

// 查询分类详细
export function getClassification(id) {
  return request({
    url: '/library/classification/' + praseStrEmpty(id),
    method: 'get'
  })
}

// 新增分类
export function addClassification(data) {
  return request({
    url: '/library/classification',
    method: 'post',
    data: data
  })
}

// 修改分类
export function updateClassification(data) {
  return request({
    url: '/library/classification',
    method: 'put',
    data: data
  })
}

// 删除分类
export function delClassification(id) {
  return request({
    url: '/library/classification/' + id,
    method: 'delete'
  })
}

// 查询部门下拉树结构
export function getTreeselect() {
  return request({
    url: '/library/classification/treeselect',
    method: 'get'
  })
}


