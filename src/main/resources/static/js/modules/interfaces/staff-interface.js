/**
 * 区域网格接口定义层
 * @creator 李丹Danica
 * @createTime 2018/3/20
 */
var StaffInterface = function() {
	var getPage = function(p, callback) {
			CommonUtil.ajaxRequest({
				url: 'staff/getPage',
				data: p
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('加载工作人员信息报错' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		getValidPage = function(p, callback) {
			CommonUtil.ajaxRequest({
				url: 'staff/getValidPage',
				data: p
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('加载工作人员信息报错' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		detail = function(id, callback) {
			if (!id) {
				return false;
			}
			CommonUtil.ajaxRequest({
				url: 'staff/detail',
				data: {
					id: id
				}
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('查询工作人员详情报错' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		changeStatus = function(data,callback){
			CommonUtil.ajaxRequest({
				url: 'staff/changeStatus',
				data: data
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						if(data.status){
							layer.msg('启用失败' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						} else {
							layer.msg('禁用失败' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						}
						return false;
					}
				}
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		modifyPersonOrg = function(data,callback) {
			CommonUtil.ajaxRequest({
				url: 'staff/modifyPersonOrg',
				data: data
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('操作失败' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		deletePersonOrg = function(data,callback) {
			CommonUtil.ajaxRequest({
				url: 'staff/deletePersonOrg',
				data: data
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('移除所属部门失败' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		};
		
	// 分页加载工作人员
	this.getPage = getPage;
	// 查询可用工作人员详情
	this.getValidPage = getValidPage;
	// 查询工作人员详情
	this.detail = detail;
	//启用与禁用
	this.changeStatus = changeStatus;
	//改变所属部门
	this.modifyPersonOrg = modifyPersonOrg;
	//移除所属部门
	this.deletePersonOrg = deletePersonOrg;
};