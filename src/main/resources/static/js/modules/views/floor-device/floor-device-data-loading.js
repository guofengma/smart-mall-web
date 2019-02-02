(function(w){
	/**
	 * 获取设备，进行数据呈现。
	 */
	var FloorDeviceDataLoading = function(p) {
		let moduleId = areaFloorManage.moduleId,
			apManegerUrl = '';
		this.subSystemdevice = {};
		this.subSystemSelecter = $(moduleId + ' .fd-device-system');
		this.deviceSelector = moduleId + ' .pg-bg .device-points';
		this.devicePointsStatus = 'all';//all：显示全部，error：显示异常设备
		this.hasUnusualStatusSubSystem = ['door','vedio','ap'];//支持设备状态的子系统
		/**
		 * 根据楼层加载设备
		 */
		let _this = this,
			showSubSystemCode = null,//搜索状态下被展示的子系统
			loadDevices = function(p, callback) {//加载设备
				p = p ? p : {};
				p.limit = p.limit ? p.limit : 10;
				
				CommonUtil.operation({
					moduleName: 'device',
					oper: p.oper ? p.oper : 'page',//page:查询详细数据，pageVo：查询简单数据，默认page
					params: p,
					forbidConfirm: true,
					forbidLoading: false
				}, function(res) {
					if (typeof callback === 'function') {
						callback(res);
					}
				});
			},
			/**
			 * 根据楼层加载设备(不分页)
			 */
			noPageDevicesBySystemCode = function(data,callback) {
				CommonUtil.operation({
					moduleName: 'store',
					oper: 'statisticData',
					type: 'get',
					forbidConfirm:true,
					params:data
				}, function(res) {
					var data = res.result;
					var amount = parseInt(data.amount);
					var error = parseInt(data.error);
					var normal = amount - error,
						html = '';
					
					if(areaFloorManage.viewStatus == 'read') {
						html = '<span>设备总数： ' + amount + '</span>'+
						'<span>正常设备数： ' + normal + '</span>'+
						'<span>异常设备数： <font class="text-danger">' + error + '</font></span>';
						if (data.others && data.others.length > 0) {
							for (let i = 0; i < data.others.length; i++) {
								let item = data.others[i],
									key = item.businessState,
									value = item.businessStateCount;
								html += '<span>' + key + '： ' + value + '</span>';
							}
						}
					} else {
						html = '<span>设备总数： ' + amount + '</span>';
					}
					$(moduleId + ' div[data-item="statistic-device-data"]').html(html);
				});
				loadDevices({
					page: 1,
					limit: 10000,
					floorId: data.floorId,
					systemCode: data.systemCode ? data.systemCode : '',
					keyword: data.keyword ? data.keyword : ''
				}, function(res) {
					_this.noPageDevicesParams = {
						floorId: data.floorId,
						systemCode: data.systemCode ? data.systemCode : '',
						keyword: data.keyword ? data.keyword : ''	
					};
					_this.devices = res.result.resultList;
					renderDevicesPoints(_this.deviceSelector);
					
					if(typeof callback == 'function') {
						callback(res)
					}
					
				});
			},
			/**
			 * 在楼层平面图上渲染设备
			 */
			renderDevicesPoints = function(el,callback){
				if (!el) {
					el = _this.deviceSelector;
				};
				$(el).html('');
				if(areaFloorManage.viewStatus == 'read') {//在只读为设备监控，显示设备状态
					if(_this.devicePointsStatus == 'all') {//显示全部设备
						for (var i = 0; i < _this.devices.length; i++) {
							var curDevice = _this.devices[i];
							// 控制设备点是本层楼的数据点
							if (curDevice.floorId == _this.floorId) {
								if(isUnusualStatusSubSystem(curDevice.systemCode, true) && curDevice.physicalState != 0) {//判断该设备是否有业务状态，如果有用图标区分
									let iconColor = "red";
									if(curDevice.physicalState != 1) {
										iconColor = "gray"
									}
									$(el).append('<div class="device-item"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-' + curDevice.systemCode + '-' + iconColor +'"></use></svg></div>');
								} else {
									$(el).append('<div class="device-item"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-' + curDevice.systemCode + '-blue"></use></svg></div>');
									
								}
								setPosition(el,curDevice);
							}	
						}
					} else if(_this.devicePointsStatus == 'error') {//显示异常设备
						for (var i = 0; i < _this.devices.length; i++) {
							var curDevice = _this.devices[i];
							// 控制设备点是本层楼的数据点
							if (curDevice.floorId == _this.floorId) {
								if(curDevice.physicalState == 1) {
									$(el).append('<div class="device-item"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-' + curDevice.systemCode + '-red"></use></svg></div>');
									setPosition(el,curDevice);
								}
							}
						}	
					}
				} else {//设备管理，不显示设备状态
					for (var i = 0; i < _this.devices.length; i++) {
						var curDevice = _this.devices[i];
						// 控制设备点是本层楼的数据点
						if (curDevice.floorId == _this.floorId) {
							$(el).append('<div class="device-item"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-' + curDevice.systemCode + '-blue"></use></svg></div>');
							setPosition(el,curDevice);
						}	
					}
				}
				/*给设备定位*/
				function setPosition(el,data) {
					let lastChild = $(el).children().last(),
						dW = lastChild[0].clientWidth,
						dH = lastChild[0].clientHeight;
					
					$(el).children().last()
					.css('top', Math.round(data.y * areaFloorManage.pgScale - dW/2 )+ 'px')
					.css('left', Math.round(data.x * areaFloorManage.pgScale - dH/2 )+ 'px')
					.attr('scale-x', data.x)
					.attr('scale-y', data.y)
					.attr('data-id', data.id)
					.attr('title', data.deviceName ? (data.deviceName + (data.remark ? ('-' + data.remark) : '')) : '新增设备点')
					.css('transform', 'scale(' + 1/areaFloorManage.pgBgScale + ')')
					.css('-ms-transform', 'scale(' + 1/areaFloorManage.pgBgScale + ')')
					.css('-moz-transform', 'scale(' + 1/areaFloorManage.pgBgScale + ')')
					.css('-webkit-transform', 'scale(' + 1/areaFloorManage.pgBgScale + ')')
					.css('-o-transform', 'scale(' + 1/areaFloorManage.pgBgScale + ')');
				}
				
				
				if (typeof callback === 'function') {
					callback(res);
				} else {
					// 单击设备点查看详情
					$(el + ' > .device-item').unbind('click').on('click', function(e) {
						e.preventDefault();
						e.stopPropagation();
						if (!areaFloorManage.lockContextMenu) {
							_this.currentDevice = FloorDevicePublic.getDataByKey(_this.devices, $(this).attr('data-id'));
							floorDeviceEvents.detail();
						}
					});
					// 设备点添加右键菜单事件
					$(el + ' > .device-item').unbind('contextmenu').on('contextmenu', function(e) {
						if(areaFloorManage.viewStatus == 'manage') {
							rightMenu({e:e,id:$(this).attr('data-id'),el:el});
						}
					});
				}
			},
			/**
			 * 获取设备管理列表数据
			 */
			pageDevicesBySystemCode = function(p,callback) {//根据楼层、子系统的code获取设备数据
				var ssCode = p.systemCode;
				p.oper = 'pageVo';
				p.sort = p.sort ? p.sort: 'physicalState';
				p.order = p.order ? p.order : 'desc';
				loadDevices(p, function(res) {
					var pageResult = res.result;
					if(pageResult.currentPage == 1) {
						_this.subSystemdevice[ssCode] = pageResult;
					}
					_this.pageDevicesBySystemCodeKeyword = p.keyword;
					_this.queryAllDevices = false;
					renderDevicesPage({systemCode:ssCode,data:pageResult,keyword:p.keyword});
					if(typeof callback == 'function') {
						callback(res.result);
					}
					
				})
			},
			/**
			 * 渲染设备管理列表
			 */
			renderDevicesPage = function(p) {
				let ssCode = p.systemCode,
					data = p.data;
				if(ssCode == 'ap') {
					console.log('areaFloorManage.viewStatus',areaFloorManage.viewStatus)
					if(areaFloorManage.viewStatus == 'manage') {
						let html = '<span>其他顺序</span>';
						
						if (areaFloorManage.opers.indexOf('syn-ap-devices') >= 0) { //ap设备同步权限
							html = '<button type="button" class="btn btn-primary btn-outline syn">同步设备</button>' + html;
						}
						if (areaFloorManage.opers.indexOf('manage-ap-devices') >= 0) { //ap设备管理权限
							html = '<a class="btn btn-primary btn-outline link-ap-manage" href="' + apManegerUrl + '" target="view_window">管理设备</a>' + html;
						}
						$(moduleId + ' .floor-devices-' + ssCode + ' .sort-btn').html(html);
						$(moduleId + ' .floor-devices-' + ssCode + ' .sort-btn .syn').unbind().on('click',function(){
							CommonUtil.operation({
								moduleName: 'device',
								oper: 'synchronizeApDevice',
								params: {},
								forbidConfirm: true,
								forbidLoading: false
							}, function(res) {
								layer.msg('同步完成',{icon:6})
								subSystemDevicesComEvent({
									systemCode:'ap',
									page:1,
									floorId:_this.floorId
								})
							})
						})
					}
				}
				if (data.totalCount > 0) {
					if(isUnusualStatusSubSystem(ssCode,true) && areaFloorManage.viewStatus == 'read') {
						$(moduleId + ' .floor-devices-' + ssCode + ' ul').html(data.resultList.map(function (d) {
							let msg = '',
								physicalState = d.physicalState;
							if(physicalState == 0) {
								let businessState = d.businessState,
									status = {};
								if(businessState) {
									businessState.forEach(function(value) {
										status = value.status;
										msg = status.statusValue;
									})
								} else {
									if(ssCode == 'ap') {
										msg = '正常';
									} else {
										msg = '其他';
									}
									
								}
								
							} else if(physicalState == 1){
								msg = '异常';
							} else if(physicalState == null) {
								msg = '获取状态';
							}
							return '<li class="list-group-item"><a href="javascript:;" role="device-detail" data-id="' + d.id + '"><i class="physicalState-' + physicalState + '"></i> ' + d.deviceName + '</a><span class="physicalState-'+physicalState+'">'+msg+'</span></li>';
						}).join(''));
					} else {
						$(moduleId + ' .floor-devices-' + ssCode + ' ul').html(data.resultList.map(function (d) {
							return '<li class="list-group-item"><a href="javascript:;" role="device-detail" data-id="' + d.id + '">' + d.deviceName + '</a></li>';
						}).join(''));
						
					}
					if (areaFloorManage.opers.indexOf('fd-detail') >= 0) { // opers 操作权限字符串
						//在设备列表中点中设备并在平面图中定位
						$(moduleId + ' .floor-devices-' + ssCode + ' ul').find('a[role="device-detail"]').unbind('click').on('click', function() {
							var self = $(this),
								nowTime = (new Date()).getTime();
								currentDeviceId = self.attr('data-id'),
								currentDeviceEl = $(moduleId + ' .pg-bg .device-points > .device-item[data-id="' + currentDeviceId + '"]'),
								normal_img = currentDeviceEl.find('use').attr('xlink:href'),
								old_img = $(moduleId + ' .pg-bg .device-points .selected').attr('data-icon');
							console.log('normal_img',normal_img,currentDeviceEl)
							
							if(normal_img && normal_img.indexOf('location') == -1) {
								currentDeviceEl.attr('data-icon',normal_img);
							}
							$(moduleId + ' ul a[role="device-detail"]').removeClass('selected');
							$(moduleId + ' .unusual-item span').removeClass('selected');
							self.addClass('selected');
							if(p.keyword && p.keyword.length > 0 && ssCode != showSubSystemCode) {
								/**
								 * 在搜索状态下，如果当前子系统不是被展示的子系统，加载当前子系统的数据和异常设备数据
								 */
								let parent = $(this).parents('.panel');
								showSubSystemCode = ssCode;
								noPageDevicesBySystemCode({
									floorId: _this.floorId,
									systemCode: ssCode,
									keyword: p.keyword ? p.keyword : ''
								}, function(res) {
									currentDeviceEl = $(moduleId + ' .pg-bg .device-points > div[data-id="' + currentDeviceId + '"]');
									normal_img = currentDeviceEl.find('use').attr('xlink:href');
									if(normal_img && normal_img.indexOf('location') == -1) {
										currentDeviceEl.attr('data-icon',normal_img);
									}
									$(moduleId + ' .pg-bg .device-points .selected').html('<svg class="icon" aria-hidden="true"><use xlink:href="' + old_img + '"></use></svg>')
									$(moduleId + ' .pg-bg .device-points .selected').removeClass('selected');
									setTimeout(function(){
										let svgEl = currentDeviceEl.find('svg');
										if(self.next('span').hasClass('physicalState-1')) {
											svgEl.find('use').attr('xlink:href','#icon-location-red');
										} else {
											svgEl.find('use').attr('xlink:href','#icon-location-blue');
										}
										currentDeviceEl.addClass('selected');
									})
								});	
							} else {
								console.log('old_img',old_img)
								/*$(moduleId + ' .pg-bg .device-points .selected svg').html('<use xlink:href="'+old_img+'"></use>');*/
								$(moduleId + ' .pg-bg .device-points .selected').html('<svg class="icon" aria-hidden="true"><use xlink:href="' + old_img + '"></use></svg>')
								$(moduleId + ' .pg-bg .device-points .selected').removeClass('selected');	
								setTimeout(function(){
									let svgEl = currentDeviceEl.find('svg');
									if(self.next('span').hasClass('physicalState-1')) {
										svgEl.find('use').attr('xlink:href','#icon-location-red');
									} else {
										svgEl.find('use').attr('xlink:href','#icon-location-blue');
									}
									currentDeviceEl.addClass('selected');
								})
							}
						});
					}
					$(moduleId + ' .floor-devices-' + ssCode + ' ul').find('a[role="device-detail"]').unbind('contextmenu').on('contextmenu', function(e) {//右键菜单
						if(areaFloorManage.viewStatus == 'manage') {
							rightMenu({e:e,id:$(this).attr('data-id'),num:3});
						}
					});
				} else {
					$(moduleId + ' .floor-devices-' + ssCode + ' ul').html('<p style="margin-top:10px;padding-left: 15px;">未查找到关联设备</p>');
				}
				let pageId = 'floor-devices-' + ssCode + '-' + moduleId.split('#')[1] + '-page';
				if (data.totalPageNum > 1) {
					laypage.render({
					    elem: pageId,
					    curr: data.currentPage,
					    count: data.totalCount,
					    layout: ['count', 'prev', 'next'],
					    jump: function(obj, first){
					      if(!first){
					    	  p.page = obj.curr;
					    	  p.systemCode = ssCode;
					    	  p.floorId = _this.floorId;
					    	  delete p.data;
					    	  pageDevicesBySystemCode(p);
					      };
					      $('#' + pageId + ' .layui-laypage-count').html('共 ' + data.totalCount + ' 条&nbsp;&nbsp;共 ' + data.totalPageNum + ' 页');
					    }
					});
					$('#' + pageId + ' .layui-laypage-count').html('共 ' + data.totalCount + ' 条&nbsp;&nbsp;共 ' + data.totalPageNum + ' 页');
				} else {
					$('#' + pageId).html('');
				}
					
			},
			
			//获取子系统设备的组合方法：获取设备列表、平面图上的设备
			subSystemDevicesComEvent = function(p){
				if(!p.floorId) {
					return false;
				}
				noPageDevicesBySystemCode(p,function(res){
					pageDevicesBySystemCode(p);
				});
			},
			//针对第一个子系统设备的组合方法
			firstSubSystemDevicesComEvent = function(p) {
				_this.subSystemSelecter.find('.panel.panel-default').each(function(index,el){
					el = $(el);
					if(index == 0) {
						let subSystemCode = el.find('.panel-heading a').attr('data-syscode');
						isUnusualStatusSubSystem(subSystemCode);
						//如果第一个子系统已经展开，直接获取数据，反之点击展开
						if(el.find('.in').length == 1) {
							subSystemDevicesComEvent({
								systemCode:subSystemCode,
								page:1,
								floorId:_this.floorId,
							})
						} else {
							el.find('.panel-heading a').trigger('click');
						}
					} else {
						//如果其他的展开,则关闭
						if(el.find('.in').length == 1) {
							el.find('.panel-heading a').trigger('click');
						}
					}
				})
			},
			/*
			 * 判断子系统是否支持设备状态
			 * subSystemCode 子系统code
			 * statusOnly true：只返回状态，false
			 */			
			isUnusualStatusSubSystem = function(subSystemCode,statusOnly){
				let status = false,
					tempList = _this.hasUnusualStatusSubSystem ? _this.hasUnusualStatusSubSystem: [];
				tempList.forEach(function(value){
					if(value == subSystemCode) {
						status = true;
					}
				});
				return status;
			},
			//设备右键菜单
			rightMenu = function (data) {
				_this.currentDevice = FloorDevicePublic.getDataByKey(_this.devices, data.id);
				let currentDeviceSys = FloorDevicePublic.getDataByKey(areaFloorManage.subSystems, _this.currentDevice.systemCode,'code');
				if(!currentDeviceSys.hasVersion) {
					return false;
				};
				data.e.preventDefault();
				let currentEl = $('section.plan-graph .device-points .current');
				if (!areaFloorManage.lockContextMenu) {
					if(currentEl.length > 0) {
						layer.msg('请先完成设备拖动',{icon:5});
						return false;
					}
					//获取我们自定义的右键菜单
					var deviceOperCMID = areaFloorManage.deviceOperCMID,
						menu = $(deviceOperCMID),
						addDeviceCMId = areaFloorManage.addDeviceCMId;
					//根据事件对象中鼠标点击的位置，进行定位
					menu.css('left', (data.e.clientX - $('#content-main').offset().left) + 'px');
					menu.css('top', (data.e.clientY - $('#content-main').offset().top + $('#content-main').scrollTop() - 20) - 30 + 'px');
					menu.css('width', '200px');
					$(addDeviceCMId).css('width', '0px');
					
					if(data.num && data.num == 3) {
						$(deviceOperCMID + ' > .item > a[role="edit"]').parent().addClass('hide');
					} else {
						$(deviceOperCMID + ' > .item > a').parent().removeClass('hide');
					}
					$(deviceOperCMID + ' > .item > a').unbind('click').on('click', function(event) {
						var role = $(this).attr('role');
						// 编辑位置
						if (role === 'edit') {
							floorDeviceEvents.editDeviceLocation(data.el);
						}
						// 编辑信息
						if (role === 'edit-info') {
							floorDeviceEvents.openDeviceFormPanel();
						}
						// 移除
						if (role === 'remove') {
							floorDeviceEvents.remove();
						}
						// 详情
						if (role === 'detail') {
							floorDeviceEvents.detail();
						}
					});
				}
			},
			//排序面板初始化
			sortPanelInit = function(){
				let sortPanel = $(moduleId + ' .sort-panel');
				$(sortPanel.find("input:radio[name='sort']")[0]).iCheck('check');
			},
			hadFloorAndImg = function() {
				if(!_this.floorId || _this.floorId == '') {
					layer.msg('请先添加楼层',{icon:5})
					return false;
				}
				if($(moduleId + ' .empty-tip').css('display') == 'block') {
					layer.msg('请上传楼层平面图',{icon:5})
					return false;
				}
				return true;
			},
			//获取ap管理界面的地址
			getApManegerUrl = function() {
				let tempModule = 'ap.manager.web';
				CommonUtil.ajaxRequest({
	    			url: 'system/' + tempModule + '/url',
	    			type: 'get',
	    			data: {
	    				module: tempModule
	    			},
	    			forbidConfirm: true,
	    			forbidLoading: false,
	    		}, function(res) {
	    			if(res.success) {
	    				apManegerUrl = res.result;
	    			} else {
	    				/*layer.msg(res.message,{icon:5});*/
	    			}
	    		})
			};
			eventInit = function(){
				//设备管理 子系统的展开与收起
				$(moduleId + ' a[role="device-by-syscode"]').unbind('click').bind('click', function(e) {
					var sysCode = $(this).attr('data-syscode'),
						parent = $(this).parents('.panel'),
						subSystemName = $(this).text();
					sortPanelInit();
					if(!parent.find('.panel-collapse').hasClass('in')) {
						if(!hadFloorAndImg()) {
							return false;
						}
						subSystemDevicesComEvent({
							systemCode:sysCode,
							page:1,
							floorId:_this.floorId,
							keyword:floorDeviceDataLoading.pageDevicesBySystemCodeKeyword,
							subSystemName: subSystemName
						})
						_this.subSystemSelecter.find('.panel').removeClass('selected');
						_this.subSystemSelecter.find('a').each(function(index,value) {
							if($(this) != $(value) && $(value).parents('.panel').find('.panel-collapse').hasClass('in')) {
								$(value).trigger('click');
							}
						})
						parent.addClass('selected');
						isUnusualStatusSubSystem(sysCode);
					} else {
						parent.removeClass('selected');
					}
				});
				//获取全部类型的设备
				$(moduleId + ' section.device-manage .all-subsys-devices').unbind('click').bind('click', function() {
					showSubSystemCode = null;
					if(!hadFloorAndImg()) {
						return false;
					}
					$(moduleId + ' section.device-manage form input').val('');
					floorDeviceDataLoading.pageDevicesBySystemCodeKeyword = null;
					floorDeviceDataLoading.queryAllDevices = true;
					noPageDevicesBySystemCode({
						floorId: _this.floorId
					}, function(res) {
						let inEl = $(moduleId + ' section.device-manage .panel-collapse.in');
						if(inEl.length > 0) {
							let parent = inEl.parents('.panel');
							parent.find('.panel-heading a').trigger('click');
						}
						_this.subSystemSelecter.find('.panel').removeClass('selected');
					});
				});
				// 搜索
				$(moduleId + ' section.device-manage form button[role="submit"]').unbind('click').bind('click', function() {
					showSubSystemCode = null;
					if(!hadFloorAndImg()) {
						return false;
					}
					CommonUtil.formDataSetAndGet({
						container: moduleId + ' section.device-manage form'
					}, function(res) {
						if(res.name.trim().length == 0) {
							layer.msg('请输入关键字',{icon:5});
							return false;
						}
						$(moduleId + ' .fd-device-system .panel-heading a').each(function(index,value){
							let systemCode = $(value).attr('data-syscode'),
								tempPanel = _this.subSystemSelecter.find('a[data-syscode="' + systemCode + '"]').parents('.panel');
							pageDevicesBySystemCode({systemCode:systemCode,keyword:res.name,floorId:_this.floorId},function(res){
								tempPanel.removeClass('selected');
								tempPanel.find('.panel-collapse').removeClass('in');
								if(res.totalCount > 0) {
									tempPanel.addClass('selected');
									tempPanel.find('.panel-collapse').addClass('in').css('height','auto')
								}
							});
							
						})
//						$.each($(moduleId + ' .fd-device-system .panel-collapse'), function() {
//							$(this).removeClass('in').addClass('in');
//							$(this).css('height','auto');
//						});
//						_this.subSystemSelecter.find('.panel').addClass('selected');
					})
				});
				// 重置
				$(moduleId + ' section.device-manage form button[role="reset"]').unbind('click').bind('click', function() {
					showSubSystemCode = null;
					if(!hadFloorAndImg()) {
						return false;
					}
					CommonUtil.formDataSetAndGet({
						container: moduleId + ' section.device-manage form',
						data: {
							name: ''
						}
					}, function(res) {
						floorDeviceDataLoading.pageDevicesBySystemCodeKeyword = null;
						$.each($('#fd-device-system .panel-collapse'), function() {
							$(this).removeClass('in')
						});
						firstSubSystemDevicesComEvent();
					})
				});
				$(moduleId + ' section.device-manage form').keydown(function(e) {
					var theEvent = e || window.event;
					var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
					
					if(!hadFloorAndImg()) {
						return false;
					}
					if (code == 13) {
						CommonUtil.formDataSetAndGet({
							container: moduleId + ' section.device-manage form'
						}, function(res) {
							pageDevices({
								page: 1,
								floorId: currentFloor.id,
								keyword: res.name
							});
							$.each($('#fd-device-system .panel-collapse'), function() {
								$(this).removeClass('in').addClass('in');
								$(this).css('height','auto');
							});
						});
						return false;
					}
					return true;
				});
				//展示设备列表排序的弹框
				_this.subSystemSelecter.find('.sort-btn span').unbind('click').on('click',function(e){
					e.stopPropagation();//阻止事件冒泡
					if(!hadFloorAndImg()) {
						return false;
					}
					let self = $(this),
						parent = self.parents('.panel');
						systemCode = parent.find('a').attr('data-syscode'),
						sortPanel = $(moduleId + ' .sort-panel'),
						posi = $(this)[0].getBoundingClientRect();
					sortPanel.removeClass('hide').css({'top':parseInt(posi.top)+35,'left':parseInt(posi.left)-52});
					sortPanel.find("input:radio[name='sort']").unbind('ifChecked').on('ifChecked', function(event){
						let value = $(this).val();
						pageDevicesBySystemCode({
							systemCode: systemCode,
							keyword: _this.pageDevicesBySystemCodeKeyword,
							floorId: _this.floorId,
							sort: value,
							order: $(this).attr('data-order')
						})
						sortPanel.addClass('hide');	
					});
					$(moduleId).unbind('click').click(function(e){//点击空白处，设置的弹框消失
				        sortPanel.addClass('hide'); 
				    });
				})
			};
			
		
		this.init = function(p){
			_this.floorId = p.floorId;
			eventInit();
			if(!_this.floorId || _this.floorId == '' || $(moduleId + ' .empty-tip').css('display') == 'block') {
				_this.subSystemSelecter.find('.panel.panel-default').each(function(index,el){
					el = $(el);
					//如果展开,则关闭
					if(el.find('.in').length == 1) {
						el.find('.panel-heading a').trigger('click');
					}
				})
				$(moduleId + ' .pg-pos-top').html('');
				return false;
			};
			getApManegerUrl();
			if(p.systemCode) {
				_this.subSystemSelecter.find('.panel-heading a[data-syscode="' + p.systemCode + '"]').trigger('click')
			} else {
				firstSubSystemDevicesComEvent();
			}
		};
		this.noPageDevicesBySystemCode = noPageDevicesBySystemCode;
		this.pageDevicesBySystemCode = pageDevicesBySystemCode;
		this.renderDevicesPoints = renderDevicesPoints;
	}
	w['FloorDeviceDataLoading'] = FloorDeviceDataLoading;
	return w;
})(window)