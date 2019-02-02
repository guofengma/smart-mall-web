var $http = (function() {
    
    /**
     * 将 可能包含网页标签或特殊字符的 字符串 反编译成 原样输出，使页面可接纳识别
     * @param {*} str 字符串
     */
    function string2html(str) {
        return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/”/g, '"').replace(/’/g, '\'');
    }
    /**
     * 将 存在网页标签或特殊字符的 字符串 -> 编译成 -> 数据库能接受的 不会报错的 字符串
     * @param {*} sHtml html字符串
     */
    function html2string(sHtml) {
		return sHtml.replace(/[<>&"']/g, function(c) {
			return {
				'<' : '&lt;',
				'>' : '&gt;',
				'&' : '&amp;',
				'"' : '”',
				'\'' : '’'
			}[c];
		});
    }
    
    /**
     * 处理传输对象值中的网页标签和特殊字符
     * @param {*} obj 
     */
    function handleHtml(obj) {
        for ( var i in obj) {
            if (typeof obj[i] == 'string') {
                var isJSONObj = obj[i].indexOf('{') == 0 && obj[i].lastIndexOf('}') == obj[i].length - 1;
                var isJSONArray = obj[i].indexOf('[') == 0 && obj[i].lastIndexOf(']') == obj[i].length - 1;
                if (isJSONObj || isJSONArray) {
                    var valObj = JSON.parse(obj[i]);
                    obj[i] = JSON.stringify(handleHtml(valObj));
                } else {
                    obj[i] = html2string(obj[i]);
                }
            }
        }
        return obj;
    }
    
    /**
     * GET数据请求
     * 用于数据获取，例如页面查询，数据查询
     * *（强烈建议后台接口关于此类型的接口，它的数据返回为：用户实际需要的数据，如存在多层包裹，去除界面无用数据） *
     * @param {
     *  forbidLoading: true/false 禁止加载动画，默认加载
     *  url： '' 请求地址
     *  data: {} 请求参数
     * } p 数据请求参数 
     * @param {*} successFn 成功回调
     * @param {*} errorFn 失败回调
     */
    function get(p, successFn, errorFn) {
        p = p ? p : {};
        successFn = successFn ? successFn : function(){
            console.info('$http.js->get()->success callback');
        };
        errorFn = errorFn ? errorFn : function(){
            console.info('$http.js->get()->error callback');
        };
        var loadIndex = null;
        if (p.forbidLoading != true) {
			loadIndex = layer.load();
		}
		$.ajax({
			url : p.url,
			data : handleHtml(p.data),
			type : 'get',
			success : function success(res) {
                if(loadIndex) {
                    layer.close(loadIndex);
                }
				successFn(res);
			},
			error: function (textStatus) {
                if(loadIndex) {
                    layer.close(loadIndex);
                }
                if (textStatus.status == 401) {
                    location.href="/login";
                }else if (typeof errorFn == 'function') {
					errorFn();
				} else {
					location.href="/500";
				}
            },
            complete: function (XMLHttpRequest,status) {
                if(status == 'timeout') {
    				layer.msg('请求超时，请检查网络或稍后再试！');
                }
            }
		});
    }
    /**
     * POST数据传输请求
     * 用于表单提交，数据增删改变动
     * *（要求后台接口返回数据必须是JSONObject对象，并且一定包含success字段，不包含视为数据请求失败）*
     * @param {
     *  forbidLoading: true/false 禁止加载动画，默认加载
     *  url： '' 请求地址
     *  data: {} 请求参数
     *  oper_cn: 操作行为中文说明
     * } p 
     * @param {*} successFn 成功回调
     * @param {*} errorFn 失败回调
     */
    function post(p, successFn, errorFn) {
        p = p ? p : {};
        successFn = successFn ? successFn : function() {
            goPage('index');
        };
        errorFn = errorFn ? errorFn : function() {
            console.info('$http.js->post()->error callback');
        };
       
        var confirmMsg = '';
        if (p.oper_cn) {
            confirmMsg = '是否确认' + p.oper_cn + '?';
        }

        function handleCore(cindex) {
            if (cindex) {
                layer.close(cindex);
            }
            var loadIndex = null;
            if (p.forbidLoading != true) {
                loadIndex = layer.load();
            }
            $.ajax({
                url : p.url,
                data : handleHtml(p.data),
                type : 'post',
                success : function success(res) {
                    if(loadIndex) {
                        layer.close(loadIndex);
                    }
                    if (typeof res == 'object' && res.success) {
                        successFn(res.result);
                    } else {
                        layer.msg((p.oper_cn ? p.oper_cn : '操作') + '失败,' + res.message);
                    }
                },
                error: function (textStatus) {
                    if(loadIndex) {
                        layer.close(loadIndex);
                    }
                    if (textStatus.status == 401) {
                        location.href="/login";
                    }else if (typeof errorFn == 'function') {
                        errorFn();
                    } else {
                        location.href="/500";
                    }
                },
                complete: function (XMLHttpRequest, status) {
                    if(status == 'timeout') {
                        layer.msg('请求超时，请检查网络或稍后再试！');
                    }
                }
            });
        }


        if (confirmMsg) {
            layer.confirm(confirmMsg, {
                icon : 3,
                btn : [ '确认', '取消' ]
            }, handleCore, function(cindex) {
                layer.close(cindex);
            });
        } else {
            handleCore();
        }
    }

    return {
        get: get,
        post: post,
        string2html: string2html
    }
}());