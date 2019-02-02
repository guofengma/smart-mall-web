var DoorManage = (function(){
	var moduleCode,
		moduleName,
		operationCodes,
		subsystemPatternId,
		El;
	let	init = function(data) {
			moduleCode = data.moduleCode;
			moduleName = data.moduleName;
			operationCodes = data.operationCodes?data.operationCodes:'';
			subsystemPatternId = data.subsystemPatternId;
			El = '#' + moduleCode + '-manage';
			$(El + ' .pattern-detail-container').addClass('hide');
			getPatterns({id: subsystemPatternId});
			$(El + ' .sub-sys-patterns').unbind().on('click','.add-pattern i', function() {
				goPage('form');
			});
			
			$(El + ' .sub-sys-pattern-detail').unbind().on('click','.edit', function() {
				var id = $(this).attr('data-id');
				goPage('form?subsystemPatternId='+id);
			});
			$(El + ' .sub-sys-pattern-detail').on('click', '.floor-device-list i', function(){
				var this_value = $(this).attr('data-value');
				this_value = JSON.parse(this_value);
				var lwIndex = null;
				
				setTimeout(function() {
					lwIndex = layer.open({
						type : 1,
						title : '【' + this_value.deviceGroupName +'】'+ moduleName + '设备详细',
						shadeClose: false,
						closeBtn: 1, 
						anim: 2,
						skin : 'layui-layer-rim', //加上边框
						area : [ '70%', '600px' ], //宽高
						content : '<div class="floor-devices-open">' + $('.floor-devices-list-panel').html() + '</div>',
						end: function() {
							layer.close(lwIndex);
						}
					});
					getDevices(this_value);
					$('.floor-devices-open .reset').unbind().on('click',function(){
						$('.floor-devices-open input[name="keyword"]').val('');
						getDevices(this_value);
					});
					$('.floor-devices-open .search').unbind().on('click',function(){
						var keyword = $('.floor-devices-open input[name="keyword"]').val();
						getDevices(this_value,keyword);
						
					})
					//搜索框内的回车事件
					$('.floor-devices-open .form-control').unbind('keydown').keydown(function(){
						if(event.keyCode==13){
							$('.floor-devices-open .search').trigger('click');
							return false;
					    }
					});
				});
			});
		},
		getPatterns = function(data){
			CommonUtil.ajaxRequest({
				url: 'subsystem/querySysPatterns',
				data: {subsystemCode: moduleCode}
			}, function(res) {
				res = res?res:[];
				if (typeof res == 'string') {
					res = JSON.parse(res);
					if (!res.success) {
						layer.msg('加载模式列表报错' + (res.message ? '原因是：' + res.message : ''), {icon: 5});
						return false;
					}
				}
				renderPatterns(res.result);

				if(data && data.id) {
					let actived_el = $(El + ' .sub-sys-patterns .pattern-item[data-id="'+data.id+'"]');
					$(El + ' .pattern-detail-container').addClass('hide');
					
					if(actived_el.length > 0) {
						$(El + ' .sub-sys-patterns .pattern-item[data-id="'+data.id+'"]').addClass('actived');
						detail({id:data.id});
					};
				}
			});
		},
		renderPatterns = function(data){
			data = data ? data : [];
			var tpl = sub_sys_patterns_tpl.innerHTML,
				view = $(El + ' .sub-sys-patterns'),
				sub_sys_name;
			
			laytpl(tpl).render(data, function(html){
				view.html(html);
				if(operationCodes.indexOf('add-pattern') == -1) { // 新增权限
					$(El + ' .add-pattern').remove();
				};
				if(operationCodes.indexOf('remove-pattern') == -1) { // 删除权限
					$(El + ' .pattern-item .remove').remove();
				};
				if(data.length >= 20) {
					$(El + ' .add-pattern').remove();
					$(El + ' .tips').removeClass('hide');
				};
				if(moduleCode == 'door') {
					sub_sys_name = '门禁监控系统';
				} else if(moduleCode == 'vedio') {
					sub_sys_name = '视频监控系统';
				};
				$(El + ' .pattern-item .custom span').html(sub_sys_name)
				$(El + ' .pattern-item').on('click',function(){
					subsystemPatternId = $(this).attr('data-id');
					
					$(El + ' .sub-sys-patterns .pattern-item').removeClass('actived');
					$(this).addClass('actived');
					detail({id:subsystemPatternId});
				});
				$(El + ' .pattern-item .remove').on('click',function(event){
					var id = $(this).parents('.pattern-item').attr('data-id');
					event.stopPropagation();
					remove({id:id});
				});
			});
		},
		detail = function(data){
			var tpl = sub_sys_pattern_detail_tpl.innerHTML,
				view = $(El + ' .sub-sys-pattern-detail');
			CommonUtil.operation({
				moduleName: 'subsystem',
				oper: 'detail',
				params: data,
				forbidConfirm: true
			}, function(res) {
				var arrangement = {
					name: res.result.name,
					id: res.result.id
				},
				temp_list = res.result.subsystemPatternDetail,
				groups = {},
				renderData = [],
				temp_obj = {},
				temp_list = temp_list ? temp_list : [];
				for(var i = 0; i < temp_list.length; i++) {
					var value = temp_list[i],
						deviceGroupId = value.deviceGroupId ? value.deviceGroupId: '-1',
						temp = {
							versionCode: value.versionCode,
			                versionName: value.versionName,
			                commandModuleId:  value.versionName,
			                commandModuleName:  value.commandModuleName,
			                versionPatternType: value.versionPatternType
						};
					if(groups[deviceGroupId] && !$.isEmptyObject(groups[deviceGroupId])) {
						groups[deviceGroupId].versions.push(temp);
					} else {
						let  deviceGroupName = value.deviceGroupName ? value.deviceGroupName: '未分组';
						groups[deviceGroupId] = {
							versions:[temp],
							deviceGroupId: deviceGroupId,
							deviceGroupName: deviceGroupName
						};
					}
				};
				temp_list = [];
				for(var key in groups) {
					groups[key].string = JSON.stringify(groups[key]);
					groups[key].versions.sort(compare('versionCode'));
					temp_list = temp_list.concat(groups[key]);
				}
				temp_list.sort(compare('deviceGroupId'));
				
				arrangement.subsystemPatternDetail = temp_list;
				laytpl(tpl).render(arrangement, function(html){
					view.html(html);
					$(El + ' .pattern-detail-container').removeClass('hide');
					adapt(El);
					if(operationCodes.indexOf('edit-pattern') == -1) { // 删除权限
						$(El + ' .pattern-detail-container .edit').remove();
					};
				});
			});
		},
		remove = function(data){
			layer.confirm('确认删除？', {
			    btn: ['确认','取消'], //按钮
			    shade: true //显示遮罩
			}, function(lindex){
				layer.close(lindex);
				CommonUtil.operation({
					moduleName: 'subsystem',
					oper: 'remove',
					params: data,
					forbidConfirm: true
				}, function(res) {
					layer.msg('删除成功',{icon:6});
					getPatterns({id: subsystemPatternId});
				});
			});
		},
		getDevices = function(data,keyword){
			var deviceGroupId = data.deviceGroupId,
				versions = data.versions,
				len = versions.length,
				num = 0,
				devices_list = [],
				tpl = floor_devices_list_tpl.innerHTML,
				oper ='pageGroupDevices',
				params = {},
				view;
			
			versions.forEach(function(value, index){
				var versionCode = value.versionCode,
					versionName = value.versionName,
					temp = {};
				if(deviceGroupId == '-1') {
					oper = 'pageUngroupDevices';
					params = {
						systemCode: moduleCode,
						versionCode: versionCode,
						name: keyword
					}
				} else {
					params = {
						groupId: deviceGroupId,
						versionCode: versionCode,
						name: keyword
					}
				}
				CommonUtil.operation({
					moduleName: 'group-devices',
					oper: oper,
					params: params,
					forbidConfirm: true
				}, function(res) {
					temp = {
						deviceGroupId: deviceGroupId,
						versionCode: versionCode,
						versionName: versionName,
						devices: res.result.resultList
					};
					devices_list.push(temp);
					if(index == len-1) {
						view = $('.floor-devices-open .floor-devices-list .below');
						
						laytpl(tpl).render(devices_list, function(html){
							view.html(html);
							
							var version_els = $('.floor-devices-open .floor-devices-list .version');
							version_els.each(function(index,value){
								var self = $(value),
									height = self.next()[0].offsetHeight;
								self.css({'height': height + 'px', 'line-height': height + 'px'})
							})
						});
					}
				});
			});
		},
		adapt = function(element) {//表单高度样式适应。
			var adapt_el = element +' .sub-sys-pattern-detail',
				height_1 = $(adapt_el + ' .items')[0].offsetHeight,
				item_list = $(adapt_el + ' .item'),
				height_2,
				margin_top;
			$(adapt_el + ' .title').css({'height': height_1 + 'px', 'line-height': height_1 + 'px'});
			item_list.each(function(index, value){
				height_2 = value.offsetHeight;
				height_2 = (height_2 > 47) ? height_2 : 47;
				margin_top = parseInt((height_2-18)/2);
				$(value).find('.floor').css({'height': height_2 + 'px', 'line-height': height_2 + 4 + 'px'});
				/*$(value).find('.floor-device-list').css({'height': height_2 + 'px', 'line-height': height_2 + 4 + 'px'});*/
				$(value).find('.floor-device-list').css({'margin-top': margin_top + 'px'});
			})
		},
		compare = function(prop) {
            return function (obj1, obj2) {
                var val1 = obj1[prop];
                var val2 = obj2[prop];
                val1 = (val1=='-1' ? 'null' : val1);
                val2 = (val2=='-1' ? 'null' : val2);
                if (val1 < val2) {
                    return -1;
                } else if (val1 > val2) {
                    return 1;
                } else {
                    return 0;
                }            
            } 
        };
	return {
		init: init,
		adapt: adapt
	}
}())