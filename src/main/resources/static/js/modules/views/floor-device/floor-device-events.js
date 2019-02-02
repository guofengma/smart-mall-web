(function(w){
	/**
	 * 楼层设备的事件。
	 */
	var FloorDeviceEvents = function(){
		var _this = this,
			pgSelector = areaFloorManage.pgSelector,
			moduleId = areaFloorManage.moduleId,
			systemVersionSelector = '#pg-device-form-panel form select[name="deviceTypeCode"]',
			currentDevice = null,
			
		openDeviceFormPanel = function(onlyShow) {//设备表单:设备详情、设备编辑、设备新增
			var img = new Image(),
				scale = 1,
				formSelector = '#pg-device-form-panel form',
				formPgSelector = '#pg-device-form-panel .mini-pg-bg',
				formPanelIndex = 0,
				formTitle = '';
			currentDevice = floorDeviceDataLoading.currentDevice;
			if($(floorDeviceDataLoading.deviceSelector + ' div[data-id="'+currentDevice.id+'"]').hasClass("current")) {//如果当前设备在拖动状态，禁止弹出
				return false;
			}
			if (onlyShow) {
				formTitle = '设备点详情展示';
			} else {
				formTitle = (currentDevice && currentDevice.id !== 'anonymous' ? '编辑' : '新增') + '设备点信息';
			}
			// 拦截重复打开
			if ($('#pg-device-form-panel').length > 0) {
				return false;
			}
			setTimeout(function() {
				// 打开设备编辑界面
				formPanelIndex = layer.open({
					type: 1,
					title: formTitle,
					skin: 'layui-layer-demo', //样式类名
					closeBtn: 1, 
					anim: 2,
					shadeClose: false, //开启遮罩关闭
					area : [ '880px', '550px' ], //宽高
					content: '<div class="wrapper-content" id="pg-device-form-panel" style="padding-left: 30px;">' + $('#pg-device-form').html() + '</div>',
					end: function() {
						if (currentDevice && currentDevice.id === 'anonymous') {
							_this.remove();
						}
					}
				});
				
				
				if(currentDevice.systemCode === 'ap') {
					let openEl = '#pg-device-form-panel'
					$(openEl + ' .remark').remove();
					$(openEl + ' .supplier').remove();
					$(openEl + ' .relationId').remove();
					$(openEl + ' .systemCode .col-sm-9').html('<input class="form-control" type="text" value="ap系统" disabled="disabled">');
				}
				// 缩略显示楼层设备信息
				$(formPgSelector).html($(moduleId + ' .pg-bg .zoom-container').html());
				// 只显示当前编辑的设备点
				$.each($(formPgSelector + ' .device-points > div'), function() {
					$(this).hide();
				});
				
				var currentDevicePoint = formPgSelector + ' .device-points > div[data-id="' + currentDevice.id + '"]';
					
				
				if($(currentDevicePoint).find('use').attr('xlink:href').indexOf('red') == -1) {
					$(currentDevicePoint).html('<svg class="icon" aria-hidden="true"><use xlink:href="#icon-location-blue"></use></svg>');
				} else {
					$(currentDevicePoint).html('<svg class="icon" aria-hidden="true"><use xlink:href="#icon-location-red"></use></svg>');
					/*svgEl.html('<use xlink:href="#icon-location-red"></use>');*/
				}
				_this.pgBgScale = 2;
				$(currentDevicePoint)
				.css('transform', 'scale(1)')
				.css('-ms-transform', 'scale(1)')
				.css('-moz-transform', 'scale(1)')
				.css('-webkit-transform', 'scale(1)')
				.css('-o-transform', 'scale(1)');
				$('#pg-device-form-panel .zoom-container')
				.css('transform', 'scale(' + _this.pgBgScale + ')')
				.css('-ms-transform', 'scale(' + _this.pgBgScale + ')')
				.css('-moz-transform', 'scale(' + _this.pgBgScale + ')')
				.css('-webkit-transform', 'scale(' + _this.pgBgScale + ')')
				.css('-o-transform', 'scale(' + _this.pgBgScale + ')');
				$(currentDevicePoint).show();
				function loadDevicePoint() {
					
					var picW = $(pgSelector).width(), // 原始图片宽度
						picH = $(pgSelector).height(), // 原始图片高度
						posX = $(currentDevicePoint).position().left,
						posY = $(currentDevicePoint).position().top,
						containerW = 350,
						containerH = 300,
						picTop,picLeft;

					if ((picW - posX) * 2 <= containerW) {
						picLeft = picW - containerW;
					} else {
						if (posX - (containerW / 2) >= 0) {
							picLeft = posX - (containerW / 2);
						} else {
							picLeft = 0;
						}
					}
					
					if ((picH - posY) * 2 <= containerH) {
						picTop = picH - containerH;
					} else {
						if (posY - (containerH / 2) >= 0) {
							picTop = posY - (containerH / 2);
						} else {
							picTop = 0;
						}
					}
					$(formPgSelector).css('margin-left', -picLeft + 'px').css('margin-top', -picTop + 'px');
				}
				loadDevicePoint();
				
				$(pgSelector).attr('current-device-code', currentDevice.systemCode);
				loadVersionsBySystemCode(currentDevice, function(errorMsg) {
					// 设备信息表单初始化
					CommonUtil.formDataSetAndGet({
						container: formSelector,
						data: currentDevice
					});
					if (errorMsg) {
						layer.close(formPanelIndex);
						layer.msg(errorMsg, {icon: 5});
						return false;
					}
					if (onlyShow) {
						$(formSelector + ' div.form-group.edit').remove();
						$(formSelector + ' h5.edit').remove();
						$(formSelector + ' div.form-opts').css('display', 'none');
						if(areaFloorManage.viewStatus != 'manage') {//只读模式
							$(formSelector + ' div.form-detail-opts').css('display', 'none');
						} else {//操作模式
							let currentDeviceSys = FloorDevicePublic.getDataByKey(areaFloorManage.subSystems, currentDevice.systemCode,'code');
							if(!currentDeviceSys.hasVersion) {
								$(formSelector + ' div.form-detail-opts').css('display', 'none');
							} else {
								$(formSelector + ' div.form-detail-opts').css('display', 'block');
							};
						}
						$.each($(formSelector + ' input'), function() {
							$(this).prop('disabled', 'disabled');
							$(this).attr('disabled', 'disabled');
						});
						$.each($(formSelector + ' select'), function() {
							$(this).prop('disabled', 'disabled')
							$(this).attr('disabled', 'disabled');
						});

						$(formSelector + ' a[role="edit-location"]').unbind('click').on('click', function() {
							layer.close(formPanelIndex);
							_this.editDeviceLocation();
						});
						
						$(formSelector + ' a[role="edit"]').unbind('click').on('click', function() {
							layer.close(formPanelIndex);
							openDeviceFormPanel();
						});

						$(formSelector + ' a[role="remove"]').unbind('click').on('click', function() {
							removeDevice();
						});
						$(formSelector + ' div.form-group').css('margin-bottom','2px');
						$($(formSelector + ' div.only-show')[3]).css('margin-bottom','15px')
						return false;
					} else {
						$(formSelector + ' div.form-group.only-show').remove();
						$(formSelector + ' h5.only-show').remove();
						$(formSelector + ' div.form-group').css('margin-bottom','10px');
						if(currentDevice.systemCode == 'ap') {
							$(formSelector + ' select').each(function(){
								$(this).attr('disabled','disabled');
							})
							$(formSelector + ' .other-info input').each(function(){
								$(this).attr('disabled','disabled');
							})
							$(formSelector + ' input[name="relationId"]').attr('disabled','disabled');
						}
					}
					$(formSelector + ' div.form-detail-opts').css('display', 'none');
					$(formSelector + ' div.form-opts').css('display', 'block');
					// 设备点x值变化后，平面图上进行联动显示
					$(formSelector + ' input[name="x"]').change(function(e){
						var val = $(this).val(),
							x = 0,
							absVal = 1;
						
						if (!(/^[1-9]\d*(\.\d+)?$/).test(val)) {
							layer.msg('设备点的X值必须是1-' + (imgWidth - 20) + '范围内的合法数字', {icon: 5});
							val = 1;
						}
						x = parseFloat(val);
						if (x > 0) {
							if (x <= imgWidth - 20) {
								absVal = x;
							} else {
								absVal = imgWidth - 20;
								layer.msg('设备点的X值不得超过图片原始尺寸的宽度[' + imgWidth + ']-20(图标尺寸占20像素的高度)', {icon: 5});
							}
						} else {

							layer.msg('设备点的X值不得小于等于0', {icon: 5});
						}
						$(this).val(absVal);
						$(formPgSelector + ' .device-points > div[data-id="' + currentDevice.id + '"]').css('left', (absVal * pgScale) + 'px' );
						
						loadDevicePoint();
					});

					// 设备点y值变化后，平面图上进行联动显示
					$(formSelector + ' input[name="y"]').change(function(){
						var val = $(this).val(),
							y = 0,
							absVal = 1;
						
						if (!(/^[1-9]\d*(\.\d+)?$/).test(val)) {
							layer.msg('设备点的Y值必须是1-' + (imgHeight - 20) + '范围内的合法数字', {icon: 5});
							val = 1;
						}
						
						y = parseFloat(val);
						
						if (y > 0) {
							if (y <= imgHeight - 20) {
								absVal = y;
							} else {
								absVal = imgHeight - 20;
								layer.msg('设备点的Y值不得超过图片原始尺寸的高度[' + imgHeight + ']-20(图标尺寸占20像素的高度)', {icon: 5});
							}
						} else {
							layer.msg('设备点的Y值不得小于等于0', {icon: 5});
						}
						$(this).val(absVal);
						$(formPgSelector + ' .device-points > div[data-id="' + currentDevice.id + '"]').css('top', (absVal * pgScale) + 'px' )
						
						loadDevicePoint();
					});
					// 系统码值发生改变，要加载相应的版本号
					$(formSelector + ' select[name="systemCode"]').on('change', function() {
	//					currentDevice.systemCode = $(this).val();
						$(pgSelector).attr('current-device-code', $(this).val());
						loadVersionsBySystemCode();
					});
					// 表单规则及错误提示配置
					var formRules = {
							systemCode: {
								required: true
							},
							deviceTypeCode: {
								required: true
							},
							deviceName: {
								required: true,
								rangelength: [4, 30]
							},
							deviceCode: {
								required: true,
								maxlength: 30
							},
							remark:{
								maxlength: 30
							},
							x: {
								number: true,
								min: 1
							},
							y: {
								number: true,
								min: 1
							},
							relationId: {
								required: true
							}
						},
						formMessage = {
							systemCode: {
								required: icon+'请选择设备类型',
							},
							deviceTypeCode: {
								required: icon+'请选择版本号',
							},
							deviceName: {
								required: icon+'请填写设备名称',
								rangelength: icon + '设备名称的长度控制在4-30个字符',
							},
							deviceCode: {
								required: icon+'请填写设备编号',
								maxlength: icon + '设备编号的输入长度控制在30个字符内'
							},
							remark: {
								maxlength: icon + '位置描述的输入长度控制在30个字符内'
							},
							x: {
								number: icon + 'x值的输入必须是合法的数字',
								min: icon + 'x值的输入不得小于1'
							},
							y: {
								number: icon + 'y值的输入必须是合法的数字',
								min: icon + 'y值的输入不得小于1'
							},
							relationId: {
								required: icon+'请填写序列号',
							}
						};
					function validateAddMethod(pCode, pRegexExp, pDescription) {
						$.validator.addMethod(pCode, function(value,element,params){
							var regex = new RegExp(pRegexExp.replace(/(^\s*)|(\s*$)/g, ''));
							
							return this.optional(element) || regex.test(value);
						}, "请输入合法的" + pDescription);  
					}
					// 遍历其它参数结构，添加表单验证方法及规则
					for (var i = 0; i < deviceFormOtherInfo.length; i++) {
						var dfoi = deviceFormOtherInfo[i];
						var pCode = dfoi.pCode,// 规则码
							pRegexExp = dfoi.pRegexExp, // 规则正则
							pDescription = dfoi.pDescription;
						validateAddMethod(pCode, pRegexExp, pDescription);
						// 添加规则码规则
						formRules[dfoi.pCode] = {};
						formRules[dfoi.pCode].required = true;
						formRules[dfoi.pCode][dfoi.pCode] = true;
						// 添加规则码错误提示
						formMessage[dfoi.pCode] = {};
						formMessage[dfoi.pCode].required = icon + '请填写' + dfoi.pDescription;
					}
					// 表单验证
					pdFormValidator = $(formSelector).validate({
						rules: formRules,
						messages: formMessage,
						submitHandler:function(form){
							var data = $(form).serializeObject();
							if (data.id === 'anonymous') {
								delete data['id'];
							}
							var i, dfoi;
							// 获取动态配置参数及值，赋给deviceFormOtherInfo进行实体的deviceOtherInfo字段关联
							for (var o in data) {
								for (i = 0; i < deviceFormOtherInfo.length; i++) {
									dfoi = deviceFormOtherInfo[i];
									if (dfoi.pCode === o) {
										dfoi.pValue = data[o];
									}
								}
							}
							// 删除实体中的动态参数
							for (i = 0; i < deviceFormOtherInfo.length; i++) {
								dfoi = deviceFormOtherInfo[i];
								delete data[dfoi.pCode];
							}
							// 关联
							data.deviceOtherInfo = deviceFormOtherInfo;
							saveDevice({
								data: data
							}, function() {
								layer.close(formPanelIndex);
							});
							return false;
						} 
					});
					
					// 重置表单
					$(formSelector + ' button[role="reset"]').unbind('click').on('click', function() {
						CommonUtil.formDataSetAndGet({
							container: formSelector,
							opt: 'reset',
							data: {
								x: 1,
								y: 1
							}
						});
						$(formSelector + ' .form-control').removeClass('has-error').removeClass('has-success')
						pdFormValidator.resetForm();
						$(formPgSelector + ' .device-points > div[data-id="' + currentDevice.id + '"]').css('top', (1 * pgScale) + 'px' );
						$(formPgSelector + ' .device-points > div[data-id="' + currentDevice.id + '"]').css('left', (1 * pgScale) + 'px' );
						layer.msg('表单内容已重置');
					});

				});
			});
			
		},
		loadVersionsBySystemCode = function(cd, callback) {//根据子系统获取版本号
			var scode = $(pgSelector).attr('current-device-code');
			
			CommonUtil.operation({
				moduleName: 'device',
				oper: 'subSystems',
				params: {
					code: scode
				},
				forbidConfirm: true
			}, function(res) {
				var brands = res.result ? res.result[0].brands : [],
					versions = [];
				
				for (var i = 0; i < brands.length; i++) {
					var b = brands[i];
					for (var j = 0; j < b.childSystems.length; j++) {
						var cs = b.childSystems[j];
						for(var k = 0; k < cs.versions.length; k++) {
							var v = cs.versions[k];
							var version = {};
							version.brandName = b.bName;
							version.systemName = cs.cName;
							version.versionCode = v.vCode;
							version.versionName = v.vVersion;
							versions.push(version);
						}
					}
				}
				if (versions.length > 0) {
					$(systemVersionSelector).html(versions.map(function (v) {
						return '<option value="' + v.versionCode + '">' + v.versionName + '( ' + v.brandName + '-' + v.systemName + ')' + '</option>';
					}).join(''));
					if (cd) {
						$('#pg-device-form-panel form select[name="systemCode"]').val(cd.systemCode);
						loadFormConfigByVersionCode(cd.deviceTypeCode, callback);
					} else {
						loadFormConfigByVersionCode(null, callback);
					}
					$(systemVersionSelector).unbind().on('change', function() {
						loadFormConfigByVersionCode();
					});
					
				} else {
					
					if (typeof callback === 'function') {
						callback('请联系管理员：系统配置不健全，子系统关联版本号数据加载为空。')
					}
				}
				
			});
		},
		deviceFormOtherInfo = [],
		loadFormConfigByVersionCode = function(vcode, callback) {//根据版本号获取表单配置
			var vcode = vcode ? vcode : $(systemVersionSelector).val();
			if (vcode) {
				CommonUtil.operation({
					moduleName: 'device',
					oper: 'formConfig',
					params: {
						versionCode: vcode
					},
					forbidConfirm: true
				}, function(res) {
					res = res.result;
					res = res ? res : [];
					deviceFormOtherInfo = currentDevice.deviceOtherInfo ? currentDevice.deviceOtherInfo : [];
					if (currentDevice.systemCode === $('#pg-device-form-panel form select[name="systemCode"]').val()) {
						if (deviceFormOtherInfo.length > 0) {
							for (var i = 0; i < deviceFormOtherInfo.length; i++) {
								var dfoi = deviceFormOtherInfo[i];
								for (var j = 0; j < res.length; j++) {
									var r = res[j];
									if (dfoi.pCode === r.pCode) {
										r.pValue = dfoi.pValue;
									}
								}
							}
						} else {
							deviceFormOtherInfo = res;
							//在提交表单的时候，改变deviceFormOtherInfo对象，转成字符串保存提交
						}
					} else {
						deviceFormOtherInfo = res;
					}
					var tpl = fd_device_form_other_params_tpl.innerHTML,
						view = '#pg-device-form-panel div.other-info';

					if (tpl) {
						laytpl(tpl).render(deviceFormOtherInfo, function(html){
							$(view).html(html);
							if (typeof callback == 'function') {
								callback();
							}
						});	
					}
					
				});
				getSupplierByDeviceCode({versionCode:vcode});
			}
		},
		removeCurDevicePointer = function(){//删除平面图上的当前设备
			var removeDeviceIndex = -1;
			for (var i = 0; i < floorDeviceDataLoading.devices.length; i++) {
				if (floorDeviceDataLoading.devices[i].id === currentDevice.id) {
					removeDeviceIndex = i;
				}
			}
			if (removeDeviceIndex >= 0) {
				floorDeviceDataLoading.devices.splice(removeDeviceIndex, 1);
				floorDeviceDataLoading.renderDevicesPoints();
			}
			currentDevice = null;
			floorDeviceDataLoading.currentDevice = null;
		},
		reFreshDevices = function(systemCode){//刷新当前的设备
			floorDeviceDataLoading.pageDevicesBySystemCode({//加载设备列表
				systemCode:systemCode,
				floorId:floorDeviceDataLoading.floorId,
				keyword:floorDeviceDataLoading.pageDevicesBySystemCodeKeyword
			})
			floorDeviceDataLoading.noPageDevicesBySystemCode(floorDeviceDataLoading.noPageDevicesParams);//加载平面图上的设备
		},
		saveDevice = function(p,callback){
			checkBaseParameters(p,function(){
				CommonUtil.operation({
		    		moduleName: 'device',
		    		oper: 'save',
					oper_cn: '保存',
		    		params: {
		    			data: JSON.stringify(p.data)
		    		},
		    		forbidConfirm: p.forbidConfirm ? true : false,
		    		forbidLoading: false
		    	}, function(res) {
					layer.closeAll();
					if(floorDeviceDataLoading.queryAllDevices) {
						floorDeviceDataLoading.noPageDevicesBySystemCode(floorDeviceDataLoading.noPageDevicesParams);//加载平面图上的设备
					} else {
						let temp_el = $('.fd-device-system a[data-syscode="' + p.data.systemCode + '"]'),
			    			temp_parent = temp_el.parents('.panel-default');
			    		if(temp_parent.hasClass('selected')) {
			    			reFreshDevices(p.data.systemCode);
			    		} else {
			    			temp_el.trigger('click');
			    		}
			    		if (typeof callback === 'function') {
			    			callback(res);
			    		}
					}
		    		
		    	});
			})
		},
		getSupplierByDeviceCode = function(p,callback){
			p = p ? p : {};
			var versionCode = p.versionCode ? p.versionCode : $(systemVersionSelector).val();
			if(!versionCode) {
				return false;
			}
			CommonUtil.operation({
	    		moduleName: 'device',
	    		oper: 'querySuppliersByVCode',
	    		params: {
	    			versionCode:versionCode
	    		},
	    		forbidConfirm: true
	    	}, function(res) {
				let html = '',
					suppliers = res.result;
				if(suppliers && suppliers.length > 0) {
					suppliers.forEach(function(value){
						html += '<option value="' + value.id + '">' + value.name + '</option>'
					});
				} else {
					html = '<option value="" selected disabled>暂无可用供应商</option>'
				}
				$('#pg-device-form-panel form select[name="supplierId"]').html(html);
				
	    	});
		},
		checkBaseParameters = function(p,callback){
			let deviceOtherInfo = p.data.deviceOtherInfo,
				systemCode = p.data.systemCode,
				deviceId = p.data.id,
				versionCode = p.data.deviceTypeCode,
				baseParameters = [],
				item = {};
			deviceOtherInfo.forEach(function(value){
				if(value.prepeat == 0) {
					item = {
						deviceId: deviceId,
						systemCode: systemCode,
						versionCode: versionCode,
						pName: value.pName,
						pValue: value.pValue,
						pDescription: value.pDescription
					};
					if(deviceId && deviceId != '') {
						item.deviceId = deviceId;
					}
					baseParameters.push(item)
				}
			});
	
			if(baseParameters.length == 0) {
				callback()
			} else {
				CommonUtil.operation({
					moduleName: 'device',
		    		oper: 'baseParameterUniqueCheck',
		    		type: 'get',
		    		params: {
		    			baseParameterCheckStr:JSON.stringify({data:baseParameters})
		    		},
		    		forbidConfirm: true
		    	}, function(res) {
		    		let result = res.result;
		    		if(result.isUnique) {
		    			callback();
		    		} else {
		    			let pDescriptions = [],
		    				list = result.notUnique;
		    			list.forEach(function(value){
		    				baseParameters.forEach(function(baseParameter) {
		    					pDescriptions.push(baseParameter.pDescription);
		    				})
		    			})
		    			layer.msg(pDescriptions.join('、') + '重复', {icon: 5});
		    		}
		    	});
			}
		};
		this.pgPointSelected = function(e) {//操作设备（楼层平面图可能被操作），获取设备的位置
			var eo = e.originalEvent,
				eoX = eo.clientX,//鼠标位置
				eoY = eo.clientY,//鼠标位置
				pgX, pgY,
				pgW = $(pgSelector).width(),//图片的尺寸
				pgH = $(pgSelector).height(),//图片的尺寸
				pgLeft,
				pgTop,
				dH = _this.dH,//设备图片的高度
				dW = _this.dW;//设备图片的宽度
			
			var matrix = getZoomScale($(moduleId + ' .pg-bg .zoom-container')),
				msWScale = 1, msHScale = 1,//缩放尺寸
				msW, msH,//缩放后的图片尺寸
				msLeft = $(pgSelector).offset().left,//缩放后的图片的左边距
				msTop = $(pgSelector).offset().top;//缩放后的图片的上边距
			
			if (matrix !== 'none') {
				msWScale = parseFloat(matrix[0]);
				msHScale = parseFloat(matrix[3]);
				msW = pgW * msWScale;
				msH = areaFloorManage.pgHeight * msHScale;
			}
			currentDevice = floorDeviceDataLoading.currentDevice;
			if (currentDevice && currentDevice.id && currentDevice.id !== 'anonymous') {// 编辑
				let currentEl = $(moduleId + ' .pg-bg .zoom-container').find('div[data-id="'+currentDevice.id+'"]');
				eoX = currentEl[0].getBoundingClientRect().left - areaFloorManage.pgScale * 2;
				eoY = currentEl[0].getBoundingClientRect().top + areaFloorManage.pgScale * 2;
				dW = currentEl[0].getBoundingClientRect().width;
				dH = currentEl[0].getBoundingClientRect().height;
			}
			if (!(currentDevice && currentDevice.id && currentDevice.id !== 'anonymous')) {// 添加
				currentDevice = FloorDevicePublic.getDataByKey(floorDeviceDataLoading.devices, 'anonymous');
				if (!currentDevice) {
					currentDevice = {
						id: 'anonymous',
						systemCode: $(pgSelector).attr('current-device-code'),
						floorId: floorDeviceDataLoading.floorId};
					// 新增点
					floorDeviceDataLoading.currentDevice = currentDevice;
					floorDeviceDataLoading.devices.push(currentDevice);
				}
			}
			
			pgX = eoX - msLeft + dW / 2;
			pgY = eoY - msTop + dH / 2;
			
			pgX = pgX / msWScale;
			pgY = pgY/ msHScale;
			
			currentDevice.x = Math.round(pgX / areaFloorManage.pgScale);
			currentDevice.y = Math.round(pgY /areaFloorManage.pgScale);
			
			// 保存点的修改
			for (var i = 0; i < floorDeviceDataLoading.devices.length; i++) {
				var d = floorDeviceDataLoading.devices[i];
				if (d.id === currentDevice.id) {
					d = currentDevice;
				}
			}
			
			$(pgSelector).attr('current-device-code', currentDevice.systemCode);
			if (currentDevice && currentDevice.id && currentDevice.id !== 'anonymous') {
				saveDevice({
					data: currentDevice,
					forbidConfirm: true
				});
			} else {
				floorDeviceDataLoading.renderDevicesPoints();
				openDeviceFormPanel();
			}
			setTimeout(function() {
				areaFloorManage.lockContextMenu = false;
			});
		};
		this.detail = function(p){
			$(pgSelector).attr('current-device-code', floorDeviceDataLoading.currentDevice.systemCode);
			openDeviceFormPanel(true);
		}
		this.remove = function(){
			currentDevice = floorDeviceDataLoading.currentDevice;
			if (currentDevice && currentDevice.id !== 'anonymous') {
				// 删除
				CommonUtil.operation({
					moduleName: 'device',
					oper: 'remove',
					oper_cn: '删除',
					params: {
						id: currentDevice.id
					}
				}, function(res) {
					layer.closeAll();
					reFreshDevices(currentDevice.systemCode);
					floorDeviceDataLoading.currentDevice = null;
				})
			} else {
				removeCurDevicePointer();
			}	
		}
		this.editDeviceLocation = function(el) {//编辑设备的位置
			let nowTime = (new Date()).getTime();
			if (!el) {
				el = floorDeviceDataLoading.deviceSelector;
			}
			let currentDeviceMove = floorDeviceDataLoading.currentDevice;
			currentDevice = floorDeviceDataLoading.currentDevice;
			floorDeviceDataLoading.lockContextMenu = true;
			var currentDeviceEl = $(el + ' > div[data-id="' + currentDeviceMove.id + '"]');
			if (currentDeviceEl.length !== 1) {
				console.log('程序错误，编辑操作的设备点元素不是唯一的。');
				return false;
			}
			currentDeviceEl.siblings('.current').find('.star').remove();
			currentDeviceEl.siblings('.current').removeClass('current');
			currentDeviceEl.addClass('current');
			if(currentDeviceEl.find('.star').length == 0) {
				currentDeviceEl.append('<span class="star"></span>');
			}
			setTimeout(function(){
				currentDeviceEl.find('.star').css('background-image','url(/img/tools/star.png?p='+nowTime + ')');
			})
			
			currentDeviceEl.css('cursor', 'move')
			.css('transform', 'scale(' + 1/areaFloorManage.pgBgScale + ')')
			.css('-ms-transform', 'scale(' + 1/areaFloorManage.pgBgScale + ')')
			.css('-moz-transform', 'scale(' + 1/areaFloorManage.pgBgScale + ')')
			.css('-webkit-transform', 'scale(' + 1/areaFloorManage.pgBgScale + ')')
			.css('-o-transform', 'scale(' + 1/areaFloorManage.pgBgScale + ')');
			currentDeviceEl.find('i').removeClass('selected');
			/*layer.msg("拖动设备图标即可修改位置", {icon: 0});*/
			currentDeviceEl.unbind('mousedown').mousedown(function(e) {
				var offset = $(this).offset();
				e.stopPropagation();
				/*console.log('开始拖动offset',offset)*/
				this.posix = {
					'w': $(this)[0].clientWidth,
					'h': $(this)[0].clientHeight,
					'x': e.pageX - offset.left,
					'y': e.pageY - offset.top
				};
				$.extend(document, {
					'move': true,
					'move_target': this,
					'move_container': $(moduleId + ' section.plan-graph > .pg-bg > .zoom-container')
				});
				
			}).unbind('mouseup').mouseup(function(e) {
				/*console.log('拖动完毕offset',$(this).offset())*/
				/*layer.confirm('是否完成拖动？', {
					btn: ['是','否'] //按钮
				}, function(cindex){
					layer.close(cindex);
					currentDeviceEl.removeClass('current');
					currentDeviceEl.css('cursor', 'auto');
					_this.pgPointSelected(e);
				}, function(cindex){
					layer.close(cindex);
				});*/
				setTimeout(function(){
					currentDevice = currentDeviceMove;
					currentDeviceEl.removeClass('current');
					currentDeviceEl.css('cursor', 'auto');
					_this.pgPointSelected(e);
					return false;
				},50)
			});
		}
		this.openDeviceFormPanel = openDeviceFormPanel;
		this.dH = 16;//设备图片的高度
		this.dW = 16;//设备图片的宽度
	};
	w['FloorDeviceEvents'] = FloorDeviceEvents;
	return w;
})(window)