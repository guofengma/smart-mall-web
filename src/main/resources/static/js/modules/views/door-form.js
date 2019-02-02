var DoorForm = (function(){
	var moduleCode,
		moduleName,
		El,
		groups, 
		versions,
		subsystemPatternId,
		groupAndversion = {},
		init = function(data) {
			moduleCode = data.moduleCode;
			moduleName = data.moduleName;
			groupAndversion = {};
			groups = null;
			versions = null;
			El = '#' + moduleCode + '-form';
			subsystemPatternId = data.subsystemPatternId ? data.subsystemPatternId : null;
			getBaseDate();
			$('.sub-sys-pattern-form button').on('click', function(){
				savePattern();
			});
			$('.sub-sys-pattern-form .items').on('click', '.version-device-list i', function(){
				var self = $(this).parent(),
					parent = self.parents('.item'),
					deviceGroupId = parent.attr('data-deviceGroupId'),
					deviceGroupName = parent.find('.group').html(),
					version = self.prev().prev(),
					versionCode = version.attr('data-versionCode'),
					versionName = version.html(),
					params = {};
				var lwIndex = null;
				console.log(deviceGroupId,deviceGroupId!=null);
				if(deviceGroupId != 'null') {
					params = {groupId:deviceGroupId,versionCode:versionCode}
				} else {
					params = {systemCode:moduleCode,versionCode:versionCode,oper:"pageUngroupDevices"}
				}
				console.log('params',params)
				setTimeout(function() {
					lwIndex = layer.open({
						type : 1,
						title : '【'+ deviceGroupName +'】' +versionName + moduleName + '设备详细',
						shadeClose: false,
						closeBtn: 1, 
						anim: 2,
						skin : 'layui-layer-rim', //加上边框
						area : [ '70%', '600px' ], //宽高
						content : '<div class="pattern-version-devices-open version-devices-open">' + $('.version-devices-list-panel').html() + '</div>',
						end: function() {
							layer.close(lwIndex);
						}
					});
					getVersionDevices(params);
					$('.pattern-version-devices-open .reset').unbind().on('click',function(){
						$('.pattern-version-devices-open input[name="keyword"]').val('');
						params.name = '';
						getVersionDevices(params);
					});
					$('.pattern-version-devices-open .search').unbind().on('click',function(){
						params.name = $('.pattern-version-devices-open input[name="keyword"]').val();
						getVersionDevices(params);
					});
					//搜索框内的回车事件
					$('.pattern-version-devices-open form').attr('autocomplete','off');
					$('.pattern-version-devices-open form').unbind('keydown').keydown('.form-control',function(){
						if(event.keyCode==13){
							$('.pattern-version-devices-open .search').trigger('click');
							return false;
					    }
					});
				});
			});
		},
		getBaseDate = function(data){
			var tpl = ss_patterm_form_tpl.innerHTML,
				view = $(El + ' .items'),
				temp_list = [],
				temp_obj = {};
			let tepmLoading = layer.load();
			setTimeout(function(){
				layer.close(tepmLoading);
			},10000)
			CommonUtil.operation({
				moduleName: 'subsystem',
				oper: 'getDeviceGroupAndVersion',
				params: {subsystemCode:moduleCode},
				type: 'get',
				forbidConfirm: true
			}, function(res) {
				console.log('res',res);
				let renderData = res.result?res.result:[];
				laytpl(tpl).render(renderData, function(html){
					layer.close(tepmLoading);
					view.html(html);
					adapt(El);
					getGroupAndVersion();
					$(El + ' select').on('change',function(){
						var self = $(this);
							deviceGroupId = self.parents('.item').attr('data-deviceGroupId'),
							versionCode = self.parents('.status').prev().attr('data-versionCode'),
							commandModuleId = self.val(),
							commandModuleName = self.find('option[value="' + commandModuleId + '"]').html();
						
						for(var i = 0; i < groupAndversion[deviceGroupId].versions.length; i++) {
							var temp = groupAndversion[deviceGroupId].versions[i];
							if(temp.versionCode == versionCode) {
								groupAndversion[deviceGroupId].versions[i].commandModuleId = commandModuleId;
								groupAndversion[deviceGroupId].versions[i].commandModuleName = commandModuleName;
							}
						};
					});
				});
				if(subsystemPatternId) { //如果存在，是编辑
					CommonUtil.operation({
						moduleName: 'subsystem',
						oper: 'detail',
						params: {id: subsystemPatternId},
						forbidConfirm: true
					}, function(res) {
						var info = res.result;
						$(El + ' input[name="id"]').val(info.id);
						$(El + ' input[name="name"]').val(info.name);
						info.subsystemPatternDetail.forEach(function(value){
							var deviceGroupId = value.deviceGroupId,
								parent = $(El).find('div[data-deviceGroupId="' + deviceGroupId + '"]'),
								version = parent.find('div[data-versionCode="' + value.versionCode + '"]');
							version.attr('data-id', value.id);
							version.next().find('select').val(value.commandModuleId);
							for(var i = 0; i < groupAndversion[deviceGroupId].versions.length; i++) {
								var temp = groupAndversion[deviceGroupId].versions[i];
								
								if(temp.versionCode == value.versionCode) {
									groupAndversion[deviceGroupId].versions[i].id =  value.id;
									groupAndversion[deviceGroupId].versions[i].commandModuleId = value.commandModuleId;
									groupAndversion[deviceGroupId].versions[i].commandModuleName = value.commandModuleName;
								}
							};
						})
					})
				}
			});
		},
		getGroupAndVersion = function(){
			$(El + ' .item').each(function(index, group) {
				group = $(group);
				let	data_deviceGroupId = group.attr('data-deviceGroupId'),
					data_deviceGroupName = group.find('.group').html(),
					version_el = group.find('.version'),
					temp_obj = {},
					temp_list = [];
				
				temp_obj =  {
						deviceGroupId: data_deviceGroupId,
						deviceGroupName: data_deviceGroupName
				};
				if(version_el.length > 0) {
					version_el.each(function(index, version){
						version = $(version);
						var data_versionCode = version.attr('data-versionCode'),
							data_versionPatternType = version.attr('data-versionPatternType'),
							data_versionName = version.html(),
							version_obj = {};
						version_obj = {
							versionCode: data_versionCode,
							versionName: data_versionName,
							versionPatternType: data_versionPatternType
						};
						
						temp_list.push(version_obj);
					});
					temp_obj.versions = temp_list;
					groupAndversion[data_deviceGroupId] = temp_obj;
				}
			});
		},
		savePattern = function(data) {
			var formData = $(El).serializeObject(),
				status = true,
				confirmMsg = '确认保存？';
				list = [];
			if(formData.name.length == 0) {
				layer.msg('请输入模式名称',{icon:5});
				return false;
			}
			if(!formData.commandModuleId) {
				layer.msg('未配置任何设备的运行状态',{icon:5});
				return false;
			} else {
				for(var key in groupAndversion) {
					var group = groupAndversion[key];
					for(var i = 0; i < group.versions.length; i++) {
						var temp = group.versions[i];
					
						if(!(temp.commandModuleId && temp.commandModuleId != '')) {
							if(temp.versionPatternType != 3) {
								status = false;
								layer.msg(group.deviceGroupName + temp.versionName +'未配置运行状态',{icon:5});
								return false;
							}	
						}
						temp.deviceGroupId = (group.deviceGroupId!="null" ? group.deviceGroupId : '');
						temp.deviceGroupName = group.deviceGroupName;
						if(formData.id && formData.id != '') {
							temp.subsystemPatternId = formData.id;
						};
						list.push(temp);
					};
				}
			}
			delete formData.commandModuleId;
			formData.subsystemCode = moduleCode;
			formData.list = list;
			console.log('formData',formData)
			if(list.length == 1 && list[0].deviceGroupId == '') {
				confirmMsg = '当前设备未分组，所有设备只能统一的进行工作，建议去设备分组中将设备分组管理再配置模式';
				layer.confirm(confirmMsg, {
				    btn: ['保存','去分组'], //按钮
				    shade: true, //显示遮罩
				    btn2: function(e){
						goPage('index',{type:'group-devices'});
					}
				}, function(lindex){
					layer.close(lindex);
					CommonUtil.operation({
						moduleName: 'subsystem',
						oper: 'save',
						params: {subsystemPatternStr:JSON.stringify(formData)},
						forbidConfirm: true
					}, function(res) {
						goPage('index',{subsystemPatternId:formData.id});
						layer.msg('保存成功',{icon:6});
					});
				});	
			} else {
				layer.confirm(confirmMsg, {
				    btn: ['保存','取消'], //按钮
				    shade: true //显示遮罩
				}, function(lindex){
					layer.close(lindex);
					CommonUtil.operation({
						moduleName: 'subsystem',
						oper: 'save',
						params: {subsystemPatternStr:JSON.stringify(formData)},
						forbidConfirm: true
					}, function(res) {
						goPage('index',{subsystemPatternId:formData.id});
						layer.msg('保存成功',{icon:6});
					});
				});
			}
			
			/*layer.confirm(confirmMsg, {
			    btn: ['保存','取消'], //按钮
			    shade: true //显示遮罩
			}, function(lindex){
				layer.close(lindex);
				CommonUtil.operation({
					moduleName: 'subsystem',
					oper: 'save',
					params: {subsystemPatternStr:JSON.stringify(formData)},
					forbidConfirm: true
				}, function(res) {
					goPage('index',{subsystemPatternId:formData.id});
					layer.msg('保存成功',{icon:6});
				});
			});	*/
		},
		getVersionDevices = function(data){
			var tpl = version_devices_list_tpl.innerHTML,
				view = $('.version-devices-open .below');
			data.limit = 10000;
			data.page = 1;
			CommonUtil.operation({
				moduleName: 'group-devices',
				oper: data.oper ? data.oper : 'pageGroupDevices',
				params: data,
				forbidConfirm: true
			}, function(res) {
				laytpl(tpl).render(res.result.resultList, function(html){
					view.html(html);
				});
			});
		},
		compare = function(prop) {
            return function (obj1, obj2) {
                var val1 = obj1[prop]*1;
                var val2 = obj2[prop]*1;
                if (val1 < val2) {
                    return -1;
                } else if (val1 > val2) {
                    return 1;
                } else {
                    return 0;
                }            
            } 
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
		};
	return {
		init: init	
	};	
}());