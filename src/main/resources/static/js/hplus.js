/*******************************************************************************
 * layer模板引擎
 */
var laytpl = null, laypage = null;

layui.use([ 'laytpl', 'laypage' ], function() {
	laytpl = layui.laytpl;
	laypage = layui.laypage;
});

// 公共配置
layer.config({
	extend : [ 'extend/layer.ext.js', 'skin/moon/style.css' ],
	skin : 'layer-ext-moon'
});
function getZoomScale(el) {
	var bt = getBowserType(),
		zoomPer = '';
	
	if (bt === 'FF') {
		zoomPer = '-moz-';
	} else if (bt === 'Opera') {
		zoomPer = '-o-';
	} else if (bt === 'Safari' || bt === 'Chrome') {
		zoomPer = '-webkit-';
	} else if (bt.indexOf('IE') >= 0) {
		if (parseInt(bt.split('IE')[1]) >= 9) {
			zoomPer = '-ms-';
		} else {
			zoomPer = 'forbid';  
		}
	} else if (bt === '0') {
		zoomPer = 'forbid';
	}
	var matrix = 'none';
	if (zoomPer !== 'forbid') {
		/**
		 * matrix( a, b, c, d, e, f );
			a 水平缩放
			b 水平倾斜
			c 垂直倾斜
			d 垂直缩放
			e 水平移动
			f 垂直移动 
		 */
		matrix = el.css(zoomPer + 'transform');
	}
	
	return matrix !== 'none' ? 
			matrix.substring(matrix.indexOf('(') + 1, matrix.indexOf(')')).split(',') : matrix;

}

