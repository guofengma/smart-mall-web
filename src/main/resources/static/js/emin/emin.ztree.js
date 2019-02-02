'use strict';

/**
 * 初始化分类树
 */
var eminZtree = function eminZtree(params, callback) {
	var zTree = null,
	    ztreeId = params.id ? params.id : null,
	    sync = params.sync ? params.sync : {},
	    async = params.async ? params.async : {},
	    idKey = params.idKey ? params.idKey : 'id',//id的key名
	    pIdKey = params.pIdKey ? params.pIdKey : 'pid',//pid的key名
	    diyDom = params.diyDom ? params.diyDom : null,
	    checkList = params.checkList ? params.checkList : [],
	    disabledIds = params.disabledIds ? params.disabledIds : [],
	    chkDisabled = false,
	    searchNodeList = [],
	    searchNode = function searchNode(val) {
		updateNodeHighlight(false);
		searchNodeList = zTree.getNodesByParamFuzzy('name', val, null);
		if (val != "") {
			updateNodeHighlight(true);
		}
	},
	    updateNodeHighlight = function updateNodeHighlight(isHighlight) {
		for (var i = 0, l = searchNodeList.length; i < l; i++) {
			searchNodeList[i].highlight = isHighlight;
			zTree.updateNode(searchNodeList[i]);
		}
	},
	    eachNodes = function eachNodes(nodes) {
		if (!nodes) {
			return false;
		}
		for (var i = 0; i < nodes.length; i++) {
			checkList.map(function (c) {
				return c[idKey] == nodes[i][idKey] ? zTree.checkNode(nodes[i], true) : zTree.checkNode(nodes[i], false);
			});
			disabledIds.map(function (id) {
				return id == nodes[i][idKey] ? zTree.setChkDisabled(nodes[i], true) : '';
			});
			eachNodes(nodes[i].children);
		}
	},
	expandNodes = function (_expandNodes) {
		function expandNodes(_x) {
			return _expandNodes.apply(this, arguments);
		}

		expandNodes.toString = function () {
			return _expandNodes.toString();
		};

		return expandNodes;
	}(function (nodes) {
		for (var i = 0; i < nodes.length; i++) {
			zTree.expandNode(nodes[i], true);
			if (nodes[i].isParent && nodes[i].zAsync) {
				//存在子级
				expandNodes(nodes[i].children); //递归
			} else {
				eachNodes(zTree.getNodes());
			}
		}
	}), setting = {
		view: {
			fontCss: function fontCss(treeId, treeNode) {
				return !!treeNode.highlight ? { color: "#5a98de", "font-weight": "bold" } : { color: "#333", "font-weight": "normal" };
			},
			addDiyDom: diyDom,
			nameIsHTML: true
		},
		data: {
			key: {
				title: "name"
			},
			simpleData: {
				enable: true,
				idKey: idKey,
				pIdKey: pIdKey
			}
		},
		callback: {
			onClick: function onClick(event, treeId, treeNode, clickFlag) {
				if (typeof callback == 'function') callback(zTree, treeNode, 'click');
			},
			onCheck: function onCheck(event, treeId, treeNode, clickFlag) {
				if (typeof callback == 'function') callback(zTree, treeNode, 'check');
			},
			onAsyncSuccess: function onAsyncSuccess(event, treeId, treeNode, msg) {
				var nodes = zTree.getNodes();
				if (nodes.length > 0) {
					if (async && async.expandAll) {
						expandNodes(nodes);
					}
				} else {
					var ztreeObj = $('#' + ztreeId);
					ztreeObj.html('<div style="padding: 7px;">暂无可用节点数据</div>');
				}
			}
		}
	};

	function filter(treeId, parentNode, childNodes) {
		if (!childNodes) return null;
		for (var i = 0, l = childNodes.length; i < l; i++) {
			childNodes[i].name = childNodes[i].name.replace(/\.n/g, '.');
		}
		return childNodes;
	}

	if (params.check) {
		chkDisabled = params.check.chkDisabled;
		setting.check = params.check;
	}

	if (ztreeId) {
		var ztreeObj = $('#' + ztreeId),
		    keywordObj = $('#' + ztreeId + 'Key');
		if (sync && sync.zNodes && sync.zNodes.length > 0) {
			// 同步所有数据
			$.fn.zTree.init(ztreeObj, setting, sync.zNodes);
			zTree = $.fn.zTree.getZTreeObj(ztreeId);
			if (sync.expandAll) {
				zTree.expandAll(true);
			}
			eachNodes(zTree.getNodes());
		} else {
			ztreeObj.html('<div style="padding: 7px;">暂无可用节点数据</div>');
		}
		if (async && async.url) {
			// 异步加载数据
			setting.async = {
				enable: true,
				url: async.url,
				autoParam: async.autoParam ? async.autoParam : ["id=" + pIdKey],
				dataFilter: filter
			};

			$.fn.zTree.init(ztreeObj, setting);
			zTree = $.fn.zTree.getZTreeObj(ztreeId);
		}

		if (keywordObj && keywordObj.length == 1) {
			keywordObj.on('input', function () {
				searchNode(keywordObj.val());
			}).on('propertychange', function () {
				searchNode(keywordObj.val());
			});
		}
	}
};

function setCurSelected(ztreeId, nodeId) {
	var selectedEls = $('#' + ztreeId + ' .curSelectedNode'),
	    zTree = $.fn.zTree.getZTreeObj(ztreeId);

	if ($('#' + nodeId + '_a').hasClass()) {
		$('#' + nodeId + '_a').removeClass('curSelectedNode');
	} else {
		for (var i = 0; i < selectedEls.length; i++) {
			$(selectedEls[i]).removeClass('curSelectedNode');
		}
		$('#' + nodeId + '_a').addClass('curSelectedNode');
	}
}

function concatNodeName(ztree, node, showTitle) {
	if (node.parentTId) {
		node = ztree.getNodeByTId(node.parentTId);
		showTitle = node.name + ' - ' + showTitle;
		return concatNodeName(ztree, node, showTitle);
	} else {
		return showTitle;
	}
}

function treeDisplay(treeName) {
	var filter = treeName + 'Filter',
	    wrap = treeName + 'Wrap',
	    showTree = function showTree() {
		var select = $('#' + filter);
		if (select.hasClass('user-defined')) {
			$('#' + wrap).slideDown("fast");
		} else {
			var selectOffset = select.position();
			$('#' + wrap).css({
				left: selectOffset.left + "px",
				top: selectOffset.top + select.outerHeight() + "px",
				width: select.css('width')
			}).slideDown("fast");
		}
		$("body").bind("mousedown", onBodyDown);
	},
	    hideTree = function hideTree() {
		$('#' + wrap).fadeOut("fast");
		$("body").unbind("mousedown", onBodyDown);
	},
	    onBodyDown = function onBodyDown(event) {
		if (!(event.target.id == wrap || event.target.id == filter || $(event.target).parents('#' + wrap).length > 0)) {
			hideTree();
		}
	};

	$('#' + filter).bind('click', showTree);
}