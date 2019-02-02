var groupMembers = (function(){
	let El = '.repair-group-member-list',
		searchFormSelector = '#repair-group-member-list-searchform',
		tableSelector = '#repair-group-member-list-table',
		_this = this;
	let init = function(data){
		data = data ? data : {};
		_this.currentUserIsManager = data.currentUserIsManager;
		_this.groupId = $(searchFormSelector + ' input[name="teamId"]').val();
		getpage({teamId:_this.groupId},function(res){
			renderTable(res)
		});
		eventInit();
	},
	getpage = function(data,callback,rememberParams){
		data = data ? data : {};
		if(!rememberParams || !rememberParams==false){
			_this.params = data;
		}
		CommonUtil.ajaxRequest({
			url: 'repair-group/getTeamMemberList',
			type: 'get',
			data: data,
			forbidConfirm: true,
			forbidLoading: false,
		}, function(res) {
			if(typeof callback == 'function') {
				callback(res.result)
			}
		});
	},
	/* 渲染列表，绑定方法 */
	renderTable = function(data) {
		if(!data) {
			return false;
		}
		let tpl = repairGroupMemberListTpl.innerHTML,
			view = $(tableSelector + ' tbody'),
			renderData = data.resultList;
		laytpl(tpl).render({isManager:_this.currentUserIsManager,data:renderData}, function(html){
			view.html(html);
			$('.i-checks').iCheck({
			    checkboxClass: 'icheckbox_square-green',
			    radioClass: 'iradio_square-green',
			});
			CommonUtil.itemsCheck({
				allSelector: tableSelector + ' input[name="selected-all"]',
				itemSelector: tableSelector + ' input[name="member-item"]'
			});
			$(tableSelector + ' input[name="selected-all"]').iCheck('uncheck');
			//移除组员
			view.find('td .cancel').on('click',function(){
				let parent = $(this).parents('tr'),
					memberId = [$(this).attr('data-id')],
					memberName = parent.find('td.name').text();
				
				cancelMember(memberId, '确认移除 ' + memberName + '?');
			})	
		})
		_this.totalMembers = data.totalMembers;
		$(El + ' .num span').html(_this.totalMembers);
		if(data.totalCount > 0) {
			initTable({
				modelName: 'repair-group-member-list',
				curr: data.currentPage,
				limit: data.pageSize,
				totalPage: data.totalPageNum,
				totalCount: data.totalCount
			},function(res){
				_this.params.limit = res.limit;
				_this.params.page = res.curr;
				getpage(_this.params,function(res){
					renderTable(res)
				})
			});
			//按名字排序
			$(El + ' th.footable-sortable').unbind().on('click',function(){
				let order = 'footable-sorted footable-sorted-desc',
					parent = $(this);
				if(parent.hasClass('footable-sorted')) {
					parent.removeClass('footable-sorted');
					parent.addClass('footable-sorted-desc');
					order = 'desc';
				} else {
					parent.removeClass('footable-sorted-desc');
					parent.addClass('footable-sorted');
					order = 'asc'
				}
				_this.params.order = order;
				_this.params.sort = 'realName';
				getpage(_this.params,function(res){
					renderTable(res)
				})
			})
			$(El + ' .cancelMembers').removeClass('hide');
		} else {
			$('#repair-group-member-list-page').html();
			$(El + ' .cancelMembers').addClass('hide');
		}
	},
	openpanel = function(groupId){
		CommonUtil.ajaxRequest({
			url: 'user/add-members',
			type: 'get',
			data: {id: groupId},
			forbidConfirm: true,
			forbidLoading: false,
		}, function(res) {
			layer.open({
				type: 1,
				title: '添加组员',
				shadeClose: false,
				closeBtn: 1, 
				anim: 2,
				skin : 'layui-layer-rim', //加上边框
				area : [ '850px', '470px' ], //宽高
				btn: ['确定'],
				content : '<div class="add-members-open">' + res + '</div>',
				yes: function(lindex){
					if(chooseMemberManageFn.memberList.length == 0) {
						layer.msg('请选择人员',{icon:5});
						return false;
					}
					
					CommonUtil.operation({
						moduleName: 'repair-group',
						oper: 'saveTeamMember',
    					oper_cn: '保存',
						params: {
							teamId:_this.groupId,
							teamMemberDtos:JSON.stringify(chooseMemberManageFn.memberList)
						}
					}, function(res) {
						getpage(_this.params,function(res){
							renderTable(res)
						})
						layer.close(lindex);
						layer.msg('保存成功！', {icon: 6,time: 2000});
					});
				}
			});
			let openSelector = $('.add-members-open');
			openSelector.find('.repair-group-choose-member').css({'margin-top':'20px','border':'none'})
		})	
	},
	/*移除组员 */
	cancelMember = function(data,confirmMsg){
		let dissolve = false;//默认不解散班组
		confirmMsg = confirmMsg? confirmMsg :'确认移除？';
		if(_this.totalMembers < (data.length + 1)) {
			confirmMsg = '移除后将自动解散该组，是否继续操作？',
			dissolve = true;
		}
		layer.confirm(confirmMsg, {
			title: '提示',
			btn: ['是','否'] //按钮
		}, function(){
			CommonUtil.operation({
				moduleName: 'repair-group',
				oper: 'delTeamMembers',
				oper_cn: '移除',
				type: 'get',
				forbidConfirm: true,
				params: {
					teamId: _this.groupId,
					memberIds: data.join(','),
					dissolve: dissolve
				}
			}, function(res) {
				if(dissolve) {
					goPage('index',{subModule:'repair-group'});
				} else {
					getpage(_this.params,function(res){
						renderTable(res)
					})
					layer.msg('移除成功！', {icon: 6,time: 2000});
				}
			});
		})
	},
	//角色转让，用于转让管理员或重设组长
	transferRole = function(data,callback){
		let selectedId = data.selectedId;
		getpage({teamId:_this.groupId,limit:10},function(res) {
			layer.open({
				type: 1,
				title: data.title,
				shadeClose: false,
				closeBtn: 1, 
				anim: 2,
				skin : 'layui-layer-rim', //加上边框
				area : [ '600px', '550px' ], //宽高
				btn: ['确定'],
				content : '<div class="transfer-manager-open">' + $('.transferManagerTableTpl-view').html() + '</div>',
				yes: function(lindex){
					let selectedInput = $('.transfer-manager-open input[name="memberId"]:checked'),
						memberId = selectedInput.val(),
						mamberName = selectedInput.parents('tr').find('.name').html();
					if(!memberId){
						layer.msg('未选择组员',{icon:5});
						return false;
					}
					if(typeof callback == 'function') {
						callback({mamberName:mamberName,memberId:memberId,lindex: lindex})
					}
				}
			});
			let openEl = $('.transfer-manager-open');		
			openEl.find('.page').attr('id','transfer-manager-table-page');
			renderTableData(res);
		},false)
		
		var renderTableData = function (data){
			let tpl = transferManagerTableTpl.innerHTML,
				view =$('.transfer-manager-open tbody'),
				renderData = data.resultList,
				pageId = 'transfer-manager-table-page';
			laytpl(tpl).render(renderData, function(html){
				view.html(html);
				$('.transfer-manager-open .i-checks').iCheck({
				    checkboxClass: 'icheckbox_square-green',
				    radioClass: 'iradio_square-green',
				});
				view.find('input[value="'+selectedId+'"]').iCheck('check');
			});
			if(data.totalPageNum > 1){
				laypage.render({
				    elem: pageId,
				    curr: data.currentPage,
				    count: data.totalCount,
				    layout: ['count', 'prev', 'page', 'next'],
				    jump: function(res, first){
				      	if(!first){
				    	  	getpage({teamId:_this.groupId,limit:res.limit,page:res.curr},function(res) {
				    	  		renderTableData(res);
							},false)
				      	};
				    }
				});
			} else {
				$('#' + pageId).html('')
			}
		};
	},
	getSelectedMemberIds = function(){
		let memberIds = [];
		$(El + ' input[name="member-item"]:checked').each(function() {
			memberIds.push($(this).val());
		});
		return memberIds;
	},
	search = function(){
		let formData = $(searchFormSelector).serializeObject();
		getpage(formData,function(res){
			renderTable(res)
		});
	},
	eventInit = function(){
		$(searchFormSelector + ' .submit').unbind().on('click',function(){
			search();
		});
		//搜索框内额回车事件
		$(searchFormSelector).unbind('keydown').keydown('.form-control',function(event){
			if(event.keyCode==13){
				$(searchFormSelector + ' button.submit').trigger('click');
				return false;
		    }
		});
		$(searchFormSelector + ' .reset').unbind().on('click',function(){
			CommonUtil.formDataSetAndGet({
				container: searchFormSelector,
				data: {
					page: 1,
					keyword: '',
					flockId: ''
				}
			})
			search();
		});
		//添加组员
		$(El + ' .add-member').unbind().on('click',function(){
			openpanel(_this.groupId);
		})
		//批量移除
		$(El + ' .cancelMembers').unbind().on('click',function(){
			let memberIds = getSelectedMemberIds();
			if(memberIds.length < 1) {
				layer.msg('请先选中组员',{icon:5});
				return false;
			}
			cancelMember(memberIds,'确认移除选中项？');
		})
		//管理员权限转让
		$(El + ' .transfer-manager').unbind().on('click',function(){
			let managerId = $(this).attr('data-id');
			transferRole({title:'转让管理员',selectedId: managerId},function(res){
				let lindex = res.lindex;
				CommonUtil.operation({
					moduleName: 'repair-group',
					oper: 'transferManager',
					type: 'get',
					confirmMsg:'确认将' + res.mamberName +  '设置为管理员？',
					params: {
						teamId: _this.groupId,
						memberId: res.memberId
					}
				}, function(res) {
					layer.close(lindex);
					layer.msg('转让成功！', {icon: 6,time: 2000});
					location.reload()
				});
			});
		})
		//设置组长
		$(El + ' .transfer-leader').unbind().on('click',function(){
			let leaderId = $(this).attr('data-id');
			transferRole({title:'重设组长',selectedId: leaderId},function(res){
				let lindex = res.lindex;
				CommonUtil.operation({
					moduleName: 'repair-group',
					oper: 'resetTeamLeader',
					type: 'get',
					confirmMsg:'确认将' + res.mamberName +  '设置为管组长？',
					params: {
						teamId: _this.groupId,
						memberId: res.memberId
					}
				}, function(res) {
					layer.close(lindex);
					layer.msg('转让成功！', {icon: 6,time: 2000});
					location.reload()
				});
			});
		})
	};
	return {
		init: init
	}
}());