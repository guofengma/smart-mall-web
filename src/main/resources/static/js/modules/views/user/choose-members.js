(function(w){
	var ChooseMemberManage = function(data){
		data = data ? data : {}
		ChooseMemberManage.prototype.groupId = data.groupId ? data.groupId : null;
		ChooseMemberManage.prototype.membersTableSelector = data.membersTableSelector ? data.membersTableSelector:".repair-group-choose-member .member-list .list-container",
		ChooseMemberManage.prototype.ChooseTableSelector = data.ChooseTableSelector ? data.ChooseTableSelector : "#repair-group-member-choose-table",
		ChooseMemberManage.prototype.searchFormSeletor = data.searchFormSeletor ? data.searchFormSeletor : '#repair-group-choose-member-searchform',
		ChooseMemberManage.prototype.memberList = [];
		ChooseMemberManage.prototype.noGroupmembers = [];
	};
	
	/*获取待选择的人员的数据*/
	ChooseMemberManage.prototype.getPage = function(data,callback){
		data = data ? data : {};
		data.page = 1;
		data.limit = 10000;
		ChooseMemberManage.prototype.params = data
		CommonUtil.ajaxRequest({
			url: 'repair-group/choiceTeamMember',
			type: 'get',
			data: data,
			forbidConfirm: true,
			forbidLoading: false,
		}, function(res) {
			if(typeof callback === 'function') {
				ChooseMemberManage.prototype.noGroupmembers = res.result
				callback(res);
			}
		})	
	};
	/*渲染待选择的人员列表，绑定选中事件*/
	ChooseMemberManage.prototype.renderpage = function(res){
		let data = ChooseMemberManage.prototype.noGroupmembers,
			tpl = repairGroupMmberChooseTpl.innerHTML,
			view = $(ChooseMemberManage.prototype.ChooseTableSelector + ' tbody');
		
		if(ChooseMemberManage.prototype.memberList.length > 0 && data.length > 0) {
			let memberList = ChooseMemberManage.prototype.memberList;
			memberList.forEach(function(v1){
				data.forEach(function(v2,index2) {
					if(v1.userId == v2.id) {
						data[index2].isChosen = true;
					}
				})
			})
		}
		
		laytpl(tpl).render(data, function(html){
			view.html(html);
			view.find('tr i[role="add"]').unbind().on('click',function(){
				let self = $(this),
					parent = self.parents('tr'),
					memberId = parent.attr('data-id');
				data.forEach(function(value) {
					if(value.id == memberId) {
						ChooseMemberManage.prototype.memberList.push({
							userId: value.id,
							part: 50,
							realName: value.realName,
							flock: value.flock
						});
					}
				})
				parent.addClass('chosen');
				ChooseMemberManage.prototype.renderMemberList();
			})
		})
	};
	/*渲染已选人员列表，绑定移除方法*/
	ChooseMemberManage.prototype.renderMemberList = function(){
		let tpl = chosenMemberTpl.innerHTML,
			view = $(ChooseMemberManage.prototype.membersTableSelector),
			data = ChooseMemberManage.prototype.memberList,
			renderData = {
				type: ChooseMemberManage.prototype.groupId ? 'update': 'add',
				list: data	
			};
		laytpl(tpl).render(renderData, function(html){
			view.html(html);
			view.prev().html('已选人员：' + data.length + '人');
			//移除
			view.find('tr i[role="cancel"]').unbind().on('click',function(){
				let memberId = $(this).attr('data-id'),
					memberIndex = null;
				data.forEach(function(value,index) {
					if(value.userId == memberId) {
						memberIndex = index;
					}
				})
				data.splice(memberIndex,1);
				ChooseMemberManage.prototype.memberList = data;
				$(ChooseMemberManage.prototype.ChooseTableSelector + ' tbody tr[data-id="' + memberId + '"]').removeClass('chosen');
				ChooseMemberManage.prototype.renderMemberList();
			});
			//设置组长
			view.find('tr i[role="set"]').unbind().on('click',function(){
				let memberId = $(this).attr('data-id');
				data.forEach(function(value,index) {
					if(value.userId == memberId) {
						data[index].part = 10;
					} else {
						data[index].part = 50;
					}
				})
				ChooseMemberManage.prototype.memberList = data;
				ChooseMemberManage.prototype.renderMemberList();
			});
		})
	};
	/*搜索*/
	ChooseMemberManage.prototype.search = function(){
		let formData = $(ChooseMemberManage.prototype.searchFormSeletor).serializeObject();
		ChooseMemberManage.prototype.getPage(formData,function(res){
			ChooseMemberManage.prototype.renderpage();
		})
	};
	/*重置*/
	ChooseMemberManage.prototype.reset = function(){
		CommonUtil.formDataSetAndGet({
			container: ChooseMemberManage.prototype.searchFormSeletor,
			data: {
				flock: '',
				name: ''
			}
		})
		ChooseMemberManage.prototype.search();
	};
	ChooseMemberManage.prototype.init = function(){
		$(ChooseMemberManage.prototype.searchFormSeletor + ' .submit').unbind().on('click',function(){
			ChooseMemberManage.prototype.search()
		});
		//搜索框内的回车事件
		$(ChooseMemberManage.prototype.searchFormSeletor).unbind('keydown').keydown('.form-control',function(event){
			if(event.keyCode==13){
				$(ChooseMemberManage.prototype.searchFormSeletor + ' button.submit').trigger('click');
				return false;
		    }
		});
		$(ChooseMemberManage.prototype.searchFormSeletor + ' .reset').unbind().on('click',function(){
			ChooseMemberManage.prototype.reset()
		})
		ChooseMemberManage.prototype.search();
		ChooseMemberManage.prototype.renderMemberList();
	};
	w["ChooseMemberManage"] = ChooseMemberManage;
	return w;
})(window)