function getBowserType() {
	var userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
	var isOpera = userAgent.indexOf("Opera") > -1; // 判断是否Opera浏览器
	var isIE = userAgent.indexOf("compatible") > -1
			&& userAgent.indexOf("MSIE") > -1 && !isOpera; // 判断是否IE浏览器
	var isEdge = userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1
			&& !isIE; // 判断是否IE的Edge浏览器
	var isFF = userAgent.indexOf("Firefox") > -1; // 判断是否Firefox浏览器
	var isSafari = userAgent.indexOf("Safari") > -1
			&& userAgent.indexOf("Chrome") == -1; // 判断是否Safari浏览器
	var isChrome = userAgent.indexOf("Chrome") > -1
			&& userAgent.indexOf("Safari") > -1; // 判断Chrome浏览器

	if (isIE) {
		var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
		reIE.test(userAgent);
		var fIEVersion = parseFloat(RegExp["$1"]);
		if (fIEVersion == 7) {
			return "IE7";
		} else if (fIEVersion == 8) {
			return "IE8";
		} else if (fIEVersion == 9) {
			return "IE9";
		} else if (fIEVersion == 10) {
			return "IE10";
		} else if (fIEVersion == 11) {
			return "IE11";
		} else {
			return "0"
		}// IE版本过低
	}// isIE end

	if (isFF) {
		return "FF";
	}
	if (isOpera) {
		return "Opera";
	}
	if (isSafari) {
		return "Safari";
	}
	if (isChrome) {
		return "Chrome";
	}
	if (isEdge) {
		return "Edge";
	}
	if (!!window.ActiveXObject || "ActiveXObject" in window) {
		return "IE11";
	}
}
$(document).ready(function() {
	/** 页面拖拽事件监听*20180601*请联系Danica*勿删******BEGIN* */
	$(document).mousemove(function(e) {
		if (!!this.move) {
			var posix = !document.move_target ? {'x' : 0, 'y' : 0} : document.move_target.posix,
					callback = document.call_down || function() {
						var mc = document.move_container, mtTop, mtLeft;
						var mcMatrix = getZoomScale(document.move_container),
							mcHScale = 1,
							mcWScale = 1;
						
						if (mcMatrix !== 'none') {
							mcWScale = mcMatrix[0];
							mcHScale = mcMatrix[3];
						}
						
						var matrix = getZoomScale($(this.move_target));
						var matrixTop = 0, matrixLeft = 0;
						if (matrix !== 'none') {
							matrixTop = Math.round(posix.h * (1 - parseFloat(matrix[3])) / 2);
							matrixLeft = Math.round(posix.w * (1 - parseFloat(matrix[0])) / 2);
						}
						if (mc) {
							var mcOffset = mc.offset(), 
								minTop = matrixTop < 0 ? matrixTop * 2 : -matrixTop,
								minLeft = matrixLeft < 0 ? matrixLeft * 2 : -matrixLeft,
								maxTop = mc[0].clientHeight - posix.h + (matrixTop < 0 ? -matrixTop * 2 : matrixTop * 2), 
								maxLeft = mc[0].clientWidth - posix.w + (matrixLeft < 0 ? -matrixLeft * 2 : matrixLeft * 2);
							
							/*mtTop = (e.pageY - mcOffset.top - posix.y - matrixTop)/mcHScale;
							mtLeft = (e.pageX - mcOffset.left - posix.x - matrixLeft)/mcWScale;*/
							mtTop = (e.pageY - mcOffset.top  - posix.y)/mcHScale - matrixTop;
							mtLeft = (e.pageX - mcOffset.left - posix.x)/mcWScale - matrixLeft;
							
							mtTop = mtTop < minTop ? minTop : mtTop;
							mtLeft = mtLeft < minLeft ? minLeft : mtLeft;
							mtTop = mtTop > maxTop ? maxTop : mtTop;
							mtLeft = mtLeft > maxLeft ? maxLeft : mtLeft;
						} else {
							mtTop = e.pageY - posix.y;
							mtLeft = e.pageX - posix.x;
						}
						
						$(this.move_target).css({
							'top' : mtTop,
							'left' : mtLeft
						});
					};

			callback.call(this, e, posix);
		}
	}).mouseup(function(e) {
		if (!!this.move) {
			var callback = document.call_up
					|| function() {
					};
			callback.call(this, e);
			$.extend(this, {
				'move' : false,
				'move_target' : null,
				'move_container' : null,
				'call_down' : false,
				'call_up' : false
			});
			$('#box').removeClass('zoom')
		}
	});
	/** 页面拖拽事件监听*20180601*请联系Danica*勿删******END* */

	// MetsiMenu
	$('#side-menu').metisMenu();

	$(".right-sidebar-toggle").click(function() {
		$("#right-sidebar").toggleClass("sidebar-open")
	})
	// 固定菜单栏
	$(function() {
		$('.sidebar-collapse').slimScroll({
			height : '100%',
			railOpacity : 0.9,
			alwaysVisible : false
		});

	});

	if (localStorageSupport) {

		var collapse = localStorage.getItem("collapse_menu");
		var fixednavbar = localStorage.getItem("fixednavbar");
		var boxedlayout = localStorage.getItem("boxedlayout");

		var body = $('body');

		if (collapse == 'on') {
			if (!body.hasClass('body-small')) {
				body.addClass('mini-navbar');
			}
		}

		if (fixednavbar == 'on') {
			$(".navbar-static-top").removeClass(
					'navbar-static-top').addClass(
					'navbar-fixed-top');
			body.addClass('fixed-nav');
		}

		if (boxedlayout == 'on') {
			body.addClass('boxed-layout');
		}
	}
});

// 判断浏览器是否支持html5本地存储
function localStorageSupport() {
	return (('localStorage' in window) && window['localStorage'] !== null)
}
$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [ o[this.name] ];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};

