var GridPickerPanel = (function() {
	var regionInterface = null,
		loadList = function(p) {
			var view = '#grid-picker-panel .datas';
			regionInterface.getGrids(p, function(res) {
				laytpl(grid_picker_datas.innerHTML).render({
					params: p,
					datas: res
				}, function(html){
					$(view).html(html);
				});
			})
		},
		init = function(p, callback) {
			var lw = '#grid-picker-panel',
				ztreeParams = {
					id: 'grid-picker-region-tree',
					async: {
						url: base + 'region/findByPid',
						expandAll: true	
					}
				},
				cbDatas = {};
			
			if (p && p.enableRegion) {
				ztreeParams.check = {
					enable: true,
					chkStyle: "checkbox",
					chkboxType: { "Y": "", "N": "" }
				};
			}
			regionInterface = new RegionInterface();
			
			eminZtree(ztreeParams, function(zTree, treeNode, type) {
				if (type == 'check') {
					var nodes = zTree.getCheckedNodes(true);
					cbDatas.regions = nodes.length > 0 ? nodes : null;
				}
				
				if (type == 'click') {
					loadList({
						regionId: treeNode.id
					});
				}
			});
			if ($(lw).hasClass('hide') || $(lw).css('display') == 'none') {
				$(lw).removeClass('hide');
				setTimeout(function() {
					layerWindowIndex = layer.open({
						type: 1,
						title: p && p.title ? p.title : '选择区域网格',
						skin: 'layui-layer-demo', //样式类名
						closeBtn: 1, //不显示关闭按钮
						anim: 2,
						shadeClose: false, //开启遮罩关闭
						area : [ '800px', 'auto' ], //宽高
						content: $(lw)
					});
					
					$(lw + ' button[role="choosen-close"]').unbind('click').bind('click', function() {
						if ($(lw + ' .datas input[name="grid-choosen"]:checked').length > 0) {
							CommonUtil.getIdsOfEls($(lw + ' .datas input[name="grid-choosen"]:checked'), function(ids, others) {
								cbDatas.grids =  {
									ids: ids,
									others: others
								}
							});
						} else {
							cbDatas.grids = null;
						}
						
						if (typeof callback == 'function') {
							callback({
								datas : cbDatas,
								layerWindowIndex: layerWindowIndex
							});
						}
					});
				});
				
//				$(lw + ' button[role="close-panel"]').unbind('click').bind('click', function() {
//					layer.close(layerWindowIndex);
//				});
				
			}
		};
		
	return {
		init: init
	};
}());