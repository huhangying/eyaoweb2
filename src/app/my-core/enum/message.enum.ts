export const enum Message {
  noData = '无数据',
  updateSuccess = '更新纪录成功！',
  deleteSuccess = '删除纪录成功！',

  defaultError = '服务器错误',
  notFound = '记录找不到', // 404
  nameExisted = '编辑的名称已经存在，请选择其它值。',
  deleteNotAllowed = '不能删除，可能是存在关联数据',

  // login
  not_registered = '用户名不存在, 请确认后重试!',
  wrong_password = '密码不正确, 请确认后重试!',
  login_failed = '不正确的用户名或密码, 请确认后重试!',
}
