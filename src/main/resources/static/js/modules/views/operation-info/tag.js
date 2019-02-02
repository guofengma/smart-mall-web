var TagManage = (function(){
	let selectedTagList = [],
		tagLib = [],
		removeIds = [],
		resourceId,
		operationCodes = null;
	let getTagLib = function(data,callback){
		data.page = data.page ? data.page: 1;
		data.limit = data.limit ? data.limit : 20;
		CommonUtil.operation({
			moduleName: 'tag-lib',
			oper: 'page',
			params: {params:JSON.stringify(data.params),page:data.page},
			forbidConfirm: true
		}, function(res) {
			
			let result = res.result,
				pageId = 'tag-library-page';
			tagLib = result.resultList ? result.resultList : [];
			renderTagLib({data:result,params:data.params});
			$('.tag-open .tag-library-page').attr('id',pageId);
			if (result.totalPageNum > 1) {
				laypage.render({
				    elem: pageId,
				    curr: result.currentPage,
				    count: result.totalCount,
				    layout: ['count', 'prev', 'next'],
				    jump: function(obj, first){
				      if(!first){
				    	  data.page = obj.curr;
				    	  getTagLib(data);
				      };
				      $('#' + pageId + ' .layui-laypage-count').html('共 ' + result.totalCount + ' 条&nbsp;&nbsp;共 ' + result.totalPageNum + ' 页');
				    }
				});
				$('#' + pageId + ' .layui-laypage-count').html('共 ' + result.totalCount + ' 条&nbsp;&nbsp;共 ' + result.totalPageNum + ' 页');
			} else {
				$('#' + pageId).html('');
			}
			if(typeof callback == 'function') {
				callback(res.result);
			}	
		});
	},
	renderTagLib = function(p){
		let html = '',
			el = $('.tag-open .tag-library');
		tagLibSelected();
		if(tagLib.length > 0) {
			tagLib.forEach(function(value) {
				html += '<a class="tag ' + value.selected + '" data-id="' + value.id + '">' + value.name + '<i class="fa fa-remove"></i></a>'
			})
		} else {
			html = '暂无数据';
		}
		el.html(html);
		if(operationCodes.indexOf('remove-label') == -1) {//删除标签的权限
			el.find('i.fa-remove').remove();
		}
	},
	tagLibSelected = function(){
		tagLib.forEach(function(value1,index1) {
			tagLib[index1].selected = '';
			selectedTagList.forEach(function(value2) {
				if(value1.name == value2.name) {
					tagLib[index1].selected = 'selected';
				}
			})
		});
	},
	getFileTags = function(data,callback) {
		resourceId = data.resourceId;
		CommonUtil.operation({
			moduleName: 'operation-info',
			oper: 'getFileTags',
			params: {params: JSON.stringify(data)},
			forbidConfirm: true
		}, function(res) {
			if(typeof callback == 'function') {
				callback(res.result);
			}	
		});
	},
	renderChosenTags = function(data,el) {
		let html = '';
		data = data ? data: [];
		data.forEach(function(value) {
			html += '<a class="tag" data-id="' + value.id + '">' + value.name + '<i class="fa fa-remove"></i></a>';
		});
		el.html(html);
		renderTagLib();
	},
	openTagPanel = function(data){
		data = data ? data : {};
		let tagOpenIndex;
		removeIds = [];
		selectedTagList = data.tags ? data.tags : [];
		setTimeout(function(){
			tagOpenIndex = layer.open({
				type : 1,
				title : '修改文件标签',
				shadeClose: false,
				closeBtn: 1, 
				anim: 2,
				skin : 'layui-layer-rim', //加上边框
				area : [ '650px', '420px' ], //宽高
				content : '<div class="tag-open">' + $('.tag-chosen-panel').html() + '</div>',
				yes: function(){
					
				}
			});
			let tagOpen = $('.tag-open');
			tagOpen.find('.above').remove();
			openEvent(tagOpen);
			renderChosenTags(selectedTagList,tagOpen.find('.selected-tags'));
			tagOpen.find('.save').unbind().on('click',function(){
				let tempObj = {};
				if(selectedTagList.length > 2) {
					layer.msg('标签数量不能超过2个',{icon:5})
					return false;
				}
				if(selectedTagList.length > 0) {
					let tagLibParams = {
							type: 1,
							resourceCode: 'maintenance',
							values:[]
						},
						tagParams = [];
					selectedTagList.forEach(function(value){
						let name = value.name;
						tagLibParams.values.push(name);
						tagParams.push({
							resourceCode: 'maintenance',
							resourceId: resourceId,
							name: name,
							value: name
						});
					})
					tempObj = {
						tagParams:JSON.stringify(tagParams),
						tagLibParams:JSON.stringify(tagLibParams)
					}
				}
				tempObj.ids = removeIds.join(',');
				addTags(tempObj,function(res){
					layer.close(tagOpenIndex)
					layer.msg('保存成功',{icon:6});
					getFileTags({
						resourceCode: 'maintenance',
						resourceId: resourceId
					},function(res){
						let html = '';
						if(res.resultList.length > 0) {
							res.resultList.forEach(function(value) {
								html += '<span tag-id="' + value.id + '">'+value.name+'</span>&nbsp';
							})
						}
						$('.operation-info-table tr[data-tt-id="' + resourceId +'"] .tags').html(html);
					})
				});
			})
		})
	},
	tagLibRemoveTags = function(ids,callback) {
		CommonUtil.operation({
			moduleName: 'tag-lib',
			oper: 'remove',
			params: {ids:ids},
			forbidConfirm: true
		}, function(res) {
			if(typeof callback == 'function') {
				callback(res.result);
			}	
		});
	},
	addTags = function(data, callback){
		CommonUtil.operation({
			moduleName: 'operation-info',
			oper: 'addTags',
			params: data,
			forbidConfirm: true
		}, function(res) {
			if(typeof callback == 'function') {
				callback(res.result);
			}	
		});
	},
	selectedTagListOper = function(p) {
		let isChosn = false,
			chosenId = null;
		selectedTagList.forEach(function(value, index){
			if(value.name == p.name) {
				chosenId = index;
				isChosn = true;
			}
		})
		if(p.oper == 'add') {
			if(selectedTagList.length >= 2) {
				layer.msg('标签数量不能超过2个',{icon:5})
				return false;
			}
			if(!isChosn) {
				selectedTagList.push({name:p.name})
			}
		}
		if(p.oper == 'remove') {
			if(isChosn) {
				selectedTagList.splice(chosenId,1)
			}
		}
	},
	tagNameIsSingle = function(name) {
		let isSingle = true;
		selectedTagList.forEach(function(value){
			if(value.name == name) {
				isSingle = false; 
			}
		})
		return isSingle;
	},
	openEvent = function(openEl,data){
		selectedTagList = data ? data :selectedTagList;
		renderChosenTags(selectedTagList,openEl.find('.selected-tags'));
		openEl.find('.selected-tags').unbind().on('click', 'i', function(){//删除文档的标签（这里是删除界面上的数据，不是真正的删除）
			let self = $(this),
				parent = self.parent(),
				name = parent.text();
			selectedTagList.forEach(function(value,index){
				if(value.name == name) {
					selectedTagList.splice(index, 1);
					if(value.id) {
						removeIds.push(value.id);
					}
				}
			});
			renderChosenTags(selectedTagList,openEl.find('.selected-tags'));
		});
		openEl.find('.add-tag-box .add').unbind().on('click', function(){
			let name = openEl.find('.add-tag-box input').val();
			name.trim();
			if(name.length == 0 ) {
				layer.msg('标签不能为空',{icon:5})
			} else if(name.length > 6) {
				layer.msg('标签的长度不能超过6个字符',{icon:5})
			} else {
				if(tagNameIsSingle(name)) {
					if(selectedTagList.length >= 2) {
						layer.msg('标签数量不能超过2个',{icon:5})
						return false;
					}
					selectedTagList.push({name:name});
					renderChosenTags(selectedTagList,openEl.find('.selected-tags'));
				}
				openEl.find('.add-tag-box input').val('');
			}
		});
		openEl.find('.get-tag-library').unbind().on('click', function(){//展示标签库
			let params = {type:1,resourceCode:'maintenance'};
			openEl.find('.tag-library').toggleClass('hide');
			openEl.find('.tag-library-page').toggleClass('hide');
			if(!openEl.find('.tag-library').hasClass('hide')) {
				openEl.find('.tag-library').removeClass('hide').html('');
				getTagLib({params:params});
			}
		});
		openEl.find('.tag-library').unbind().on('click', 'i', function(e){//删除标签库中的标签
			e.stopPropagation();
			tagLibRemoveTags($(this).parent().attr('data-id'),function(){
				let params = {type:1,resourceCode:'maintenance'};
				getTagLib({params:params});
			})
		});
		openEl.find('.tag-library').on('click', 'a', function(e){//选中标签
			e.stopPropagation();
			let self = $(this),
				name = self.text(),
				oper = 'remove';
			self.toggleClass('selected');
			if(self.hasClass('selected')) {
				oper = 'add';
			};
			selectedTagListOper({name:name,oper:oper})
			renderChosenTags(selectedTagList,openEl.find('.selected-tags'));
		});
		
	},
	init = function(p){
		operationCodes = p.operationCodes;
	};
	return {
		openTagPanel: openTagPanel,
		getFileTags: getFileTags,
		openEvent: openEvent,
		init:init
	}
})();