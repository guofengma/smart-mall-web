var SubSysInterface = (function(){
	var resetSys = function(p,callback){
		CommonUtil.ajaxRequest({
			url: 'central-con/resetSystem',
			type: 'post',
			data: p
		}, function(res) {
			console.log('res',res)
			if (typeof res == 'string') {
				res = JSON.parse(res);
			}
			if (!res.success) {
				layer.msg('重置子系统报错' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
				return false;
			}
			if (typeof callback == 'function') {
				callback(res);
			}
		});
	};
	return {
		resetSys: resetSys //重置已经配置子系统
	};
}());