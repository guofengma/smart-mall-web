$(function(){
	var icon = "<i class='fa fa-times-circle'></i> ";
    $("#loginForm").on("submit",function(){
    	return false;
    })
    $("#loginForm").validate({
        rules: {
            account: {
                required: true
                
            },
            password: {
                required: true
               
            }
        },
        messages: {
        	account: {
                required: icon + "请填写禅道账号或Email"
               
            },
            password: {
                required: icon + "请填写禅道密码"
              
            }
        },
        submitHandler:function(form){
        	var passwordField = form.querySelector("input[type='password'")
        	passwordField.value = $.md5(passwordField.value)
        	var data = $(form).serializeObject()
        	console.log(data)
        	
        	var url =form.action            	
        	loading = layer.load();
        	
        	$.ajax({
            	url:url,
            	type:"post",
            	dataType:"json",
            	data:data,
            	success:function(data){
            		console.log(data)
            		//data = JSON.parse(data);                		
            		layer.close(loading);
            		if (!data.success) {
            			layer.alert(data.message ? data.message : '登录失败',{icon: 5});
            			form.reset()
            		} else {
            			delete sessionStorage.isLogout;
            			window.location.replace("/")
            		}
            	}
            })
        	//console.log($(form).serializeObject())
        	
        }     
    });
})
$.fn.serializeObject = function()
{
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};