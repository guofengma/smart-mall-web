var patternChooseManage = (function(){
	let patternTimer = null,
		El = '#pattern-choose',
		operationCodes;
	let init = function(data){
		operationCodes = data.operationCodes?data.operationCodes:'';
		timeStyleInit()
		if(operationCodes.indexOf('change-time') == -1) { // 编辑模式时间权限
			$(El + ' .time-select').attr('disabled','');
		};
		if(operationCodes.indexOf('add-pat-cho') == -1) { // 选择商场模式权限
			$(El + ' .no-pattern-btn').attr('disabled','');
		};
		if(operationCodes.indexOf('edit-pat-cho') == -1) { // 改变商场模式权限
			$(El + ' .pattern-btn').attr('disabled','');
		};
		if(operationCodes.indexOf('handler-pat-cho') == -1) { // 进入操作面板权限
			$(El + ' .operation').remove();
		};
		if(operationCodes.indexOf('edit-pat-cho') == -1 && operationCodes.indexOf('reset-pat-cho') == -1) { // 进入操作面板权限
			$(El + ' .operation').remove();
		};
		clearInterval(patternTimer);
		getNowTimer();
		patternTimer = setInterval(function(){
			getNowTimer();
		}, 1000)
		
		resize()
		window.onresize = resize;	
		
		$(El + ' .no-pattern-btn').unbind().on('click',function(){
			let timeSortId = $(this).parents('.pattern-choose-item').attr('data-id');
			patternChoosePanel({timeSortId:timeSortId});
		})
		$(El + ' .pattern-choose-item .item-shade').unbind().on('click',function(){
			let subsystemPatternSetId = $(this).parent().attr('data-subsystemPatternSetId');
			if(!subsystemPatternSetId) {
				layer.msg('该时段未配置模式',{icon:5});
				return false;
			};
			setTimeout(function() {
				patternDetailPanel({id:subsystemPatternSetId});
			});
		})
		$(El + ' .pattern-choose-item .operation').unbind().on('click',function(){
			let parent = $(this).parents('.pattern-choose-item');
			parent.find('.cover').removeClass('hide');
			if(operationCodes.indexOf('edit-pat-cho') == -1) { // 改变商场模式权限
				parent.find('.cover').find('.edit').addClass('hide');
			};
			if(operationCodes.indexOf('reset-pat-cho') == -1) { // 重置商场模式权限
				parent.find('.cover').find('.reset').addClass('hide');
			};
		});
		$(El + ' .bottom-cover').unbind().on('click',function(){
			$(El + ' .cover').addClass('hide');
		});
		$(El + ' .pattern-choose-item .cover .edit').unbind().on('click',function(){
			
			let timeSortId = $(this).parents('.pattern-choose-item').attr('data-id'),
				subsystemPatternSetId = $(this).attr('data-subsystemPatternSetId');
			patternChoosePanel({timeSortId:timeSortId,subsystemPatternSetId:subsystemPatternSetId});
		})
		$(El + ' .pattern-choose-item .cover .reset').unbind().on('click',function(){
			let timeSortId = $(this).parents('.pattern-choose-item').attr('data-id');
			reset({id:timeSortId});
		})
	},
	patternChoosePanel = function(data){
		let tpl = pattern_choose_tpl.innerHTML,
			view,timeSortId;
		
		data = data ? data : {};
		timeSortId = data.timeSortId ? data.timeSortId : null;
		setTimeout(function() {
			lwIndex = layer.open({
				type : 1,
				title : '选择模式',
				shadeClose: false,
				closeBtn: 1, 
				anim: 2,
				skin : 'layui-layer-rim', //加上边框
				area : [ '600px', '400px' ], //宽高
				content : '<div class="pattern-open"></div>',
				end: function() {
					layer.close(lwIndex);
				}
			});
			view = $('.pattern-open');
			PatternInterface.combpatterns({},function(res) {
				
				laytpl(tpl).render(res, function(html){
					view.html(html);
					$('.pattern-open .pattern-choose-item').on('click',function() {
						let self = $(this),
							selected_pattern = $('.pattern-open .selected-pattern');
						if(!self.hasClass('actived')) {
							$('.pattern-open .pattern-choose-item').removeClass('actived');
							$('.pattern-open .pattern-msg').addClass('hide');
							$('.pattern-open .status').addClass('hide');
							self.addClass('actived');
							self.find('.pattern-msg').removeClass('hide');
						} else {
							self.removeClass('actived');
							self.find('.pattern-msg').addClass('hide');
						}
						if(selected_pattern.length > 0) {
							if(selected_pattern.find('.pattern-msg').hasClass('hide')) {
								selected_pattern.find('.status').removeClass('hide');
							}
						};
					})
					$('.pattern-open .pattern-choose-item .btn-1').on('click',function(event){//应用
						let self = $(this),
							parent = self.parent().parent().parent();
							value = parent.attr('data-value');
						event.stopPropagation();
						layer.confirm('确认应用？', {
							btn: ['确认','取消'], //按钮
							shade: true //显示遮罩
						}, function(lindex){
							layer.close(lindex);
							$('.pattern-open .pattern-choose-item').removeClass('selected-pattern');
							$('.pattern-open .pattern-choose-item .status').addClass('hide');
							$('.pattern-open .pattern-choose-item .btn-1').removeClass('hide');
							$('.pattern-open .pattern-choose-item .btn-2').addClass('hide');
							self.addClass('hide');
							parent.find('.btn-2').removeClass('hide');
							parent.addClass('selected-pattern');
							value = JSON.parse(value);
							
							PatternInterface.perfectMallPattern({id:timeSortId,str:JSON.stringify(value)},function(res){
								
								layer.close(lwIndex)
								let slot = $(El+ ' .pattern-choose-item[data-id="'+ timeSortId + '"]');
								slot.find('.pattern-btn').html(value.subsystemPatternSetName);
								slot.find('.pattern-btn').attr('data-id',value.subsystemPatternSetId);
								slot.find('.pattern-btn').removeClass('hide');
								slot.find('.no-pattern-btn').addClass('hide');
								slot.find('.operation').removeClass('hide');
								slot.find('.edit').attr('data-subsystemPatternSetId',value.subsystemPatternSetId);
								layer.msg('保存成功', {icon:6});
							})
							
							
						});
					});
					$('.pattern-open .pattern-choose-item .btn-2').on('click',function(event){
						let self = $(this),
							parent = self.parent().parent().parent();
						
						event.stopPropagation();
						layer.confirm('确认取消应用？', {
							btn: ['确认','取消'], //按钮
							shade: true //显示遮罩
						}, function(lindex){
							self.addClass('hide');
							parent.find('.btn-1').removeClass('hide');
							parent.removeClass('selected-pattern');
							reset({id:timeSortId})
							layer.close(lindex);
						});
						
					});
					
					if(data && data.subsystemPatternSetId) {
						let temp = $('.pattern-open div[data-id=' + data.subsystemPatternSetId + ']');
						temp.addClass('actived');
						temp.addClass('selected-pattern');
						temp.find('.pattern-msg').removeClass('hide');
						temp.find('.btn-1').addClass('hide');
						temp.find('.btn-2').removeClass('hide');
					}
				});
			})
		});
		
			
	},
	patternDetailPanel = function(data) {
		lwIndex = layer.open({
			type : 1,
			title : '模式详情',
			shadeClose: false,
			closeBtn: 1, 
			anim: 2,
			skin : 'layui-layer-rim', //加上边框
			area : [ '600px', '300px' ], //宽高
			content : '<div class="pattern-open"></div>',
			end: function() {
				layer.close(lwIndex);
			}
		});
		let tpl = pattern_detail_tpl.innerHTML,
		view = $('.pattern-open');
		PatternInterface.detail(data,function(res){
			res.string = JSON.stringify(res);
			
			laytpl(tpl).render(res, function(html){
				view.html(html);
			});
		})
		
	},
	reset = function(data) {
		PatternInterface.cancelSubsystemPatternSet(data,function(res){
			layer.msg('取消成功',{icon:6});
			let slot = $(El+ ' .pattern-choose-item[data-id="'+ data.id + '"]');
			slot.find('.pattern-btn').addClass('hide');
			slot.find('.no-pattern-btn').removeClass('hide');
			slot.find('.operation').addClass('hide');
			slot.find('.edit').removeAttr('data-subsystemPatternSetId');
		});
	},
	timeStyleInit = function(data) {//卡片样式
		let mockData = [{name:"凌晨",startTime:'00:00',endTime:'06:00',classN: 'slot-1'},
			            {name:"日间",startTime:'06:00',endTime:'18:00',classN: 'slot-2'},
			            {name:"傍晚",startTime:'18:00',endTime:'20:00',classN: 'slot-3'},
			            {name:"夜间",startTime:'20:00',endTime:'24:00',classN: 'slot-4'}];
		mockData.forEach(function(value, index) {
			mockData[index].startTime = getMinutes(value.startTime);
			mockData[index].endTime = getMinutes(value.endTime);
		});
		
		$(El + ' .pattern-choose-item .time-slot span').each(function(index1, time_sort_el) {
			let self = $(time_sort_el),
				parent = self.parents('.pattern-choose-item');
				time_value = self.html().split('-'),
				sort_start_index = null,
				sort_end_index = null,
				classN = null;
			time_value[0] = getMinutes(time_value[0]);
			time_value[1] = getMinutes(time_value[1]);
			
			mockData.forEach(function(value, index) {
				if(value.startTime <= time_value[0] && value.endTime >= time_value[0]) {
					sort_start_index = index;
				};
				if(value.startTime <= time_value[1] && value.endTime >= time_value[1]) {
					sort_end_index = index;
				};
			});	
			
			if(sort_start_index == sort_end_index) {
				classN = mockData[sort_start_index].classN
			} else if(sort_end_index-sort_start_index == 1) {
				let d_value_1 = mockData[sort_start_index].endTime-time_value[0],
					d_value_2 = time_value[1] - mockData[sort_end_index].startTime;
				if(d_value_1 >= d_value_2) {
					classN = mockData[sort_start_index].classN;
				} else {
					classN = mockData[sort_end_index].classN;
				}
			} else if(sort_end_index-sort_start_index == 2) {
				let d_value_1 = mockData[sort_start_index].endTime-time_value[0],
					d_value_3 = time_value[1] - mockData[sort_end_index].startTime,
					d_value_2 = mockData[sort_start_index+1].endTime-mockData[sort_start_index+1].startTime;
				let max = [d_value_1,d_value_2,d_value_3].sort(function(a, b) {//b-a从大到小，a-b从小到大
				    return b-a;
				})[0];
				
				if(d_value_1 == max) {
					classN = mockData[sort_start_index].classN;
				} else if (d_value_2 == max){
					classN = mockData[sort_start_index + 1].classN;
				} else if (d_value_3 == max) {
					classN = mockData[sort_end_index].classN;
				}
			} else if(sort_end_index-sort_start_index == 3) {
				let d_value_1 = mockData[0].endTime-time_value[0],
					d_value_4 = time_value[1] - mockData[3].startTime,
					d_value_2 = mockData[2].endTime-mockData[1].startTime;
					d_value_3 = mockData[3].endTime-mockData[2].startTime;
					
				let max = [d_value_1,d_value_2,d_value_3,d_value_4].sort(function(a, b) {//b-a从大到小，a-b从小到大
				    return b-a;
				})[0];
				
				if(d_value_1 == max) {
					classN = mockData[0].classN;
				} else if (d_value_2 == max){
					classN = mockData[1].classN;
				} else if (d_value_3 == max) {
					classN = mockData[2].classN;
				} else if (d_value_4 == max) {
					classN = mockData[3].classN;
				}
			}
			parent.addClass(classN);
		});
		function getMinutes(time){//将时间转换成分钟
			time = time.split(':');
			return time[0]*60 + time[1]*1;	
		}
	},
	getNowTimer = function(){
		let now_timer  = new Date(),
			year,month,day,week_day,
			temp_list = [],
			yyyymmdd = null,
			day_type_name = '工作日';
		now_timer =  formatDate(now_timer,'yyyy-MM-dd HH:mm:ss E');
		temp_list = now_timer.split(' ');
		now_timer = temp_list[1];
		if($(El + ' .time .year').html() == '') {
			week_day = temp_list[2];
			temp_list = temp_list[0].split('-');
			yyyymmdd = temp_list.join('');
			year = temp_list[0];
			month = temp_list[1]*1;
			day = temp_list[2]*1;
			$(El + ' .time .year').html(year);
			$(El + ' .time .month').html(month+'月');
			$(El + ' .time .day').html(day);
			
			CommonUtil.operation({
				moduleName: 'mall-pattern-calendar',
				oper: 'findMallPatternByDay',
				params: {yyyymmdd: yyyymmdd},
				forbidConfirm: true
			}, function(res) {
				day_type_name = res.result.name;
				$(El + ' .time .below .week-day').html('&nbsp;' + week_day + '&nbsp;&nbsp;');
			});
		}
		$(El + ' .time .time-time').html(now_timer);
	},
	resize = function(){
		let temp_p = $(El).parents('.tabs-container'),
		temp_h = null;
		if(!temp_p[0]) {
			return false;
		}
		temp_h = temp_p[0].offsetHeight;
		$(El + ' .pattern-choose-container').css('height',temp_h - 50 + 'px')
	};
	return {
		init: init
	};
}());
