var AlarmManage = (function(){
	var moduleId = '#alarm-manage',
		searchFormSelector,
		sformDateRangeInit,
		paramsInit,
		init,
		operationCodes,
		firstPush = true;//第一次推送
	/**
	 * 搜索表单时间区间选择初始化
	 */
	sformDateRangeInit = function() {
		var dateRangeSelector = '#alarm-sform-date-range';
		// 获得区间赋值
		CommonUtil.formDataSetAndGet({
			container: searchFormSelector
		}, function(res) {
			var dFormat = 'yyyy/MM/dd',
				btStr = res.eventAlertTimeStart ? new Date(parseInt(res.eventAlertTimeStart)).Format(dFormat) : '',
				etStr = res.eventAlertTimeEnd ? new Date(parseInt(res.eventAlertTimeEnd)).Format(dFormat) : '',
				dateRangeStr = btStr && etStr ? (btStr + ' - ' + etStr) : '';

			// 渲染时间选择器
			$(dateRangeSelector).val(dateRangeStr);
			laydate.render({
				elem: dateRangeSelector,
				range: true,
				format: dFormat,
				value: dateRangeStr,
				done: function(v, date, endDate) {
					// 选择后赋值
					CommonUtil.formDataSetAndGet({
						container: searchFormSelector,
						data: {
							eventAlertTimeStart: DateUtil.getTime(date),
							eventAlertTimeEnd: DateUtil.getTime(endDate),
							rangeType: ''
						}
					})
					$(moduleId + ' .time-search a.selected').removeClass('selected');
				}
			});
		});
	};
	/**
	 * 参数初始化
	 */
	paramsInit = function() {
		searchFormSelector = '#alarm-searchform';
		sformDateRangeInit();
	};
	/**
	 * 置为已读
	 */
	let setRead = function(data,callback) {
		data = data ? data : {};
		data.ids = data.ids ? data.ids : null;
		CommonUtil.operation({
			moduleName: 'alarm',
			oper: 'doRead',
			type: 'post',
			oper_cn: '设置为已读',
			params: {ids:data.ids},
			forbidConfirm: data.forbidConfirm?data.forbidConfirm:'true'
		}, function(res) {
			if(typeof callback == 'function') {
				callback(res);
			}
		})
	},
	/**
	 * 连接web socket推送
	 */
	webSocketLink = function(){
		let hostname = location.hostname, //主机名
			port = location.port, //端口号
			url = 'ws://' + hostname + ':' + port + '/websocket/notify',
			/*url = 'ws://192.168.0.202:8123/websocket/notify',*/
			params = {viewStatus: 0},
			intervalTime = 60*1000*8,
			showData = {
				status:1, //1:新的报警,2:未读报警
				number:null, //数量
				msg:'未读',
				id:197
			},
			alarmPushTimer;
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
		var ws = new SmartWebSocket({wxIndex:1,url:url,callbacks:{//wxIndex不能重复
			message:function(res) {
				res = res.data ? res.data : '';
				if(res == '' || res == null ) {
					return false;
				} else if(res == registerCmdSuccess){
					console.info("打开管道注册成功")
                    return true;
				}else if(res == registerCmdFail){
                    console.error("打开管道注册失败");
                    //todo 完善后续逻辑
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
					if(firstPush) {
						getAlarmSta({paramStr:JSON.stringify(params)});
					} else {
						if(showData.number == null) {
							getAlarmSta({paramStr:JSON.stringify(params)});
						} else {
							showData.number += 1;
							showCover(showData);
						}
					}

					firstPush = false;
					clearInterval(alarmPushTimer);

					alarmPushTimer = setInterval(function(){
						getAlarmSta({paramStr:JSON.stringify(params)})
					},intervalTime);
				};
			},
			/**
			 * 在打开的时候，处理相关消息
			 * @param e
			 */
            open:function(e){
                ws.onsend(new CmdOperation("register","alarm").cmd());
			}
		}});
		ws.init();

		if(firstPush) {
			getAlarmSta({paramStr:JSON.stringify(params)});
			firstPush = false;
			clearInterval(alarmPushTimer);

			alarmPushTimer = setInterval(function(){
				getAlarmSta({paramStr:JSON.stringify(params)})
			},intervalTime);
		}

		function getAlarmSta(data) {
			CommonUtil.operation({
				moduleName: 'alarm',
				oper: 'alarmSta',
				type: 'get',
				params: data,
				forbidConfirm: 'true'
			}, function(res) {
				showData = {
					status:2,
					number:res.result, //数量
					msg:'未读',
					id: null
				};
				showCover(showData);
			})
		};
	};
	function showCover(data) {//展开提示框
		if(data.number == 0) {
			return false;
		}
		let cover_el = $(moduleId + ' .cover'),
			html = '当前有<strong>' + data.number + '</strong>条' + data.msg + '预警';
		cover_el.find('p').html(html);
		cover_el.animate({right: '5px'}, "slow");

	}
	function hideCover() {//关闭提示框
		let cover_el = $(moduleId + ' .cover');
			corver_w = cover_el[0].clientWidth + 10;
		corver_w = corver_w*-1 + 'px';
		cover_el.animate({right: corver_w}, "slow");
	};
	//获取分页数据
	function queryPage(data) {
		data = data ? data : {};
		CommonUtil.operation({
			moduleName: 'alarm',
			oper: 'page',
			type: 'get',
			params: data,
			forbidConfirm: 'true',
			forbidLoading: false
		}, function(res) {
			let tpl = alart_table_tpl.innerHTML,
				view = $('#alarm-table'),
				renderData = {
					pages: res.result.resultList,
					params: res.params
				},
				dFormat = 'yyyy/MM/dd',
				btStr = renderData.params.eventAlertTimeStart ? new Date(parseInt(renderData.params.eventAlertTimeStart)).Format(dFormat) : '',
				etStr = renderData.params.eventAlertTimeEnd ? new Date(parseInt(renderData.params.eventAlertTimeEnd)).Format(dFormat) : '';
			
			CommonUtil.formDataSetAndGet({
				container: searchFormSelector,
				data: {
					eventAlertTimeStart: btStr,
					eventAlertTimeEnd: etStr,
					timeSelect: btStr && etStr ? (btStr + ' - ' + etStr) : ''
				}
			});
			
			laytpl(tpl).render(renderData, function(html){
				view.html(html);
				if(operationCodes.indexOf('anomaly-location') === -1) { //定位异常权限
					$(moduleId + ' a[title="定位异常"]').remove();
				};
				if(operationCodes.indexOf('deal-info') === -1) { //处理异常权限
					$(moduleId + ' a[title="处理"]').remove();
				};
				if(operationCodes.indexOf('deal-history') === -1) { //报警追踪权限
					$(moduleId + ' a[title="报警追踪"]').remove();
				};
				if(operationCodes.indexOf('do-read') === -1) { //标记为已读
					$(moduleId + ' a.setRead').hide();
				};
				if(operationCodes.indexOf('do-all-read') === -1) { //全部标记为已读
					$(moduleId + ' a.setAllRead').hide();
				};
				$('.i-checks').iCheck({
				    checkboxClass: 'icheckbox_square-green',
				    radioClass: 'iradio_square-green',
				});
				view.removeClass('footable-loaded');
				$(moduleId + ' input[name="selected-all"]').iCheck('uncheck');
				$(moduleId + ' input[name="limit"]').val(res.result.pageSize);

				initTable({
					modelName: 'alarm',
					curr: res.result.currentPage,
					limit: res.result.pageSize,
					totalPage: res.result.totalPageNum,
					totalCount: res.result.totalCount
				},function(res){
					limit = $(moduleId + ' input[name="limit"]').val();
					if(limit != res.limit) {
						res.curr = 1;
					}
					search({limit:res.limit,curr:res.curr})
				});
				if(res.result.totalCount === 0) {
					$(moduleId + ' #alarm-page').addClass('hide');
					$(moduleId + ' .tools-bar .switch').addClass('hide');

				} else {
					$(moduleId + ' #alarm-page').removeClass('hide');
					$(moduleId + ' .tools-bar .switch').removeClass('hide');
				};
				$(moduleId + ' table tr').css('display','table-row');
				CommonUtil.itemsCheck({
					allSelector: moduleId + ' input[name="selected-all"]',
					itemSelector: moduleId + ' input[name="alarm-item"]'
				});
				$(moduleId + ' a[role="open-dealhistory-panel"]').bind('click', function() {//处理记录
					var alarmInfoId = $(this).attr('data-id');
					dealHistoryPanel(alarmInfoId);
				});
				//处理告警
				$(moduleId + ' a[role="deal-info"]').unbind().on('click',function(){//处理告警
					console.log('lallaal')
					let alarmId = $(this).attr('data-id');
					CommonUtil.ajaxRequest({
						url: 'alarm/deal-info',
						data: {
							id: alarmId,
						},
						forbidLoading: true
					}, function(res) {
						layer.open({
			                type: 1,
			                title:"报警处理",
			                resize :true,
			                maxmin:false,
			                skin: 'layui-layer-rim', //加上边框
			                area:["800px"],
			                maxHeight:document.body.clientHeight,
			                content: '<div class="wrapper-content">' + res + '<div style="clear:both"></div></div>'  
			            });
					});
				});
			});
		});
	};
	function dealHistoryPanel(alarmInfoId) {
		var panelIndex = -1;
	    CommonUtil.ajaxRequest({
	        url: 'alarm/deal-history',
	        type: 'get',
	        data: {
	        	id: alarmInfoId
	        }
	    },function(res){
			setTimeout(function() {
				panelIndex = layer.open({
					title: '报警信息处理记录',
					type: 1,
					skin: 'layui-layer-rim', //加上边框
					area: ['800px', '500px'], //宽高
					content: res
				});
			});
	    });
	};
	function search(data){
		var searchParams = $('#alarm-searchform').serializeObject();
		data = data ? data : {};
		searchParams.limit = data.limit ? data.limit : 10;
		searchParams.page = data.curr ? data.curr : 1;
		queryPage(searchParams);
	};
	function reset() {
		$(moduleId + ' form input[role="user-params"]').val('');
		$(moduleId + ' form select[role="user-params"]').val('');
		$(moduleId + ' form input[name="limit"]').val('10');
		$(moduleId + ' form input[name="page"]').val('1');
		$(moduleId + ' form input[name="dateType"]').val('');
		$(moduleId + ' .time-search a.selected').removeClass('selected');
		$(moduleId + ' .time-search a[role="all"]').addClass('selected');
	};
	/**
	 * 程序入口
	 */
	init = function(data) {

		paramsInit();
		search();
		webSocketLink();
		operationCodes = data.operationCodes;
		if(data.eventSourceId) {
			let input_el = $(moduleId + ' input[value='+data.eventSourceId+']'),
				parent = input_el.parents('td');
			console.log(input_el)
			console.log(parent)
			console.log(parent.find('.footable-toggle'))
			parent.find('.footable-toggle').trigger('click');
			setRead({ids:data.eventSourceId},function(res){
				input_el.attr('data-viewStatus','1');
				parent.find('.checkbox i').remove();
			})
		}
		$(moduleId + ' ul.handlerStatus li').unbind('click').bind('click', function() {
			let data_status = Number($(this).attr('data-status'));
			$(this).siblings().removeClass('active');
			$(this).addClass('active');
			$(searchFormSelector + ' input[name="handlerStatus"]').val(data_status);
			if(data_status === 200) {
				$(searchFormSelector + ' select[name="viewStatus"]').val('');
			};
			reset();
			pageSearch('alarm');
		});
		
		//展开查看详情,标记为已读
		$(moduleId).on('click', 'tr', function(){
			let self = $(this),
				inputEl = self.find('input[type="checkbox"]'),
				viewStatus = Number(inputEl.attr('data-viewStatus')),
				itemId = inputEl.attr('data-id');
			if(self.hasClass('footable-detail-show')) {
				if(viewStatus === 0) {
					setRead({ids:itemId},function(res){
						inputEl.attr('data-viewStatus','1');
						self.removeClass('unRead');
					})
				}
			}
		});
		CommonUtil.itemsCheck({
			allSelector: moduleId + ' input[name="selected-all"]',
			itemSelector: moduleId + ' input[name="alarm-item"]'
		});
		//批量标记为已读
		$(moduleId + ' .setRead').on('click', function(){
			let ids = [],
				limit = $(moduleId + ' #alarm-searchform input[name="limit"]').val(),
				page = $(moduleId + ' #alarm-searchform input[name="page"]').val();
			$(moduleId + ' input[name="alarm-item"]:checked').each(function() {
				ids.push($(this).val());
			});
			if(ids.length === 0) {
				layer.msg("未选中任何报警信息",{icon: 5});
			} else {
				setRead({ids:ids.join(','),forbidConfirm:'false'},function(res){
					if(res.success) {
						search({limit:limit,curr:page});
						layer.msg('标记成功',{icon:6})
					}
				});
			}
		});
		//全部标记为已读
		$(moduleId + ' .setAllRead').on('click', function(){
			let limit = $(moduleId + ' #alarm-searchform input[name="limit"]').val(),
				page = $(moduleId + ' #alarm-searchform input[name="page"]').val();
			setRead({forbidConfirm:false},function(res){
				if(res.success) {
					search({limit:limit,curr:page});
					layer.msg('已经全部置为已读',{icon:6})
				}
			});
		});
		//关闭推送
		$(moduleId + ' .cover i').on('click',function(e){
			 var oEvent = e || event;
             //js阻止事件冒泡
             oEvent.cancelBubble = true;
             oEvent.stopPropagation();

			hideCover();
		});
		//查看未读列表
		$(moduleId + ' .cover').unbind().on('click', function(){
			let eventSourceId = $(this).attr('data-id'),
				handlerStatus = Number($(moduleId + ' input[name="handlerStatus"]').val());
			hideCover();
			reset();
			$(searchFormSelector + ' select[name="viewStatus"]').removeAttr('disabled').val(0);
			if(eventSourceId) {
				$(searchFormSelector + ' input[name="eventSourceId"]').val(eventSourceId);
			};
			console.log('handlerStatus',handlerStatus)
			if(handlerStatus === 200) {
				$(moduleId + ' input[name="handlerStatus"]').val(0);
				pageSearch('alarm');
			} else {
				queryPage({viewStatus:0,limit:10});
			}

		});
		//搜索
		$(moduleId + ' form .submit').on('click',function(){
			search();
		});
		//搜索框内回车事件
		$(moduleId + ' form').unbind('keydown').keydown('.form-control',function(){
			if(event.keyCode==13){
				$(moduleId + ' form button.submit').trigger('click');
				return false;
		    }
		});
		//重置
		$(moduleId + ' form .reset').on('click',function(){
			reset();
			search();
		});
		//快捷搜索
		$(moduleId + ' .time-search a').on('click',function(){
			let role = $(this).attr('role');
			$(moduleId + ' .time-search a.selected').removeClass('selected');
			$(this).addClass('selected');
			
			CommonUtil.formDataSetAndGet({
				container: searchFormSelector,
				data: {
					eventAlertTimeStart: '',
					eventAlertTimeEnd: '',
					timeSelect: '',
					rangeType: role
				}
			});
			search();
		});
	}
	return {
		init: init,
		search: search,
		dealHistoryPanel: dealHistoryPanel
	}

}());
