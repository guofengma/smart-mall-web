var userInterface = (function(){
	var userDetail = function(p, callback){
		CommonUtil.ajaxRequest({
			url: 'user/detail',
			data: p
		}, function(res) {
			if (typeof res == 'string') {
				res = JSON.parse(res);
				if (!res.success) {
					layer.msg('加载用户信息报错' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
					return false;
				}
			}
			if (typeof callback == 'function') {
				callback(res);
			}
		});
	},
	getFlocks = function(p, callback) {
		CommonUtil.ajaxRequest({
			url: 'user/getFlocks',
			data: {}
		}, function(res) {
			if (typeof res == 'string') {
				res = JSON.parse(res);
				if (!res.success) {
					layer.msg('加载用户信息报错' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
					return false;
				}
			}
			if (typeof callback == 'function') {
				callback(res);
			}
		});
	},
	changeStatus = function(p, callback){
		CommonUtil.ajaxRequest({
			url: 'user/changeStatus',
			data: p?p:{}
		}, function(res) {
			if (typeof res == 'string') {
				res = JSON.parse(res);
				if (!res.success) {
					layer.msg('加载用户角色报错' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
					return false;
				}
			}
			if (typeof callback == 'function') {
				callback(res);
			}
		});
	};
	return {
		userDetail: userDetail, //获取用户详情
		getFlocks: getFlocks, //获取角色
		changeStatus: changeStatus //改变用户状态
	};
	
}())