Date.prototype.Format = function(fmt) { // author: meizz
	var o = {
		"M+" : this.getMonth() + 1, // 月份
		"d+" : this.getDate(), // 日
		"h+" : this.getHours(), // 小时
		"m+" : this.getMinutes(), // 分
		"s+" : this.getSeconds(), // 秒
		"q+" : Math.floor((this.getMonth() + 3) / 3), // 季度
		"S" : this.getMilliseconds()
	// 毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	for ( var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
					: (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

/**
 * 将毫秒转换为日期 date 毫秒 format 日期格式，例如yyyy-MM-dd HH:mm:ss
 */
function formatDate(date, format) {
	var v = "";
	date = new Date(date);
	if (typeof date == "string" || typeof date != "object") {
		return;
	}

	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();
	var weekDay = date.getDay();
	var ms = date.getMilliseconds();
	var weekDayString = "";
	if (weekDay == 1) {
		weekDayString = "星期一";
	} else if (weekDay == 2) {
		weekDayString = "星期二";
	} else if (weekDay == 3) {
		weekDayString = "星期三";
	} else if (weekDay == 4) {
		weekDayString = "星期四";
	} else if (weekDay == 5) {
		weekDayString = "星期五";
	} else if (weekDay == 6) {
		weekDayString = "星期六";
	} else if (weekDay == 0) {
		weekDayString = "星期日";
	}

	v = format;
	// Year
	v = v.replace(/yyyy/g, year);
	v = v.replace(/YYYY/g, year);
	v = v.replace(/yy/g, (year + "").substring(2, 4));
	v = v.replace(/YY/g, (year + "").substring(2, 4));

	// Month
	var monthStr = ("0" + month);
	v = v.replace(/MM/g, monthStr.substring(monthStr.length - 2));

	// Day
	var dayStr = ("0" + day);
	v = v.replace(/dd/g, dayStr.substring(dayStr.length - 2));

	// hour
	var hourStr = ("0" + hour);
	v = v.replace(/HH/g, hourStr.substring(hourStr.length - 2));
	v = v.replace(/hh/g, hourStr.substring(hourStr.length - 2));

	// minute
	var minuteStr = ("0" + minute);
	v = v.replace(/mm/g, minuteStr.substring(minuteStr.length - 2));

	// Millisecond
	v = v.replace(/sss/g, ms);
	v = v.replace(/SSS/g, ms);

	// second
	var secondStr = ("0" + second);
	v = v.replace(/ss/g, secondStr.substring(secondStr.length - 2));
	v = v.replace(/SS/g, secondStr.substring(secondStr.length - 2));

	// weekDay
	v = v.replace(/E/g, weekDayString);
	return v;
};

/*******************************************************************************
 * 选择微信公众号
 * 
 * @param moduleName
 *            模块名称
 * @param fn
 *            执行的方法
 */
function selectcompanyCode(moduleName, fn) {
	var value = $('#' + moduleName + 'SelectForm select').val();

	if (value != '') {
		$('#' + moduleName + 'Content').removeClass('hide')
		$('#' + moduleName + 'Add').removeClass('hide')
		fn;
	} else {
		$('#' + moduleName + 'Content').addClass('hide')
		$('#' + moduleName + 'Add').addClass('hide')
	}
}

/*******************************************************************************
 * js模板渲染
 * 
 * @param url
 *            获取数据的地址
 * @param moduleName
 *            模块名称
 * @param fn
 *            执行的方法
 */
function ajaxTpl(url, moduleName, fn) {
	CommonUtil
			.ajaxRequest(
					{
						url : url,
						type : 'get'
					},
					function(res) {
						if (res.success) {
							var temp = moduleName + 'DetailData', getTpl = temp.innerHTML, view = document
									.getElementById(moduleName + 'Detail-view');
							if (res.data.length > 0) {
								laytpl(getTpl).render(res, function(html) {
									view.innerHTML = html;
								});
							} else {
								view.innerHTML = '<p>暂无</p>'
							}

						} else {
							layer.msg(res.message ? res.message : '数据获取失败！', {
								icon : 5
							});
						}
					})
}
/*******************************************************************************
 * 选择回复类别
 * 
 * @param moduleName
 *            模块名称
 */
function chooseReplyType(moduleName) {
	var data = $('#' + moduleName + 'Form').serializeObject();
	if (data.replyType == 'news') {
		$('#' + moduleName + 'Form .textContainer').addClass('hide');
		$('#' + moduleName + 'Form .newsContainer').removeClass('hide');
	} else {
		$('#' + moduleName + 'Form .textContainer').removeClass('hide');
		$('#' + moduleName + 'Form .newsContainer').addClass('hide');
	}
}

function toTxt(str) {
	str = str.replace(/\<|\>/g, function(MatchStr) {
		switch (MatchStr) {
		case "<":
			return "&lt;";
			break;
		case ">":
			return "&gt;";
			break;
		default:
			return MatchStr;
			break;
		}
	})
	return str;
}
//阻止‘string’的输入
function prevent(string1, string2) {
	var e = event || window.event;
	if (e.key == string1) {
		e.returnValue = false;//string输入
		return false;
	}
	if (e.key == string2) {
		e.returnValue = false;//string输入
		return false;
	}
}