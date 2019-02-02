var MallLayoutManage = (function() {
	let moduleId,
		layoutPgSelector,
		unConfigAreaPicsSelector,
		configedAreaPicsSelector,
		opt_uploadLayoutSelector,
		opt_setLayoutSelector,
		paramsInit,
		mallId,
		layoutPg, // 全局图加载及保存对象
		layoutPgScale, // 全局图缩放比例
		showLayoutAndCalScale,
		handleConfigedAreaCore,
		handleConfigedAreas,
		loadLayoutPg,
		uploadLayoutPg,
		configCore,
		operationCodes,
		init;
	
	paramsInit = function() {
		moduleId = '#store-vertical-view';
		layoutPgSelector = moduleId + ' .vertical-view-handler > img';
		opt_uploadLayoutSelector = moduleId + ' a[data-opt="upload-layout"]';
		opt_setLayoutSelector = moduleId + ' a[data-opt="set-layout"]';
		configedAreaPicsSelector = moduleId + ' ul.configed-area-pics';
		unConfigAreaPicsSelector = moduleId + ' ul.area-pgs';
	};
	
	/**
	 * 显示全局图并计算缩放比例
	 */
	showLayoutAndCalScale = function(layoutPicUrl) {
		$(layoutPgSelector).attr('src', layoutPicUrl);
		var img = new Image();
		img.src = layoutPicUrl;
		img.onload = function() {
			layoutPgScale = $(layoutPgSelector).width()/img.width;
			if (operationCodes.indexOf('vertical-view-match') >= 0) {
				handleConfigedAreas();
			}
		};
	}
	/**
	 * 加载全局图
	 */
	loadLayoutPg = function(callback) {
		CommonUtil.operation({
			moduleName: 'floor',
			oper: 'getPlanGraph',
			forbidConfirm: true
		}, function(pg) {
			layoutPg = pg.result;
			layoutPg = layoutPg ? layoutPg : {
				mallId: mallId
			};
			if (layoutPg && layoutPg.picture && layoutPg.picture.storage) {

				$(moduleId + ' .vertical-view-handler-empty').css('display', 'none');
				$(moduleId + ' .vertical-view-handler').css('display', 'block');
				showLayoutAndCalScale(layoutPg.picture.storage[0].fileStorageUrl);
			} else {
				$(moduleId + ' .vertical-view-handler-empty').css('display', 'block');
				$(moduleId + ' .vertical-view-handler').css('display', 'none');
			}
			callback();
		});
	};
	/**
	 * 上传全局图
	 */
	uploadLayoutPg = function() {
		let eminFileUpload = new EminFileUpload();
		eminFileUpload.init({
			title: '上传全局图',
			fileNumLimit: 1,
			filesType: ['img']
		}, function(res) {
			layoutPg.picture = res[0];
			CommonUtil.operation({
				moduleName: 'floor',
				oper: 'savePlanGraph',
				params: {
					data: JSON.stringify(layoutPg)
				},
				forbidConfirm: true
			}, function(res) {
				layer.msg('全局图保存成功！', {icon: 6});
				delAreaPositionMatch();
				/*if($(moduleId + ' .vertical-view-handler').css('display') == 'none') {
					$(moduleId + ' .vertical-view-handler-empty').css('display', 'none');
					$(moduleId + ' .vertical-view-handler').css('display', 'block');
				}
				showLayoutAndCalScale(layoutPg.picture.storage[0].fileStorageUrl);*/
			})
		});
		
	};
	handleConfigedAreaCore = function(el) {
		let	x = parseFloat(el.attr('data-x')) * layoutPgScale,
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
			
		};
	};
	handleConfigedAreas = function() {
		if ($(configedAreaPicsSelector + ' li').length > 0 ) {
			$.each($(configedAreaPicsSelector + ' li > a'), function() {
				handleConfigedAreaCore($(this));
			});
			$(configedAreaPicsSelector + ' img').unbind('click').bind('click', function() {
				configCore($(this));
			});
		}
	};
	configCore = function(el) {
		let picUrl = el.attr('src');
		let picInfo = {
			width: el.css('width'),
			height: el.css('height'),
			top: el.css('top'),
			left: el.css('left')
		};
		let elParent = $(el.parent().parent());
		elParent.siblings().removeClass('current');
		elParent.addClass('current');
		
		verticalViewHandler.init({
			handlerSelector: '#store-vertical-view .vertical-view-handler',
			targetPicUrl: picUrl,
			picInfo: picInfo
		}, function(res) {
			let submitLayoutConfig = {};
			let img = new Image();
			let currentConfigArea = $($(configedAreaPicsSelector + ' img[src="' + res.imgSrc + '"]').parent());
			img.src = res.imgSrc;
			submitLayoutConfig.areaId = currentConfigArea.attr('data-id');
			img.onload = function() {
				submitLayoutConfig.ratio = res.w / img.width / layoutPgScale;
				submitLayoutConfig.x = res.left / layoutPgScale;
				submitLayoutConfig.y = res.top / layoutPgScale;
				CommonUtil.operation({
					moduleName: 'store',
					oper: 'getLayoutConfigByAreaId',
					params: {
						areaId: submitLayoutConfig.areaId
					},
					forbidConfirm: true
				}, function(areaConfigRes) {
					if (areaConfigRes.result && areaConfigRes.result.id) {
						submitLayoutConfig.id = areaConfigRes.result.id
					}
					CommonUtil.operation({
						moduleName: 'store',
						oper: 'saveLayoutConfig',
						oper_cn: '保存',
						params: {
							data: JSON.stringify(submitLayoutConfig)
						},
						forbidConfirm: true
					}, function(res) {
						layer.msg('已保存！', {icon: 6});
						currentConfigArea.attr('data-x', submitLayoutConfig.x);
						currentConfigArea.attr('data-y', submitLayoutConfig.y);		
						currentConfigArea.attr('data-scale', submitLayoutConfig.ratio);
						handleConfigedAreaCore(currentConfigArea);
					})
				});
			};
		});
	},
	delAreaPositionMatch = function(p) {
		p = p ? p : {}
		CommonUtil.operation({
			moduleName: 'store',
			oper: 'delAreaPositionMatch',
			oper_cn: '删除匹配数据',
			type: 'get',
			params: {
				areaId:p.areaId
			},
			forbidConfirm: (p.forbidConfirm == false) ? false : true
		}, function(res) {
			goPage('vertical-view');
		})
	};
	init = function(p) {
		p = p ? p : {};
		operationCodes = p.operationCodes;
		
		mallId = p.mallId;
		paramsInit();
		loadLayoutPg(function() {
			
			$(opt_uploadLayoutSelector).unbind('click').bind('click', function() {
				uploadLayoutPg();
			});
			/*$(opt_setLayoutSelector).unbind('click').bind('click', function() {
				$(unConfigAreaPicsSelector).toggleClass("hide");*/
				$(unConfigAreaPicsSelector + ' > li > a').unbind('click').bind('click', function() {
					let areaPic = $(this).parent();
					$(configedAreaPicsSelector).append('<li>' + areaPic.html() + '</li>');
					areaPic.remove();
					let capLis = $(configedAreaPicsSelector + ' li');
					$(capLis[capLis.length-1]).find('img').css('width', '200px');
					/*$(unConfigAreaPicsSelector).toggleClass("hide");*/
					$(configedAreaPicsSelector + ' img').unbind('click').bind('click', function() {
						configCore($(this));
						if ($(unConfigAreaPicsSelector + ' li').length == 0) {
							$(unConfigAreaPicsSelector).html('<div style="padding: 20px 0; color: rgb(250, 251, 253); font-size: 16px; text-align: center">暂无未配置的区域俯视图</div>');
						}
					});
					$(configedAreaPicsSelector).children().last().find('img').trigger('click');
					if($(unConfigAreaPicsSelector + ' li').length == 0) {
						$(unConfigAreaPicsSelector).toggleClass("hide");
					}
					
				});
			/*});*/
			$(moduleId + ' a[data-opt="del-match"]').unbind('click').bind('click', function() {
				delAreaPositionMatch({forbidConfirm: false});
			})
			if ($(unConfigAreaPicsSelector + ' li').length == 0) {
				$(unConfigAreaPicsSelector).html('<div style="padding: 20px 0; color: rgb(250, 251, 253); font-size: 16px; text-align: center">暂无未配置的区域俯视图<br>请点击全局图中的区域图片进行位置匹配</div>');
			} else {
				if (operationCodes.indexOf('vertical-view-match') >= 0) {
					/*$(opt_setLayoutSelector).trigger('click');*/
					$(unConfigAreaPicsSelector).toggleClass("hide");
				}
				
			}
		});
		
	};
	
	return {
		init: init
	}
}());