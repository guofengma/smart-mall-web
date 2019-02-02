var floorPlan = function(p, callback) {
    p = p == null ? {} : p;
    $.extend(this, p);
    var that  = this;

    that.timestamp = new Date().getTime();
    that.suffix = '#floor-plan-' + that.timestamp;
    that.fpSel = that.suffix + ' .floor-plan'
    that.floorSel = that.fpSel + ' > img';
    that.deviceSel = that.fpSel + ' > a.d-point';
    that.moveSel = that.fpSel + ' > point.move-location';
    that.originScale = 1;
    that.pgBgScale = 1;
    
    that.init = function(initBack) {
        $http.get({
            url: 'devices-monitor/floor-plan',
            data: {
                floorId: that.floorId,
                systemCode: that.systemCode,
                timestamp: that.timestamp
            },
            forbidLoading: true
        }, function(res) {
            $(that.container).html(res);
            that.fnInit();
            setTimeout(function() {
                that.fpInit(); // 楼层平面图及设备初始化
                that.fpBindScroll();
                if (typeof callback == 'function') {
                    callback();
                }
                if (typeof initBack == 'function') {
                    initBack();
                }
            });
        });
    };
    that.fnInit = function() {
        var fn = this;
        var datas = {};
        /**
         * 展开或收起操作栏
         */
        fn.optsDirection = function() {
            var el = $(that.suffix + ' a[data-opt="optsDirection"]');
            if(el.hasClass('direction-left')) {//调用展开方法
                el.removeClass('direction-left').addClass('direction-right').attr('title','收起');
                $(el.find('i')[0]).removeClass('fa-caret-left').addClass('fa-caret-right');
                $(el.parent()).animate({right: '0px'}, "slow");
            } else{//调用收起方法
                var panelWidth = el.parent()[0].clientWidth;
                el.removeClass('direction-right').addClass('direction-left').attr('title','展开');
                $(el.find('i')[0]).removeClass('fa-caret-right').addClass('fa-caret-left');
                $(el.parent()).animate({right: 107 - panelWidth + 'px'}, "slow");
            }
        };
        /**
         * 切换比例
         */
        fn.switchScale = function() {
            var el = $(that.suffix + ' a[data-opt="switchScale"]');
            var lstEl = el.siblings('.percentage-items');
            let tempW = el[0].clientWidth;

            if(lstEl.hasClass('hide')) {
                lstEl.removeClass('hide').css({'width': tempW + 'px'});
                //选择缩放比例
                lstEl.find('li').unbind().on('click', function(e){
                    e.preventDefault();
                    let percent = parseInt($(this).html());
                    that.pgBgScale = percent/100;
                    that.setScale();
                    lstEl.addClass('hide');
                })
                //点击其他任意区域，隐藏示比例选择框
                setTimeout(function(){
                    $(document).one('click',function(e){
                        if (!e.target.parentNode || e.target.parentNode.className.indexOf('percentage-items') < 0) {
                            lstEl.addClass('hide');
                        }
                    })
                });
            } else {
                lstEl.addClass('hide');
            }
        };
        /**
         * 放大平面图
         */
        fn.enlargeScale = function() {
            that.pgBgScale += 0.1;
            that.setScale();
        };
        
        /**
         * 缩小平面图
         */
        fn.minishScale = function() {
            that.pgBgScale -= 0.1;
            if (that.pgBgScale < 0.1) {
                that.pgBgScale = 0.1;
            }
            that.setScale();
        };
        /**
         * 最大化平面图
         */
        fn.maximize = function() {
            var loIndex = layer.open({
                type: 1,
                title: that.title,
                skin: 'layui-layer-demo',
                content: '123',
            });
            layer.full(loIndex);
            var maxSuffix = '#layui-layer' + loIndex + ' > div.layui-layer-content';
            $(maxSuffix).css({
                'height': 'calc(100vh - 52px)',
                'max-height': 'calc(100vh - 52px)',
                'max-width': '100%',
                'overflow': 'hidden'
            });
            setTimeout(function() {
                new floorPlan({
                    floorId: that.floorId,
                    systemCode: that.systemCode,
                    container: maxSuffix
                }, function() {
                    $(maxSuffix + ' a[data-opt="maximize"]').remove();
                    $(maxSuffix + ' div.scale-panel').css('right', '-73px');
                });
            })
        };


        $(that.suffix + ' a').unbind('click').click(function() {
            datas = $(this).data();
            if (datas.opt != 'detail') {
                eval('fn.' + datas.opt + '()');
            }
        });
    };


    /**
     * 初始化楼层平面和设备的100%显示
     */
    that.fpInit = function() {
        var cw = $(that.container)[0].offsetWidth;
        var ch = $(that.container)[0].offsetHeight;
        var img = new Image();
        img.src = $(that.floorSel).attr('src');
        img.onload = function() {
            var loadAttr = CommonUtil.calcuPicLoadParams(cw, ch, img.width, img.height);
            that.originScale = loadAttr.scale;
            that.img = img;
            $(that.floorSel).attr('width', loadAttr.w).attr('height', loadAttr.h);
            $(that.deviceSel).each(function(i) {
                var cur = $($(that.deviceSel)[i]);
                var dLeft = cur.css('left');
                var dTop = cur.css('top');
                if (dLeft.split('px').length > 0) {
                    dLeft = parseInt(dLeft.split('px')[0]) * that.originScale;
                }
                if (dTop.split('px').length > 0) {
                    dTop = parseInt(dTop.split('px')[0]) * that.originScale;
                }
                cur.css({
                    'left': dLeft + 'px',
                    'top': dTop + 'px'
                });
            });
            that.pgBgScale = 1;
            that.setScale();
            /**
             * 拖拽功能
             */
            $(that.fpSel).unbind('mousedown').mousedown(function(e) {
                var zcThis = this;
                var offset = $(zcThis).offset();
                zcThis.posix = {
                    'w': $(zcThis)[0].clientWidth,
                    'h': $(zcThis)[0].clientHeight,
                    'x': e.pageX - offset.left,
                    'y': e.pageY - offset.top
                };
                $.extend(document, {
                    'move': true,
                    'move_target': zcThis,
                    'move_container': $(that.suffix)
                });
            });
        };
        
    };
    /**
     * 滚动楼层平面图进行缩放
     */
    that.fpBindScroll = function() {
        $(that.fpSel).unbind('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll',function onMouseScroll(e){
            e.preventDefault();
            var wheel = e.originalEvent.wheelDelta || -e.originalEvent.detail,
                delta = Math.max(-1, Math.min(1, wheel) ),
                fpSelPosition = $(that.fpSel)[0].getBoundingClientRect(),
                eX = e.clientX,//鼠标的位置x
                eY = e.clientY,//鼠标的位置Y
                pX = (eX - fpSelPosition.left)/fpSelPosition.width,//鼠标在楼层图上的相对位置 x
                pY = (eY - fpSelPosition.top)/fpSelPosition.height,//鼠标在楼层图上的相对位置 y
                step = 0,
                newLeft = 0,
                newTop = 0,
                imgH = $(that.fpSel)[0].clientHeight,//图片缩放的基准高度 即缩放因子为1时的高度
                imgW = $(that.fpSel)[0].clientWidth,//图片缩放的基准宽度 即缩放因子为1时的宽度
                oldPgBgScale = that.pgBgScale;//缩放前的比例
            
            if(delta<0){//向下滚动
                step = -0.1;
            }else{//向上滚动
                step= 0.1;
            }
            that.pgBgScale += step;
            if (that.pgBgScale < 1) {
                that.pgBgScale = 1;
            }
            /*不改变缩放中心,计算top、left的补偿值(以鼠标为缩放中心),
                * 默认以fpSel的中点为缩放中心，相对位置为(0.5,0.5)
                * 以left为例$(fpSel)[0].offsetLeft是缩放对象原来的位置
                * (that.pgBgScale - oldPgBgScale)*imgW*(0.5 - pX)为补偿值，改变量*图片的宽度*（缩放中心的性对位置-鼠标的相对位置）
                */				    	
            newLeft =  $(that.fpSel)[0].offsetLeft + (that.pgBgScale - oldPgBgScale) * imgW * (0.5 - pX);
            newTop = $(that.fpSel)[0].offsetTop + (that.pgBgScale - oldPgBgScale) * imgH * (0.5 - pY);
            
            $(that.fpSel).css({left: newLeft + 'px', top: newTop + 'px'});
            that.setScale();
        });
    };
    /**
     * 缩放比例发生改变
     */
    that.setScale = function() {
        $(that.deviceSel)
        .css('transform', 'scale(' + 1/that.pgBgScale + ')')
        .css('-ms-transform', 'scale(' + 1/that.pgBgScale + ')')
        .css('-moz-transform', 'scale(' + 1/that.pgBgScale + ')')
        .css('-webkit-transform', 'scale(' + 1/that.pgBgScale + ')')
        .css('-o-transform', 'scale(' + 1/that.pgBgScale + ')');
        
        $(that.moveSel)
        .css('transform', 'scale(' + 1/that.pgBgScale + ')')
        .css('-ms-transform', 'scale(' + 1/that.pgBgScale + ')')
        .css('-moz-transform', 'scale(' + 1/that.pgBgScale + ')')
        .css('-webkit-transform', 'scale(' + 1/that.pgBgScale + ')')
        .css('-o-transform', 'scale(' + 1/that.pgBgScale + ')');
        
        $(that.fpSel)
        .css('transform', 'scale(' + that.pgBgScale + ')')
        .css('-ms-transform', 'scale(' + that.pgBgScale + ')')
        .css('-moz-transform', 'scale(' + that.pgBgScale + ')')
        .css('-webkit-transform', 'scale(' + that.pgBgScale + ')')
        .css('-o-transform', 'scale(' + that.pgBgScale + ')');
        $(that.suffix + ' a[data-opt="switchScale"] > span').html((that.pgBgScale*100).toFixed());
    };


    that.init();
};

