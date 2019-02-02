CustomerAnalysisManage = (function() {
    var init;

    var beginTime;

    var endTime;

    var bindDateRangeEvent;

    var loadFlowDailyLine;

    var loadDistributeBar;

    var loadSexRatioPie;

    var loadAgeRatioCircle;

    bindDateRangeEvent = function() {
        var dateRangeSelector = '#customer-analysis-manage .range-input > input',
            dFormat = 'yyyy/MM/dd',
            btStr = beginTime ? new Date(parseInt(beginTime)).Format(dFormat) : '',
            etStr = endTime ? new Date(parseInt(endTime)).Format(dFormat) : '',
            dateRangeStr = btStr && etStr ? (btStr + ' - ' + etStr) : '';
        
        // 渲染时间选择器
        $(dateRangeSelector).val(dateRangeStr);
        laydate.render({
            elem: dateRangeSelector,
            range: true,
            format: dFormat,
            value: dateRangeStr,
            max: new Date().Format('yyyy-MM-dd'),
            done: function(v, date, endDate) {
                beginTime = DateUtil.getTime(date);
                endTime = DateUtil.getTime(endDate);
                if (endTime - beginTime > 24*60*60*1000*30) {
                    layer.msg('自定义统计区间的选择不得大于30天!请重新选择。', {icon: 5});
                    return false;
                } else {
                    goPage('index?beginTime=' + beginTime + '&endTime=' + endTime);
                }
            }
        });
    };

    function resolveToCatesAndDatas(obj) {
        var cates = [];
        var datas = [];
        for(o in obj) {
            cates.push(o);
            datas.push(obj[o]);
        }

        return {
            cates: cates,
            datas: datas
        };
    }

    function resolveToValueAndName(obj) {
        var res = [];
        for(o in obj) {
            res.push({
                name: o,
                value: obj[o]
            });
        }

        return res;
    }
    function noData(El,title){
		let html = '<div class="no-data clear"></div>';
		$(El).find('.echart-box').html(html)
	};

    loadFlowDailyLine = function(res) {
        var obj = resolveToCatesAndDatas(res);
        console.log(obj);

        // 指定图表的配置项和数据
        var option = {
    		toolbox: {
		        feature: {  
		            magicType: {show: true, type: ['line', 'bar']},
		        },
		        right: '24'
		    },
        	backgroundColor: '#F8F8F8',
        	color:'#2F97E6',
        	grid: {
		    	top: '50px',
		        left: '70px',
		        right: '40px',
		        bottom: '40px',
		        containLabel: false
		    },
           /* tooltip: {
                tooltip: {
                    triggerOn: 'none'
                },
                backgroundColor: '#ffffff',
                borderColor: '#ffffff',
                textStyle: {
                	color: '#333333',
                	fontSize: '16'
                },
                extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
//                position:function(p){   //其中p为当前鼠标的位置
//                    return [p[0] - 90, p[1] - 50];
//                },
                position: 'top',
                trigger: 'item',
                width: '50',
                formatter: function (params) {
                    var htmlStr ='<div>'+ params.value +'</div>';
                    return htmlStr; 
                }
            },*/
            xAxis: [
		        {
		            type: 'category',
		            axisLabel: {
		                color: '#333333'
		            },
		            axisLine: {
		                lineStyle: {
		                    color:'#9ec2ff',
		                    width:'2'
		                    
		                }
		            },
		            data: obj.cates,
		            axisPointer: {
		                type: 'shadow'
		            },
		            axisTick: {
			            show: false,
			            alignWithLabel: true
			        },
			    	splitLine: {
			    		show:true,
			    		lineStyle: {
			                color: ['#dae2ea'],
			                type: 'dashed'
			            }
			    	},
			    	show:true
		        }
		    ],
            yAxis: [
 		       {
 		            type: 'value',
 		            axisLabel: {
 		                formatter: '{value}',
 		            },
 		            axisLine: {
 		                lineStyle: {
 		                    color:'#333333',
 		                    width:'0'
 		                    
 		                }
 		            },
 		            axisTick: {
 					            show: false
 					        },
 			    	splitLine: {
 			    		show:true,
 			    		lineStyle: {
 			                color: ['#dae2ea'],
 			                type: 'dashed'
 			            }
 			    	},
 			    	show:true,
 		        }
 		        
 		    ],
            series: [{
                data: obj.datas,
                type: 'bar',
                smooth: true,
                symbolSize:10,
                barWidth: 50,
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                        color: '#333333'
                    }
                },
                itemStyle: {   
                    //通常情况下：
                    normal:{  
    　　　　　　　　　　　　//每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                        color: function (params){
                            return ['#7fb7fc'];
                        }
                    }
                },
            }]
        };

        // 使用刚指定的配置项和数据显示图表。
        if(obj.datas.length > 0) {
        	// 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.querySelector('#customer-analysis-manage .daily-line .echart-box'));
        	myChart.setOption(option);
        } else {
        	noData('#customer-analysis-manage .daily-line');
        }
        

    };

    loadDistributeBar = function(res) {
        function resolveRes(res) {
            var cates = [];
            var datas = [];
            for(var i = 0; i < res.length; i++) {
                cates.push(res[i].areaname);
                datas.push(res[i].count);
            }
            return {
                cates: cates,
                datas: datas
            }
        };
        var obj = resolveRes(res);

        // 指定图表的配置项和数据
        var option = {
        	backgroundColor: '#F8F8F8',
        	color : ['#5FBDA3'],
           /* tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },*/
            xAxis: {
                type: 'value',
                axisLabel: {
                    interval:0,
                    rotate:40
                }
            },
            yAxis: {
                type: 'category',
                axisLabel: {
                    interval:0,
                    rotate:40
                },
                data: obj.cates
            },
            grid: {
                left: '10px',
                right: '65px',
                bottom: '3%',
                containLabel: true
            },
            series: [{
                data: obj.datas,
                type: 'bar',
                smooth: true,
                label: {
                    normal: {
                        show: true,
                        position: 'right'
                    }
                },
                itemStyle: {   
                    //通常情况下：
                    normal:{  
    　　　　　　　　　　　　//每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                        color: function (params){
                            var colorList = ['#EF9E2C','#E05A5F','#2D95C2','#3F5B70','#5EBDA3'];
                            return colorList[params.dataIndex];
                        }
                    },
                    //鼠标悬停时：
                    emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        
        if(obj.datas.length > 0) {
        	// 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.querySelector('#customer-analysis-manage .distribute-bar .echart-box'));
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        } else {
        	noData('#customer-analysis-manage .distribute-bar');
        }
        
    };
    loadSexRatioPie = function(res) {
        var datas = resolveToValueAndName(res),
        	total = 0;
        if(datas.length > 0) {
        	datas.forEach(function(value){
        		total += value.value;
        	})
        }
        // 指定图表的配置项和数据
        var option = {
        	backgroundColor: '#F8F8F8',
            series: [{
                name: 'pie',
                label: {
                    normal: {
                        formatter:'{b}：{c}({d}%)'
                    }
                },
                type: 'pie',
                radius: '60%',
                center : ['50%', '55%'],
                selectedMode: 'single',
                data: datas
            }]
        };
        if(total > 0) {
        	// 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.querySelector('#customer-analysis-manage .sex-ratio-pie .echart-box'));
            myChart.setOption(option);
        } else {
        	noData('#customer-analysis-manage .sex-ratio-pie');
        }
    };

    loadAgeRatioCircle = function(res) {
        var datas = resolveToValueAndName(res);

        // 指定图表的配置项和数据
        var option = {
        	backgroundColor: '#F8F8F8',
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            series: [{
                name:'客流年龄分布',
                type:'pie',
                radius: '60%',
                center : ['50%', '55%'],
                avoidLabelOverlap: false,
                data: datas
            }]
        };

        if(datas.length > 0) {
        	// 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.querySelector('#customer-analysis-manage .age-ratio-circle .echart-box'));
            myChart.setOption(option);
        } else {
        	noData('#customer-analysis-manage .age-ratio-circle');
        }
    };

    init = function(p) {
        p = p ? p : {};
        beginTime = p.beginTime;
        endTime = p.endTime;
        $('#customer-analysis-manage a[href-opt="custom-range"]').unbind('click').bind('click', function(){
            var rangeInput = $('#customer-analysis-manage .range-input');
            if (rangeInput.css('display') == 'none') {
                rangeInput.css('display', 'block');
            } else {
                rangeInput.css('display', 'none');
            }
        });
        bindDateRangeEvent();
        p.analysis = p.analysis ? p.analysis : {};
        loadFlowDailyLine(p.analysis.count ? p.analysis.count : {});
        loadDistributeBar(p.analysis.hot ? p.analysis.hot : []);
        loadSexRatioPie(p.analysis.sex ? p.analysis.sex : {});
        loadAgeRatioCircle(p.analysis.age ? p.analysis.age : {});
    };
    return {
        init: init
    }
}());