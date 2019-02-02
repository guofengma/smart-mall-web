/**
 * 组织架构接口定义层
 * @creator 李丹Danica
 * @createTime 2018/3/21
 */
var OrgChartInterface = function() {
	var findAll = function(p, callback) {
			CommonUtil.ajaxRequest({
				url: 'org-chart/findAll',
				data: p
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('加载组织架构报错！' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		save = function(p, callback) {
			CommonUtil.ajaxRequest({
				url: 'org-chart/save',
				data: p
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
				}
				if (!res.success) {
					layer.msg('保存组织架构信息报错！' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
					return false;
				}
				
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		remove = function(id, callback) {
			
			CommonUtil.ajaxRequest({
				url: 'org-chart/remove',
				data: {
					id: id
				}
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
				}
				if (!res.success) {
					layer.msg('删除组织架构报错！' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
					return false;
				}
				
				if (typeof callback == 'function') {
					callback(res);
				}
			});
			
		},
		detail = function(id, callback) {
			CommonUtil.ajaxRequest({
				url: 'org-chart/detail',
				data: {
					id: id
				}
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('删除组织架构报错！' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		relateStaffs = function(p, callback) {
			CommonUtil.ajaxRequest({
				url: 'org-chart/relateStaffs',
				data: p
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
				}
				if (!res.success) {
					layer.msg('组织添加工作人员关联报错！' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
					return false;
				}
				
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		exchangeStaffs = function(p, callback) {
			CommonUtil.ajaxRequest({
				url: 'org-chart/exchangeStaffs',
				data: p
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
				}
				if (!res.success) {
					layer.msg('组织间转移工作人员报错！' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
					return false;
				}
				
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		removeStaffs = function(p, callback) {
			CommonUtil.ajaxRequest({
				url: 'org-chart/removeStaffs',
				data: p
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
				}
				if (!res.success) {
					layer.msg('组织删除工作人员报错！' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
					return false;
				}
				
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		};
		
		
	//一次性加载所有组织架构节点
	this.findAll = findAll;
	// 保存组织信息
	this.save = save;
	// 查询详情
	this.detail = detail;
	// 删除组织
	this.remove = remove;
	// 组织关联工作人员
	this.relateStaffs = relateStaffs;
	// 组织迁移工作人员
	this.exchangeStaffs = exchangeStaffs;
	// 组织移除工作人员
	this.removeStaffs = removeStaffs;

}