var RunSettingManage = (function(){
	let El,
		mockData,
	    color_list,
		mallPatternId = null,
		mallPatternDetail = null,
		operationCodes = null;
	let init  = function(data){
			mallPatternId = data.mallPatternId ? data.mallPatternId : 1;
			operationCodes = data.operationCodes;
			El = '.run-setting';
			color_list = ['fdbf41', '1687d5','14c6bc','f43d7e','cc3a76','4b65fa','01649b','910e4d'];
			mockData = [{name:"凌晨",startTime:'00:00',endTime:'06:00'},
			            {name:"日间",startTime:'06:00',endTime:'18:00'},
			            {name:"傍晚",startTime:'18:00',endTime:'20:00'},
			            {name:"夜间",startTime:'20:00',endTime:'24:00'}];
			getMallpatternDetail({mallPatternId:mallPatternId});
			if(operationCodes.indexOf('edit-day-type') == -1) {//编辑日期类型的权限
				$(El + ' .above .edit').remove();
			}
			if(operationCodes.indexOf('remove-day-type') == -1) {//删除日期类型的权限
				$(El + ' .above .remove').remove();
			}
			if(operationCodes.indexOf('remove-day-type') == -1) {//调整时间段的权限
				$(El + ' .time-sort-link').remove();
			}
			$(El + ' select').unbind().on('change', function() {
				if($(this).val()){
					mallPatternId = $(this).val();
					getMallpatternDetail({mallPatternId:mallPatternId});
				} else {
					setRender({});
					timeSortManage({title: '添加日期类型',type:'add-day-type'});
					$(El + ' .time-sort-link').addClass('hide');
					$(El + ' .above .edit').addClass('hide');
					$(El + ' .add-day-type').removeClass('hide').unbind().on('click',function(){
						timeSortManage({title: '添加日期类型',type:'add-day-type'});
					})
				};
			});
			$(El + ' .above .edit').unbind().on('click',function() {
				$(this).addClass('hide');
				editRender(mallPatternDetail);
			});
			
			$(El + ' .time-sort-link').unbind().on('click', function() {
				timeSortManage({title: '时间段管理',type:'time-sort-manage'});
			});
			$(El + ' .cancel-btn').unbind().on('click',function() {
				if($(El + ' select').val() == ''){
					$(El + ' select').val(mallPatternId);
				} 
				setRender(mallPatternDetail);
			});
			$(El + ' .save-btn').unbind().on('click',function() {
				getTimeSortDataAndSave();
			});
			$(El + ' .above .remove').unbind().on('click',function() {
				removeDayType();
			});
		},
		getMallpatternDetail = function(data){//获取模式详情
			CommonUtil.operation({
				moduleName: 'pattern',
				oper: 'mallPatternDetail',
				params: data,
				forbidConfirm: true
			}, function(res) {
				let temp = {
					systemDefault: res.result.systemDefault,
			        color: res.result.color,
			        enable: res.result.enable,
			        mallId: res.result.mallId,
			        name: res.result.name,
			        id:	res.result.id,
			        universal: res.result.universal,
			        status: res.result.status
				},
				status = true;
				$(El + ' select[name="mallPatternId"]').attr('data-value',JSON.stringify(temp));
				mallPatternDetail = res.result.mallPatternTime;
				mallPatternDetail.forEach(function(value,index) {
					if(!(value.subsystemPatternSetId && value.subsystemPatternSetId != '')) {
						status = false;
					}
				});
				if(status){
					setRender(mallPatternDetail);
				} else {
					editRender(mallPatternDetail);
					$(El + ' .above .edit').addClass('hide');
					if(temp.id == 1 || temp.id == 2) {
						$(El + ' .above .edit').addClass('hide');
						$(El + ' .above .remove').addClass('hide');
					}
				}
				
			});
		};
		setRender = function(data) {//模式详情界面
			let tpl = time_sort_item_tpl.innerHTML,
				view = $(El + ' #run-setting-form .items');
			laytpl(tpl).render(data, function(html){
				view.html(html);
				$(El + ' .day-type-name').addClass('hide');
				if(mallPatternId == 1 || mallPatternId == 2) {
					$(El + ' .remove').addClass('hide');
				} else {
					$(El + ' .remove').removeClass('hide');
				};
				$(El + ' .btns-group').addClass('hide');
				$(El + ' .time-sort-link').removeClass('hide');
				$(El + ' .edit').removeClass('hide');
				$(El + ' .add-day-type').addClass('hide');
			});
		},
		editRender = function(data, day_type_name) {//模式详情编辑界面
			let tpl = time_sort_item_edit_tpl.innerHTML,
				view = $(El + ' #run-setting-form .items'),
				time_select_els = null;
			console.log(data,day_type_name)
			if(day_type_name) {
				let temp = {
						systemDefault: false,
				        universal: true,
				        name: day_type_name
					},
					colors = getColors(),
					allColors = color_list,
					len = null,
					num = null,
					data_value = null;
				$(El + ' .remove').addClass('hide');
				colors.forEach(function(usedColor, index1){
					allColors.forEach(function(color, index2){
						if(usedColor == color) {
							allColors.splice(index2, 1);
						}
					})
				});
				len = allColors.length;
				num = Math.floor(Math.random()*len);
				temp.color = allColors[num];
				$(El + ' select[name="mallPatternId"]').attr('data-value',JSON.stringify(temp));
			};
			data_value = JSON.parse($(El + ' select[name="mallPatternId"]').attr('data-value'));
			if(data_value.systemDefault) {
				$(El + ' .day-type-name').addClass('hide');
			} else {
				$(El + ' .day-type-name').removeClass('hide');
				$(El + ' .day-type-name input').val(data_value.name);
			};
			$(El + ' .btns-group').removeClass('hide');
			$(El + ' .time-sort-link').addClass('hide');
			$(El + ' .add-day-type').addClass('hide');
			
			subRender(data);
			function subRender(data) {
				laytpl(tpl).render(data, function(html){
					view.html(html);
					laydateTimerInit();
//					if(day_type_name) {
//						let temp = {
//								systemDefault: false,
//						        universal: true,
//						        name: day_type_name
//							},
//							colors = getColors(),
//							allColors = color_list,
//							len = null,
//							num = null,
//							data_value = null;
//						$(El + ' .remove').addClass('hide');
//						colors.forEach(function(usedColor, index1){
//							allColors.forEach(function(color, index2){
//								if(usedColor == color) {
//									allColors.splice(index2, 1);
//								}
//							})
//						});
//						len = allColors.length;
//						num = Math.floor(Math.random()*len);
//						temp.color = allColors[num];
//						$(El + ' select[name="mallPatternId"]').attr('data-value',JSON.stringify(temp));
//					};
					time_select_els = $(El + ' .items .time-select');
//					data_value = JSON.parse($(El + ' select[name="mallPatternId"]').attr('data-value'));
//					if(data_value.systemDefault) {
//						$(El + ' .day-type-name').addClass('hide');
//					} else {
//						$(El + ' .day-type-name').removeClass('hide');
//						$(El + ' .day-type-name input').val(data_value.name);
//					};
//					$(El + ' .btns-group').removeClass('hide');
//					$(El + ' .time-sort-link').addClass('hide');
//					$(El + ' .add-day-type').addClass('hide')
					//选择模式
					$(El + ' .items .pattern-choose-btn').unbind().on('click',function(){
						let self = $(this),
							parent = self.parents('.item'),
							timeSortId = parent.attr('data-timeSortId'),
							subsystemPatternSetId = self.attr('data-subsystemPatternSetId'),
							ops = {timeSortId:timeSortId};
						if(subsystemPatternSetId) {
							ops.subsystemPatternSetId = subsystemPatternSetId
						};
						patternChoosePanel(ops,parent);
					})
					$(time_select_els[0]).attr('disabled','disabled').addClass('disabled');
					$(time_select_els[time_select_els.length-1]).attr('disabled','disabled').addClass('disabled');
					//删除时段
					$(El + ' .items .sort-name .remove').unbind().on('click',function(){
						$(this).parents('.item').remove();
					})
					//添加时段
					$(El + ' .items .add-time-sort').unbind().on('click',function(){
						let timeSortList = getTimeSort(true);
						timeSortList.push({});
						subRender(timeSortList);
					})
				});
				function getTimeSort(check){
					let timeSortList = [];
					$(El + ' .items .item').each(function(index, value){
						let item = $(value),
							timeSort = {
								id: item.attr('data-timeSortId'),
								name: item.find('.sort-name input').val(),
								mallPatternId:mallPatternId,
								startTime: item.find('input[name="startTime"]').val(),
								endTime: item.find('input[name="endTime"]').val(),
								sort: index+1,
								subsystemPatternSetId: item.find('.pattern-choose-btn').attr('data-subsystemPatternSetId'),
								subsystemPatternSetName: item.find('.pattern-choose-btn').html()
							};
						if(check){
							if(!(timeSort.name && timeSort.name.trim().length > 0)) {
								layer.msg('请填写时间段名称',{icon: 5});
								status = false;
								return false;
							};
							if(!(timeSort.startTime && timeSort.startTime.trim().length > 0)) {
								layer.msg('请填写【' + timeSort.name + '】的开始时间',{icon: 5});
								status = false;
								return false;
							};
							if(!(timeSort.endTime && timeSort.endTime.trim().length > 0)) {
								layer.msg('请填写【' + temp.timeSort + '】的结束时间',{icon: 5});
								status = false;
								return false;
							};
							if(!(timeSort.subsystemPatternSetId && timeSort.subsystemPatternSetName)) {
								layer.msg('【'+timeSort.name + '】未选择模式',{icon:5});
								status = false;
								return false;
							};
						}
						timeSortList.push(timeSort);
					});
					return timeSortList;
				}
			}
		},
		getTimeSortDataAndSave = function(callback){//获取各个时间段的数据并保存
			let objData = {},
				timeSortList = [],
				judgeResult = {},
				day_type_name = null,
				status = true;
			if(!$(El + ' .day-type-name').hasClass('hide')) {
				day_type_name = $(El + ' .day-type-name input').val().trim();
				if(day_type_name == '') {
					layer.msg('日期类型名称不能为空', {icon: 5});
					$(El + ' .day-type-name input').focus();
					status = false;
					return false;
				};
			};
			$(El + ' .items .item').each(function(index, value){
				let item = $(value),
					timeSort = {
						id: item.attr('data-timeSortId'),
						name: item.find('.sort-name input').val(),
						mallPatternId:mallPatternId,
						startTime: item.find('input[name="startTime"]').val(),
						endTime: item.find('input[name="endTime"]').val(),
						sort: index+1,
						subsystemPatternSetId: item.find('.pattern-choose-btn').attr('data-subsystemPatternSetId'),
						subsystemPatternSetName: item.find('.pattern-choose-btn').html()
					};

				if(!(timeSort.name && timeSort.name.trim().length > 0)) {
					layer.msg('请输入时间段名称',{icon:5});
					item.find('.sort-name input').focus();
					status = false;
					return false;
				};
				if(!(timeSort.startTime && timeSort.startTime.trim().length > 0)) {
					layer.msg('请填写【' + timeSort.name + '】的开始时间',{icon: 5});
					status = false;
					return false;
				};
				if(!(timeSort.endTime && timeSort.endTime.trim().length > 0)) {
					layer.msg('请填写【' + temp.timeSort + '】的结束时间',{icon: 5});
					status = false;
					return false;
				};
				if(timeJudge1(timeSort.startTime,timeSort.endTime) != -1){
					layer.msg('【'+timeSort.name + '】开始时间应小于结束时间,请重新设置', {icon: 5});
					status = false;
					return false;
				};
				if(!(timeSort.subsystemPatternSetId && timeSort.subsystemPatternSetName)) {
					layer.msg('【'+timeSort.name + '】未选择模式',{icon:5});
					status = false;
					return false;
				};
				timeSortList.push(timeSort);
			});
			
			if(!status) {
				return false;
			}
			judgeResult = timeJudge2($(El + ' .time-select'));
			if(judgeResult.chink && judgeResult.overlap) {
				layer.msg('您配置的时间段有间隙、有重叠，请调整。', {icon: 5});
				return false;
			} else if(judgeResult.chink && !judgeResult.overlap){
				layer.msg('您配置的时间段有间隙，请调整。', {icon: 5});
				return false;
			} else if(!judgeResult.chink && judgeResult.overlap) {
				layer.msg('您配置的时间段有重叠，请调整。', {icon: 5});
				return false;
			}
			objData = JSON.parse($(El + ' select[name="mallPatternId"]').attr('data-value'));
			objData.mallPatternTime =  timeSortList;
			console.log('objData',objData);
			if(day_type_name && day_type_name != '') {
				objData.name = day_type_name;
			};
			if(typeof callback =='function'){
				callback(objData)
			} else {
				sava(objData);
			}
		},
		sava = function(data){
			let msg = '';
			if(data.id == 1 || data.id == 2) {
				msg = ', '+ data.name + '各子系统将按照您的设置运行';
			}
			CommonUtil.operation({
				moduleName: 'pattern',
				oper: 'saveMallPattern',
				oper_cn: '保存',
				params: {mallPatternStr: JSON.stringify(data)}
			}, function(res) {
				if(data.id) {
					layer.msg('保存成功' + msg, {icon: 6,time: 2000});
					getMallpatternDetail({mallPatternId:mallPatternId});
				} else {
					mallPatternId = res.result;
					if(operationCodes.indexOf('calendar-view') == -1) {//去日历的权限
						goPage('run-setting',{mallPatternId:mallPatternId});
						layer.msg('保存成功' + msg, {icon: 6,time: 2000});
					} else {
						layer.confirm('<i class="fa fa-bookmark" style="color:#'+ data.color +';"></i> ' + data.name + '时段保存成功？', {
						    btn: ['去日历指定日期','暂不指定'], //按钮
						    shade: true //显示遮罩
						}, function(){
							goPage('mall-pattern-calendar');
						},function(){
							goPage('run-setting',{mallPatternId:mallPatternId});
							layer.msg('保存成功' + msg, {icon: 6,time: 2000});
						});
					}
					
					
				}
			});
		},
		removeDayType = function(){//删除
			layer.confirm('确认删除？', {
			    btn: ['确认','取消'], //按钮
			    shade: true //显示遮罩
			}, function(){
				CommonUtil.operation({
					moduleName: 'pattern',
					oper: 'mallPatternDelete',
					params: {id: mallPatternId}
				}, function(res) {
					layer.msg('删除成功！', {icon: 6,time: 2000});
					goPage('run-setting');
				});
			});
		},
		timeSortManage = function(data){//时间段管理或者添加日期类型
			let data_type = data.type,
				personalTimeSort = [],
				lwIndex = layer.open({
					type : 1,
					title : data.title,
					shadeClose: false,
					closeBtn: 1, 
					anim: 2,
					skin : 'layui-layer-rim', //加上边框
					area : [ '600px', '400px' ], //宽高
					content : '<div class="time-sort-open"></div>',
					btn : ['确定'],
					yes: function(lindex, layero) {
						if(getTimes()) {
							let len = mallPatternDetail.length,
							temp = {},
							day_type_name = null,
							status = true;
							if($('.time-sort-open .day-type-name').length > 0) {
								day_type_name = $('.time-sort-open .day-type-name input').val();
								if(!(day_type_name && day_type_name.length >0)) {
									layer.msg('请填写日期类型名称',{icon: 5});
									status = false;
									return false;
								}
							};
							personalTimeSort.forEach(function(value, index) {
								if(value.id == '') {
									personalTimeSort[index].mallPatternId = mallPatternId;
									personalTimeSort[index].sort = index+1;
								} else {
									mallPatternDetail.forEach(function(value2, index2) {
										if(value.id == value2.id) {
											let item = mallPatternDetail[index2];
											personalTimeSort[index].id = (item.id?item.id:''),
											personalTimeSort[index].mallPatternId = mallPatternId,
											personalTimeSort[index].subsystemPatternSetId = item.subsystemPatternSetId,
											personalTimeSort[index].subsystemPatternSetName = item.subsystemPatternSetName,
											personalTimeSort[index].sort = index + 1
										}
									});
								};
								
								if(timeJudge1(value.startTime,value.endTime) != -1){
									layer.msg('开始时间应小于结束时间,请重新设置', {icon: 5});
									status = false;
									return false;
								};
							});
							if(status) {
								let judgeResult = timeJudge2($('.time-sort-open .time-select'));
								if(judgeResult.chink && judgeResult.overlap) {
									layer.msg('您配置的时间段有间隙、有重叠，请调整。', {icon: 5});
									return false;
								} else if(judgeResult.chink && !judgeResult.overlap){
									layer.msg('您配置的时间段有间隙，请调整。', {icon: 5});
									return false;
								} else if(!judgeResult.chink && judgeResult.overlap) {
									layer.msg('您配置的时间段有重叠，请调整。', {icon: 5});
									return false;
								}
								editRender(personalTimeSort,day_type_name);
								layer.closeAll();
							}			
						};
					}
				}),
				tpl = time_sorts_tpl.innerHTML,
				view = $('.time-sort-open');
			if(data_type == 'time-sort-manage'){
				personalTimeSort = JSON.parse(JSON.stringify(mallPatternDetail));
			} else {
				personalTimeSort = JSON.parse(JSON.stringify(mockData));
			}
			subRender({list:personalTimeSort,name:''});
			function subRender(data) {
				laytpl(tpl).render(data, function(html){
					view.html(html);
					if(data_type == 'time-sort-manage'){
						$('.time-sort-open .day-type-name').remove();
					} 
					if(data.list.length <= 1) {
						$('.time-sort-open .remove').remove();
					}
					$('.time-sort-open .add-time-sort').unbind().on('click', function() {//添加时段
						if(getTimes()) {
							let temp = personalTimeSort,
								name = '';
							temp.push({});
							if($('.time-sort-open input[name="day-type-name"]').length > 0) {
								name = $('.time-sort-open input[name="day-type-name"]').val()
							};
							subRender({list:temp,name: name});
						};
					});
					$('.time-sort-open .remove').unbind().on('click', function() {//删除时段
						let self = $(this),
							parent = self.parents('.time-sort'),
							data_index = parent.attr('data-index'),
							name = '';
						personalTimeSort.splice(data_index, 1);
						if($('.time-sort-open input[name="day-type-name"]').length > 0) {
							name = $('.time-sort-open input[name="day-type-name"]').val()
						};
						subRender({list:personalTimeSort,name: name});
					});
					let timer_el = $('.time-sort-open .time-select'),
						len = timer_el.length;
					timer_el.each(function(index, value){
						if(index == 0 || index == len-1){
							$(this).attr('disabled','disabled');
							$(this).addClass('disabled');
							if(index == len-1){
								$(this).val('24:00');
							}
							if(index == 0){
								$(this).val('00:00');
							}
						} else {
							laydate.render({
						        elem: this,
						      	type: 'time',
								min: '00:01:00',
								max: '23:59:00',
								format: 'HH:mm',
								btns: ['confirm'],
								ready: function(date){	
								    $('.laydate-time-show .laydate-time-list > li').addClass('pattern-choose-date');
								    $('.laydate-time-show .laydate-time-list > li:nth-child(3)').addClass('hide');
								},
								done: function(value){
								
								}
						    });
						}
					    
					  });
				});
			};
			function getTimes(){
				let newTimeSort = [],
					status = true;
				$('.time-sort-open .time-sort').each(function(index, value){
					let self = $(value),
						temp = {
							name: self.find('input[name="name"]').val(),
							startTime: self.find('input[name="startTime"]').val(),
							endTime: self.find('input[name="endTime"]').val(),
							id: self.attr('data-timeSortId'),
							sort:index + 1
						};
					if(!(temp.name && temp.name.trim().length > 0)) {
						layer.msg('请填写时间段名称',{icon: 5});
						status = false;
						return false;
					};
					if(!(temp.startTime && temp.startTime.trim().length > 0)) {
						layer.msg('请填写【' + temp.name + '】的开始时间',{icon: 5});
						status = false;
						return false;
					};
					if(!(temp.endTime && temp.endTime.trim().length > 0)) {
						layer.msg('请填写【' + temp.name + '】的结束时间',{icon: 5});
						status = false;
						return false;
					};
					newTimeSort.push(temp);
				});
				if(status) {
					personalTimeSort = newTimeSort;
				}
				return status;
			};
			
		},
		patternChoosePanel = function(data, action_el){//选择组合模式
			let tpl = pattern_choose_tpl.innerHTML,
				view,timeSortId;
			
			data = data ? data : {};
			timeSortId = data.timeSortId ? data.timeSortId : null;
			console.log(data)
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
							selected_pattern = null,
							data_index = $(this).attr('data-index'),
							len = $('.pattern-open .pattern-choose-item').length;
						if(!self.hasClass('actived')) {
							$('.pattern-open .pattern-choose-item').removeClass('actived');
							$('.pattern-open .pattern-msg').addClass('hide');
							self.addClass('actived');
							self.find('.pattern-msg').removeClass('hide');
							self.find('.pattern-choose-btn').removeClass('hide');
						} else {
							if(!self.hasClass('.selected-pattern')) {
								self.removeClass('actived');
								self.find('.pattern-msg').addClass('hide');
							}	
						}
						selected_pattern = $('.pattern-open .selected-pattern');
						if(!selected_pattern.hasClass('actived')) {
							if(selected_pattern.length > 0) {							
								selected_pattern.find('.pattern-msg').removeClass('hide');
								selected_pattern.find('.pattern-choose-btn').addClass('hide');
							};
						};
						
						if(data_index >= 3 ) {
							if(data_index < len-2) {
								/*$('.layui-layer-content .below')[0].scrollTop = (data_index - 1) * 51;//滚动条的位置
*/							} else {
								$('.layui-layer-content .below')[0].scrollTop = $('.layui-layer-content')[0].scrollHeight + 100;
							}
						};
					})
					$('.pattern-open .pattern-choose-item .btn-1').on('click',function(event){//应用
						var self = $(this),
							parent = self.parent().parent().parent();
							value = parent.attr('data-value'),
							/*slot = $(El+ ' .item[data-timeSortId="'+ timeSortId + '"]')*/
							slot = action_el;
							
						event.stopPropagation();
					
						$('.pattern-open .pattern-choose-item').removeClass('selected-pattern');
						$('.pattern-open .pattern-choose-item .status').addClass('hide');
						$('.pattern-open .pattern-choose-item .btn-1').removeClass('hide');
						$('.pattern-open .pattern-choose-item .btn-2').addClass('hide');
						self.addClass('hide');
						parent.find('.btn-2').removeClass('hide');
						parent.addClass('selected-pattern');
						value = JSON.parse(value);
						
						slot.find('.selected-pattern').html(value.subsystemPatternSetName);
						slot.find('.selected-pattern').attr('data-subsystemPatternSetId',value.subsystemPatternSetId);
						slot.find('.selected-pattern').removeClass('hide');
						slot.find('.no-pattern').addClass('hide');
						layer.close(lwIndex);
					});
					$('.pattern-open .pattern-choose-item .btn-2').on('click',function(event){//取消
						var self = $(this),
							parent = self.parent().parent().parent(),
							slot = action_el;
						
						event.stopPropagation();
						
						self.addClass('hide');
						parent.find('.btn-1').removeClass('hide');
						parent.removeClass('selected-pattern');
						slot.find('.selected-pattern').addClass('hide').removeAttr('data-subsystemPatternSetId').val('');
						slot.find('.no-pattern').removeClass('hide');
						
					});
					
					if(data && data.subsystemPatternSetId) {
						var temp = $('.pattern-open div[data-id=' + data.subsystemPatternSetId + ']'),
							data_index = temp.attr('data-index'),
							len = $('.pattern-open .pattern-choose-item').length;
						temp.addClass('actived');
						temp.addClass('selected-pattern');
						temp.find('.pattern-msg').removeClass('hide');
						temp.find('.btn-1').addClass('hide');
						temp.find('.btn-2').removeClass('hide');
						if(data_index >= 3 ) {
							if(data_index < len-2) {
								$('.layui-layer-content .below')[0].scrollTop = (data_index - 1) * 51;//滚动条的位置
							} else {
								$('.layui-layer-content .below')[0].scrollTop = $('.layui-layer-content')[0].scrollHeight + 100;
							}
						};
					}
				});
			})		
		},
		
		timeJudge1 = function (num1, num2) {//num1与num2的关系：小于：-1，相等：0，大于：1
			var start = num1.split(':'),
				end = num2.split(':'),
				result  = null;
			
			if(start[0] == end[0] && start[1] == end[1]) {
				result  = 0;
			} else if(start[0] > end[0] || (start[0] == end[0] && start[1] > end[1])) {
				result  = 1;
			} else {
				result  = -1;
			}
			return result;
		},
		timeJudge2 = function (data) {//判断所有时间段有无缝隙，有无重叠
			var overlap = false,//重叠
				chink = false,//间隙
				timerValue = [],
				len = data.length,
				temp;
			data.each(function(index, value){
				timerValue.push($(value).val());
			})
			for(var i = 0; i < len-1; i++) {
				if(i == 0) {
					/*temp = timeJudge1(timerValue[len-1], timerValue[0]);*/
				} else {
					if(i % 2 == 0) {//时间段 的开始
						temp = timeJudge1(timerValue[i-1], timerValue[i]);
					}
				}
				switch(temp) {
					case -1:
						chink = true;
						break;
					case 1:
						overlap = true
						break;
					default:;
				}
			};
			
			return {
				chink: chink,
				overlap: overlap
			};
		},
		timeSlider = function(data) {
			console.log('data',data)
			let lwIndex = layer.open({
				type : 1,
				title : data.title,
				shadeClose: false,
				closeBtn: 1, 
				anim: 2,
				skin : 'layui-layer-rim', //加上边框
				area : [ '640px', '300px' ], //宽高
				content : '<div class="time-slider-open">' + $('.time-slider-panel').html() + '</div>',
				btn : ['确定'],
				yes: function(lindex, layero) {
					let new_time  = $('.time-slider-open .time-value').html();
						time_select_els = $(El + ' .items .item');
					if(data.input_name == 'startTime')	{
						$(time_select_els[data.data_index]).find('input[name="startTime"]').val(new_time);
						$(time_select_els[data.data_index-1]).find('input[name="endTime"]').val(new_time);
					} else {
						$(time_select_els[data.data_index]).find('input[name="endTime"]').val(new_time);
						$(time_select_els[data.data_index+1]).find('input[name="startTime"]').val(new_time);
					};
					layer.close(lwIndex);
				}
			});
			$('.time-slider-open .time-slider').attr('id','time-slider');
			$('.time-slider-open .timer-slider-msg span').html('【' + data.time_sort_name + '】' + data.input_name_ch);
			$('.time-slider-open .time-value').html(data.splits[1].title);
			let _DxRange = new DxRangeSlider('#time-slider', {  
                step: 1,  
                splits: data.splits,  
                onRangeChange: function (e) {
                    console.log(e);
                    if(e.selectValue) {
                        var curValue =  e.selectValue,
                            hour =  parseInt(curValue/60),
                            minute =  curValue%60;
                        hour = '0' + hour.toString();
                        hour = hour.slice(-2);
                        minute = '0' + minute.toString();
                        minute = minute.slice(-2);
                        console.log(hour + ':' + minute);
                        $('.time-slider-open .time-value').html(hour + ':' + minute);
                    }
                },  
                onRangeMove: function (e) { 
                }  
            });
		},
		getColors = function() {
			let colors = [];
			$(El + ' .has-color').each(function(index, value){
				colors.push($(value).attr('data-color'));
			});
			return colors;
		},
		getMinutes = function (time){//将时间转换成分钟
			time = time.split(':');
			return time[0]*60 + time[1]*1;	
		},
		laydateTimerInit = function (data) {
			let time_select_els = $(El + ' .items .time-select');
				len = time_select_els.length,
				temp_list = [];
			
			for(let i = 0; i < len; i++){
				let item = $(time_select_els[i]),
					timeSort = {
						value: item.val(),
						name: item.attr('name')
					};
				temp_list.push(timeSort);
			};
			for(let i = 0; i < len; i ++) {
				if(i > 0 && i < len-1) {
					let temp_index = null,
						bind_index = null;
					if(i % 2 == 0) {
						temp_index = i - 2;
						bind_index = i - 1;
					} else {
						temp_index = i - 1;
						bind_index = i + 1;
					}
					let min = hhmmss(temp_list[temp_index].value,1);
					let max = hhmmss(temp_list[temp_index + 3].value,-1);
					$(time_select_els[i]).unbind();
					laydate.render({
				        elem: time_select_els[i],
				      	type: 'time',
						min: '00:01:00',
						max: '23:59:00',
						format: 'HH:mm',
						btns: ['confirm'],
						ready: function(date){
						    $('.laydate-time-show .laydate-time-list > li').addClass('pattern-choose-date');
						    $('.laydate-time-show .laydate-time-list > li:nth-child(3)').addClass('hide');
						},
						done: function(value){
							$(time_select_els[i]).val(value);
							$(time_select_els[bind_index]).val(value);
							laydateTimerInit();
						}
				    });
				}
			}
			function hhmmss(value,p) {
				var curValue =  getMinutes(value)*1 + p*1,
	                hour =  parseInt(curValue/60),
	                minute =  curValue%60,
	                result;
	            hour = '0' + hour.toString();
	            hour = hour.slice(-2);
	            minute = '0' + minute.toString();
	            minute = minute.slice(-2);
	            result = hour + ':' + minute + ':00'
	            return result
			}
		
		};
	return {
		init: init
	};	
}());