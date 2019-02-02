var icon = "<i class='fa fa-times-circle'></i> ";

function bindMobile(idPrefix){
	var person = JSON.parse(localStorage.merisWebPerson);
	layer.open({
		type: 1,
		skin : 'layui-layer-rim', //加上边框
		title : person.username + '您好，首次登陆系统请绑定手机号！',
		area : [ '50%', '320px' ], //宽高
		closeBtn:0,
		shadeClose: false, //开启遮罩关闭
		content: '<div class="wrapper-content" id="' + idPrefix + 'Chosen" style="overflow:auto;height:265px;">' + $('#bindMobile').html() + '</div>'
	});
	$('#'+ idPrefix +'Chosen form').validate({
	    rules: {
	        mobile: {
	        	required: true,
                phone: true,
                remote: {
                	url:"person/validateMobile",
                    type:"get",
                    data:{
                    	mobile: function(){return $('#'+ idPrefix +'Chosen form .mobile').val()},
                    	personId: function(){return person.id}
                    },
                    dataFilter: function(data, type) {
                    	
                    	if (data == 'false'){
                    		return true;
                    	} else {
                    		return false
                    	}
             
                 	}

                }
            },
            code: {
            	required:true,
                rangelength:[4,4]
            }
	    },
	    messages: {
	        mobile: {
	        	required: icon + "请输入手机号码",
                phone: icon + "请输入11位手机号码",
                remote: icon + "手机号码已经注册"
            },
            code: {
            	required: icon + "请填写验证码",
                rangelength: icon + "请填写4位验证码"
            }
	    },
	    submitHandler:function(form){
	    	var submitObj =$('#'+ idPrefix +'Chosen form').serializeObject(),
	    		option = {
		    		url:'bindMobile',
					data:{},
					type:'GET'
		    	};
	    	submitObj.userId = person.id;
	    	option.data = submitObj;
	    	CommonUtil.ajaxRequest(option, function(result){
	    		if (typeof result == 'string') {
	    			result = JSON.parse(result);
	    		}
	    		if(result.success) {
	    			layer.closeAll()
	    			layer.msg('绑定成功',{icon: 6})
	    			person.mobile = submitObj.mobile;
	    			localStorage.merisWebPerson = JSON.stringify(person);
	    		} else {
	    			layer.msg(result.message?result.message:'绑定失败',{icon: 5});
	    		}
	    	})
	    } 
	});
	
	$('#' + idPrefix + 'Chosen input[name="mobile"]').on('keyup',function(){
		/*charge()*/
	})
	$('#' + idPrefix + 'Chosen input[name="mobile"]').on('change',function(){
		/*charge()*/
	})
	function charge(){
		var reg= /^1[34578]\d{9}$/,
			mobile = $('#' + idPrefix + 'Chosen input[name="mobile"]').val();
		if(reg.test(mobile)){
			$('#' + idPrefix + 'Chosen a.getCode').removeClass('btn-default');
			$('#' + idPrefix + 'Chosen a.getCode').addClass('btn-primary');
			$('#' + idPrefix + 'Chosen a.getCode').attr('onclick','getCode('+ mobile +')')
		} else {
			$('#' + idPrefix + 'Chosen a.getCode').addClass('btn-default');
			$('#' + idPrefix + 'Chosen a.getCode').removeClass('btn-primary');
			$('#' + idPrefix + 'Chosen a.getCode').attr('onclick','')
		}
	}
	$.validator.addMethod("phone",function(value, element, params){  
        var phone = /^1[34578]\d{9}$/;  
        return this.optional(element)||(phone.test(value));  
    },"*格式错误");
}

//获取验证码
function getCode(mobile){
	var num = 60,
		idPrefix = 'bindMobile',
		option = {
			url:'sendSMS',
			data:{
				mobile:mobile
			},
			type:'GET'
		};
	
	CommonUtil.ajaxRequest(option, function(result){
		/*if (typeof result == 'string') {
			result = JSON.parse(result);
		}
		if(result.success){*/
			$('#' + idPrefix + 'Chosen a.getCode').addClass('hide');
			$('#' + idPrefix + 'Chosen a.num').removeClass('hide');
			$('#' + idPrefix + 'Chosen a.num').html(num + ' s');
			var timer = setInterval(function(){
				num -= 1;
				if(num < 1){
					$('#' + idPrefix + 'Chosen a.getCode').removeClass('hide');
					$('#' + idPrefix + 'Chosen a.num').addClass('hide');
					clearInterval(timer)
				} else {
					$('#' + idPrefix + 'Chosen a.num').html(num + ' s');
				}
			},1000)
		/*} else {
			layer.msg(result.message?result.message:'发送验证码失败',{icon: 5});
		}*/
	})	
};


