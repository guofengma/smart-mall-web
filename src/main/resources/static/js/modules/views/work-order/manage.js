var WorkOrderManage  = (function(){
	var moduleId;
	var searchFormEl;
	var fnParams = {};

	var operationCodes;
	var assignStatus;
	function operationLimit() {
		var allOpers = ['search', 'view', 'track', 'assign', 'receive', 'reject', 'deal','location', 'sort'];
		allOpers.forEach(function(code) {
			var operEl = $('#' + moduleId + ' [oper-code="' + code + '"]');
			operEl.addClass('hide');
			if (operationCodes.indexOf(code) >= 0) {
				if (code === 'assign' && assignStatus === 2) {
					return false;
				}
				operEl.removeClass('hide');
			}
		})
	}
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
				$(searchFormEl + ' button.search').trigger('click');
				return false;
		    }
		});
	};
	
	//获取分页数据
	function getPage(data) {
		data = data ? data : {};
		var parentEl = '#' + moduleId + ' div.list';
		$(parentEl).html('');
		$http.get({
			url: moduleId + '/page?' + new Date().getTime(),
			data: data
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
			}
			
			$('.i-checks').iCheck({
				checkboxClass: 'icheckbox_square-green',
				radioClass: 'iradio_square-green',
			});
			$(parentEl + ' > table').removeClass('footable-loaded');
			$(parentEl + ' > table').footable();
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

			
			
			$(parentEl + ' a').unbind('click').click(function(){
				var self = this;
				optFn(self, function() {
					$(self).parent().parent().removeClass('unread');
				})
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
				}
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
	 * 修改工单管理类型
	 */
	function changeType() {
		var typedLi = $('#' + moduleId + ' ul.type li > a[data-type="' + fnParams.type +'"]').parent();
		typedLi.siblings().removeClass('active');
		typedLi.addClass('active');
		CommonUtil.formDataSetAndGet({
			container: searchFormEl,
			opt: 'reset',
		});
		fnParams.page = 1;
		fnParams.limit = 10;
		fnParams.sort = 'workOrderNumber';
		fnParams.order = 'desc';

		formSearch();
	}

	/**
	 * 修改工单处理类型
	 */
	function changeHStat() {
		var typedLi = $('#' + moduleId + ' ul.hStat li > a[data-h-stat="' + fnParams.hStat +'"]').parent();
		typedLi.siblings().removeClass('active');
		typedLi.addClass('active');
		formSearch();
		
	}

	/**
	 * 处理
	 */
	function deal() {
		$http.get({
			url: moduleId + '/deal-info?' + new Date().getTime(),
			data: fnParams,
			forbidLoading: true
		}, function(res) {
			setTimeout(function() {
				layerWindowIndex = layer.open({
					type: 1,
					title:"处理",
					resize :true,
					maxmin:false,
					skin: 'layui-layer-rim', //加上边框
					area:["800px", '500px'],
					maxHeight:document.body.clientHeight,
					content: '<div class="wrapper-content">' + res + '<div style="clear:both"></div></div>',
					end: function() {
						layer.close(layerWindowIndex);
					}
				});
				controlClick = 0;
			});
		});
	}

	/**
	 * 指派
	 */
	function assign() {
		$http.get({
	        url: moduleId + '/assign-form?' + new Date().getTime(),
	        data: fnParams,
			forbidLoading: true
	    },function(res){
			setTimeout(function() {
				layerWindowIndex = layer.open({
					title: '任务指派',
					type: 1,
					skin: 'layui-layer-rim', //加上边框
					area: ['800px', '500px'], //宽高
					maxHeight:document.body.clientHeight,
					content: res,
					end: function() {
						layer.close(layerWindowIndex);
					}
				});
				controlClick = 0;
			});
	    });
	}
	function transfer() {
		$http.post({
			url: 'work-order/transfer',
			data: fnParams,
			forbidLoading: true
		}, function() {
			controlClick = 0;
			fnParams = {
				page: 1,
				limit: 10
			}
			formSearch();
		})
	}
	
	function reject() {
		layer.prompt({title: '退回原因', formType: 2}, function(text, index){
			layer.close(index);
			fnParams.memo = text;
			transfer();
		});
	}

	/**
	 * 追踪
	 */
	function track() {
		$http.get({
	        url: moduleId + '/deal-history?' + new Date().getTime(),
	        data: fnParams
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
			});
			controlClick = 0;
	    });
	}
	
	/**
	 * 程序入口
	 */
	function init(p) {
		fnParams = {};
		operationCodes = p.operationCodes;
		assignStatus = p.assignStatus;
		moduleId = p.moduleId ? p.moduleId : 'device-exception';
		searchFormEl = '#' + moduleId + ' form.search-form';
		controlClick = 0;
		searchFormInit();
		formSearch();

		/**
		 * 列表href事件触发
		 */
		$('#' + moduleId + ' a').unbind('click').click(function() {
			optFn(this);
		});

	}
	return {
		init: init
	}

}());
