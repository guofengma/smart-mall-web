(function(w){
	/**
	 * 获取区域楼层及楼层平面图，以及平面图上的一些操作。
	 */
	var AreaFloorManage = function(p){
		p = p ? p : {};
		this.moduleId ='#' +p.moduleId;
		this.floorSelector = this.moduleId + ' section.floor .fd-floor-menu-view';
		this.pgSelector = this.moduleId + ' .pg-bg img';
		this.addDeviceCMId = this.moduleId + ' .add-device-enter'; // 平面图右键菜单容器id
		this.deviceOperCMID = this.moduleId + ' .device-oper-enter'; // 设备点右键菜单容器id
		this.pgBgScale = 1;//楼层平面图放大缩小的倍数（操作产生）
		this.opers = p.opers ? p.opers : '';
		this.pgWidth;
		this.pgHeight;
		this.pgScale;//楼层平面图原始放大缩小的倍数
		this.miniPgScale;
		this.currentDevice;
		this.lockContextMenu = false;
		this.imgWidth = 0;
		this.imgHeight = 0;
		this.subSystems = [];
		let _this = this,
			moduleId,
			
			/**
			 *  初始化屏幕左、中、右区域的高度
			 */
			globalVariableInit = function() { 
				_this.pgWidth = Math.floor(($(window).width() - 300) * 0.65) + 40; // 页面中平面图容器设置固定宽度
				_this.pgHeight = $(window).height() - $(_this.moduleId)[0].getBoundingClientRect().top-110-30; // 页面中平面图容器设置固定高度
				_this.pgBgScale = 1;
				$('.floor-plan-device-view section.plan-graph').css('height', _this.pgHeight + 50 + 'px');
				$('.floor-plan-device-view section.device-manage').css('height', _this.pgHeight + 50 + 'px');
				$('.floor-plan-device-view .fd-device-system').css({'height': _this.pgHeight - 106 + 30 + 'px','overflow-y': 'auto','overflow-x':'hidden'});
				
			},
			loadSubSystems = function() {//获取已经接入的子系统，用于地图上的右键操作
				CommonUtil.operation({
					moduleName: 'device',
					oper: 'queryShowDeviceSubSystem',
					forbidConfirm: true
				}, function(res) {
					let subSystems = res.result;
					if(_this.viewStatus == 'manage'){
						let tempList = [];
						if(subSystems.length > 0) {
							subSystems.forEach(function(value){
								/*if(value.autoConfig !=0) {*/
									tempList.push(value);
								/*}*/
							})
						}
						subSystems = tempList;
					}
					_this.subSystems = subSystems;
					if (_this.subSystems.length > 0) {
						$(moduleId).css('display', 'block');
						$(moduleId + '-error').css('display', 'none');
					} else {
						$(moduleId).css('display', 'none');
						$(moduleId + '-error').css('display', 'block');
					}
					var tpl = fd_device_system_tpl.innerHTML,
						view = $(moduleId + ' .fd-device-system');
					
					laytpl(tpl).render({moduleId:moduleId.split('#')[1],data:subSystems}, function(html){
						view.html(html);
					});
					$('#pg-device-form form select[name="systemCode"]').html(subSystems.map(function (ss) {
						if(ss.hasVersion) {
							return '<option value="' + ss.code + '">' + ss.systemName + '</option>';
						}
					}).join(''));
					$(_this.addDeviceCMId).html(subSystems.map(function (ss) {
						if(ss.hasVersion) {
							return '<div class="item">' + '<a href="javascript:;" class="add-device" device-type="' + ss.systemCode + '"><i class="fa"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-' + ss.systemCode + '-blue"></use></svg></i>&nbsp;添加' + ss.systemName + '设备</a>' + '</div>' + '';
						}
					}).join(''));
					$(_this.addDeviceCMId).html($(_this.addDeviceCMId).html()+'<div class="item"><a href="javascript:;" class= "device-upload"><i class="icon-img batch-import"></i>&nbsp;批量导入</a></div>' + '');
					addDeviceCMId_click();
					$(_this.addDeviceCMId + ' .device-upload').unbind().on('click',function(){//打开批量上传的界面
						DeviceUpload.init({areaId: _this.currentFloor.areaId,areaName: _this.currentFloor.areaName,floorId:_this.currentFloor.id,floorName:_this.currentFloor.floorName,mallId:_this.currentFloor.mallId});
					});
				})
			},
			loadFloors = function() {//加载区域和楼层数据
				CommonUtil.operation({
					moduleName: 'floor',
					oper: 'list',
					forbidConfirm: true
				}, function(res) {
					let tpl = fd_floors_menu_datas.innerHTML,
						datas = res.result;
					datas = datas ? datas : [];
					laytpl(tpl).render(datas, function(html){
						$(_this.floorSelector).html(html);
						if(_this.viewStatus == 'manage') {
							$(moduleId + ' .unusual-devices-btn').remove()
						}
						if(datas.length > 0) {
							$($(_this.floorSelector).find('.floors select')[0]).removeClass('hide');
							$(_this.floorSelector + ' select.areas').on('change',function(){
								let areaId = $(this).val(),
									activeFloorSelectEl = $(_this.floorSelector).find('#fdmd-collapse-' + areaId);
								_this.areaId = areaId;
								activeFloorSelectEl.val($(activeFloorSelectEl.find('option')[0]).attr('value'));
								$(_this.floorSelector).find('.floors select').addClass('hide');
								activeFloorSelectEl.removeClass('hide');
								loadFloorRelateInfo(activeFloorSelectEl.val());
							})
						}
					});
					console.log('datas.length',datas,datas.length)
					if (datas.length > 0) {//判断是否存在区域
						let floors = [];
						for (let i = 0; i < datas.length; i++) {
							if (datas[i].floors) {
								for (let j = 0; j < datas[i].floors.length; j++) {
									floors.push(datas[i].floors[j]);
								}
								datas[i].floorsStr = JSON.stringify(datas[i].floors);
							} else {
								datas[i].floorsStr = null;
							}
						}
						_this.floors = floors;
						if (floors.length > 0) {//判断是否存在楼层
							$(_this.floorSelector + ' select.floor').unbind('change').on('change', function(e) {//点击楼层 切换楼层数据
								$(moduleId + ' section.device-manage form input').val('');
								
								loadFloorRelateInfo($(this).val());
							});
							/*loadFloorRelateInfo(floors[0].id);
							_this.areaId = floors[0].areaId;*/
							if (datas[0].floors.length > 0) {//第一个区域判断是否存在楼层
								loadFloorRelateInfo(datas[0].floors[0].id);
								_this.areaId = datas[0].floors[0].areaId;
							} else {
								_this.currentFloor = {};
								_this.currentFloor.areaId = datas[0].id;
								loadFloorRelateInfo(null);
							}
						} else {
							_this.currentFloor = {};
							_this.currentFloor.areaId = datas[0].id;
							loadFloorRelateInfo(null);
						}
					} else {
						$(moduleId + ' section.plan-graph > .pg-bg').css({'display':'none'});
						$(moduleId + ' section.plan-graph > .empty-tip').css({'display':'block'});
						$(moduleId + ' section.plan-graph > .empty-tip .tip-content').html('未配置商场区域，请移步商场管理-添加区域');
						$(moduleId + ' section.plan-graph > .empty-tip .btn').html('添加区域');
						$(moduleId + ' div[data-item="statistic-device-data"]').html('');
						
					}
					
				});
			},
			loadFloorPg = function(pgSuffix, callback) { // 根据前缀加载楼层设备平面图，并实现放大缩小，拖拽的功能 
				var zoomContainer = pgSuffix + ' div.zoom-container',
					zoomImg = zoomContainer + ' > img',
					floorId = _this.currentFloor.id,
					img = new Image(),
					picLoadParams;
				_this.pgBgScale = 1;
				// 显示楼层平面图
				$(zoomImg).attr('src', _this.currentFloor.pgUrl);
				// 加载楼层平面图
				img.src = $(zoomImg).attr('src');
				// 加载成功后进行逻辑代码操作
				img.onload = function() {
					_this.imgWidth = img.width;
					_this.imgHeight = img.height;
					$('.original-size-memo').html('图片原始尺寸(' + img.width + '*' + img.height + ')');
					
					picLoadParams = CommonUtil.calcuPicLoadParams(_this.pgWidth, _this.pgHeight, img.width, img.height);
					_this.pgScale = picLoadParams.scale;
					$(zoomImg).attr('width', picLoadParams.w).attr('height', picLoadParams.h);
					/*pageDevices({
						page: 1,
						floorId: floorId
					});*/
					
					$(pgSuffix).css('height', _this.pgHeight + 'px');
					$(zoomContainer).css('width', $(zoomImg).width())
					.css('height', $(zoomImg).height())
					.css('position', 'absolute')
					.css('top', '0')
					.css('left', '0');
					setScale();
					//缩放面板初始化
					let scalePanelFn = new ScalePanelFn(pgSuffix);
					//快捷选择放大缩小比例
					$(pgSuffix + ' .data-opts > a.percentage').unbind().on('click',function(event){
						event.stopPropagation(); 
						scalePanelFn.showPercentageList(function(res){
							_this.pgBgScale = res;
							setScale();
							if(res == 1) {//选择100%时，有一个还原的效果
								$(zoomContainer).css({left: '0px', top: '0px'});
							}
						});
					});
					//鼠标滚轮放大缩小
					$(zoomContainer).unbind('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll',onMouseScroll);
					function onMouseScroll(e){
					    e.preventDefault();
					    var wheel = e.originalEvent.wheelDelta || -e.originalEvent.detail,
					    	delta = Math.max(-1, Math.min(1, wheel) ),
					    	zoomContainerPosition = $(zoomContainer)[0].getBoundingClientRect(),
					    	eX = e.clientX,//鼠标的位置x
					    	eY = e.clientY,//鼠标的位置Y
					    	pX = (eX - zoomContainerPosition.left)/zoomContainerPosition.width,//鼠标在楼层图上的相对位置 x
					    	pY = (eY - zoomContainerPosition.top)/zoomContainerPosition.height,//鼠标在楼层图上的相对位置 y
					    	step = 0,
					    	newLeft = 0,
					    	newTop = 0,
					    	imgH = $(zoomContainer)[0].clientHeight,//图片缩放的基准高度 即缩放因子为1时的高度
					    	imgW = $(zoomContainer)[0].clientWidth,//图片缩放的基准宽度 即缩放因子为1时的宽度
					    	oldPgBgScale = _this.pgBgScale;//缩放前的比例
					    
					    if(delta<0){//向下滚动
					    	step = -0.1;
					    }else{//向上滚动
					    	step= 0.1;
					    }
					    _this.pgBgScale += step;
				    	if (_this.pgBgScale < 1) {
							_this.pgBgScale = 1;
						}
				    	/*不改变缩放中心,计算top、left的补偿值(以鼠标为缩放中心),
				    	 * 默认以zoomContainer的中点为缩放中心，相对位置为(0.5,0.5)
				    	 * 以left为例$(zoomContainer)[0].offsetLeft是缩放对象原来的位置
				    	 * (_this.pgBgScale - oldPgBgScale)*imgW*(0.5 - pX)为补偿值，改变量*图片的宽度*（缩放中心的性对位置-鼠标的相对位置）
				    	 */				    	
				    	newLeft =  $(zoomContainer)[0].offsetLeft + (_this.pgBgScale - oldPgBgScale)*imgW*(0.5 - pX);
				    	newTop = $(zoomContainer)[0].offsetTop + (_this.pgBgScale - oldPgBgScale)*imgH*(0.5 - pY);
				    	
					    setScale();
					    $(zoomContainer).css({left: newLeft + 'px', top: newTop + 'px'});
					}
					// 缩放设备及平面图
					$(pgSuffix + ' .data-opts > a.opt').unbind('click').bind('click', function(){
						var dataOpt = $(this).attr('data-opt');
						//放大或者缩小
						if (dataOpt !== 'maximize' && dataOpt !== 'scale') {
							if (dataOpt === 'enlarge') {
								_this.pgBgScale += 0.1;
							} else {
								_this.pgBgScale -= 0.1;
								if (_this.pgBgScale < 1) {
									_this.pgBgScale = 1;
								}
							}
							/*$(zoomContainer).css({'transform-origin':'center'});*/
							setScale();
						} else {
							if (dataOpt === 'maximize') {
								/*loadFloorRelateInfo(_this.currentFloor.id);*/
								// 楼层设备平面图最大化显示
								var loUUId = new Date().getTime(),
									beformPgBgScale = _this.pgBgScale,
									oldPgHeight = _this.pgHeight;
								var loIndex;
								setTimeout(function() {
									loIndex = layer.open({
										type: 1,
										title: $(moduleId + ' section.plan-graph > h5').html(),
										skin: 'layui-layer-demo',
										content: '<div class="max-pg-bg" id="' + loUUId + '">' + $(pgSuffix).html() + '</div>',
										end: function() {
											_this.pgWidth = Math.floor(($(window).width() - 300) * 0.65) + 40;
											_this.pgHeight = $(window).height() - 280;// 页面中平面图容器设置固定高度
										}
									});
									
									layer.full(loIndex);
									
									$('#layui-layer' + loIndex + ' .layui-layer-close').unbind().on('click',function(){
										_this.pgBgScale = beformPgBgScale;
										
										layer.close(loIndex);
									})
									_this.pgWidth = $(window).width();
									_this.pgHeight = $(window).height() - 45;
									
									
									picLoadParams = CommonUtil.calcuPicLoadParams(_this.pgWidth, _this.pgHeight, img.width, img.height);
									_this.pgScale = picLoadParams.scale;
									
									$('#' + loUUId + ' .device-item').each(function(index,value){
										let self = $(value),
											x = self.attr('scale-x'),
											y = self.attr('scale-y');
										
										self.css('top', Math.round(y * _this.pgScale - floorDeviceEvents.dW/2 )+ 'px')
											.css('left', Math.round(x * _this.pgScale - floorDeviceEvents.dH/2 )+ 'px')
									})
									loadFloorPg('#' + loUUId, function(){});
									$('#' + loUUId + ' .data-opts > a[data-opt="maximize"]').remove();
									/*$('#' + loUUId + ' .data-opts > a.direction').remove();*/
									$('#' + loUUId + ' .data-opts > .percentage-items').css('left',0)
									if($('#' + loUUId + ' .data-opts > .scale-btn').hasClass('active')) {
										$('#' + loUUId + ' .data-opts > .scale-btn').removeClass('active')
									}
								});

							} else {
								/*if ($(this).hasClass('active')) {
									$(this).removeClass('active');
									$(zoomContainer).unbind('mousedown');
									$(pgSuffix + ' .zoom-container').css('cursor', 'pointer');
								} else {

									$(this).addClass('active');
									$.each($(pgSuffix + ' .data-opts > a.scale-pg'), function() {
										$(this).css('display', 'inline-block');
									});
									// 拖动设备及平面图
									$(zoomContainer).unbind('mousedown').mousedown(function(e) {
										var zcThis = this;
										if (!_this.lockContextMenu) {
											var offset = $(zcThis).offset();
											
											zcThis.posix = {
										    	'w': $(zcThis)[0].clientWidth,
										    	'h': $(zcThis)[0].clientHeight,
										    	'x': e.pageX - offset.left,
										    	'y': e.pageY - offset.top
										    };
										    $.extend(document, {
										    	'move': true,
										    	'move_target': zcThis,
										    	'move_container': $(pgSuffix)
										    });
										}
									});
									var bowserType = getBowserType();
									if (bowserType.indexOf('IE') >= 0) {
										$(pgSuffix + ' .zoom-container').css('cursor', 'move');
									} else {
										$(pgSuffix + ' .zoom-container').css({'cursor': 'grab','cursor':'-webkit-grab'});
									}
								}*/
							}
						}
						
					});
					// 拖动设备及平面图
					$(zoomContainer).unbind('mousedown').mousedown(function(e) {
						var zcThis = this;
						if(e.button == 2) {
							return false;
						}
						if (!_this.lockContextMenu) {
							var offset = $(zcThis).offset();
							
							zcThis.posix = {
						    	'w': $(zcThis)[0].clientWidth,
						    	'h': $(zcThis)[0].clientHeight,
						    	'x': e.pageX - offset.left,
						    	'y': e.pageY - offset.top
						    };
						    $.extend(document, {
						    	'move': true,
						    	'move_target': zcThis,
						    	'move_container': $(pgSuffix)
						    });
						}
					});
					//根据放大缩小的因子或者比例设置图片尺寸
					function setScale(){
						$(zoomContainer + ' .device-points .device-item')
						.css('transform', 'scale(' + 1/_this.pgBgScale + ')')
						.css('-ms-transform', 'scale(' + 1/_this.pgBgScale + ')')
						.css('-moz-transform', 'scale(' + 1/_this.pgBgScale + ')')
						.css('-webkit-transform', 'scale(' + 1/_this.pgBgScale + ')')
						.css('-o-transform', 'scale(' + 1/_this.pgBgScale + ')');
						$(zoomContainer)
						.css('transform', 'scale(' + _this.pgBgScale + ')')
						.css('-ms-transform', 'scale(' + _this.pgBgScale + ')')
						.css('-moz-transform', 'scale(' + _this.pgBgScale + ')')
						.css('-webkit-transform', 'scale(' + _this.pgBgScale + ')')
						.css('-o-transform', 'scale(' + _this.pgBgScale + ')');
						$(pgSuffix + ' .percentage span').html((_this.pgBgScale*100).toFixed());
					}
				};
			},
			loadFloorRelateInfo = function(floorId, callback) {//渲染楼层平面图
				if(!floorId) {
					_this.floorId = null;
					_this.currentFloor = null;
					$(moduleId + ' section.plan-graph > .pg-bg').css('display', 'none');
					$(moduleId + ' section.plan-graph > .empty-tip').css('display', 'block');
					$(moduleId + ' section.plan-graph > .empty-tip .tip-content').html('该区域暂无楼层');
					$(moduleId + ' section.plan-graph > .empty-tip .btn').html('添加楼层');
					$(moduleId + ' div[data-item="statistic-device-data"]').html('');
					floorDeviceDataLoading.init({floorId:floorId});
					return false;
				}
				
				var currentFloorEl = $(_this.floorSelector + ' a[data-id="' + floorId + '"]').parent();
				globalVariableInit();
				if (!currentFloorEl.hasClass('selected')) {
					$.each($(_this.floorSelector + ' li'), function() {
						$(this).removeClass('selected');
					});
					currentFloorEl.addClass('selected');
				}
				
				// 获得当前操作楼层数据
				_this.currentFloor = FloorDevicePublic.getDataByKey(_this.floors, floorId);
				
				// 获得楼层平面图
				CommonUtil.operation({
					moduleName: 'floor',
					oper: 'getPlanGraph',
					params: {
						floorId: floorId,
						areaId:_this.currentFloor.areaId
					},
					forbidConfirm: true
				}, function(res) {
					if (res && res.result && res.result.picture) {
						$(moduleId + ' section.plan-graph > .pg-bg').css('display', 'block');
						$(moduleId + ' section.plan-graph > .empty-tip').css('display', 'none');
						_this.currentFloor.pgUrl = res && res.result && res.result.picture ? res.result.picture.storage[2].fileStorageUrl : 'http://192.168.0.203:8081/group1/M00/10/00/oYYBAFr1P2iAaKShAAERIRLqDm8239.jpg';
						loadFloorPg(moduleId + ' .pg-bg');
					} else {
						$(moduleId + ' section.plan-graph > .pg-bg').css('display', 'none');
						$(moduleId + ' section.plan-graph > .empty-tip').css('display', 'block');
						$(moduleId + ' section.plan-graph > .empty-tip .tip-content').html('未上传楼层平面图，无法监控楼层及设备信息');
						$(moduleId + ' section.plan-graph > .empty-tip .btn').html('上传楼层平面图');
					}
					if(_this.systemCode_onetime) {
						floorDeviceDataLoading.init({floorId:floorId,systemCode: _this.systemCode_onetime});
						_this.systemCode_onetime = null
					} else {
						floorDeviceDataLoading.init({floorId:floorId});
					}
					
				});
			},
			addDeviceCMId_click = function() {
				// 添加设备右键菜单点击事件
				$(_this.addDeviceCMId + ' > .item > a.add-device').unbind('click').on('click', function(event) {
					var deviceCode = $(this).attr('device-type');
					/*event.stopPropagation();*/
					if (_this.currentDevice && _this.currentDevice.id === 'anonymous') {
						layer.msg('你有新增点未完成编辑，在保存或者移除后可进行新增操作', {icon: 5});
						$(moduleId + ' .pg-bg .device-points > div[data-id="anonymous"]').removeClass('current').addClass('current');
						return false;
					}
					floorDeviceDataLoading.currentDevice = null;
					if (_this.currentDevice && _this.currentDevice.id !== 'anonymous') {
						currentDevice = null;
					}
					// 设置当前操作添加设备类型名称
					$(_this.pgSelector).attr('current-device-code', deviceCode);
					// 根据设备名称改变鼠标样式
					$(moduleId + ' .fixed-transparent').css('cursor', 'url(img/tools/' + deviceCode + '/' + deviceCode + '.cur),crosshair');
					_this.lockContextMenu = true;
					
					// 给平面图绑定点击事件
					$(moduleId + ' .fixed-transparent').unbind('click').bind('click', function(event) {
						/*event.stopPropagation();*/
						// 置空操作设备类型名称
						$(_this.pgSelector).attr('current-device-name', '');
						// 修改鼠标点击样式为普通
						$(moduleId + ' .fixed-transparent').css('cursor', 'move');
						// 平面图解绑点击事件
						$(moduleId + ' .fixed-transparent').unbind('click');
						floorDeviceEvents.pgPointSelected(event);
					});
				});
			};
			this.init = function(data) {
				this.viewStatus = data.viewStatus ? data.viewStatus:'manage';//read表示只读；manage表示管理，可以操作数据
				this.systemCode_onetime = data.systemCode ? data.systemCode : null;
				moduleId = this.moduleId;
				
				// 全局变量初始化
				/*globalVariableInit();*/
				loadSubSystems();
				$('.i-checks').iCheck({
	                checkboxClass: 'icheckbox_square-green',
	                radioClass: 'iradio_square-green',
	            });
				// 加载楼层数据
				loadFloors();
				// 页面点击事件
				$('html').unbind('click').on('click', function(e) {
					var menu1 = $(_this.addDeviceCMId),
						menu2 = $(_this.deviceOperCMID);

					// 平面图右键菜单是否存在，存在则让其消失
					if (menu1.width() > 0) {
						setTimeout(function() {
							menu1.css('width', '0px');
						}, 300);
					}
					// 设备点右键菜单是否存在，存在则让其消失
					if (menu2.width() > 0) {
						setTimeout(function() {
							menu2.css('width', '0px');
						}, 300);
					}
				});
				if (this.opers.indexOf('fd-add') >= 0) {
					// 平面图绑定右键菜单事件
					
					if(_this.viewStatus == 'manage') {//可以调用界面的数据操作功能
						$(this.moduleId + ' .fixed-transparent').unbind('contextmenu').on('contextmenu', function(e) {
							e.preventDefault();
							let currentEl = $('section.plan-graph .device-points .current');
							if (!_this.lockContextMenu) {
								if(currentEl.length > 0) {
									layer.msg('请先完成设备拖动',{icon:5});
									return false;
								}
								var menu,
									pgUrl = $(_this.pgSelector).attr('src');
			
								if (pgUrl === 'error-pg.png') {
									layer.alert('平面图尚未加载成功，无法操作！');
									return false;
								}
								//获取我们自定义的右键菜单
								menu = $(_this.addDeviceCMId);
								//根据事件对象中鼠标点击的位置，进行定位
								menu.css('left', (e.clientX - $('#content-main').offset().left) + 'px');
								menu.css('top', (e.clientY - $('#content-main').offset().top + $('#content-main').scrollTop() - 20) - 25 + 'px');
								menu.css('width', '200px');
								$(_this.deviceOperCMID).css('width', '0px');
							}
						});
						$($(_this.moduleId + ' .sort-panel .physicalState')[0]).remove();
					}
				}
				$(this.moduleId + ' a[role="go-upload-floor-pic"]').unbind('click').on('click', function() {
					goModule({
						moduleName: 'store',
						directive: 'index',
						areaId: _this.areaId ? _this.areaId : null,
						floorId: _this.currentFloor ? _this.currentFloor.id : null,
						subModule: 'aera-floor'
					});
				});
				$(this.moduleId + '-error a[role="go-subsystem-config"]').unbind('click').on('click', function() {
					goModule({
						moduleName: 'store',
						directive: 'sub-system-form'
					});
				});
			};
	}
	w['AreaFloorManage'] = AreaFloorManage;
	return w;
})(window)
