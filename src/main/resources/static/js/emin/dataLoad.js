layui.use(['laypage'], function(){
	laypage = layui.laypage;
});
function initTable(p,callback) {
	var i = 0, 
		paramsEls = null,
		modelName = p.modelName,
		curr = p.curr ? parseInt(p.curr) : 0,
		totalPage = p.totalPage ? parseInt(p.totalPage) : 0,
		totalCount = p.totalCount ? parseInt(p.totalCount) : 0,
		limit = p.limit ? parseInt(p.limit) : 10,
		limits = p.limits ? p.limits : [10, 20, 30, 40, 50],
		layout = p.layout ? p.layout : null,
		pageInput = $('#' + modelName + '-searchform input[name="page"]');
	if (!modelName) {
		return false;
	}
	if (pageInput.length == 1) {
		pageInput.val(curr);
	}
	if ($('#' + modelName + '-table').length == 1) {
		// 初始化列表
		$('#' + modelName + '-table').footable();
	}

	if(totalPage > 0) {
		pageList({
			modelName: modelName,
			totalCount: totalCount,
			limit: limit,
			limits: limits,
			layout: layout,
			curr: pageInput.val() ? pageInput.val() : 1
		}, function(obj) {
			if (typeof callback == 'function') {
				callback(obj);
			} else {
				pageInput.val(obj.curr);
				pageSearch(modelName, obj.limit);
			}
		});
	}

	if (curr > totalPage && totalPage != 0) {
		layer.msg('当前页已无可操作数据，即将跳转至查询首页数据...');
		setTimeout(function() {
			goPage('index', {
				limit : limit
			});
		}, 2000)
	}

	$('#' + modelName + '-searchform button[role="submit"]').attr('onclick',
			"pageSearch('" + modelName + "', '" + limit + "')");
	$('#' + modelName + '-searchform button[role="reset"]').attr('onclick',
			"resetForm('" + modelName + "', '" + limit + "')");

	paramsEls = $('#' + modelName + '-searchform input[role="user-params"]');
	for (var i = 0; i < paramsEls.length; i++) {
		$(paramsEls[i]).attr('onclick', "resetPage('" + modelName + "')");
	}

	paramsEls = $('#' + modelName + '-searchform select[role="user-params"]');
	for (var i = 0; i < paramsEls.length; i++) {
		$(paramsEls[i]).attr('onclick', "resetPage('" + modelName + "')");
	}

	$('#' + modelName + '-searchform').keydown(function(e) {
		var theEvent = e || window.event;
		var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
		if (code == 13) {
			/*pageSearch(modelName, limit);*/
			$('#' + modelName + '-searchform button[role="submit"]').trigger('click')
			return false;
		}
		return true;
	});


}

function pageList(p, callback) {
	if ($('#' + p.modelName + '-page').length == 1) {
		laypage.render({
			elem: p.modelName + '-page', //注意，这里的 test1 是 ID，不用加 # 号
			count: p.totalCount, //数据总数 //从服务端得到
			limit: p.limit, //每页的显示数量
			curr: p.curr, //当前页
			limits: p.limits, //可供选择的每页显示数量
			theme: '#3A8FE2',
		  	layout: p.layout ? p.layout : ['count', 'prev', 'page', 'next', 'limit', 'skip'],//分页栏的功能
			jump : function(obj, first) {
				if(!first) {
					callback(obj);
				}
			}
		});
		
		$('#' + p.modelName + '-page .layui-input').on('change',function(){
			let value  =  $(this).val(),
				reg = /^[0-9]+$/,
			max = Math.ceil(p.totalCount/p.limit);
//			value = value.replace(/[^\d]/g,"");
			if(reg.test(value) && value > max) {
				value = max;
			}
			$(this).val(value);
		});
	}
}

/**
 * 搜索查询
 */
function pageSearch(modelName, limit) {
	var searchParams = $('#' + modelName + '-searchform').serializeObject();

	searchParams.limit = limit ? limit : 10;

	goPage('index', searchParams);
}

/**
 * 重置表单
 */
function resetForm(modelName, limit) {
	var ups = $('#' + modelName + '-searchform input[role="user-params"]');
	for (var i = 0; i < ups.length; i++) {
		$(ups[i]).val('');
	}
	ups = $('#' + modelName + '-searchform select[role="user-params"]');
	for (var i = 0; i < ups.length; i++) {
		$(ups[i]).val('');
	}
	resetPage(modelName);
	pageSearch(modelName, limit);
}

/**
 * 重置页码
 */
function resetPage(modelName) {
	$('#' + modelName + '-searchform input[name="page"]').val(1);
}

/**
 * Ajax请求返回json数据结果统一封装
 * 
 * @param p
 *            参数项
 * @param callback
 *            回调函数
 */
function operation(p, callback) {
	var moduleName = p.moduleName ? p.moduleName : '', // 模块名称
	oper = p.oper ? p.oper : '', // 操作
	params = p.params ? p.params : {}, // ajax参数
	operChinese = '', moduleNameChinese = '', confirmMsg = ''; // 操作对应中文提示

	if (!moduleName || !oper) {
		console.log('ERR: 数据请求必要参数缺失')
		return false;
	}
	$.ajaxSettings.async = false;
	$.getJSON('js/emin/moduleName_en_cn.json', function(res) {
		for (var i = 0; i < res.length; i++) {
			if (res[i].key.toLowerCase() == moduleName.toLowerCase()) {
				moduleNameChinese = res[i].value;
			}
		}
	});
	$.getJSON('js/emin/oper_en_cn.json', function(res) {
		for (var i = 0; i < res.length; i++) {
			if (res[i].key.toLowerCase() == oper.toLowerCase()) {
				operChinese = res[i].value;
			}
		}
	});
	$.ajaxSettings.async = true;

	confirmMsg = p.confirmMsg ? p.confirmMsg
			: ('来自' +  moduleNameChinese + '的提示:是否确认' + operChinese + '? ');

	setTimeout(function() {
		layer.confirm(confirmMsg, {
			icon : 3,
			btn : [ '确认', '取消' ]// 按钮
		}, function(cindex) {
			layer.close(cindex);
			loading = layer.load();
			CommonUtil.ajaxRequest({
				url : moduleName + '/' + oper,
				data : params,
				type : "post",
			}, function(data) {
				if (typeof data == 'string') {
					data = JSON.parse(data);
				}
				if (!data.success) {
					layer.msg(moduleNameChinese + operChinese + "失败！"
							+ (data.message ? "错误提示：" + data.message : ""), {
						icon : 5
					});
				} else {
					if (typeof callback == 'function') {
						callback(data);
					} else {
						layer.msg(moduleNameChinese + operChinese + "成功！", {
							icon : 6
						});
						goPage('index');
					}
				}
			})
		});
	});
}
function showUploadImg(data,el){
	$(el + ' div.upload-img').removeClass('hide');
	$(el + ' .upload-input').addClass('hide');
	$(el + ' .upload-input input').val(data);
	$(el + ' .upload-img img').attr('src',data);
}

function removeUploadImg(el) {
	$(el + ' div.upload-img').addClass('hide');
	$(el + ' .upload-input').removeClass('hide');
	$(el + ' .upload-input input').val('');
}
