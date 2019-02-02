var DocumentManage = (function(){
	let path = [],
		moduleCode,
		operationCodes,
		El,
		rootId = null,
		_this = this;
	let init = function(data){
		El = '#document-manage';
		rootId = data.rootId;
		operationCodes = data.operationCodes?data.operationCodes:'';
		getList({pid:rootId});
		syncDownAviable();
		//新建文件夹
		$(El + ' .add-folder').on('click',function(){
			let pid = $('#document-searchform input[name="pid"]').val();
			folder({pid: pid});
		});
		//上传文件
		$(El + ' .file-upload').on('click',function(){
			let len  = path.length,
				item = path[len-1];
			documendUpload({id:item.k,name:item.v});
			
			setTimeout(function(){
				$('.layui-layer-content .queueList label').trigger('click');
			},350);
		});
		//搜索
		$('#document-searchform button[role="submit"]').on('click',function(){
			let name = $('#document-searchform input[name="name"]').val();
			$('#document-searchform input[name="pid"]').val('');
			if(name && $.trim(name).length > 0 ) {
				search();
			} else {
				layer.msg('搜索字段不能为空',{icon: 5});
			}
		});
		//搜索框内额回车事件
		$('#document-searchform').unbind('keydown').keydown('.form-control',function(){
			if(event.keyCode==13){
				$('#document-searchform button[role="submit"]').trigger('click');
				return false;
		    }
		});
		//重置
		$('#document-searchform button[role="reset"]').on('click',function(){
			$('#document-searchform input[name="page"]').val(1);
			$('#document-searchform input[name="pid"]').val(rootId);
			$('#document-searchform input[name="name"]').val('');
			search();
		});
		//单选框动作时，关闭右键菜单
		$(El + ' tr ins').on('click',function(){
			$('#document-right-memu').addClass('hide');
		});
		//批量删除/移动
		$(El + ' .btns .btn').on('click',function(){
			let ids = getSelect(),
				role = $(this).attr('role'),
				confirmMsg = "确认删除文件？",
				names = [];
			if(ids.length == 0) {
				layer.msg('未选中任何文件或文件夹',{icon:5});
				return false;
			}
			if(role == 'move') {
				ids.forEach(function(value){
					names.push($('#document-table tr[data-id="'+value+'"]').find('span.name').text())
				})
				changeFolder({ids:ids.join(','),fileNames:names});
			} else {
				ids.forEach(function(value){
					let selected = $(El + ' td input[value="'+value+'"]'),
						parent = selected.parents('tr');
					if($(parent[0]).find('span').hasClass('folder-name')) {
						confirmMsg = "文件夹中的内容也会被删除,确认删除？"
					}
				});
				remove({ids:ids.join(',')},confirmMsg)
			}
		});
	},
	getList = function(p) {
		p = p ? p : {};
		CommonUtil.operation({
			moduleName: 'document',
			oper: 'getPage',
			params: p,
			forbidConfirm: true
		}, function(res) {
			res.result.name = res.name;
			res.result.order = res.order;
			path = res.path;
			$(El).attr('data-name',res.name);
			$('#document-searchform input[name="page"]').val(res.result.currentPage?res.result.currentPage:'1');
			$('#document-searchform input[name="pid"]').val(p.pid ? p.pid : rootId);
			$('#document-searchform input[name="name"]').val(res.name);
			pathText({name:res.name,path:path});
			render(res.result);
		});
		
		function render(data) {
			data = data ? data : {};
			let tpl = document_list_tpl.innerHTML,
				view = $(El + ' #document-table'),
				renderData = {
					name: data.name ? data.name: null,
					resultList: data.resultList ? data.resultList : [],
					order: data.order ? data.order: null
				};	
			laytpl(tpl).render(renderData, function(html){
				view.html(html);
				$(El + ' .btns').addClass('hide');
				if(data.totalCount && data.totalCount > 0) {
					$('.i-checks').iCheck({
					    checkboxClass: 'icheckbox_square-green',
					    radioClass: 'iradio_square-green',
					});
					$('#document-page').show();
					pageList({
						modelName: 'document',
						totalCount: data.totalCount,
						limit: data.pageSize,
						curr: data.currentPage
						}, function(obj) {
							$('#document-searchform input[name="name"]').val($(El).attr('data-name'));
							search({limit:obj.limit});
							
					});
					$(El + ' .btns').removeClass('hide');
					if(operationCodes.indexOf('move-file') != -1 && operationCodes.indexOf('move-folder') != -1) { // 批量移动的权限
						$(El + ' .btns .batch-move').removeClass('hide')
					} else {
						$(El + ' .btns .batch-move').addClass('hide')
					};
					if(operationCodes.indexOf('remove-file') != -1 && operationCodes.indexOf('remove-folder') != -1) { // 批量删除的权限
						$(El + ' .btns .batch-remove').removeClass('hide')
					} else {
						$(El + ' .btns .batch-remove').addClass('hide')
					};
					if($(El + ' .btns .batch-remove').hasClass('hide') && $(El + ' .btns .batch-move').hasClass('hide')) {
						$(El + ' table .i-checks input').attr('disabled','disabled');
					}
					if(operationCodes.indexOf('download') == -1) { // 下载权限
						$(El + ' table .download').remove();
					};
					//选中及不选中
					CommonUtil.itemsCheck({
						allSelector: El + ' input[name="selected-all"]',
						itemSelector: El + ' input[name="file-item"]'
					});
					//右键菜单
					let lockContextMenu = false;
					$(El + ' td .name').unbind('contextmenu').on('contextmenu', function(e) {
						e.preventDefault();
						let menu = $('#document-right-memu'),
							self = $(this),
							parent = self.parents('tr'),
							id = parent.attr('data-id'),
							confirmMsg = "确认删除？"
							html = null;
						if(self.hasClass('folder-name')) {
							html = '<li role="edit">重命名</li>'+
									'<li role="move">移动</li>'+
									'<li role="remove">删除</li>';
							confirmMsg = "文件夹中的内容也会被删除,确认删除？"
						} else {
							html = '<li role="move">移动</li>'+
									'<li role="remove">删除</li>';
						}
						menu.html(html);
						if(self.hasClass('folder-name')) {
							if(operationCodes.indexOf('re-name-folder') == -1) { // 重命名权限
								menu.find('li[role="edit"]').remove();
							};
							if(operationCodes.indexOf('move-folder') == -1) { // 文件夹移动权限
								menu.find('li[role="move"]').remove();
							};
							if(operationCodes.indexOf('remove-folder') == -1) { // 文件夹删除权限
								menu.find('li[role="remove"]').remove();
							};
						} else {
							if(operationCodes.indexOf('move-file') == -1) { // 文件移动权限
								menu.find('li[role="move"]').remove();
							};
							if(operationCodes.indexOf('remove-file') == -1) { // 文件删除权限
								menu.find('li[role="remove"]').remove();
							};
						}
						
						/*if (!lockContextMenu) {*/
							//根据事件对象中鼠标点击的位置，进行定位
							menu.css('left', e.clientX + 'px');
							menu.css('top', e.clientY + 'px');
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
									changeFolder({ids:id})
								}
								// 移除
								if (role === 'remove') {
									remove({ids:id},confirmMsg);
								}
								// 编辑
								if (role === 'edit') {
									CommonUtil.operation({
										moduleName: 'document',
										oper: 'folderDetail',
										params: {id:id},
										forbidConfirm: true
									}, function(res) {
										folder(res.result);
									});
									
								}
							});
						/*}*/
					});
					//排序
					$(El + ' .footable-sort-indicator').on('click', function(){
						let self = $(this),
							order = null;
						if(self.hasClass('sort-asc')) {
							self.addClass('sort-desc');
							self.removeClass('sort-asc');
							search({order:'desc'})
						} else {
							self.removeClass('sort-desc');
							self.addClass('sort-asc');
							search({order:'asc'})
						}
					});
					//进入子文件夹
					$(El + ' .folder-name').on('click', function(){
						let self = $(this),
							parent = self.parents('tr'),
							id = parent.attr('data-id');
						getList({pid:id});
					});
					//下载文件 
					$(El + ' .download').on('click', function(){
						let self = $(this),
							parent = self.parents('tr'),
							fileName = parent.find('.name').html(),
							url = base  + "file/download?url=" + self.attr('data-url') + '&fileName=' + fileName;
				
						document.getElementById("ifile").src = url;
					});
					//打包下载文件
					$(El + ' .package').on('click',function(){
						let self = $(this),
							parent = self.parents('tr'),
							packageFileName = parent.find('.name').html(),
							id = parent.attr('data-id'),
							available = parent.find('td[data-available]').attr('data-available');
						package_download({dirId: id,available: available,packageFileName: packageFileName});
					});
					//文件预览
					$(El + ' td[role="filepreview"] .name').unbind('click').on('click', function(){
						let self = $(this),
							parent = self.parents('tr'),
							fileName = parent.find('.name').text(),
							pathUrl = parent.find('.download').attr('data-url');
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
				} else {
					$('#document-page').hide();
				}
			});
		};	
	}, 
	folder = function(data, callback){//新建或者编辑文件夹
		let tpl = document_form_tpl.innerHTML,
			view = null,
			folderOpen = null;
		setTimeout(function(){
			folderOpen = layer.open({
				type : 1,
				title : data.id?'重命名文件夹':'新建文件夹',
				shadeClose: false,
				closeBtn: 0, 
				anim: 2,
				skin : 'layui-layer-rim', //加上边框
				area : [ '400px', '140px' ], //宽高
				content : '<div class="document-form-open"></div>',
				end: function() {
					layer.close(folderOpen);
				}
			});
			view = $('.document-form-open');
			laytpl(tpl).render({}, function(html){
				view.html(html);
				$('.document-form-open #document-form input[name="name"]').focus();
				if(data.id) {
					CommonUtil.formDataSetAndGet({container: '.document-form-open #document-form', data:data})
				};
				$('.document-form-open #document-form a.btn').on('click',function(){
					layer.close(folderOpen);
				});
				$('.document-form-open #document-form').validate({
				    rules: {
				        name: {
				        	required: true,
			            	rangelength: [1,20]
				        }
				    },
				    messages: {
				        name: {
				        	required: icon + "请输入文件夹的名称",
			     	        rangelength: icon + "文件夹的名称长度介于2-20之间" 
				        }
				    },
				    submitHandler:function(form){
				    	var submitObj = $(form).serializeObject();
				    	submitObj.pid = data.pid;
				    	CommonUtil.operation({
							moduleName: 'document',
							oper: 'folderCreateOrUpdate',
							oper_cn: '保存',
							params: submitObj
						}, function(res) {
							$('#document-searchform input[name="name"]').val($(El).attr('data-name'));
							layer.close(folderOpen);
							layer.msg('保存成功',{icon:6});
							search();
							if(typeof callback == 'function') {
								callback(res);
							}
						});
				    }
				});
			});
		});	
	},
	changeFolder = function(data){//移动文件
		let tpl = document_change_folder_tpl.innerHTML,
			view = null,
			changeIds = data.ids.split(','),
			changeFolderOpen = layer.open({
				type : 1,
				title : '移动文件',
				shadeClose: false,
				closeBtn: 1, 
				anim: 2,
				skin : 'layui-layer-rim', //加上边框
				area : [ '500px', '400px' ], //宽高
				btn: ['确认','取消'],
				content : '<div class="change-folder-open">' + $('.document-change-panel').html() + '</div>',
				yes: function(){
					let selectedEl = $('.change-folder-open .selected');
					if(selectedEl.length == 0) {
						layer.msg('未选中任何文件夹',{icon: 5});
					} else {
						let mvPid = selectedEl.parent().attr('data-id');
						CommonUtil.operation({//验证文件名称是否重复
							moduleName: 'document',
							oper: 'existNodeFirLvlName',
							params: {nodeNames:data.fileNames.join(','),targetDirId:mvPid},
							forbidConfirm: true
						}, function(res) {
							console.log('res',res)
							if(res.result) {
								layer.msg('文件参数非法',{icon:5})
								return false;
							};
							CommonUtil.operation({
								moduleName: 'document',
								oper: 'move',
								oper_cn: '移动',
								params: {ids:changeIds.join(','),mvPid:mvPid}
							}, function(res) {
								layer.close(changeFolderOpen);
								layer.msg('移动成功',{icon: 6});
								$('#document-searchform input[name="name"]').val($(El).attr('data-name'));
								search();
							});
						});
					}
				}
			});
		view = $('.change-folder-open .folders');
		renderFolder({view:view,d:[{id:rootId,name:"文档库"}]})
		function renderFolder(p) {
			let tempView = p.view;
			laytpl(tpl).render(p.d, function(html){
				tempView.html(html);
				$('.change-folder-open .folders').unbind().on('click','.item',function(){
					let self = $(this),
						tempId = self.parent().attr('data-id');
					if(!self.hasClass('selected')) {
						$('.change-folder-open .folders .item').removeClass('selected');
						self.addClass('selected');
					};
					if(self.hasClass('open')) {
						self.next('ul').addClass('hide');
						self.removeClass('open');
						self.addClass('retracted');
						self.find('i').removeClass('fa-folder-open');
						self.find('i').addClass('fa-folder');
					} else {
						getChildren({pid:tempId},function(res){
							duplicateRemoval({data:res,el:self});
						});
					}
				});
				$('.change-folder-open .add-folder').unbind().on('click',function(){
					let sEl = $('.change-folder-open .selected');
						pid = rootId;
					if(sEl.length > 0) {
						pid = sEl.parent().attr('data-id');
					}
					folder({pid:pid},function(res){
						getChildren({pid:pid},function(res){
							selectdInit(changeIds);
							duplicateRemoval({data:res,el:sEl});
							
						});
					});
				});
				if(p.d.length == 1 && p.d[0].id == rootId) {
					$('.change-folder-open .folders .item').trigger('click');
				}
			});
		};
		function duplicateRemoval(data) {//去重
			let d = data.data,
				el = data.el,
				len = d.length,
				isSame = null,
				tempList = [];
			for(let i = 0; i < len; i++) {
				isSame = "false";
				for(let j = 0; j < changeIds.length; j++) {
					if(changeIds[j] == d[i].id) {
						isSame = "true";
					}
				};
				if(isSame == "false") {
					tempList.push(d[i]);
				}
			};
			if(tempList.length > 0) {
				renderFolder({view: el.next('ul'),d:tempList});
				el.next('ul').removeClass('hide');
				el.removeClass('retracted');
				el.addClass('open');
				el.find('i').removeClass('fa-folder');
				el.find('i').addClass('fa-folder-open');
			}
		};
		function getChildren(data,callback){
			data = data ? data : {};
			data.pid = data.pid ? data.pid : rootId;
			data.limit = 1000;
			data.nodeType = 10;
			CommonUtil.operation({
				moduleName: 'document',
				oper: 'getPage',
				params: data,
				forbidConfirm: true
			}, function(res) {
				if(!res.success) {
					layer.msg('文件夹查询失败',{icon:5});
					return false;
				}
				if(typeof callback == 'function') {
					callback(res.result.resultList)
				}
			});
		};
	},
	remove = function(data,confirmMsg) {
	 	CommonUtil.operation({
			moduleName: 'document',
			oper: 'remove',
			params: data,
			oper_cn: '删除文件'
		}, function(res) {
			layer.msg('删除成功',{icon: 6});
			$('#document-searchform input[name="name"]').val($(El).attr('data-name'));
			search();
		});
	},
	getSelect = function(){
		let ids = [];
		$(El + ' input[name="file-item"]:checked').each(function() {  
			ids.push($(this).val());  
		});
		return ids;
	},
	pathText = function(p){
		let data = p ? p : {},
			tempIndex = null,
			tpl = document_path_tpl.innerHTML,
			view = $(El + ' ul.path');
		
		laytpl(tpl).render(data, function(html){
			view.html(html);
			$(El + ' ul.path li').unbind().on('click',function(){//路径改变
				let id = $(this).attr('data-id');
				id  = id ? id : rootId;
				$('#document-searchform input[name="pid"]').val(id);
				search();
			});
			$(El + ' ul.path a').unbind().on('click',function(){//路径回退
				let tempId = null,
					len = null;

				path = path.slice(0,-1);
				len = path.length;
				$('#document-searchform input[name="page"]').val(1);
				$('#document-searchform input[name="name"]').val('');
				if(len == 0 ) {
					tempId = rootId;
				} else {
					tempId = path[len-1].k;
				};
				$('#document-searchform input[name="pid"]').val(tempId);
				search();
			});
		})
	},
	documendUpload = function(data){
		let fileUpload = new EminAontherFileUpload();
		setTimeout(function() {
			fileUpload.init({
				title: '上传本地文件',
				confirmMsg: '您确定要将选中文件上传至<strong> ' + data.name + ' </strong>吗',
				fileNumLimit: 1,
				fileSingleSizeLimit: 10,
				uploadUrl: '/file/universalUpload.do',
				filesType: ['all'],
				data:{id:data.id}
			}, function(res) {
				if(res.success){
					let params = res.result.storage[0];
					params.name = $('#uploadInterface .filelist .title').html();
					params.fileType = res.result.originalMimeType;
					params.contentType = res.result.originalContentType;
					params.pid = $('#document-searchform input[name="pid"]').val();
					params.storePath = params.fileStorageUrl;
					params.storeHost = params.destinationStorageHost;
					params.fileStoreId = params.fileId;
					delete params.fileStorageUrl;
					delete params.destinationStorageHost;
					delete params.fileId;
					CommonUtil.operation({
						moduleName: 'document',
						oper: 'fileCreateOrUpdate',
						params: {fileDto:JSON.stringify(params)},
						forbidConfirm: true
					}, function(res) {
						console.log('res',res)
						if(res.success) {
							layer.closeAll();
							layer.msg('上传文件成功', {icon: 6});
							$('#document-searchform input[name="name"]').val($(El).attr('data-name'));
							search();
						} else {
							layer.msg(res.message?res.message:'上传文件失败', {icon: 5});
						}
					});
				} else {
					layer.msg(res.message?res.message:'上传文件失败', {icon: 5});
				};
				layer.closeAll();
			});
		},300)
	},
	search = function(data){
		data = data ? data : {};
		let params = $('#document-searchform').serializeObject();
		params.limit = data.limit ? data.limit : 20;
		if(data.order) {
			params.order =  data.order
		};
		getList(params);
		
	},
	//在打包下载之前进行验证
	checkBeforePackage = function(data,callback) {
		CommonUtil.operation({
			moduleName: 'file',
			oper: 'document/'+data.dirId+'/check',
			type: 'get',
			params: data.params,
			forbidConfirm: true,
			forbidLoading: false,
		}, function(res) {
			if(res.success) {
				if(typeof callback == 'function') {
					callback()
				}
			} else {
				layer.msg(res.message,{icon:5})
			}
			
		})
	},
	package_download = function(data) {
		
		checkBeforePackage({dirId: data.dirId},function(res){
			let url = base  + 'file/document/' + data.dirId + '/package?packageFileName=' + data.packageFileName;
			if(data.available <= _this.syncDownAviable) {
				document.getElementById("ifile").src = url;
			} else {
				let syncDownAviableM = (_this.syncDownAviable/1024/1024).toFixed(2);
				layer.confirm('该压缩包为超大文件(大于' + syncDownAviableM + 'M)，是否确认下载？', {
					btn: ['确认'] //按钮
				}, function(){
					document.getElementById("ifile").src = url;
				});
			}
		})
	},
	syncDownAviable = function() {
		CommonUtil.operation({
			moduleName: 'file',
			oper: 'document/syncDownAviable',
			type: 'get',
			params: {},
			forbidConfirm: true
		}, function(res) {
			_this.syncDownAviable = res.result;
		});
	};
	selectdInit = function(data){
		data = data ? data : [];
		data.forEach(function(value){
			$(El + ' input[value="'+ value +'"]').iCheck('check');
		});
	};
	return {
		init: init
	}
})();