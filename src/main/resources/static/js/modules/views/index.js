var indexManage = (function(){
	$(".logout").click(function(){
		layer.confirm('是否确定注销登录？', {
		    btn: ['确定','取消']//按钮
		  //  shade: true //不显示遮罩
		}, function(){
			var option = {
					url:"logout",
					type:"get"
			};
			CommonUtil.ajaxRequest(option,function(){
				localStorage.removeItem('erc_system_token');
				localStorage.removeItem('erc_system_ecmId');
				localStorage.removeItem('erc_system_ecmName');
				localStorage.removeItem('erc_login_user');
				window.location.replace("/login");
			})
		}, function(){
		});
	});
	$('.modify-password').on('click', function(){
		modifyPassword();
	})
	$('.J_menuItem').on('click',function(){
		//解绑鼠标滚动事件
		$(document).unbind('mousewheel DOMMouseScroll');
	})
}())

/*$(function() {
        // 初始化内容宽度
        var initLftWidth = $('.lft-slide-nav').width(),
            loadPageContent = function() {
                var activeMenu = $('.slide-section li > a.active'),
                    menuHref = null;

                if (activeMenu.length == 1) {
                    menuHref = activeMenu.attr('href');
                }
                console.info(menuHref);
               $('#content-main').html(menuHref)
               
            },
            menusClick = function(cur, level) {
                var selectedLi = cur.parent(),
                    activeSth = false,
                    pcMarginLeft = initLftWidth;

                $.each($('.slide-section li'), function() {
                    var el = $(this);
                    el.removeClass('selected');
                });

                if (!selectedLi.hasClass('selected')) {
                    selectedLi.addClass('selected');
                    if (level == 2) {
                        selectedLi.parent().parent().parent().addClass('selected');
                    }
                }
                if (level == 1) {
                    if (selectedLi.find('.sub_navs').length === 1) {
                        pcMarginLeft =  initLftWidth + 150;
                    } else {
                        activeSth = true;
                    }
                } else {
                    pcMarginLeft =  initLftWidth + 150;
                    activeSth = true;
                }

                $('.page-content').css('margin-left', pcMarginLeft + 'px');

                if (activeSth) {
                    $.each($('.slide-section li > a'), function() {
                        var el = $(this);
                        el.removeClass('active');
                    });
                    cur.addClass('active');
                    $('.top-menu-tab a').removeClass('actived');
                    loadPageContent();
                }
            },
            topMenusClick = function(){
            	console.log('应该添加actived')
                if(!$(this).hasClass('actived')) {
                    $('.top-menu-tab a').removeClass('actived');
                    menusClick($(this), 1);
                    $(this).addClass('actived');
                   
                }
                return false;
            }
            flMenusClick = function(event) {
                menusClick($(this), 1);
                return false;
            },
            secMenusClick = function(event) {
                menusClick($(this), 2);
                return false;
            };

        $('.page-content').css('margin-left', initLftWidth + 'px');
        $('ul.fl_menus > li > a').on('click', flMenusClick);
        $('ul.sec_menus > li > a').on('click', secMenusClick);
        $('.top-menu-tab a').on('click',topMenusClick)
         
    });*/