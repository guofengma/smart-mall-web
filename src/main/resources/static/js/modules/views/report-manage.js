var ReportManage = (function(){
		let moduleId = '#report-manage',
			tableSelect = '#report-table',
			reportTimer = null,
			operationCodes = '',
			reportNowDate = '';
		let init = function(p){
			//初始化时间插件
			p = p ? p : {};
			laydate.render({
			  elem: '#report-search-date'/*,
			  max: 0*/
			});
			getPage();
			operationCodes = p.operationCodes ? p.operationCodes : '';
			event(operationCodes);
			webSocketLink();
		},
		getPage = function(p){
			let tpl = report_table_tpl.innerHTML,
				view = $(tableSelect + ' tbody'),
				pageId = 'report-page',
				params = $(moduleId).attr('data-params');
			p = p ? p : {};
			if(params && params != '') {
				params = JSON.parse(params);
			} else {
				params = {};
			}
			params.limit = p.limit ? p.limit : 10;
			params.page = p.page;
			CommonUtil.operation({
				moduleName: 'report',
				oper: 'getPage',
				params: params,
				forbidConfirm: true,
				forbidLoading: false,
			}, function(res) {
				let renderData = res.result ? res.result : [];
				laytpl(tpl).render(renderData, function(html){
					view.html(html);
					if(operationCodes.indexOf('download-r') == -1) { //下载权限
						$(tableSelect + ' tbody a.download').remove();
					};
					if(operationCodes.indexOf('remove-r') == -1) { //删除权限
						$(tableSelect + ' tbody a.remove').remove();
					};
					if(operationCodes.indexOf('re-try') == -1) { //重新加载
						$(tableSelect + ' tbody span.error').remove();
					};
					clearInterval(reportTimer);
					reportTimer = setInterval(function(){
						getStatus();
					},1000*60);
					if (renderData.totalPageNum > 0) {
						pageList({
							modelName: 'report',
							curr: renderData.currentPage,
							totalCount: renderData.totalCount,
						    limit: renderData.pageSize,
						    limits: [10,20,30,40,50]
						},function(obj){
							if(params.limit == obj.limit) {
								params.page = obj.curr;
							} else {
								params.limit = obj.limit;
								params.page = 1;
							}
				    	 	getPage(params);
						})
					} else {
						$('#' + pageId).html('');
					}
				});
			});
		},
		openPanel = function(p) {
			let tpl = report_form_panel_tpl.innerHTML,
				view = null,
				lwIndex = null,
				panelHeight;
			if(p.reportBusinessType == 'alarm') {
				panelHeight = '340px';
			} else if(p.reportBusinessType == 'deviceBusinessStatus') {
				panelHeight = '310px'
			} else if(p.reportBusinessType == 'visitor-statistics' || p.reportBusinessType == 'door' || p.reportBusinessType == 'vedio') {
				panelHeight = '230px'
			}
			setTimeout(function(){
				lwIndex = layer.open({
					type : 1,
					title : p.title + '报表',
					shadeClose: false,
					closeBtn: 1, 
					anim: 2,
					skin : 'layui-layer-rim', //加上边框
					area : [ '500px', panelHeight], //宽高
					content : '<div class="report-form-open"></div>',
					end: function() {
						layer.close(lwIndex);
					}
				});
				view = $('.report-form-open');
				laytpl(tpl).render(p.reportBusinessType, function(html){
					let nowDate = new Date();
						nowDate = nowDate.Format('yyyy/MM/dd');
					view.html(html);
					$('#report-register-date-range').val(getFirstDayOfMonth() + " - " + nowDate);
					//复选框初始化
					$('.i-checks').iCheck({
					    checkboxClass: 'icheckbox_square-green',
					    radioClass: 'iradio_square-green',
					});
					renderRegisterDate(view);
					//选择表单时间类型
					$('.report-form-open input[type="radio"]').on('ifChecked', function(event){
						$('.layui-laydate').remove();
						renderRegisterDate(view);
						
					});
					//取消
					$('.report-form-open a[type="cancel"]').unbind().on('click',function(){
						layer.close(lwIndex);
					});
					$('.report-form-open input[type="checkbox"]').on('ifChecked', function(event){
						let parent  = $(this).parents('.form-group');
						if(parent.hasClass('has-error')) {
							parent.removeClass('has-error');
							parent.find('span.help-block').html('');
						}
					});
					//表单验证
					$('.report-form-open form').validate({
						rules: {
							date:{
								required: true
							},
							systemCode: {
								required: true
							},
							eventAlertLevel: {
								required: true
							}
						},
						messages: {
							date:{
								required: icon + "请选择时间范围"
							},
							systemCode: {
								required: icon + "请选择统计类型"
							},
							eventAlertLevel: {
								required: icon + "请选择统计级别"
							}
						},
						submitHandler:function(form){
							var formData = $('.report-form-open form').serializeObject(),
								fileNameStrs = [],
								timeList;
							if(formData['date-type'] == 'day') {
								timeList = [formData.date,formData.date]
							} else if(formData['date-type'] == 'week') {
								timeList = [getFirstDayOfWeek(reportNowDate),getToday()]
							} else {
								timeList = formData.date.split(' - ')
							};
							console.dir(formData);
							console.dir(timeList);
							formData.reportBusinessType = p.reportBusinessType;
							if(timeList[1] == timeList[0]) {
								formData.queryParams = {
									startTime: new Date(timeList[0]).getTime(),
									endTime: new Date(timeList[1]).getTime() + 24 * 60 * 60 * 1000 - 1000,
								}
							} else {
								formData.queryParams = {
									startTime: new Date(timeList[0]).getTime(),
									endTime: new Date(timeList[1]).getTime()-1000,
								}
							}
							
							if(formData.systemCode && typeof formData.systemCode != 'string') {
								formData.systemCode = formData.systemCode.join(',');
							}
							if(formData.eventAlertLevel && typeof formData.eventAlertLevel != 'string') {
								formData.eventAlertLevel = formData.eventAlertLevel.join(',');
							}
							formData.queryParams.systemCode = formData.systemCode;
							formData.queryParams.eventAlertLevel = formData.eventAlertLevel;
							delete formData.date;
							delete formData.systemCode;
							delete formData.eventAlertLevel;
							if(formData.reportBusinessType == 'alarm') {
								formData.queryParams.systemCode =  "vedio";
							}
							if(!formData.queryParams.systemCode) {
								formData.queryParams.systemCode = formData.reportBusinessType;
							}
							formData.reportBusinessType;
							CommonUtil.operation({
								moduleName: 'report',
								oper: 'register',
								params: {reportRegister: JSON.stringify(formData)},
								forbidConfirm: true
							}, function(res) {
								layer.close(lwIndex);
								layer.msg('正在生成报表',{icon:6})
								setTimeout(function(){
									getPage();
								},100);
							});
						}    
					});
				})
				
			})
		},
		//获取这周的周一
		getFirstDayOfWeek = function (date) {
			date = date ? new Date(date) : new Date();
			var weekday = date.getDay()||7; //获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
			date.setDate(date.getDate()-weekday+1);//往前算（weekday-1）天，年份、月份会自动变化
			return date.Format('yyyy/MM/dd');
		},
		//获取该月的第一天
		getFirstDayOfMonth = function(date) {
			date= date ? date : new Date();
			date.setDate(1);
			return date.Format('yyyy/MM/dd');
		},
		//获取该月的最后
		getLastDayOfMonth = function(date) {
			
			date= date ? new Date(date): new Date();
			date.setDate(1);
			var dstr = date.Format('yyyy/MM/dd').split('/');
			var year = parseInt(dstr[0]);
			var month = parseInt(dstr[1]);
			var day = parseInt(dstr[2]);
			if(month == 12) {
				year = year + 1;
				month = 1;
			}
			return new Date(year + '/' + month + '/' + day).Format('yyyy/MM/dd');

		},
		//获取今天
		getToday = function(format){
			var  date= new Date();
			date = date.getTime();
			format = format ? format : 'yyyy/MM/dd';
			if(reportNowDate >= date) {
				date = reportNowDate;
			}
			date = new Date(date);
			return date.Format(format);
		},
		//返回今年已经过及正在过的季度
		getQuarters = function(p){
			var date= p.date ? new Date(p.date): new Date(),
				year = date.getFullYear(),
				month = date.getMonth()+1,
				num = Math.ceil(month/3),
				html = '',
				chNum = '',
				data = [],
				tempDate = null,
				value = '';
			for(let i = 1; i <= num; i++) {
				let temp = {};
				value = '';
				switch (i){
					case 1:
						chNum = '一';
						break;
					case 2:
						chNum = '二';
						break;
					case 3:
						chNum = '三';
						break;
					case 4:
						chNum = '四';
						break;
					default:
					    break;
				}
				//判断月份不小于1
				var tempM = i * 3 - 2;
				tempM = tempM < 1 ? 1 : tempM;
				
				tempDate = year + '/' + tempM + '/1';
				tempDate = new Date(tempDate);
				value = getFirstDayOfMonth(tempDate);
				//判断月份不大于12
				tempM = i * 3 + 1;
				tempM = tempM > 12 ? 12 : tempM;
				var tempDate1 = year + '/' + tempM + '/1';
				tempDate1 = new Date(tempDate1);
				value += ' - ' + getLastDayOfMonth(tempDate1);
				temp.name = '第' + chNum + '季度';
				temp.value = value;
				data.push(temp);
			};
			return data;
		},
		//返回今年已经过及正在过的月份
		getMonths = function(p) {
			let date= p.date ? new Date(p.date): new Date(),
				year = date.getFullYear(),
				month = date.getMonth()+1,
				value = '',
				tempDate = null,
				data = [];
			for(let i = 1; i <= month; i ++) {
				let temp = {};
				
				tempDate = year + '/' + i + '/1';
				tempDate = new Date(tempDate);
				
				value = getFirstDayOfMonth(tempDate);
				tempDate = year + '/' + (i+1) + '/1';
				tempDate = new Date(tempDate);
				value += ' - ' + getLastDayOfMonth(tempDate);
				temp.value = value;
				temp.name = i + '月';
				data.push(temp);
			}
			return data;	
		},
		/**
		 * 获取状态
		 * multiple:是否多次查询，默认否
		 */
		getStatus = function(p) {
			let tds_10 = $('#report-table td[data-reportStatus=10]'),
			 	tds_0 = $('#report-table td[data-reportStatus=0]'),
			 	tds = [];
			
			if(tds_10.length > 0 && tds_0.length > 0) {
				tds = tds_10.concat(tds_0);
			} else if(tds_10.length > 0) {
				tds = tds_10;
			} else {
				tds = tds_0;
			}
			if(tds.length > 0) {
				for(let i = 0; i < tds.length; i++) {
					let td_el = tds[i],
						taskId = $(td_el).parents('tr').attr('data-taskId');
					CommonUtil.operation({
						moduleName: 'report',
						oper: 'taskDetail',
						params: {taskId: taskId},
						forbidConfirm: true
					}, function(res) {
						let result = res.result;
						changeStatus({el:$(td_el),reportStatus:result.reportStatus,reportFileName:result.reportFileName,url:result.reportUrl});
					});
				}
			}
		},
		getDetail = function(p){
			CommonUtil.operation({
				moduleName: 'report',
				oper: 'taskDetail',
				params: {taskId: p.taskId},
				forbidConfirm: true
			}, function(res) {
				let result = res.result;
				changeStatus({el:$(p.td_el),reportStatus:result.reportStatus,reportFileName:result.reportFileName,url:result.reportUrl,reportTypeName:result.reportTypeName});
			});
		},
		changeStatus  = function(p){
			let html = '';
			p.reportStatus = p.reportStatus ? p.reportStatus: 10;
			if(!p.reportStatus ||p.reportStatus == 10 || p.reportStatus == 0) {
				html = '<i class=" circle-icon">&nbsp;</i>&nbsp;(正在生成报表...)';
			} else if(p.reportStatus == 20) {
				if(operationCodes.indexOf('download-r') != -1) { //下载权限
					if(p.url) {
						let fileName = '暂缺';
						html += '<a href="javascript:void(0)" title="下载" class="download" data-url="' + p.url +'"><i class="fa fa-download text-navy">&nbsp;&nbsp;</i></a>&nbsp;'
						if(p.reportFileName) {
							fileName = p.reportFileName;
						}
						//p.el.parent().find('.reportFileName').attr('onclick', 'filePreview.preview("' + p.url + '","' + fileName + '")');
						p.el.parent().find('.reportFileName').attr('onclick', 'layer.msg("当前文件暂不支持在线预览",{icon:5})');
					}
				};
				if(operationCodes.indexOf('remove-r') != -1) { //删除权限
					html += '<a href="javascript:void(0)" title="删除" class="remove"><i class="fa fa-trash text-navy">&nbsp;</i></a>&nbsp;'
				};
			} else if(p.reportStatus == 100) {
				if(operationCodes.indexOf('re-try') == -1) { //重新加载
					html = '<i class="fa fa-exclamation-triangle text-navy">&nbsp;</i>&nbsp;';
				} else {
					html = '<i class="fa fa-exclamation-triangle text-navy">&nbsp;</i>&nbsp;<span class="error">(生成失败，请<a class="reTry">重新生成</a>)</span>';
				};
			}
			if(p.el) {
				p.el.html(html);
				p.el.attr('data-reportstatus',p.reportStatus);
			}
			if(p.reportFileName) {
				p.el.parent().find('.reportFileName span').html(p.reportFileName);
			}
			if(p.reportTypeName) {
				p.el.parent().find('.reportTypeName').html(p.reportTypeName);
			}
		},
		search = function(){
			var searchmData = $('#report-searchform').serializeObject(),
				createTime = searchmData.createTime;
			if(createTime) {
				createTime = new Date(createTime);
				createTime = createTime.getTime();
				searchmData.createTimeStart = createTime - 8 * 60 * 60 * 1000;
				searchmData.createTimeEnd = createTime + 24 * 60 * 60 * 1000 -1000;
			}
			delete searchmData.createTime;
			
			$(moduleId).attr('data-params',JSON.stringify(searchmData));
			getPage();
			
		},
		reset = function(){
			CommonUtil.formDataSetAndGet({container:'#report-searchform',opt:'reset'});
			$(moduleId).attr('data-params','');
			getPage();	
		},
		layerDateInit = function(p) {
			p = p ? p : {}
			laydate.render({
				  elem: '#report-register-date-range',
				  range: (p.range == true) ? p.range : false,
				  format: 'yyyy/MM/dd',
				  max: getToday('yyyy-MM-dd') + ' 23:59:59',
				  ready: function(){
					 $('.layui-laydate.layui-laydate-range').addClass('layui-laydate-range-width');
				  },
				  done: function(value, date, endDate){
					  	let parent  = $('#report-register-date-range').parents('.form-group');
						if(parent.hasClass('has-error')) {
							parent.removeClass('has-error');
							parent.find('span.help-block').html('');
						} 
					  
					    setTimeout(function(){
					    	$('#report-register-date-range').blur();
					    })
					  }
				});
		},
		renderRegisterDate = function(el){
			let tpl = register_date_tpl.innerHTML,
				view = el.find('.register-date'),
				value = el.find("input[type='radio']:checked").val(),
				renderData = {},
				range = false;
			if(value == 'day'  || value == 'custom') {
				renderData.type = 'input';
				if( value == 'custom') {
					range = true;
					renderData.value = getFirstDayOfMonth() + ' - ' + getToday()
				} else {
					renderData.value = getToday();
				}
			} else if(value == 'week') {
				renderData.type = 'text';
			} else {
				let data = [];
				renderData.type = 'select';
				if(value == 'quarter') {
					renderData.data = getQuarters({date: reportNowDate});
				}
				if(value == 'month') {
					renderData.data = getMonths({date: reportNowDate});
				}
			}
			console.dir(renderData);
			laytpl(tpl).render(renderData, function(html){
				view.html(html);
				if(renderData.type == 'input') {
					layerDateInit({range: range})
				}
			})
		},
		/**
		 * 连接web socket推送
		 */
		webSocketLink = function(){
			let hostname = location.hostname, //主机名
				port = location.port, //端口号
				url = 'ws://' + hostname + ':' + port + '/websocket/notify';
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
			var reportWs = new SmartWebSocket({wxIndex:"reportWsId",url:url,callbacks:{
				message:function(res) {
					console.log('res',res);
					res = res.data ? res.data : '';
					if(res == '' || res == null ) {
						return false;
					} else if(res == registerCmdSuccess){
						console.info("打开管道注册成功")
	                    return true;
					}else if(res == registerCmdFail){
	                    console.error("打开管道注册失败");
	                    //todo 完善后续逻辑
	                    if(reportWs.number > 3) {
	                    	reportWs.destory();
	                    } else {
	                    	setTimeout(function(){
	                    		reportWs.init();
	                    	},1000*20); 
	                    }
	                } else if (res == cmdFalseSuccess){
	                	reportWs.destory();
	                } else {
						res = JSON.parse(res);
						let el = $(moduleId + ' tr[data-taskId="' + res.taskId + '"] .oper');
						if(res.status == 20) {
							changeStatus({el:el, reportStatus:res.status, reportFileName:res.fileName, url:reportWs.reportUrl,reportTypeName:res.handlerName});
							reportWs.reportUrl = null;
						} else {
							if(res.status == 10) {
								if(res.storagePath && res.storagePath.length > 0) {
									reportWs.reportUrl = res.storagePath;
								}
							}
							changeStatus({reportStatus:res.status, el:el})
						}
					};
				},
				/**
				 * 在打开的时候，处理相关消息
				 * @param e
				 */
	            open:function(e){
	            	reportWs.onsend(new CmdOperation("register","report").cmd());
				}
			}});
			reportWs.init();
		},
		event = function(operationCodes) {
			//打开form
			$(moduleId + ' .type-item span').on('click',function(){
				let parent = $(this).parent(),
					reportBusinessType = parent.attr('data-reportBusinessType'),
					title = parent.attr('data-title');
				if(operationCodes.indexOf(reportBusinessType) == -1) { //新增报表的权限
					return false;
				};
				CommonUtil.operation({
					moduleName: 'report',
					oper: 'getNowDate',
					type: 'get',
                    oper_cn: '获取当前时间',
                    forbidConfirm: true,
					params: {}
				}, function(res) {
					reportNowDate = res.result;
					openPanel({reportBusinessType: reportBusinessType, title: title});
				});
				
			})
			//下载
			$(tableSelect + ' tbody').unbind();
			$(tableSelect + ' tbody').on('click', '.download',function(){
				let self = $(this),
					parent = self.parents('tr'),
					fileName = parent.find('.reportFileName .name').html(),
					url = base  + "file/download?url=" + self.attr('data-url') + '&fileName=' + fileName;
				document.getElementById("ifile").src = url;
			})
			//删除
			$(tableSelect + ' tbody').on('click', '.remove',function(){
				let taskId = $(this).parents('tr').attr('data-taskId');
				CommonUtil.operation({
					moduleName: 'report',
					oper: 'remove',
                    oper_cn: '删除',
					params: {taskId: taskId}
				}, function(res) {
					layer.msg('删除成功！', {icon: 6,time: 2000});
					getPage();
				});
			});
			//重新生成
			$(tableSelect + ' tbody').on('click', 'a.reTry',function(){
				let self = $(this),
					taskId = self.parents('tr').attr('data-taskId');
				CommonUtil.operation({
					moduleName: 'report',
					oper: 'reTry',
					params: {taskId: taskId},
					forbidConfirm: true
				}, function(res) {
					changeStatus({el:self.parents('td')});
				});
			});
			//搜索
			$('#report-searchform button[role="submit"]').unbind().on('click',function(){
				search();
			})
			//搜索框内额回车事件
			$('#report-searchform').unbind('keydown').keydown('.form-control',function(event){
				if(event.keyCode==13){
					$('#report-searchform button[role="submit"]').trigger('click');
					return false;
			    }
			});
			//重置
			$('#report-searchform button.reset').unbind().on('click',function(){
				reset();
			})
		};
		return {
			init: init
		}	 
	}());