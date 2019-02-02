var AbnormalAssign = function(p) {
	var that = this;
	that.moduleId = '#work-order-assign';
	p = p ? p : {};
	$.extend(that, p);
	
	that.init = function() {
		$(that.moduleId + ' a[data-opt="pickUser"]').unbind('click').click(pickUser);
		formInit();
	};
	function formInit() {
		$(that.moduleId + ' form').validate({
		    submitHandler: function(form){
				var submitObj = $(form).serializeObject();
				$http.post({
					url: 'work-order/assign',
					data: {
						data: JSON.stringify(submitObj)
					},
					forbidLoading: true
				}, function() {
					if (layerWindowIndex) {
						layer.close(layerWindowIndex);
					}
					goPage('index', {limit: 10});
				})
		    }
		});
	}
	
	function pickUser() {
		that.userPicker = new ServiceUserPicker(that.moduleId + ' .fixed-wrap .core', that.systemCode);
		$(that.moduleId + ' .fixed-wrap').css('display', 'block');
		$(that.moduleId + ' .fixed-wrap > div').addClass('animated fadeInRight');
		setTimeout(function() {
			$(that.moduleId + ' .fixed-wrap > div').removeClass('fadeInRight');
		}, 2000);
		$(that.moduleId + ' a').unbind('click').click(function() {
			eval($(this).data().opt + '()');
		});
		$(that.moduleId + ' a[data-opt="confirmPickedUser"]').unbind('click').click(confirmPickedUser);
		$(that.moduleId + ' .fixed-wrap').unbind('click').click(function(e) {
			e.stopPropagation();
			var eTarget = e.target;
			if (eTarget.className === 'fixed-wrap') {
				confirmPickedUser();
			}
		});
	
	}
	function confirmPickedUser() {
		var users = that.userPicker.checkedItems;
		if (users.length > 1) {
			setTimeout(function() {
				layer.msg('请勾选1个人进行任务指派');
			})
		} else {
			$(that.moduleId + ' .fixed-wrap > div').addClass('animated fadeOutRight');
			setTimeout(function() {
				$(that.moduleId + ' .fixed-wrap').css('display', 'none');
				$(that.moduleId + ' .fixed-wrap > div').removeClass('fadeOutRight');
			});
			users.forEach(function(user) {
				var renderObj = {
					userIdTo: user.id,
					userNameTo: user.others.split('-')[0],
					userPhoneTo: user.others.split('-')[1]
				};
				CommonUtil.formDataSetAndGet({
					container: that.moduleId + ' form.assign-form',
					data: renderObj
				});
				
			});
		}
		
	}
	
	that.init();
};

