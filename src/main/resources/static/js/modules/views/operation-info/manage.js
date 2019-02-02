var OperationInfoManage = (function(){
	let moduleId = '#operation-info-manage',
		operationCodes = null,
		treeTableSelecter = $(moduleId + ' .table-box'),
		removeIds = [],
		_this = this,
		treeRoots = [];
	let init = function(p){
		p = p ? p : {};
		operationCodes = p.operationCodes;
		adapt();
		getRoots();
		events();
	},
	adapt = function(){//高度设置
		let windowH = $(window).height();
		$(moduleId).css({'height':windowH - 102 + 'px'});
	},
	getRoots = function(rootId,callback) {
		CommonUtil.operation({
			moduleName: 'operation-info',
			oper: 'queryRoots',
			params: {},
			forbidConfirm: true
		}, function(res) {
			let html = '',
				result = res.result;
			if(result && result.length > 0) {
				result.forEach(function(value){
					html += '<li class="templet" data-id="' + value.id + '" data-nodeDomain="' + value.nodeDomain + '">' + value.name + '</li>'
				})
				$(moduleId + ' .empty').addClass('hide');
				$(moduleId + ' .info-msg').removeClass('hide');
				$(moduleId + ' .templet-list').html(html);
				if(rootId) {
					$(moduleId + ' li.templet[data-id="' + rootId + '"]').trigger('click');
				} else {
					$($(moduleId + ' li.templet')[0]).trigger('click')
				};
				if(typeof callback == 'function') {
					callback(res.result);
				}
			} else {
				$(moduleId + ' .empty').removeClass('hide');
				$(moduleId + ' .info-msg').addClass('hide');
				$(moduleId + ' .templet-list').html(html);
			}
			
			
		});
	},
	getList = function(p,callback) {
		p = p ? p : {};
		p.limit = 100000;
		p.page = 1;
		if(_this.params) {
			for(key in _this.params) {
				p[key] = _this.params[key]
			}
		}
		CommonUtil.operation({
			moduleName: 'document',
			oper: 'getPage',
			params: p,
			forbidConfirm: true
		}, function(res) {
			if(typeof callback == 'function') {
				callback(res.result);
			}
		});
	},
	renderTable = function(p,nodeId) {
		p = p ? p : {};
		let tpl = operation_info_table_tpl.innerHTML,
			view = treeTableSelecter,
			renderDate = p.data;
		renderDate = renderDate ? renderDate : [];
		laytpl(tpl).render(renderDate, function(html){
			view.html(html);
			let nowDate = new Date();
				tableId = 'operation-info-table' + nowDate.getTime();
			
			view.find('table').attr('id',tableId);
			if(renderDate.length > 0) {
				$(moduleId + ' .opers').removeClass('hide');
				$('#' + tableId).removeClass('treetable');
				treeTableInit($('#' + tableId),function(res){
					if(nodeId && nodeId != '') {
						openNode($('#' + tableId),[nodeId])
					} else {
						let roots = res.roots ? res.roots :[];
						roots.forEach(function(value,index) {
							if(index < 2) {
								let tempId = value.id
								openNode($('#' + tableId),[tempId]);
							}
						})
						
					}
					
				});
			} else {
				$(moduleId + ' .opers').addClass('hide');
			}
			if(operationCodes.indexOf('edit-folder') != -1) {//目录的编辑权限
				$('#' + tableId + ' span.folder').unbind('dblclick').on('dblclick',function(){//双击编辑
					editFolder({el:$(this).find('span')});
				});
			}
			$('#' + tableId + ' .folder-download').unbind('click').on('click', function(){
				let self = $(this),
					parent = self.parents('tr'),
					fileName = parent.find('.filename').text() + '.zip',
					folderId = parent.attr('data-tt-id'),
					nodeDomain = parent.attr('data-nodeDomain'),
					url;
				getList({pid:folderId,nodeDomain:nodeDomain},function(res){
					let urls = [];
					if(res.totalCount == 0) {
						layer.msg('目录中无文件可下载',{icon:5});
						return false;
					}
					res.resultList.forEach(function(value){
						urls.push({urlPath:value.storePath,fileName:value.name});
					})
					url = base  + "file/package?fileEntriesStr=" + JSON.stringify(urls) + '&packageFileName=' + fileName;
					
					url = encodeURI(url);
					document.getElementById("ifile").src = url;
				});
			});
			
		})
	},
	treeTableInit = function(el,callback){//树形表格初始化
		el.treetable({  
			expandable: true,
			onInitialized: function(){//树初始化完毕的回调函数
				$('.i-checks').iCheck({
				    checkboxClass: 'icheckbox_square-green',
				    radioClass: 'iradio_square-green',
				});
				if(operationCodes.indexOf('edit-folder') == -1 && operationCodes.indexOf('remove-folder') == -1) {//目录的右键权限
					el.find('span.folder').removeClass('box');
				}
				if(operationCodes.indexOf('download-package') == -1) {//文件夹的打包下载权限
                	el.find('.folder-download').remove();
				}
				treeItemEvent(el);
				if(typeof callback == 'function') {
					treeRoots = this.roots;
					callback(this)
				}
			},
			onNodeInitialized: function(){//节点始化完毕的回调函数
				
				
			},
			onNodeCollapse: function(){//节点收起时的回调,
				let node = this,
					children = node.children,
				 	len = children.length,
				 	nodeIds = [];
				 	
	     		if(len > 0) {
	     			children.forEach(function(value) {
	     				nodeIds.push(value.id);
	     			});
	     			nodeIds.forEach(function(value) {
	     				el.treetable("removeNode",value)
	     			});
	     		}
			},
		    onNodeExpand: function () {//节点展开时的回调
		        var node = this,
		        	nodeEl = el.find('tr[data-tt-id="'+node.id+'"]'),
		        	nodeDomain = nodeEl.attr('data-nodedomain'),
		        	tpl = operation_info_tr_tpl.innerHTML;
	            getList({pid:node.id,nodeDomain:nodeDomain},function(res){
	            	let renderData = res.resultList,
	            		inputEl = nodeEl.find('input:checked');
	            	renderData = renderData ? renderData : [];
	            	
	            	laytpl(tpl).render(renderData, function(html){
	            		el.treetable("loadBranch", node, html);// 插入子节点
		                el.treetable("expandNode", node.id);// 展开子节点
		                $('.i-checks').iCheck({
						    checkboxClass: 'icheckbox_square-green',
						    radioClass: 'iradio_square-green',
						});
		                if(inputEl.length > 0) {
		                	$(moduleId + ' input[name="' + node.id + '"]').iCheck('check');
		                }
		                treeRoots.forEach(function(value) {
		                	new CheckItems(moduleId + ' input[name="' + value.id + '-all"]',moduleId + ' input[name="' + value.id + '"]'); 
		                })
		                
		                if(operationCodes.indexOf('remove-file') == -1 && operationCodes.indexOf('move-file') == -1) {//文件的右键权限
							el.find('span.file').removeClass('box');
						}
		                if(operationCodes.indexOf('download-file') == -1) {//文件的下载权限
		                	el.find('.download').remove();
						}
		                if(operationCodes.indexOf('edit-file-label') == -1) {//文件的修改标签权限
		                	el.find('.fa-tags').remove();
						}
		                if(operationCodes.indexOf('edit-file-label') == -1) {//文件的预览权限
		                	el.find('span.file').removeAttr('role');
		                	el.find('span.file').removeAttr('onclick');
						}
						el.find('.fa-tags').unbind().on('click',function(){
							let parent = $(this).parents('tr'),
								id = parent.attr('data-tt-id');
							TagManage.getFileTags({resourceId:id,resourceCode:'maintenance'},function(res){
								TagManage.openTagPanel({resourceId:id,tags:res.resultList})
							})
						});
						el.find('.download').unbind('click').on('click', function(){
							let self = $(this),
								parent = self.parents('tr'),
								fileName = parent.find('.filename').text(),
								url = base  + "file/download?url=" + self.attr('data-url') + '&fileName=' + fileName;
					
							document.getElementById("ifile").src = url;
						});
						el.find('span[role="filepreview"]').unbind('click').on('click', function(){
							let self = $(this),
								parent = self.parents('tr'),
								fileName = parent.find('.filename').text(),
								pathUrl = parent.find('.download').attr('data-url');
								url = base  + "file/download?url=" + self.attr('data-url') + '&fileName=' + fileName;
							/*window.open(pathUrl);*/
							setTimeout(function(){
								layer.open({
									type : 1,
									title :'【' + fileName + '】 在线预览',
									shadeClose: false,
									closeBtn: 1, 
									anim: 2,
									skin : 'layui-layer-rim', //加上边框
									area : [ '800px', '600px' ], //宽高
									btn: ['全屏'],
									content : '<div class="filer-filepreview-open" style="background:#F3F5F5">' + "<iframe src='" + pathUrl + "' width='100%' height='501px' frameborder='0'>This is an embedded <a target='_blank' href='http://office.com'>Microsoft Office</a> document, powered by <a target='_blank' href='http://office.com/webapps'>Office Online</a>.</iframe>" + '</div>',
									yes: function(oneOpenIndex){
										let oneOpen = $('#layui-layer' + oneOpenIndex);
											H = window.innerHeight - 99;
										oneOpen.addClass('hide');
										let twoOpen = layer.open({
											type : 1,
											title :'【' + fileName + '】 在线预览',
											shadeClose: false,
											closeBtn: 1, 
											anim: 2,
											skin : 'layui-layer-rim', //加上边框
											btn: ['还原'],
											area : [ '100%', '100%' ], //宽高
											content : '<div class="filer-filepreview-open" style="background:#F3F5F5">' + "<iframe src='" + pathUrl + "' width='100%' height='" + H + "px' frameborder='0'>This is an embedded <a target='_blank' href='http://office.com'>Microsoft Office</a> document, powered by <a target='_blank' href='http://office.com/webapps'>Office Online</a>.</iframe>" + '</div>',
											yes: function(fullSIndex){
												oneOpen.removeClass('hide');
												layer.close(fullSIndex)
											}
										});
										$('#layui-layer' + twoOpen + ' .layui-layer-close').on('click',function(){
											layer.close(oneOpenIndex)
										});
									}
								});
							})
						
						});
	            	})
	            });
		    }
        });	
	},
	openCatePanel = function(data){
		data = data ? data : {};
		let changeFolderOpen,
			renderData = data.renderData ? data.renderData : [];
		removeIds = [];
		setTimeout(function(){
			changeFolderOpen = layer.open({
				type : 1,
				title : data.title ? data.title : '新建分类',
				shadeClose: false,
				closeBtn: 1, 
				anim: 2,
				skin : 'layui-layer-rim', //加上边框
				area : [ '500px', '400px' ], //宽高
				btn: ['确认','取消'],
				content : '<div class="opration-info-cate-open">' + $('.opration-info-cate-panel').html() + '</div>',
				yes: function(){
					let name = $('.opration-info-cate-open input[name="name"]').val(),
						
						rootModifyDto = {
							folders: getFolders()
						};
					name = name.trim();
					if(name == '') {
						layer.msg('分类名称不能为空',{icon:5});
						$('opration-info-cate-open input[name="name"]').focus();
						return false;
					}
					if(name.length > 20) {
						layer.msg('分类名称的长度不能超过20个字符',{icon:5});
						$('opration-info-cate-open input[name="name"]').focus();
						return false;
					};
					if(!judgeFoldersName(rootModifyDto.folders)) {
						layer.msg('目录名称重复',{icon:5});
						return false;
					}
					rootModifyDto.name = name;
					if(data.id) {
						rootModifyDto.id = data.id;
					}
					CommonUtil.operation({
						moduleName: 'operation-info',
						oper: 'createDomainRoot',
						params: {rootModifyDto: JSON.stringify(rootModifyDto),ids:removeIds.join(',')}
					}, function(res) {
						layer.close(changeFolderOpen);
						layer.msg('保存成功',{icon: 6});
						getRoots(res.result.id);
					});
				}
			});
			if(data.name) {
				$('.opration-info-cate-open input[name="name"]').val(data.name);
			};
			if(!data.id) {//如果是新增分类，默认有一个‘新建目录’
				renderData.push({
					name:'新建目录',
					id: null,
					sortId: (new Date()).getTime()
				})
			};
			renderfolders({renderData:renderData});
			if(operationCodes.indexOf('add-folder') == -1) {//添加目录的权限
				$('.opration-info-cate-open .add-folder').remove();
			}
			
			function addFolder() {
				let folders = getFolders(),
					isUsed = false,
					newfolderName = null,
					len = folders.length;
				
				for(var i = 0; i < len; i ++){
					let name = (i == 0) ? '新建目录' : ('新建目录(' + i + ')');
					isUsed = false;
					folders.forEach(function(value,index) {
						if(value.name == name) {
							isUsed = true;
						}
					});
					if(!isUsed) {
						newfolderName = name;
						break;
					}
				};
				if(newfolderName == null) {
					newfolderName = (len == 0) ? '新建目录' : ('新建目录(' + len + ')')
				}
				folders.push({
					name:newfolderName,
					id: null,
					sortId: (new Date()).getTime()
				})
				renderfolders({renderData:folders},function(){
					let folderEls = $('.opration-info-cate-open .item'),
						len = folderEls.length;
					editFolder({el:$(folderEls[len-1]).find('span span')});
				});
			}
			$('.opration-info-cate-open .add-folder').unbind().on('click',addFolder);
		})
	},
	openChosenFolderPanel = function(data,callback) {
		data = data ? data : {};
		data.renderData = data.renderData ? data.renderData : [];
		let btnName = data.btnName ? data.btnName : '下一步';
		let chosenFolderPanelOpen;
		setTimeout(function(){
			chosenFolderPanelOpen = layer.open({
				type: 1,
				title: '选择目录',
				shadeClose: false,
				closeBtn: 1, 
				anim: 2,
				skin : 'layui-layer-rim', //加上边框
				area : [ '500px', '400px' ], //宽高
				btn: [btnName,'取消'],
				content : '<div class="opration-info-folders-open">' + $('.opration-info-cate-panel').html() + '</div>',
				yes: function(){
					let selectedEl = $('.opration-info-folders-open .selected'),
						id = selectedEl.attr('data-id'),
						name = selectedEl.find('span span').text();
					if(id) {
						setTimeout(function(){
							layer.close(chosenFolderPanelOpen);
						},100);
						callback({id:id,name:name});
					} else {
						layer.msg('请选择目录',{icon:5})
					}
				}
			});
			
			$('.opration-info-folders-open input[name="name"]').val(data.name).attr('readOnly','readOnly');
			$('.opration-info-folders-open .add-folder').remove();
			renderfolders({renderData:data.renderData,el:$('.opration-info-folders-open')});
			$('.opration-info-folders-open .item').unbind().on('click',function(){
				$('.opration-info-folders-open .item').removeClass('selected');
				$(this).addClass('selected');
			})
			
		})
	},
	renderfolders = function(data,callback){
		data = data ? data : {};
		let html = '',
			el = data.el ? data.el : $('.opration-info-cate-open');
		if(data.renderData && data.renderData.length > 0) {
			data.renderData.forEach(function(value){
				if(value.sortId) {
					html += '<p class="item" data-id="' + value.id + '" sort-id="' + value.sortId + '">'+
								'<span class="folder">'+
								'<i class="fa fa-folder"></i>'+
								'<span>' + value.name + '</span>'+
								'<input type="hidden" value="' + value.name + '">'+
							'</span>'+
						'</p>';
				} else {
					html += '<p class="item" data-id="' + value.id + '">'+
						'<span class="folder">'+
							'<i class="fa fa-folder"></i>'+
							'<span>' + value.name + '</span>'+
							'<input type="hidden" value="' + value.name + '">'+
						'</span>'+
					'</p>';
				}
			});
		} else {
			html += '<p class="no-data">点击右上角按钮进行目录添加</p>';
		}
		el.find('.below').html(html);
		$('.opration-info-cate-open .item span.folder').unbind('contextmenu').on('contextmenu',function(e) {//文件、目录的右键菜单
			let menu = $('.opration-info-cate-open .right-menu'),
				pPosition = $('.layui-layer')[0].getBoundingClientRect();
			rightMenu({
				id: data.id,
				type: 'folder',
				e: e,
				menu: menu,
				top: pPosition.top + 30,
				left: pPosition.left,
				el: $(this).find('span')
			});
		});
		if(operationCodes.indexOf('edit-folder') != -1) {//编辑日期类型的权限
			$('.opration-info-cate-open .item span.folder').unbind('dblclick').on('dblclick',function(){//双击编辑
				editFolder({el:$(this).find('span')});
			});
		}
		
		if(typeof callback == 'function') {
			callback();
		}
	},
	getFolders = function(){
		let list = []
		$('.opration-info-cate-open .item').each(function(index,folder){
			let temp = {};
			folder = $(folder);	
			temp = {
				sortId: folder.attr('sort-id') ? folder.attr('sort-id') : null,
				name: folder.find('span span').html()
			}
			if(folder.attr('data-id') && folder.attr('data-id') != 'null' && folder.attr('data-id') != 'undefined') {
				temp.id = folder.attr('data-id');
			}
			list.push(temp);
		})
		return list;
	},
	judgeFoldersName = function(folders){
		let isSingle = true,
			len = folders.length;
		if(len > 1) {
			folders.forEach(function(v1,index1){
				if(index1 < len -1) {
					for(let i = index1+1; i < len; i++) {
						if(folders[i].name == v1.name) {
							isSingle = false;
						}
					}
				}
				
			})
		}
		return isSingle;
	},
	judgeFoldersName2 = function(folders,name){
		let isSingle = true;
		if(folders.length > 0) {
			folders.forEach(function(v1){
				if(v1.name == name) {
					isSingle = false;
				}
			})
		}
		return isSingle;
	}, 
	rightMenu = function(p){//右键菜单
		let menu = p.menu ? p.menu : $('#operation-info-right-memu'),
			id = p.id,
			confirmMsg = "确认删除？"
			html = null,
			e = p.e,
			pTop = p.top ? p.top : 0,
			pLeft = p.left ? p.left : 0;
		e.preventDefault();
		if(p.type == "folder") {
			html = '<li role="edit">重命名</li>'+
					'<li role="remove">删除</li>';
			confirmMsg = "目录中的内容也会被删除,确认删除？"
		} else if(p.type == "cate") {
			html = '<li role="edit">编辑</li>'+
					'<li role="remove">删除</li>';
			confirmMsg = "该分类下的所有文件都会被删除,确认删除？"
		} else {
			html = '<li role="move">移动</li>'+
					'<li role="remove">删除</li>';
		}
		menu.html(html);
		if(p.type == "folder") {
			if(operationCodes.indexOf('edit-folder') == -1) { // 目录重命名权限
				menu.find('li[role="edit"]').remove();
			};
			if(operationCodes.indexOf('remove-folder') == -1) { // 目录删除权限
				menu.find('li[role="remove"]').remove();
			};
		} else if(p.type == 'file') {
			if(operationCodes.indexOf('move-file') == -1) { // 文件移动权限
				menu.find('li[role="move"]').remove();
			};
			if(operationCodes.indexOf('remove-file') == -1) { // 文件删除权限
				menu.find('li[role="remove"]').remove();
			};
		}
		
		/*if (!lockContextMenu) {*/
			//根据事件对象中鼠标点击的位置，进行定位
			menu.css('left', e.clientX - pLeft + 'px');
			menu.css('top', e.clientY - pTop + 'px');
			menu.css('width', '100px');
			menu.removeClass('hide');
			lockContextMenu = true;
			document.onclick=function(){  
				menu.addClass('hide');
				lockContextMenu = false;
			};  
			
			menu.find('li').unbind('click').on('click', function(event) {
				let role = $(this).attr('role');
				// 移动
				if (role === 'move') {
					let tempEl  = $(moduleId + ' tr[data-tt-id="'+id+'"]'),
						fileNames = tempEl.find('.filename').text(),
						parentIds = tempEl.attr('data-tt-parent-id');
					/*changeFolder({ids:id});*/
					changeFolder({ids:id,fileNames:fileNames,parentIds:[parentIds]});
				}
				// 移除
				if (role === 'remove') {
					if(pTop > 0) {//在open-panel中的删除目录
						let revomeEl = p.el.parents('.item'),
							id = revomeEl.attr('data-id');
						if(id && id != 'null' && id != 'undefined') {
							removeIds.push(id)
						}
						revomeEl.remove();
						let folders = getFolders();
						if(folders.length == 0) {
							$('.opration-info-cate-open .below').html('<p class="no-data">点击右上角按钮进行目录添加</p>');
						}
					} else {
						if(p.type == 'cate') {//删除分类
							var cateLen = $('ul.templet-list li').length;
							if (cateLen > 1) {
								remove({ids:p.id}, confirmMsg, function(){
									getRoots();
								})
							} else {
								layer.msg('至少需要有一个目录', {icon: 5});
							}
						} else {//删除文件
							let pid = $(moduleId + ' tr[data-tt-id="' + p.id + '"]').attr('data-tt-parent-id');
							remove({ids:p.id},confirmMsg,function(){
								getFoldersBySelectedCate(function(res){
									renderTable({data:res.resultList},pid)
								})
							})
						}
					}
				}
				// 编辑
				if (role === 'edit') {
					if(p.type == 'cate') {//编辑分类
						getList({pid:p.id,nodeDomain:p.nodeDomain},function(res){
							openCatePanel({id:p.id,name:p.name,title:'编辑分类',renderData:res.resultList});
						})
					} else {//编辑目录
						editFolder({el:p.el});
					}
				}
			});
		/*}*/
	},
	editFolder = function(p){//重命名
		let inputEl = p.el.next(),
			oldName = inputEl.val();
		inputEl.attr('type','text');
		p.el.addClass('hide');
		inputEl.focus();
		inputEl.select();
		inputEl.unbind().on('keyup',function(e){
			// 兼容FF和IE和Opera  
	        var theEvent = e || window.event;  
	        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;  
	        if (code == 13) {   
	        	changeName(inputEl,oldName);
	           return false;  
	        }  
	        return true; 
		});
		inputEl.blur(function(){
			changeName(inputEl,oldName);
		});
		function changeName(el,oldName){
			let newName = el.val();
			if(!(newName && newName.trim().length > 0) || newName == oldName) {
				newName = oldName;
			} else {
				if(el.parents('tr').length > 0) {
					let folderId = el.parents('tr').attr('data-tt-id');
					folderDetail(folderId,function(res) {
						res.name = newName;
						CommonUtil.operation({
							moduleName: 'document',
							oper: 'folderCreateOrUpdate',
							forbidConfirm: true,
							params:res
						}, function(res) {
							
						});
					})
				}
			}
			el.prev().text(newName).removeClass('hide');
			el.attr('type','hidden');
			
		};
	},
	documendUpload = function(data){
		let fileUpload = new EminAontherFileUpload(),
			pid = data.id;
		setTimeout(function() {
			fileUpload.init({
				title: '上传本地文件',
				forbidConfirm: true,
				confirmMsg: '您确定要将选中文件上传至<strong> ' + data.name + ' </strong>吗',
				fileNumLimit: 1,
				fileSingleSizeLimit: 10,
				uploadUrl: '/file/universalUpload.do',
				filesType: ['all'],
				data:{id:data.id}
			}, function(res) {
				if(res.success){
					let params = res.result.storage[0],
						viewFileType = res.result.viewFileType;
					params.name = $('#uploadInterface .filelist .title').html();
					params.fileType = res.result.originalMimeType;
					params.contentType = res.result.originalContentType;
					params.viewFileType = res.result.viewFileType;
					params.storePath = params.fileStorageUrl;
					params.storeHost = params.destinationStorageHost;
					params.fileStoreId = params.fileId;
					delete params.fileStorageUrl;
					delete params.destinationStorageHost;
					delete params.fileId;
					
					if(!(viewFileType && viewFileType != '')) {
						viewFileType = 'fa-file-o';
					}
					let layerOpen = $('#layui-layer' + fileUpload.open),
						html = '<i class="fa '+ viewFileType +' text-navy"></i>&nbsp;&nbsp;<span>' + params.name + '</span>';
					layerOpen.find('.layui-layer-content').html($('.tag-chosen-panel').html());
					layerOpen.find('.tag-chosen .above').html(html);
					layerOpen.addClass('tag-open');
					TagManage.openEvent(layerOpen,[]);
					layerOpen.find('.tag-chosen .save').unbind().on('click',function(){//保存
						let tagEls = layerOpen.find('.selected-tags .tag'),
							tempObj = {};
						
						if(tagEls && tagEls.length > 0) {
							let tagLibParams = {
								type: 1,
								resourceCode: 'maintenance',
								values:[]
							},
							tagParams = [];
							tagEls.each(function(index,value) {
								let name = $(value).text();
								tagLibParams.values.push(name)
								tagParams.push({
									resourceCode: 'maintenance',
									name: name,
									value: name
								});
								
							});
							tempObj = {
								tagParams:JSON.stringify(tagParams),
								tagLibParams:JSON.stringify(tagLibParams)
							}
						}
						params.pid = pid;
						tempObj.fileDto = JSON.stringify(params);
						saveFile(tempObj,function(res){
							layer.close(fileUpload.open);
							getFoldersBySelectedCate(function(res){
								renderTable({data:res.resultList},pid)
							})
						});
					});
					
				} else {
					layer.msg(res.message?res.message:'上传文件失败', {icon: 5});
				};
			});
		},100)
	},
	saveFile = function(data,callback) {//保存文件
		data = data ? data : {};
		CommonUtil.operation({
			moduleName: 'document',
			oper: 'fileCreateOrUpdate',
			params: data,
			forbidConfirm: true
		}, function(res) {
			if(res.success) {
				if(typeof callback == 'function') {
					callback(res.result);
				}
			} else {
				layer.msg(res.message?res.message:'保存失败', {icon: 5});
			}
		});
	},
	folderDetail = function(folderId,callback){
		CommonUtil.operation({
			moduleName: 'document',
			oper: 'folderDetail',
			params: {id:folderId},
			forbidConfirm: true
		}, function(res) {
			if(typeof callback == 'function') {
				callback(res.result)
			}
		});
	},
	changeFolder = function(data) {
		let selectedCate = $(moduleId + ' .templet.selected'),
			name = selectedCate.html();
		
		getFoldersBySelectedCate(function(res) {
			let renderData = res.resultList,
			parentIds = data.parentIds ? data.parentIds: [];
			parentIds.forEach(function(value){
				for(let i = 0; i < renderData.length; i) {
					if(renderData[i].id == value) {
						renderData.splice(i,1);
						
					} else {
						i++
					}
				}
			});
			openChosenFolderPanel({name:name,renderData:renderData},function(res) {
				let pid = res.id;
				CommonUtil.operation({//验证文件名称是否重复
					moduleName: 'document',
					oper: 'existNodeFirLvlName',
					params: {nodeNames:data.fileNames.join(","),targetDirId:pid},
					forbidConfirm: true
				}, function(res) {
					if(res.result) {
						layer.msg('文件参数非法',{icon:5})
						return false;
					};
					CommonUtil.operation({//移动请求
						moduleName: 'document',
						oper: 'move',
						params: {ids:data.ids,mvPid:pid}
					}, function(res) {
						layer.msg('移动成功',{icon: 6});
						getFoldersBySelectedCate(function(res){
							renderTable({data:res.resultList},pid);
						})
					});
				});
				
			})
		})
	},
	remove = function(data,confirmMsg,callback) {//删除文件或者目录
	 	CommonUtil.operation({
			moduleName: 'document',
			oper: 'remove',
			params: data,
			confirmMsg:(confirmMsg ? confirmMsg : '确认删除文件？')
		}, function(res) {
			layer.msg('删除成功',{icon: 6});
			if(typeof callback == 'function') {
				callback()
			}
		});
	},
	getSelect = function(){
		let files = [],
			folders = [];
		$(moduleId + ' input.file:checked').each(function() {
			let parent = $(this).parents('tr');
			files.push({
				pid: parseInt(parent.attr('data-tt-parent-id')),
				id: parseInt(parent.attr('data-tt-id')),
				name: parent.find('.filename').text()
			});  
		});
		$(moduleId + ' input.folder:checked').each(function() {
			let self = $(this),
				parent = self.parents('tr'),
				id = self.val(),
				nodeDomain = parent.attr('data-nodedomain')
			if(parent.hasClass('branch')) {
				folders.push({
					pid:id,
					nodeDomain:nodeDomain
				});
			}  
		});
		return {
			files: files,
			folders: folders
		};
	},
	search = function(data){
		data = data ? data : {};
		let params = $('#operation-info-searchform').serializeObject();
		_this.params = params;
		getFoldersBySelectedCate()
	},
	getFilesByfolderIds = function(data,callback){
		CommonUtil.operation({
			moduleName: 'operation-info',
			oper: 'getFilesByfolderIds',
			params: data,
			forbidConfirm: true
		}, function(res) {
			if(typeof callback == 'function') {
				callback(res.result);
			}
		});
	},
	events = function(){
		$(moduleId + ' .templet-list').unbind().on('click','.templet',function(){//切换分类
			let self = $(this),
				pid = self.attr('data-id'),
				nodeDomain = self.attr('data-nodedomain'),
				name = self.text();
			if(!self.hasClass('selected')) {
				$(moduleId + ' .templet-list .templet').removeClass('selected');
				self.addClass('selected');
				$(moduleId + ' .path').html(name+'主目录');
			}
			folderDetail(pid,function(res) {
				$(moduleId + ' span.number').html(res.fileCount);
			})
			getList({pid:pid,nodeDomain:nodeDomain},function(res){
				renderTable({data:res.resultList})
			})
		});
		/*$($(moduleId + ' .templet-list .templet')[0]).trigger('click');*/
		if(operationCodes.indexOf('edit-cate') != -1 || operationCodes.indexOf('remove-cate') != -1) { // 分类的右键菜单权限
			$(moduleId + ' .templet-list').on('contextmenu','.templet',function(e){//分类的右键菜单
				let self = $(this),
					id = self.attr('data-id'),
					nodeDomain = self.attr('data-nodeDomain');
				e.preventDefault();
				rightMenu({id:id,nodeDomain:nodeDomain,type:'cate',e:e,name:self.text()});
			});
		};
		$(moduleId + ' .add-templet i').unbind().on('click',function(){//添加分类
			openCatePanel({title:'添加分类'});
		});
		$(moduleId + ' a[role="upload-file"]').unbind().on('click',function(){//上传文件
			let selectedCate = $(moduleId + ' .templet.selected'),
				name = selectedCate.html();
				pid = selectedCate.attr('data-id'),
				nodeDomain = selectedCate.attr('data-nodeDomain');
				
			getList({pid:pid,nodeDomain:nodeDomain},function(res){
				if(res.totalCount == 0) {
					layer.msg('当前分类下不存在目录，请添加目录',{icon:5})
					return false;
				}
				openChosenFolderPanel({name:name,renderData:res.resultList},function(res) {
					documendUpload(res);
					setTimeout(function(){
						$('.layui-layer-content .queueList label').trigger('click');
					},150);
				})
			})
		});
		//批量删除/移动
		$(moduleId + ' .opers .btn').on('click',function(){
			let selecteds = getSelect(),
				role = $(this).attr('role'),
				confirmMsg = "确认删除勾选的所有文件？<br>该操作仅删除文件，不会删除文件夹。",
				name = $('#operation-info-searchform input[name="name"]').val();
			if(selecteds.files.length == 0 && selecteds.folders.length == 0) {
				layer.msg('未选中任何文件',{icon:5});
				return false;
			}
			getFilesByfolderIds({name:name,folders:JSON.stringify(selecteds.folders)},function(res) {
				let files = selecteds.files ? selecteds.files : [],
					fileNames = [],
					parentIds = [],
					newFiles = [],
					fileIds = [],
					isSingle = true;//true：表示不重复
				files = files.concat(res)
				files.forEach(function(value,index){
					isSingle = true;
					if(newFiles.length == 0) {
						newFiles.push(value)
					} else {
						newFiles.forEach(function(value2){
							if(value2.id == value.id) {
								isSingle = false;
							}
						})
						if(isSingle) {
							newFiles.push(value);
						}
					}
				});
				newFiles.forEach(function(value){
					parentIds.push(parseInt(value.pid));
					fileNames.push(value.name);
					fileIds.push(value.id)
				})
				parentIds = dedupe(parentIds);
				if(role == 'move') {
					changeFolder({ids:fileIds.join(','),fileNames:fileNames,parentIds:parentIds});
				} else {
					remove({ids:fileIds.join(',')},confirmMsg,function(){
						getFoldersBySelectedCate(function(res){
							renderTable({data:res.resultList},parentIds)
						})
					})
				}
				
			})

			function dedupe(array){
				let arr = array,
					result = [],
					i,
					j,
					len = arr.length;
				for(i = 0; i < len; i++){
					for(j = i + 1; j < len; j++){
						if(arr[i] === arr[j]){
							j = ++i;
						}
					}
					result.push(arr[i]);
				}
				return result;
			};
				
		});
		//搜索
		$('#operation-info-searchform button[role="submit"]').on('click',function(){
			let name = $('#operation-info-searchform input[name="name"]').val();
			if(name && $.trim(name).length > 0 ) {
				search();
			} else {
				layer.msg('搜索字段不能为空',{icon: 5});
			}
		});
		$('#operation-info-searchform').unbind('keydown').keydown('.form-control',function(){
			if(event.keyCode==13){
				$('#operation-info-searchform button[role="submit"]').trigger('click');
				return false;
		    }
		});
		//重置
		$('#operation-info-searchform button[role="reset"]').on('click',function(){
			$('#operation-info-searchform input[name="name"]').val('');
			_this.params = null;
			search();
		});
	
	},
	treeItemEvent = function(el){
		el.unbind('contextmenu');
		el.on('contextmenu','span.box',function(e) {//文件、目录的右键菜单
			let self = $(this).find('span.filename'),
				parent = self.parents('tr'),
				id = parent.attr('data-tt-id'),
				type = 'file';
			if($(this).hasClass('folder')) {
				type = 'folder';
			}
			e.preventDefault();
			rightMenu({id:id,type:type,e:e,el:self});
		});
	},
	
	openNode = function(el,ids) {//展开node
		ids = ids ? ids : [];
		ids.forEach(function(value) {
			el.find('tr[data-tt-id="' + value + '"] .indenter a').trigger('click');
		})
	},
	getFoldersBySelectedCate = function(callback){//根据选中的分类，获取子目录
		let selectedCate = $(moduleId + ' .templet.selected'),
		name = selectedCate.html();
		pid = selectedCate.attr('data-id'),
		nodeDomain = selectedCate.attr('data-nodeDomain');
		getList({pid:pid,nodeDomain:nodeDomain},function(res){
			if(typeof callback == 'function') {
				callback(res)
			} else {
				renderTable({data:res.resultList})
			}
		})
	},
	CheckItems = function(allSelector,itemSelector){
    	let init = function(){
    		// 全选
    		$(allSelector).on('ifChecked', function(event){
    			$(itemSelector).iCheck('check');
    		});
    		// 全不选
    		$($(allSelector).siblings('ins')[0]).on('click', function(){
    			let parent = $(this).parents('.icheckbox_square-green');
    			if(!parent.hasClass('checked')) {
    				$(itemSelector).iCheck('uncheck');
    			}
    		})
    		// 部分选中
    		$(itemSelector).on('ifChecked', function(event){
    			var item_len = $(itemSelector).length,
    				selected_len = $(itemSelector + ':checked').length;

    			if(item_len == selected_len) {
    				$(allSelector).iCheck('check');
    			}
    		});
    		$(itemSelector).on('ifUnchecked', function(event){
    			$(allSelector).iCheck('uncheck');
    		});
    	};
    	
    	
    	this.init = init
    	return this.init(); 	
    };
	return {
		init: init
	}
})()

