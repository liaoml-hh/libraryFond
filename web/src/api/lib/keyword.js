import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/common";

// 查询关键词列表
export function listKeyword(query) {
  return request({
    url: '/library/keyword/list',
    method: 'get',
    params: query
  })
}

// 查询关键词详细
export function getKeyword(id) {
  return request({
    url: '/library/keyword/' + praseStrEmpty(id),
    method: 'get'
  })
}

// 新增关键词
export function addKeyword(data) {
  return request({
    url: '/library/keyword',
    method: 'post',
    data: data
  })
}

// 修改关键词
export function updateKeyword(data) {
  return request({
    url: '/library/keyword',
    method: 'put',
    data: data
  })
}

// 删除关键词
export function delKeyword(id) {
  return request({
    url: '/library/keyword/' + id,
    method: 'delete'
  })
}


