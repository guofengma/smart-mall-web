var DealInfo = (function() {
	var moduleId,
		paramsInit,
		handlerUserChoosenInit,
		formSubmit,
		init;
	
	paramsInit = function() {
		$('.i-checks').iCheck({
		    checkboxClass: 'icheckbox_square-green',
		    radioClass: 'iradio_square-green',
		});
	};
	
	formSubmit = function() {
		$(moduleId).validate({
		    rules: {
		    	handlerType: {
		            required: true
		        },
		        handlerMessage: {
		            required:true
		        },
		        handlerUserName: {
		            required:true
		        }
		    },
		    messages: {
		    	handlerType: {
		            required: icon + "请选择处理结果"
		        },
		        handlerMessage: {
		            required: icon + "请输入处理批注"
		        },
		        handlerUserName: {
		            required: icon + '请完善处理人员'
		        }

		    },
		    submitHandler: function(form){
		        var submitObj = $(form).serializeObject();

				CommonUtil.operation({
					moduleName: 'alarm',
					oper: 'deal',
					type: 'post',
					oper_cn: '处理报警',
					params: {
						data: JSON.stringify(submitObj)
					}
				}, function() {
					goPage('index');
				})
		    }
		});
	};
	init = function(p) {
		p = p ? p : {};
		moduleId = p.moduleId ? p.moduleId: '#alarm-dealinfo-form';
		paramsInit();
		// handlerUserChoosenInit(p.users ? p.users : []);
		formSubmit();
	}
	
	return {
		init: init
	}
}());