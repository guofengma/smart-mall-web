var PatternInterface = (function(){
	var combpatterns = function(p, callback) {
			CommonUtil.ajaxRequest({
				url: 'com-pattern/combpatterns',
				data: p
			}, function(res) {
				res = res?res:[];
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('加载组合模式列表报错' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		detail = function(p, callback){
			CommonUtil.ajaxRequest({
				url: 'com-pattern/detail',
				data: p
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('加载组合模式详情报错' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		querySysPat = function(p, callback) {
			CommonUtil.ajaxRequest({
				url: 'pattern/querySysPatterns',
				data: p
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('加载子系统及其模式数据报错' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		perfectMallPattern = function(p, callback) {
			CommonUtil.ajaxRequest({
				url: 'pattern/perfectMallPattern',
				data: p
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('保存商场模式数据失败' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		},
		cancelSubsystemPatternSet = function(p, callback) {
			CommonUtil.ajaxRequest({
				url: 'pattern/cancelSubsystemPatternSet',
				data: p
			}, function(res) {
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('取消失败' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				if (typeof callback == 'function') {
					callback(res);
				}
			});
		};
	return {
		combpatterns: combpatterns, //组合模式列表
		detail: detail, //组合模式详情
		querySysPat: querySysPat, //获取子系统及其下面的模式
		perfectMallPattern: perfectMallPattern, //编辑商场模式
		cancelSubsystemPatternSet: cancelSubsystemPatternSet//取消商场模式下的模式设置
	}
}())