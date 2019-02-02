var AbnormalDealInfo = (function() {
	var formEl,
		fnParams;
	function formInits() {
		/**
		 * 表单复选框初始化
		 */
		$('.i-checks').iCheck({
		    checkboxClass: 'icheckbox_square-green',
		    radioClass: 'iradio_square-green',
		});
		/**
		 * 表单验证初始化
		 */
		$(formEl).validate({
		    rules: {
		    	type: {
		            required: true
		        },
		        conclusion: {
		            required:true
		        },
		        isHc: {
		            required:true
		        },
		        hcDetail: {
		            required:true
		        }
		    },
		    messages: {
		    	type: {
		            required: icon + "请选择处理结果"
		        },
		        conclusion: {
		            required: icon + "请输入处理批注"
				},
				isHc: {
					
		            required: icon + "请选择耗材情况"
				},
		        hcDetail: {
		            required: icon + "请填写维修耗材详情"
				},

		    }
		});
		/**
		 * 控制回车提交
		 */
		$(formEl).keydown(function(e) {
			var theEvent = e || window.event;
			var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
			if (code == 13) {
				return $(formEl).valid();
			}
			return true;
		});

		/**
		 * 表单按钮事件绑定
		 */
		$(formEl + ' button').unbind('click').click(function() {
			var self = this;
			fnParams = $(self).data();
			if ($(formEl).valid()) {
				eval(fnParams.opt + '()');
			}
		});
	
	};


	function deal() {
		$.extend(fnParams, $(formEl).serializeObject());
		$http.post({
			url: 'work-order/deal',
			data: fnParams,
			forbidLoading: true
		}, function() {
			if (layerWindowIndex) {
				layer.close(layerWindowIndex);
			}
			goPage('index');
		})
	}

	function init(p) {
		p = p ? p : {};
		formEl = p.formEl ? p.formEl: '#abnormal-dealinfo-form';
		formInits();
	}

	return {
		init: init
	}
}());
AbnormalDealInfo.init()