var AnomalyLocation = (function() {
	var moduleId,
		areaId,
		paramsInit,
		init,
		picUrl,
		pgBgScale = 1,
		loadFloorPg,
		loadVv,
		handleConfigedAreaCore = function(el, layoutPgScale) {//加载园区定位图
			let	configedAreaId = el.attr('data-id'),
				x = parseFloat(el.attr('data-x')) * layoutPgScale,
				y = parseFloat(el.attr('data-y')) * layoutPgScale,
				scale = parseFloat(el.attr('data-scale')),
				imgScale = scale * layoutPgScale,
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
					$(moduleId + ' .al-area').css('width', imgWidth + 'px')
										.css('height', imgHeight + 'px')
										.css('top', y + 'px')
										.css('left', x + 'px');
				}
				
			};
		};
	
	loadFloorPg = function(pgSuffix) { // 根据前缀加载楼层设备平面图，并实现放大缩小，拖拽的功能 
		var zoomContainer = pgSuffix + ' .pg-bg',
			zoomImg = zoomContainer + ' > img',
			img = new Image(),
			picLoadParams,
			pgWidth = $(pgSuffix).width(),
			pgHeight = $(pgSuffix).height(),
			pgScale = 1;
		if (!picUrl) {
			layer.msg('数据初始化错误，页面无法正常显示，建议关闭页面！', {icon: 5});
			return false;
		}
		// 显示楼层平面图
		$(zoomImg).attr('src', picUrl);
		// 加载楼层平面图
		img.src = $(zoomImg).attr('src');
		// 加载成功后进行逻辑代码操作
		img.onload = function() {
			picLoadParams = CommonUtil.calcuPicLoadParams(pgWidth-2, pgHeight-2, img.width, img.height);
			pgScale = picLoadParams.scale;
			$(zoomImg).attr('width', picLoadParams.w).attr('height', picLoadParams.h);
			var spotSelector = $(zoomContainer + ' > i.location-spot'),
				spotX = spotSelector.attr('data-x'),
				spotY = spotSelector.attr('data-y');
			
			spotSelector.css('top', (spotY * pgScale) + 'px').css('left', (spotX * pgScale) + 'px');
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
			// 缩放设备及平面图
			$(pgSuffix + ' .data-opts > a.scale-pg').unbind('click').bind('click', function(){
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
			    	'move_container': $(pgSuffix)
			    });
					
			});
			function setScale(){
				$(zoomContainer + ' i.location-spot')
				.css('transform', 'scale(' + 1/pgBgScale + ')')
				.css('-ms-transform', 'scale(' + 1/pgBgScale + ')')
				.css('-moz-transform', 'scale(' + 1/pgBgScale + ')')
				.css('-webkit-transform', 'scale(' + 1/pgBgScale + ')')
				.css('-o-transform', 'scale(' + 1/pgBgScale + ')');
				$(zoomContainer)
				.css('transform', 'scale(' + pgBgScale + ')')
				.css('-ms-transform', 'scale(' + pgBgScale + ')')
				.css('-moz-transform', 'scale(' + pgBgScale + ')')
				.css('-webkit-transform', 'scale(' + pgBgScale + ')')
				.css('-o-transform', 'scale(' + pgBgScale + ')');
				$(pgSuffix + ' .percentage span').html((pgBgScale*100).toFixed());
			}
		};
	};
	loadVv = function() {
		var vvUrl = $(moduleId + ' .vv-pg-cnt > img').attr('src'),
			vvImg = new Image();
		
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
	function dealHistoryPanel(alarmInfoId) {
		var panelIndex = -1;
	    CommonUtil.ajaxRequest({
	        url: 'alarm/deal-history',
	        type: 'get',
	        data: {
	        	id: alarmInfoId
	        }
	    },function(res){
			setTimeout(function() {
				panelIndex = layer.open({
					title: '报警信息处理记录',
					type: 1,
					skin: 'layui-layer-rim', //加上边框
					area: ['800px', '500px'], //宽高
					content: res
				});
			});
	    });
	};
	
	
	paramsInit = function(p) {
		moduleId = '#alarm-anomaly-location';
		areaId = p.areaId;
		picUrl = p.picUrl;
	};
	
	init = function(p) {
		paramsInit(p);
		loadFloorPg(moduleId + ' .floor-bg');
		loadVv();
		$(moduleId + ' a[role="deal-history-panel"]').unbind().on('click',function(){
			dealHistoryPanel(p.alarmInfoId)
		})
	};
	return {
		init: init
	}
}());