//修改用户信息，现在不用，但是一定不能删除
function personEdit(idPrefix, option){
	layer.open({
		type: 1,
		skin : 'layui-layer-rim', //加上边框
		title : '欢迎登录云企管理平台，请完善用户信息！',
		area : [ '60%', '600px' ], //宽高
		shadeClose: false, //开启遮罩关闭
		content: '<div class="wrapper-content" id="' + idPrefix + 'Chosen" style="overflow:auto;height:545px;">' + $('#personEdit').html() + '</div>'
	});
	$('#'+ idPrefix +'Chosen form').validate({
	    rules: {
	    	realName: {
	            rangelength: [2,20],
	            isName: true
	        },
	        nickname: {
	            rangelength: [1,20],
	            isName: true
	        },
	        mobile: {
	        	required: true,
                phone: true,
                remote: {
                	url:"person/validateMobile",
                    type:"get",
                    data:{
                    	mobile: function(){return $('.mobile').val()},
                    	personId: function(){return $('.id').val()?$('.id').val():''}
                    },
                    dataFilter: function(data, type) {
                    	if (data == 'false'){
                    		return true;
                    	} else {
                    		return false
                    	}
             
                 	}

                }
            },
            email: {
                email: true,
                isEmail: true,
                remote: {
                	url:"person/validateEmail",
                    type:"get",
                    data:{
                    	email: function(){return $('.email').val()},
                    	personId: function(){return $('.id').val()?$('.id').val():''}
                    },
                    dataFilter: function(data, type) {
                    	if (data == 'false'){
                    		return true;
                    	} else {
                    		return false
                    	}
             
                 	}

                }
            },
            oldPassword: {
                passwordR:true,
                rangelength:[6,20]
            },
            newPassword: {
            	noRepeat:true,
                passwordR:true,
                rangelength:[6,20]
            },
            newPasswordRepeat: {
           	 equalTo: '#'+ idPrefix +'Chosen form #newPassword'
            }
	    },
	    messages: {
	    	realName: {
	            rangelength: icon + "司机姓名输入长度限制为2-20个合法字符",
	            isName:icon + "允许输入中文、字母、数字、空格，且不能以空格开始或结尾"
	        },
	        nickname: {
	            rangelength: icon + "用户昵称输入长度限制为1-20个合法字符",
	            isName:icon + "允许输入中文、字母、数字、空格，且不能以空格开始或结尾"
	        },
	        mobile: {
	        	required: icon + "请输入手机号码",
                phone: icon + "请输入11位手机号码",
                remote: icon + "手机号码已经注册"
            },
            email: {
                emial: icon + "请输入有效的电子邮箱",
                isEmail: icon + "请输入有效的电子邮箱",
                remote: icon + "电子邮箱已经注册"
            },
            oldPassword: {
                passwordR:icon+'密码格式错误',
                rangelength: icon + "密码长度为6-20" 
            },
            newPassword: {
            	noRepeat:icon+'新密码与原密码重复',
                passwordR:icon+'密码格式错误',
                rangelength: icon + "密码长度为6-20"
            },
            newPasswordRepeat: {
            	equalTo: icon + "两次输入的密码不一致"
            }
	    },
	    submitHandler:function(form){
	    	var submitObj =$('#'+ idPrefix +'Chosen form').serializeObject(),
	    		params = {};
	    	
	    	if(submitObj.oldPassword == submitObj.newPassword){
	    		layer.msg('新密码不能与原密码一致',{icon:5});
	    		return false;
	    	}
	    	params = {
	    			tdStr: JSON.stringify(submitObj)
	        };
	    	
	    	console.log(submitObj)
	    	/*saveDriver(params)*/
	    } 
	});
	if(option && option.id) {
		$('#'+ idPrefix +'Chosen input[name="id"]').val(option.id);
		$('#'+ idPrefix +'Chosen input[name="driverName"]').val(option.driverName);
		$('#'+ idPrefix +'Chosen input[name="driverMobile"]').val(option.driverMobile);
	}
	$('#' + idPrefix + 'Chosen input[name="logisticsCompanyId"]').val(option.logisticsCompanyId)
	$.validator.addMethod("phone",function(value, element, params){  
        var phone = /^1[34578]\d{9}$/;  
        return this.optional(element)||(phone.test(value));  
    },"*格式错误");
	jQuery.validator.addMethod("isName", function(value, element) {       
	    return this.optional(element) || /^[\u4E00-\u9FA5A-Za-z0-9]+[ ]{0,}[\u4E00-\u9FA5A-Za-z0-9]+$/.test(value);       
	}, "不符合规则");
	$.validator.addMethod("passwordR",function(value,element,params){  
        var passwordR = /^[0-9a-zA-Z]{0,}[0-9a-zA-Z]{1}$/;
        return this.optional(element)||(passwordR.test(value));  
    },"*密码格式错误");
	$.validator.addMethod("noRepeat",function(value,element,params){  
        var oldPassword = $('#'+ idPrefix +'Chosen form input[name="oldPassword"]').val();
        console.log('value',value)
        console.log('oldPassword',oldPassword);
        return this.optional(element)||(!(oldPassword.length > 0 && value == oldPassword));
    },"*新密码与原密码重复");
	
}
