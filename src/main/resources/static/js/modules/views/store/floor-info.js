var FloorInfoManage = (function() {
	let moduleId, 
		mallId,
		areaId,
		floorId,
		mapPgEl,
		emptyPgEl,
        paramsInit,
		openFormPanel,
	    removeFloor,
	    currentFloor,
	    currentPg,
	    buildMag,
	    renderFloorMap,
	    getPlanGraph,
	    loadFloorPg,
	    uploadCurrentPg,
	    init,
	    operationCodes;
	
	paramsInit = function() {
		magPgEl = moduleId + ' .pg-bg';
		emptyPgEl = moduleId + ' .empty-tip';
		$(magPgEl).html('');
		
		$(magPgEl).css('display', 'none');
		$(emptyPgEl).css('display', 'none');
	};
	openFormPanel = function(p){
		p = p ? p : {};
		p.areaId = areaId;
		
        CommonUtil.ajaxRequest({
            url: 'store/floor-form',
            type: 'get',
            data: p
        },function(res){
        	let formIndex = -1;
        	setTimeout(function() {
				formIndex = layer.open({
					title: (p.id ? '编辑' : '添加') + '楼层信息',
					type: 1,
					skin: 'layui-layer-rim', //加上边框
					area: ['360px', 'auto'], //宽高
					content: res
				});
				
				$("#floorForm").validate({
					rules: {
						floorName: {
							required: true,
							rangelength: [1,10]
						},
						serialNumber: {
							required:true,
							number: true,
							unable_0: true,
							range:[-5,100]
						}
	
					},
					messages: {
						floorName: {
							required: icon + "请输入楼层名称",
							rangelength: icon + "楼层名称输入长度必须介于1和10之间"
	
						},
						serialNumber: {
							required: icon + "请输入楼层",
							number: icon + "楼层必须为数字",
							unable_0: icon + '楼层的输入值不能为0',
							range: icon + "楼层的输入值必须介于-5和100之间,且不能为0",
						}
	
					},
					submitHandler: function(){
						let submitObj = $('#floorForm').serializeObject();
						CommonUtil.operation({
							moduleName: 'floor',
							oper: 'save',
							oper_cn: '保存',
							params: {
								data: JSON.stringify(submitObj)
							}
						}, function(res) {
							layer.close(formIndex);
							StoreRouter.loadAreaInfo({floorId:res.result});
						})
					}
				});
				$.validator.addMethod("unable_0",function(value,element,params){
					if(value == 0) {
						return false;
					} else {
						return true;
					}
				},"楼层编号不能为0");
			})
        })
    };
    removeFloor = function(id) {
    	CommonUtil.operation({
    		moduleName: 'floor',
    		oper: 'remove',
			oper_cn: '删除',
    		params: {
    			id: id
    		}
    	}, function() {
    		StoreRouter.loadAreaInfo();
    	});
    };
    buildMag = function(callback) {
    	$(magPgEl).html('');
    	CommonUtil.ajaxRequest({
            url: 'store/mag-tpl',
            type: 'get'
        },function(res){
        	$(magPgEl).html(res);
        	/*let mag = $(moduleId + ' .mee-thumb-drag');
            mag.mag({
                position: 'drag',
                toggle: false,
                initial:{
                    zoom: 1
                }
            });
        	let magCtrl = $(moduleId + ' .cb-ctrl-controls');
        	magCtrl.magCtrl({
                mag: mag
            })*/
            if (typeof callback == 'function') {
	            callback();
            }	
        });
    };
    renderFloorMap = function(picUrl) {
    	let img = new Image();
    	img.src = picUrl;
    	img.onload = function() {
    		let containerWidth = $(magPgEl).width(),
    			containerHeight = $(magPgEl).height(),
    			imgWidth = img.width,
    			imgHeight = img.height,
				renderScale = 1;
    		if (imgWidth > imgHeight) {
    			if(imgWidth > containerWidth) {
	    			renderScale = containerWidth/imgWidth;
	    			if (imgHeight*renderScale <= containerHeight) {
	    				$(magPgEl + ' img').attr('width', containerWidth);
	    			} else {
	    				$(magPgEl + ' img').attr('height', containerHeight);
	    			}
	    		} else {
	    			if(imgHeight > containerHeight) {
	    				$(magPgEl + ' img').attr('height', containerHeight);
		    		}
	    		}
    		} else {
				$(magPgEl + ' img').attr('height', containerHeight);
    		}
    		
    		$(magPgEl + ' img').attr('src', picUrl);
            $(magPgEl + ' img').load(function(){
				var pgBgScale = 1;
				var zoomContainer = magPgEl + ' div.zoom-container';
				$(zoomContainer).css('width', $(this).width())
						.css('height', $(this).height())
						.css('position', 'absolute')
						.css('top', '0')
						.css('left', '0');
				setScale();
				//缩放面板初始化
				let scalePanelFn = new ScalePanelFn(magPgEl);
				//快捷选择放大缩小比例
				$(magPgEl + ' .data-opts > a.percentage').unbind().on('click',function(event){
					event.stopPropagation(); 
					scalePanelFn.showPercentageList(function(res){
						pgBgScale = res;
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
				    	oldPgBgScale = pgBgScale;//缩放前的比例
				    
				    if(delta<0){//向下滚动
				    	step = -0.1;
				    }else{//向上滚动
				    	step= 0.1;
				    }
				   pgBgScale += step;
			    	if (pgBgScale < 1) {
						pgBgScale = 1;
					}
			    	/*不改变缩放中心,计算top、left的补偿值(以鼠标为缩放中心),
			    	 * 默认以zoomContainer的中点为缩放中心，相对位置为(0.5,0.5)
			    	 * 以left为例$(zoomContainer)[0].offsetLeft是缩放对象原来的位置
			    	 * (_this.pgBgScale - oldPgBgScale)*imgW*(0.5 - pX)为补偿值，改变量*图片的宽度*（缩放中心的性对位置-鼠标的相对位置）
			    	 */				    	
			    	newLeft =  $(zoomContainer)[0].offsetLeft + (pgBgScale - oldPgBgScale)*imgW*(0.5 - pX);
			    	newTop = $(zoomContainer)[0].offsetTop + (pgBgScale - oldPgBgScale)*imgH*(0.5 - pY);
			    	
				    setScale();
				    $(zoomContainer).css({left: newLeft + 'px', top: newTop + 'px'});
				}
				$(magPgEl + ' .data-opts > a.scale-pg').unbind('click').bind('click', function(){
					var opt = $(this).data("opt");
					
					if (opt === 'enlarge') {
						pgBgScale += 0.1;
					} else {
						pgBgScale -= 0.1;
						if (pgBgScale < 1) {
							pgBgScale = 1;
						}
					}
					setScale();
				});
				// 拖动设备及平面图
				$(zoomContainer).unbind('mousedown').mousedown(function(e) {
					var zcThis = this;
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
						'move_container': $(magPgEl)
					});
				});
				var bowserType = getBowserType();
				if (bowserType.indexOf('IE') >= 0) {
					$(zoomContainer).css('cursor', 'move');
				} else {
					$(zoomContainer).css({'cursor': 'grab','cursor':'-webkit-grab'});
				}
				
				function setScale(){
					$(zoomContainer)
					.css('transform', 'scale(' + pgBgScale + ')')
					.css('-ms-transform', 'scale(' + pgBgScale + ')')
					.css('-moz-transform', 'scale(' + pgBgScale + ')')
					.css('-webkit-transform', 'scale(' + pgBgScale + ')')
					.css('-o-transform', 'scale(' + pgBgScale + ')');
					$(magPgEl + ' .percentage span').html((pgBgScale*100).toFixed());
				}
			});
			

			$(magPgEl).css('display', 'block');
			$(emptyPgEl).css('display', 'none');
    	};
    	
    };
    
    getPlanGraph = function(p, callback) {
    	p = p ? p : {};
    	p.areaId = areaId;
    	if (!p.floorId) {
    		currentFloor = null;
    	}
		CommonUtil.operation({
			moduleName: 'floor',
			oper: 'getPlanGraph',
			params: p,
			forbidConfirm: true
		}, function(pg) {
			currentPg = pg.result;
			if (typeof callback === 'function') {
				callback();
			}
		});
    };
    
    loadFloorPg = function(floorId, callback) {
    	currentFloor = null;
    	CommonUtil.operation({
			moduleName: 'floor',
			oper: 'detail',
			params: {
				id: floorId,
				areaId: areaId
			},
			forbidConfirm: true
		}, function(res) {
			currentFloor = res.result;
			getPlanGraph({
				floorId: floorId
			}, callback);
		})
    };
    uploadCurrentPg = function() {
    	let eminFileUpload = new EminFileUpload();
		setTimeout(function() {
			eminFileUpload.init({
				title: '上传 ' + (currentFloor ? '楼层平面图' : '区域俯视图'),
				fileNumLimit: 1,
				filesType: ['img']
			}, function(res) {
				currentPg = currentPg ? currentPg : {
					mallId: mallId,
					areaId: areaId,
					floorId: currentFloor ? currentFloor.id : 0,
				};
				currentPg.picture = res[0];
				CommonUtil.operation({
					moduleName: 'floor',
					oper: 'savePlanGraph',
					oper_cn: '保存',
					params: {
						data: JSON.stringify(currentPg)
					},
					forbidConfirm: true
				}, function(res) {
					console.log('operationCodes',operationCodes)
					if (operationCodes.indexOf('vertical-view-match') >= 0) {
						if(currentFloor) {
							layer.msg((currentFloor ? '楼层平面图' : '区域俯视图') + '保存成功！', {icon: 6});
						} else {
							layer.confirm('您已经成功上传区域俯视图，为避免数据缺失，请即刻前往园区俯视图中进行匹配', {
								icon : 3,
								btn : [ '去匹配', '稍后再去' ]
							}, function(){
								goPage('vertical-view');
							});
						}
					} else {
						layer.msg((currentFloor ? '楼层平面图' : '区域俯视图') + '保存成功！', {icon: 6});
					}
					
					
					StoreRouter.loadAreaInfo({floorId:(currentFloor ? currentFloor.id : 0)});
				})
			});
		})
		
    };
    init = function(p) {
    	p = p ? p : {};
    	moduleId = p.moduleId ? p.moduleId : '#floor-info-manage',
    	mallId = p.mallId ? p.mallId : 1;
    	areaId = p.areaId ? p.areaId : 1;
    	floorId = p.floorId ? p.floorId : null;
    	operationCodes = p.operationCodes ? p.operationCodes : '';
    	paramsInit();
		$(moduleId + ' a[data-opt="form-floor"]').unbind('click').on('click', function() {
			let dataId = $(this).attr('data-id'),
				p = dataId ? {id : dataId} : {};
			
			openFormPanel(p);
		});
		
		$(moduleId + ' a[data-opt="remove"]').unbind('click').on('click', function() {
			let dataId = $(this).attr('data-id');
			
			removeFloor(dataId);
		});
		
		function handleCurrentPg() {
			if(currentPg && currentPg.picture && currentPg.picture.storage){
				buildMag(function() {
					renderFloorMap(currentPg.picture.storage[0].fileStorageUrl);
				});
            } else {
				renderFloorMap('');
				$(magPgEl).css('display', 'none');
				$(emptyPgEl).css('display', 'block');
            }
		}
		
		$(moduleId + ' .floorList > li[data-opt="floor-vertical-view"]').unbind('click').on('click', function() {
			let el = $(this);
			
			el.siblings().removeClass('active');
			el.addClass('active');
			
			getPlanGraph(null, function() {
				handleCurrentPg();
			});
		});
		
		$(moduleId + ' .floorList > li[data-opt="floor-detail"]').unbind('click').on('click', function() {
			let el = $(this),
				floorId = el.attr('data-id');
			
			el.siblings().removeClass('active');
			el.addClass('active');
			
			loadFloorPg(floorId, function() {
				handleCurrentPg();
			});
		});
		
		if (floorId && parseInt(floorId) > 0) {
			$(moduleId + ' .floorList > li[data-id="' + floorId + '"]').click();
		} else {
			$($(moduleId + ' .floorList > li')[0]).click();
		}
		
		$(moduleId + ' li[data-opt="floor-vertical-view"] a[data-opt="upload-pic"]').unbind('click').on('click', function() {
			getPlanGraph(null, function() {
				uploadCurrentPg();
			});
		});
		
		$(moduleId + ' li[data-opt="floor-detail"] a[data-opt="upload-pic"]').unbind('click').on('click', function() {
			loadFloorPg($(this).attr('data-id'), function() {
				uploadCurrentPg();
			});
		});
	};
	return {
		init: init
	}
}());