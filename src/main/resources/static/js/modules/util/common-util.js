'use strict';

/**
 * 公共工具类
 *
 * @creator 李丹Danica
 * @createTime 2018/3/20
 */
var CommonUtil = function() {

	var getIdsOfEls = function(els, callback) {
		// 获取对象集合的数据编号集合
		var ids = [], others = [];
		if (els.length > 0) {
			$.each(els, function() {
				ids.push($(this).attr('data-id'));
				if ($(this).attr('data-others')) {
					others.push($(this).attr('data-others'));
				} else {
					others.push($(this).attr('data-id'));
				}
			});
			if (typeof callback == 'function') {
				callback(ids.join(','), others);
			}
		} else {
			layer.msg('未勾选操作记录', {
				icon : 5
			});
		}
	}, formDataSetAndGet = function(p, callback) {
		var container = p.container, obj = p.data, opt = p.opt ? p.opt : '';

		if (!container) {
			console.log('表单构建器，参数缺失');
			return false;
		}
		if ($(container).length != 1) {
			console.log('表单构建器，表单对象不存在或者存在多个');
			return false;
		}
		if (opt === 'reset') {
			$.each($(container).find('input[role="user-params"]'), function() {
				$(this).val('');
			});
			$.each($(container).find('textarea[role="user-params"]'),
					function() {
						$(this).val('');
					});
			$.each($(container).find('select[role="user-params"]'), function() {
				$(this).val('');
			});
		}
		if (obj) {
			$.each($(container).find('input[role="user-params"]'), function() {
				var el = $(this);
				for ( var variable in obj) {
					if (el.attr('name') == variable) {
						el.val(obj[variable]);
					}
				}
			});

			$.each($(container).find('textarea[role="user-params"]'),
					function() {
						var el = $(this);
						for ( var variable in obj) {
							if (el.attr('name') == variable) {
								el.val(obj[variable]);
							}
						}
					});
			$.each($(container).find('select[role="user-params"]'), function() {
				var el = $(this);
				for ( var variable in obj) {
					if (el.attr('name') == variable) {
						el.val(obj[variable]);
					}
				}
			});
		}
		if (typeof callback == 'function') {
			callback($(container).serializeObject());
		}
	}, ajaxRequest = function(p, successFn, errorFn) {
		/* $('.layui-laydate').remove(); */

		if (!p.forbidLoading) {
			var loading = layer.load();
		}

		$.ajax({
			url : p.url,
			data : stringHtmlEsc(p.data),
			type : p.type ? p.type : 'get',
			success : function success(res) {
				if (!p.forbidLoading) {
					layer.close(loading);
				}
				successFn(res);
			},
			error: function (textStatus) {
                console.info("请求报错");
                layer.closeAll();
                if (textStatus.status == 401) {
                    //added by Anson 2018年07月17日15:54:59
                    //新增未授权跳转
                    location.href="/login";
                }else if (typeof errorFn == 'function') {
					errorFn();
				} else {
					location.href="/500";
				}
            },
            complete: function (XMLHttpRequest,status) {
                if(status == 'timeout') {
                    console.info("请求超时");
    				location.href="/500";
                }
            }
		});
	}, operation = function(p, callback) {
		var moduleName; // 模块名称
		var oper; // 操作名称
		var params; // 参数
		var moduleName_cn; // 模块名称对应配置中文
		var oper_cn; // 操作名称对应配置中文
		var confirmMsg; // 确认信息
		var operFunction;
		var forbidLoading;
		p = p ? p : {};
		moduleName = p.moduleName;
		oper = p.oper;
		moduleName_cn = p.moduleName_cn ? p.moduleName_cn : '';
		oper_cn = p.oper_cn ? p.oper_cn : '操作';
		confirmMsg = p.confirmMsg ? p.confirmMsg : null;
		var action = moduleName_cn + oper_cn;
		params = p.params ? p.params : {};
		forbidLoading = (p.forbidLoading == false) ? false : true;
		if (!moduleName || !oper) {
			console.log('ERR: 数据请求必要参数缺失');
			return false;
		}
		
		operFunction = function(cindex) {
			if (cindex) {
				layer.close(cindex);
			}
			ajaxRequest({
				url : moduleName + '/' + oper,
				data : params,
				type : p.type ? p.type : 'post',
				forbidLoading : forbidLoading
			}, function(data) {
				if (typeof data == 'string') {
					data = JSON.parse(data);
				}
				if (!data.success) {
					
					reportErrMsg(action + "失败！"
							+ (data.message ? "错误提示：" + data.message : ""));
				} else {
					if (typeof callback == 'function') {
						callback(data);
					} else {
						layer.msg(action + "成功！", {
							icon : 6
						});
						goPage('index');
					}
				}
			});
		};
		if (!p.forbidConfirm) {
			if(!confirmMsg) {
				confirmMsg = '确认' + (oper_cn ? oper_cn : '您的操作') + '? ';
			}
			setTimeout(function() {
				layer.confirm(confirmMsg, {
					icon : 3,
					btn : [ '确认', '取消' ]
				// 按钮
				}, operFunction);
			});
		} else {
			operFunction();
		}
	}, reportErrMsg = function(errMsg) {
		layer.msg(errMsg, {
			icon : 5
		});
		console.log('ERR:' + errMsg);
	}, html2Escape = function(sHtml) {
		return sHtml.replace(/[<>&"']/g, function(c) {
			return {
				'<' : '&lt;',
				'>' : '&gt;',
				'&' : '&amp;',
				'"' : '”',
				'\'' : '’'
			}[c];
		});
	}, string2html = function(str) {
		return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/”/g, '"').replace(/’/g, '\'');
	}, stringHtmlEsc = function(obj) {
		for ( var i in obj) {
			if (typeof obj[i] == 'string') {
				if (obj[i].indexOf('{') == 0
						&& obj[i].lastIndexOf('}') == obj[i].length - 1
						|| obj[i].indexOf('[') == 0
						&& obj[i].lastIndexOf(']') == obj[i].length - 1) {
					var valObj = JSON.parse(obj[i]);
					obj[i] = JSON.stringify(stringHtmlEsc(valObj));
				} else {
					obj[i] = html2Escape(obj[i]);
				}
			}
		}
		return obj;
	}, calcuPicLoadParams = function(containerW, containerH, originalW, originalH) {
		var res = {};
		if (containerW > containerH) {
			if (originalW > originalH && originalW >= containerW) {
				if(containerW/originalW * originalH > containerH) {
					res.scale = containerH/originalH;
					res.w = 'auto';
					res.h = containerH;
				} else {
					res.scale = containerW/originalW;
					res.w = containerW;
					res.h = 'auto';
				}
			} else {
				if (originalH > containerH) {
					res.scale = containerH/ originalH;
					res.w = 'auto';
					res.h = containerH;
				} else {
					res.scale = 1;
					res.w = originalW;
					res.h = 'auto';
				}
			}
		} else {
			if (originalW < originalH && originalH <= containerH) {
				if(containerH/originalH * originalW > containerW) {
					res.scale = containerW/originalW;
					res.w = containerW;
					res.h = 'auto';
				} else {
					res.scale = originalH/ containerH;
					res.w = 'auto';
					res.h = containerH;
				}
			} else {
				if (originalW > containerW) {
					res.scale = containerW/originalW;
					res.w = containerW;
					res.h = 'auto';
				} else {
					res.scale = 1;
					res.w = originalW;
					res.h = 'auto';
				}
			}
		}
		return res;
	},
	itemsCheck = function(p, callback) {
		p = p ? p : {};
		var allSelector = p.allSelector;
		var itemSelector = p.itemSelector;
		if (!allSelector || !itemSelector) {
			console.log('Err: CommonUtil.itemsCheck->必要参数缺失！');
			return false;
		}


		var controlEnter = 0;
		var handleCallback = function(callback) {
			if (controlEnter) return false;
			controlEnter = 1;
			setTimeout(function() {
				if (typeof callback === 'function') {
					var checkedItems = [],uncheckedItems = [];
					$.each($(itemSelector + ':checked'), function() {
						var val = $(this).val();
						var others = $(this).attr('data-others');
						checkedItems.push({
							id: val,
							others: others
						})
					});
					$.each($(itemSelector + ':unchecked'), function() {
						var val = $(this).val();
						var others = $(this).attr('data-others');
						uncheckedItems.push({
							id: val,
							others: others
						})
					});
					var adds = [];
					var minus = [];
					if (checkedList.length > 0) {
						for (var i = 0; i < checkedItems.length; i++) {
							var count = 0;
							for (var j = 0; j < checkedList.length; j++) {
								if (parseInt(checkedList[j].id) !== parseInt(checkedItems[i].id)) {
									count ++
								}
							}
							if (count === checkedList.length) {
								adds.push(checkedItems[i]);
							}
						}

						for(var i = 0; i < uncheckedItems.length; i++) {
							for (var j = 0; j < checkedList.length; j++) {
								if (parseInt(uncheckedItems[i].id) === parseInt(checkedList[j].id)) {
									minus.push(j);
								}
							}
						}
					} else {
						adds = checkedItems;
					}
					for (var j = minus.length - 1; j >= 0; j--) {
						checkedList.splice(parseInt(minus[j]), 1);
					}
					for (var i = 0; i < adds.length; i++) {
						checkedList.push(adds[i]);
					}
					callback(checkedList);
					controlEnter = 0;
				}
			});
		}
		// 全选
		$(allSelector).on('ifChecked', function(event){
			$(itemSelector).iCheck('check');
			handleCallback(callback);
		});

		$($(allSelector).siblings('ins')[0]).on('click', function(){
			let parent = $(this).parents('.icheckbox_square-green');
			if(!parent.hasClass('checked')) {
				$(itemSelector).iCheck('uncheck');
			}
			handleCallback(callback);
		})
		// 部分选中
		$(itemSelector).on('ifChecked', function(event){
			var item_len = $(itemSelector).length,
				selected_len = $(itemSelector + ':checked').length;

			if(item_len == selected_len) {
				$(allSelector).iCheck('check');
			}
			handleCallback(callback);
		});
		$(itemSelector).on('ifUnchecked', function(event){
			$(allSelector).iCheck('uncheck');
			handleCallback(callback);
		});

		var checkedList = p.checkedList ? p.checkedList : [];
		$(itemSelector).iCheck('uncheck');
		if (checkedList.length > 0) {
			for (var i = 0; i < checkedList.length; i++) {
				var checkSelector = itemSelector + '[value="' + checkedList[i].id + '"]';
				var checkedCount = 0;
				if ($(checkSelector).length === 1) {
					$(checkSelector).iCheck('check');
					checkedCount++;
				}
			}
			if (checkedCount === $(itemSelector).length) {
				$(allSelector).iCheck('check');
			}
		}

	};

	return {
		ajaxRequest : ajaxRequest,
		getIdsOfEls : getIdsOfEls,
		string2html : string2html,
		formDataSetAndGet : formDataSetAndGet,
		operation : operation,
		reportErrMsg : reportErrMsg,
		stringHtmlEsc : stringHtmlEsc,
		calcuPicLoadParams: calcuPicLoadParams,
		itemsCheck: itemsCheck
	};
}();