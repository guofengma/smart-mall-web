var RepairGroupCreate = function(params) {
    var that = this;
    $.extend(that, params);
	var step1 = '#repair-group-create-step-1',
		step2 = '#repair-group-create-step-2',
		smartwizardSelector = '#repair-group-create-smartwizard';
	that.createFormData = function(callback) {
		var basic = $(step1 + ' form').serializeObject(),
			memberList = chooseMemberManageFn.memberList,
			teamGroupDeviceDtos = [],
			hasTeamLeader = false;
		console.log('memberList',memberList)
		if(memberList.length < 1) {
			layer.msg('一个班组至少需要1名成员',{icon:5});
			return false;
		} else {
			memberList.forEach(function(value) {
				if(value.part == 10) {
					hasTeamLeader = true;
				}
			})
		};
		if(!hasTeamLeader) {
			layer.msg('请设置组长',{icon:5});
			return false;
		}
		if(typeof basic.subsystemCodes == 'string') {
			basic.subsystemCodes = [basic.subsystemCodes]
		}
		basic.subsystemCodes.forEach(function(value){
			teamGroupDeviceDtos.push({
				systemCode: value,
				systemName: $(step1 + ' form').find('option[value="'+value+'"]').text()
			})
		})
		$.extend(basic, {
			teamMemberDtos: memberList,
			teamGroupDeviceDtos: teamGroupDeviceDtos
		});
		delete basic.subsystemCodes;
		callback(basic);
	};
	that.save = function() {
		that.createFormData(function(res) {
			CommonUtil.operation({
			 	moduleName: 'repair-group',
			 	oper: 'saveTeamGroup',
			 	oper_cn: '保存',
			 	forbidLoading: false,
			 	params: {
			 		teamGroupDto : JSON.stringify(res)
			 	}
			 }, function() {
				 layer.closeAll();
				 layer.msg('保存成功',{icon:6});
				 goPage('index',{subModule:'repair-group'});
			 })
		});
	};
	that.ichecksInit = function(parentContainer) {
		$(parentContainer + ' .i-checks').iCheck({
		    checkboxClass: 'icheckbox_square-green',
		    radioClass: 'iradio_square-green',
		});
	};
	
	
	
    that.init = function() {
        var btnSubmit = $('<button type="button"></button>').html('保存')
                .addClass('btn btn-primary hide')
                .on('click', function(){
                    that.save()
                });
        
        $(smartwizardSelector).smartWizard({
            selected: 0,
            keyNavigation: false,
            theme: 'circles',
            transitionEffect:'fade',
            autoAdjustHeight:false,
            showStepURLhash: false,
            useURLhash:true,
            lang: { // Language variables for button
                next: '下一步 <i class="fa fa-chevron-right"></i>',
                previous: '<i class="fa fa-chevron-left"></i> 上一步'
            },
            toolbarSettings: {
                toolbarButtonPosition: 'end',
                toolbarExtraButtons: [btnSubmit]
            },
            anchorSettings: {
                markDoneStep: true, // add done css
                markAllPreviousStepsAsDone: true, // When a step selected by url hash, all previous steps are marked done
                removeDoneStepOnNavigateBack: true, // While navigate back done step after active step will be cleared
                enableAnchorOnDoneStep: true // Enable/Disable the done steps navigation
            }
        });
        $(smartwizardSelector).on("showStep", function(e, anchorObject, stepNumber, stepDirection) {
        	console.log('stepNumber',stepNumber)
            if(stepNumber==1){
                $(".sw-btn-group-extra .btn").removeClass("hide");
                $(".sw-btn-next").hide();
            }else{
                $(".sw-btn-group-extra .btn").addClass("hide");
                $(".sw-btn-next").show()
            }
        });
        $(smartwizardSelector).on("leaveStep", function(e, anchorObject, stepNumber, stepDirection) {
        	if(stepNumber === 0) {
        		if (!$(step1 + ' .repair-group-basic-form').valid()) {
        			return false;
        		}
        		let basic = $(step1 + ' form').serializeObject();
        		console.log(basic);
        		if(!(basic.subsystemCodes && basic.subsystemCodes!='')) {
        			layer.msg('请选择维修系统',{icon:5});
        			return false;
        		}
        	} else if (stepNumber == 1){
        		console.log('第2步')
        	}
        	console.log(e, anchorObject, stepNumber, stepDirection)
            return true;
        });
    }
    that.init();
};