var DeviceExceptionManage = (function(){
	var moduleId;
	var searchFormEl;
	var fnParams = {};
	var controlClick = 0;
	function optFn(self, after) {
		if (controlClick === 0) {
			controlClick = 1;
			setTimeout(function() {
				controlClick = 0;
			}, 3000);
			fnParams = $(self).data();
			if (fnParams.opt) {
				eval(fnParams.opt + '()');
				if (typeof after == 'function') {
					after();
				}
			}
		} else {
			layer.msg('您的操作太频繁，请稍后再试或刷新！');
		}
	}

	var operationCodes;
	function operationLimit() {
		var allOpers = ['search', 'view', 'track', 'claim', 'location', 'do-read', 'do-all-read', 'sort'];
		allOpers.forEach(function(code) {
			var operEl = $('#' + moduleId + ' [oper-code="' + code + '"]');
			operEl.addClass('hide');
			if (operationCodes.indexOf(code) >= 0) {
				operEl.removeClass('hide');
			}
		})
	}

	/**
	 * 搜索表单初始化
	 */
	function searchFormInit() {
		/**
		 * 搜索表单时间区间选择初始化
		 */
		var timeRangeEl = searchFormEl + ' input.timeRange';
		// 获得区间赋值
		CommonUtil.formDataSetAndGet({
			container: searchFormEl
		}, function(res) {
			var dFormat = 'yyyy/MM/dd',
				btStr = res.bt ? new Date(parseInt(res.bt)).Format(dFormat) : '',
				etStr = res.et ? new Date(parseInt(res.et)).Format(dFormat) : '',
				dateRangeStr = btStr && etStr ? (btStr + ' - ' + etStr) : '';

			// 渲染时间选择器
			$(timeRangeEl).val(dateRangeStr);
			laydate.render({
				elem: $(timeRangeEl)[0],
				range: true,
				format: dFormat,
				value: dateRangeStr,
				done: function(v, date, endDate) {
					endDate.hours = 23;
					endDate.minutes = 59;
					endDate.seconds = 59;
					// 选择后赋值
					CommonUtil.formDataSetAndGet({
						container: searchFormEl,
						data: {
							bt: DateUtil.getTime(date),
							et: DateUtil.getTime(endDate),
							rangeType: ''
						}
					})
				}
			});
		});

		/**
		 * 表单按钮事件触发
		 */
		$(searchFormEl + ' button').unbind('click').click(function() {
			optFn(this);
		});
		//搜索框内额回车事件
		$(searchFormEl).unbind('keydown').keydown('.form-control',function(){
			if(event.keyCode==13){
				$(searchFormEl + ' button.submit').trigger('click');
				return false;
		    }
		});
	};
	
	//获取分页数据
	function getPage(data) {
		if (data.handlerStatus != 300) {
			$('#' + moduleId + ' .tools-bar .switch').addClass('hide');
		}
		data = data ? data : {};
		var parentEl = '#' + moduleId + ' div.list';
		$(parentEl).html('');
		$http.get({
			url: moduleId + '/page?' + new Date().getTime(),
			data: data,
			forbidLoading: true
		}, function(res) {
			$(parentEl).html(res);
			
			var params = $(parentEl + ' > table').data();
			$.extend(params, $(parentEl + ' > div.pagination').data());
			if (params) {
				// 搜索时间区间赋值
				var timeSelect = "";
				if (params.bt && params.et) {
					var dFormat = 'yyyy/MM/dd';
					var startDate  = new Date().Format(params.bt);
					var endDate =  new Date().Format(params.et);
					timeSelect = new Date(startDate).Format(dFormat) + ' - ' + new Date(endDate).Format(dFormat);
				}
				CommonUtil.formDataSetAndGet({
					container: searchFormEl,
					data: {
						timeSelect: timeSelect,
						limit: params.limit // 分页条数赋值
					}
				});
				$('#' + moduleId + ' span.new-event-count').html(params.newEventCount);
			}
			
			$('.i-checks').iCheck({
				checkboxClass: 'icheckbox_square-green',
				radioClass: 'iradio_square-green',
			});
			$(parentEl + ' > table').removeClass('footable-loaded');
			$(parentEl + ' > table').footable();
			if (params) {
				
				//加载分页控件
				laypage.render({
					elem: $(parentEl + ' > div.pagination')[0],
					count: params.totalCount,
					limit: params.limit,
					limits: [10, 20, 30, 40, 50],
					theme: '#3A8FE2',
					layout: ['count', 'prev', 'page', 'next', 'limit', 'skip'],
					curr: params.page,
					jump: function(obj, first) {
						if(!first) {
							CommonUtil.formDataSetAndGet({
								container: searchFormEl,
								data: {
									page: obj.curr,
									limit: obj.limit
								}
							}, function(searchParams) {
								getPage(searchParams);
							});
						}
					}
				});
			}

			
			
			CommonUtil.itemsCheck({
				allSelector: parentEl + ' input[name="selected-all"]',
				itemSelector: parentEl + ' input[name="read-item"]'
			});

			$(parentEl + ' a').unbind('click').click(function(){
				var self = this;
				optFn(self, function() {
					$(self).parent().parent().removeClass('unread');
				});
			});
			/**
			 * 	排序功能代码
			 * 	Example:
			 * 	<a class="sort-indicator" href="javascript:;" data-sort="happenTime">
					<i class="fa {{d.params.sort == 'happenTime' && d.params.order=='asc' ? 'fa-caret-up' : 'fa-caret-down'}}"></i>
				</a>
			*/
			$(parentEl + ' > table .sort-indicator').on('click', function(){
				let self = $(this);
				let sort = self.attr('data-sort');
				let order = "desc";
				if(self.children('i').hasClass('fa-caret-up')) {
					self.children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
					order = 'desc';
				} else {
					self.children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
					order = 'asc';
				}

				fnParams = {
					sort: sort,
					order: order
				};
				formSearch();
			});
			operationLimit();
			controlClick = 0;
		});
	};
	/**
	 * 表单查询
	 * @param {*} data 
	 */
	function formSearch() {
		CommonUtil.formDataSetAndGet({
			container: searchFormEl,
			data: fnParams,
			opt: fnParams.reset ? 'reset' : null // reset表示重置表单
		}, function(searchParams) {
			getPage(searchParams);
		});
	}

	/**
	 * 设置已读
	 */
	function setRead() {
		var ids = null;
		var succTip = '已经全部置为已读';
		if (fnParams.type == 'part') {
			ids = [];
			$('#' + moduleId + ' input[name="read-item"]:checked').each(function() {
				ids.push($(this).val());
			});
			if (ids.length == 0) {
				layer.msg("未选中任何异常信息",{icon: 5});
				return false;
			}
			succTip = '标记成功';
			fnParams = {
				ids: ids.join(',')
			}
		}
		
		$http.post({
			url: moduleId + '/doRead',
			data: fnParams,
			forbidLoading: true
		}, function(res) {
			layer.msg(succTip, {icon: 6});
			getDeviceExceptionSta(); // 获取未读异常数据
			formSearch();
		});
	}
	/**
	 * 追踪
	 */
	function track() {
		$http.get({
	        url: moduleId + '/deal-history?' + new Date().getTime(),
	        data: fnParams,
			forbidLoading: true
	    },function(res){
			setTimeout(function() {
				layerWindowIndex = layer.open({
					title: '处理记录',
					type: 1,
					skin: 'layui-layer-rim', //加上边框
					area: ['800px', '500px'], //宽高
					content: res,
					end: function() {
						layer.close(layerWindowIndex);
					}
				});
				controlClick = 0;
			});
	    });
	}

	/**
	 * 认领
	 */
	function claim() {
		$http.post({
			url: 'work-order/transfer',
			data: fnParams,
			forbidLoading: true
		}, function() {
			controlClick = 0;
			goPage('index');
		})
	}
	
	var activeHStats = [];
	function changeHStat() {
		var activeEl = $('#' + moduleId + ' div.hStat-nav a[data-h-stat="' + fnParams.hStat + '"]').parent();
		
		if (activeEl.hasClass('active')) {
			activeEl.removeClass('active').addClass('normal');
		} else {
			activeEl.addClass('active').removeClass('normal');
		}

		activeHStats = [];
		$('#' + moduleId + ' div.hStat-nav li.active').each(function() {
			var self = $(this);
			activeHStats.push($(self.find('a')[0]).data().hStat);
		})
		
		fnParams = {
			hStat: activeHStats.join(','),
			page: 1,
			limit: 10
		};
		
		formSearch();
	}
	var firstPush = true;
	function getDeviceExceptionSta(data) {
		$http.get({
			url: 'device-exception/notRead?' + new Date().getTime(),
			forbidLoading: true
		}, function(res) {
			showCover({
				status: 2,
				number: res.result,
				msg: '未读',
				id: null
			});
		});
		
	};
	function webSocketLink(){
		let hostname = location.hostname, //主机名
			port = location.port, //端口号
			url = 'ws://' + hostname + ':' + port + '/websocket/notify',
			intervalTime = 60*1000*8,
			showData = {
				number:null, //数量
				msg:'未读'
			},
			dePushTimer;

		firstPush = true;
        var CmdOperation =function (operation,value){
			this.operation = operation;
			this.value = value;
            this.cmd = function(){
                return "CMD:" + this.operation + " VALUE:" + this.value;
            };
		};
		var cmdFalseSuccess = new CmdOperation("cmd", "false").cmd();
        var registerCmdSuccess = new CmdOperation("register", "true").cmd();
        var registerCmdFail = new CmdOperation("register", "false").cmd();
		//打开web socket
		var ws = new SmartWebSocket({
			wxIndex:'deviceExWSIndex',
			url:url,
			callbacks:{
			message:function(res) {
				res = res.data ? res.data : '';
				if(res == '' || res == null ) {
					return false;
				} else if(res == registerCmdSuccess){
					console.info("打开管道注册成功")
                    return true;
				}else if(res == registerCmdFail){
                    console.error("打开管道注册失败");
                    if(ws.number > 3) {
                    	ws.destory();
                    } else {
                    	setTimeout(function(){
                    		ws.init();
                    	},1000*20); 
                    }
                } else if (res == cmdFalseSuccess){
                	ws.destory();
                } else {
                	//此处的代码根据需要修改
					if(firstPush) {
						getDeviceExceptionSta();
					} else {
						if(showData.number == null) {
							getDeviceExceptionSta();
						} else {
							showData.number += 1;
							showCover(showData);
						}
					}

					firstPush = false;
					clearInterval(dePushTimer);

					dePushTimer = setInterval(function(){
						getDeviceExceptionSta()
					},intervalTime);
				};
			},
			/**
			 * 在打开的时候，处理相关消息
			 * @param e
			 */
            open:function(e){
                ws.onsend(new CmdOperation("register","abnormal").cmd());
			}
		}});
		ws.init();

		if(firstPush) {
			getDeviceExceptionSta();
			firstPush = false;
			clearInterval(dePushTimer);
			dePushTimer = setInterval(function(){
				getDeviceExceptionSta()
			},intervalTime);
		}
	};

	function showCover(data) {//展开提示框
		if(data.number == 0) {
			return false;
		}
		// data.number = data.number > 99 ? '..' : data.number;
		let cover_el = $('#' + moduleId + ' .cover'),
			html = '当前有<strong>' + data.number + '</strong>条' + data.msg + '异常';
		cover_el.find('p').html(html);
		cover_el.animate({right: '0px'}, "slow");
	}
	function hideCover() {//关闭提示框
		let cover_el = $('#' + moduleId + ' .cover');
		cover_el.animate({right: '-300px'}, "slow");
	};
	
	/**
	 * 程序入口
	 */
	function init(p) {
		fnParams = {};
		operationCodes = p.operationCodes;
		moduleId = p.moduleId ? p.moduleId : 'device-exception';
		searchFormEl = '#' + moduleId + ' form.search-form';
		searchFormInit();
		formSearch();
		$('#' + moduleId + ' a').unbind('click').click(function() {
			optFn(this);
		});

		webSocketLink();
		//关闭推送
		$('#' + moduleId + ' .cover i').on('click',function(e){
			var oEvent = e || event;
			//js阻止事件冒泡
			oEvent.cancelBubble = true;
			oEvent.stopPropagation();

		   hideCover();
	   });

	   //查看未读列表
	   $('#' + moduleId + ' .cover').unbind().on('click', function(){
		   	hideCover();
			fnParams = {
				page: 1,
				limit: 10,
				rStat: 0
			}
		   	CommonUtil.formDataSetAndGet({
				container: searchFormEl,
				opt: 'reset'
			});
			formSearch();

	   });
	}
	return {
		init: init
	}

}());
