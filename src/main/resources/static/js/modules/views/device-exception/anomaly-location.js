var DeviceExceptionAnomalyLocation = (function() {
	var moduleId,
		areaId,
		paramsInit,
		init,
		floorPlan,
		pgBgScale = 1;

	
	/**
	 * 根据前缀加载楼层设备平面图，并实现放大缩小，拖拽的功能  
	 * @param {*} prefix 指定前缀
	 */
	function foorPlanRelates(prefix) { 
		var pgSel = prefix + ' .pg-bg', // 楼层平面图包含容器选择器
			pgImgSel = pgSel + ' > img'; // 楼层平面图选择器

		if (!floorPlan) {
			layer.msg('数据初始化错误，页面无法正常显示，建议关闭页面！', {icon: 5});
			return false;
		}

		// 显示楼层平面图
		$(pgImgSel).attr('src', floorPlan);

		var img = new Image();
		// 加载楼层平面图
		img.src = $(pgImgSel).attr('src');
		// 加载成功后进行逻辑代码操作
		img.onload = function() {
			// 防止图片过大溢出容器影响美观，一般正常缩小或者放大至撑满容器宽度或者高度
			// 封装的方法会计算出最终显示的宽度，高度，和缩放比例。
			var planShowP = CommonUtil.calcuPicLoadParams($(prefix).width()- 2, $(prefix).height() - 2, img.width, img.height);
			
			// 设置楼层平面图最终显示的宽高
			$(pgImgSel).attr('width', planShowP.w)
					   .attr('height', planShowP.h);

			// 得到楼层平面图缩放比例
			var fpScale = planShowP.scale; 
			// 根据楼层平面图缩放比例计算设备定位点相应的缩放位置
			var spotSelector = $(pgSel + ' > i.location-spot');
			var	spotX = spotSelector.attr('data-x');
			var spotY = spotSelector.attr('data-y');
			// 原始坐标轴*缩放比例
			spotSelector.css('top', (spotY * fpScale) + 'px')
						.css('left', (spotX * fpScale) + 'px');

			// 缩放容器（包含平面图和设备坐标点）初始化
			$(pgSel).css('width', $(pgImgSel).width())
					.css('height', $(pgImgSel).height())
					.css('position', 'absolute')
					.css('top', '0')
					.css('left', '0');
			setScale();
			//缩放面板初始化
			let scalePanelFn = new ScalePanelFn(prefix);
			//快捷选择放大缩小比例
			$(prefix + ' .data-opts > a.percentage').unbind().on('click',function(event){
				event.stopPropagation(); 
				scalePanelFn.showPercentageList(function(res){
					pgBgScale = res;
					setScale();
					if(res == 1) {//选择100%时，有一个还原的效果
						$(pgSel).css({left: '0px', top: '0px'});
					}
				});
			});
			//鼠标滚轮放大缩小
			$(pgSel).unbind('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll',onMouseScroll);
			function onMouseScroll(e){
			    e.preventDefault();
			    var wheel = e.originalEvent.wheelDelta || -e.originalEvent.detail,
			    	delta = Math.max(-1, Math.min(1, wheel) ),
			    	zoomContainerPosition = $(pgSel)[0].getBoundingClientRect(),
			    	eX = e.clientX,//鼠标的位置x
			    	eY = e.clientY,//鼠标的位置Y
			    	pX = (eX - zoomContainerPosition.left)/zoomContainerPosition.width,//鼠标在楼层图上的相对位置 x
			    	pY = (eY - zoomContainerPosition.top)/zoomContainerPosition.height,//鼠标在楼层图上的相对位置 y
			    	step = 0,
			    	newLeft = 0,
			    	newTop = 0,
			    	imgH = $(pgSel)[0].clientHeight,//图片缩放的基准高度 即缩放因子为1时的高度
			    	imgW = $(pgSel)[0].clientWidth,//图片缩放的基准宽度 即缩放因子为1时的宽度
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
		    	newLeft =  $(pgSel)[0].offsetLeft + (pgBgScale - oldPgBgScale)*imgW*(0.5 - pX);
		    	newTop = $(pgSel)[0].offsetTop + (pgBgScale - oldPgBgScale)*imgH*(0.5 - pY);
		    	
			    setScale();
			    $(pgSel).css({left: newLeft + 'px', top: newTop + 'px'});
			}
			// 控制地图缩小放大
			$(prefix + ' .data-opts > a.scale-pg').unbind('click').bind('click', function(){
				var dataOpt = $(this).attr('data-opt');
				if (dataOpt === 'enlarge') {
					pgBgScale += 0.1;
				} else {
					pgBgScale -= 0.1;
					if (pgBgScale < 0.1) {
						pgBgScale = 0.1;
					}
				}
				setScale();
			});

			// 拖动设备及平面图
			$(pgSel).unbind('mousedown').mousedown(function(e) {
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
			    	'move_container': $(prefix)
			    });
					
			});
			function setScale(){
				//保证地图放大，设备定位点不放特别大
				$(pgSel + ' i.location-spot')
				.css('transform', 'scale(' + 1/pgBgScale + ')')
				.css('-ms-transform', 'scale(' + 1/pgBgScale + ')')
				.css('-moz-transform', 'scale(' + 1/pgBgScale + ')')
				.css('-webkit-transform', 'scale(' + 1/pgBgScale + ')')
				.css('-o-transform', 'scale(' + 1/pgBgScale + ')');
				$(pgSel)
				.css('transform', 'scale(' + pgBgScale + ')')
				.css('-ms-transform', 'scale(' + pgBgScale + ')')
				.css('-moz-transform', 'scale(' + pgBgScale + ')')
				.css('-webkit-transform', 'scale(' + pgBgScale + ')')
				.css('-o-transform', 'scale(' + pgBgScale + ')');
				$(prefix + ' .percentage span').html((pgBgScale*100).toFixed());
			}
		};
	};

	/**
	 * 加载园区俯视图
	 */
	function loadVv() {
		var vvUrl = $(moduleId + ' .vv-pg-cnt > img').attr('src'),
			vvImg = new Image();
		
		var handleConfigedAreaCore = function(el, vvScale) {//加载园区定位图
			let	configedAreaId = el.attr('data-id'),
				x = parseFloat(el.attr('data-x')) * vvScale,
				y = parseFloat(el.attr('data-y')) * vvScale,
				scale = parseFloat(el.attr('data-scale')),
				imgScale = scale * vvScale,
				imgSrc = $(el.find('img')[0]).attr('src'),
				img = new Image(),
				imgWidth = 0,
				imgHeight = 0;
			img.src = imgSrc;
			img.onload = function() {
				imgWidth = img.width * imgScale;
				imgHeight = img.height * imgScale;
				$(el.find('img')[0]).css('width', imgWidth + 'px')
									.css('height', imgHeight + 'px')
									.css('top', y + 'px')
									.css('left', x + 'px');
				
				if (parseInt(configedAreaId) === parseInt(areaId)) {
					$(moduleId + ' .de-area').css('width', imgWidth + 'px')
										.css('height', imgHeight + 'px')
										.css('top', y + 'px')
										.css('left', x + 'px');
				}
				
			};
		};
		vvImg.src = vvUrl;
		vvImg.onload = function() {
			var cntW = $(moduleId + ' .floor-bg').width();
			var cntH = $(moduleId + ' .floor-bg').height();
			var vvW = vvImg.width;
			var vvH = vvImg.height;
			var vvLoadParams = CommonUtil.calcuPicLoadParams(cntW-2, cntH-2, vvW, vvH);
			$(moduleId + ' .vv-pg-cnt > img').attr('width', vvLoadParams.w).attr('height', vvLoadParams.h);
			
			$.each($(moduleId + ' .configed-area-pics a'), function() {
				handleConfigedAreaCore($(this), vvLoadParams.scale);
			});
		};
	};


	function dealHistoryPanel(deInfoId) {
	    $http.get({
	        url: 'device-exception/deal-history',
	        data: {
	        	id: deInfoId
	        }
	    },function(res){
			setTimeout(function() {
				layerWindowIndex = layer.open({
					title: '处理追踪',
					type: 1,
					skin: 'layui-layer-rim', //加上边框
					area: ['800px', '500px'], //宽高
					content: res,
					end: function() {
						layer.close(layerWindowIndex);
					}
				});
			});
	    });
	};

	function openAssignPanel(deInfoId) {
		$http.get({
	        url: 'work-order/assign-form',
	        data: {
	        	id: deInfoId
	        }
	    },function(res){
			setTimeout(function() {
				layerWindowIndex = layer.open({
					title: '设备异常任务指派',
					type: 1,
					skin: 'layui-layer-rim', //加上边框
					area: ['800px', '500px'], //宽高
					content: res,
					end: function() {
						layer.close(layerWindowIndex);
					}
				});
			});
	    });
	}
	
	paramsInit = function(p) {
		moduleId = '#smw-anomaly-location';
		areaId = p.areaId;
		floorPlan = p.floorPlan;
	};
	
	init = function(p) {
		paramsInit(p);
		foorPlanRelates(moduleId + ' .floor-bg');
		loadVv();
		
		$(moduleId + ' a[role="deal-history-panel"]').unbind().on('click',function(){
			dealHistoryPanel(p.deInfoId)
		})
		$(moduleId + ' a[role="open-assign-form"]').unbind().on('click',function(){
			openAssignPanel(p.deInfoId);
		})
	};
	return {
		init: init
	}
}());