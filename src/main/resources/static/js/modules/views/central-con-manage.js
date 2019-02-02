var centerConManage = (function(p){
		let el = '#cen-con-sub-sys',
			colorList = {
				'异常': '#F85056',
				'正常': '#97C583',
				'已处理': '#E0AC7C',
				'未处理': '#FDCB66'
			},
			allStatus = {},
			operationCodes = {};
		let getSubSystemData = function(p,callback){
				p = p ? p : {};
				let tpl = central_con_sub_systems_tpl.innerHTML,
				view = $(el + ' .tab-content');
				CommonUtil.operation({
					moduleName: 'central-con',
					oper: 'getsSubSysMointerData',
					type: 'get',
					params: {},
					forbidConfirm: true,
					forbidLoading: p.forbidLoading,
				}, function(res) {
					laytpl(tpl).render(res.result, function(html){
						view.html(html);
						res.result.forEach(function(value){
							let deviceBusiness = value.deviceBusiness,
								piedata=[],
								colors = [],
								physicalState = [],
								physicalStateColors = [],
								legends = [];
							if(value.deviceNum > 0) {
								if(!value.unusualDeviceNum || value.unusualDeviceNum == 0) {
									physicalState = [
										{value:value.deviceNum,name:'正常'}
									]
									physicalStateColors = [colorList['正常']];
								}  else {
									let tempNum = value.deviceNum - value.unusualDeviceNum;
									if(tempNum == 0) {
										physicalState = [
											{value:value.unusualDeviceNum,name:'异常'}
										]
										physicalStateColors = [colorList['异常']];
									} else {
										physicalState = [
											{value:value.deviceNum - value.unusualDeviceNum,name:'正常'},
											{value:value.unusualDeviceNum,name:'异常'}
										]
										physicalStateColors = [colorList['正常'],colorList['异常']];
									}
									
								}
							}
							legends = [{statusvalue:'正常',color: colorList['正常']},{statusvalue:'异常',color: colorList['异常'],statuskey:1}];
							pieDataReander({data:physicalState,subSystemCode:value.code,colors:physicalStateColors,tyep:'physicalState',legends:legends});
			
							if(deviceBusiness && deviceBusiness != 'undefined') {//业务状态
								legends = allStatus[value.code];
								deviceBusiness.forEach(function(value) {
									piedata.push({value:value.businessStateCount,name:value.businessState});
									legends.forEach(function(s,index) {
										if(s.statusvalue == value.businessState) {
											colors.push(s.color);
										}
									})
								});
								pieDataReander({data:piedata,subSystemCode:value.code,colors:colors,type:'business',legends:legends});
							}
							if(value.alarmNum && value.alarmNum != 'undefined'){//报警数量
								let alarm = [],
									alarmColors = [];
								if(value.alarmNum > 0) {
									if(value.dealAlarmNum == 0) {
										alarm = [
											{value:value.alarmNum - value.dealAlarmNum, name:'未处理'}
										]
										alarmColors = [colorList['未处理']];
									} else if(value.dealAlarmNum  == value.alarmNum) {
										alarm = [
											{value:value.dealAlarmNum, name:'已处理'},
										]
										alarmColors = [colorList['已处理']];
									} else {
										alarm = [
											{value:value.alarmNum - value.dealAlarmNum, name:'未处理'},
											{value:value.dealAlarmNum, name:'已处理'},
										]
										alarmColors = [colorList['未处理'],colorList['已处理']];
									}
								}
								legends = [{statusvalue:'未处理',color: colorList['未处理'],statuskey:0},{statusvalue:'已处理',color: colorList['已处理']}];
								pieDataReander({data:alarm,subSystemCode:value.code,colors:alarmColors,type:'alarm',legends:legends});
							}
							if(value.hourPassengerFlow && value.hourPassengerFlow != 'undefined') {//客流数据
								let hourPassengerFlow = value.hourPassengerFlow,
									lineData = [];
								for(var key in hourPassengerFlow) {
									let tempValue = hourPassengerFlow[key],
										tempKey = key;
									tempKey = tempKey.split(' ')[1];
									tempKey = tempKey.split(':')[0];
									
									lineData.push({value:tempValue,name:tempKey+':00'})
								}
								lineData.sort(compare('name'));
								if(lineData.length > 5) {
									lineData = lineData.slice(-5);
								}
								lineDataReander(lineData,value.code,'line');
							}
						})
						view.find('.sub-sys-type-item').unbind().on('click','.legend-item i',function(){
							let parent = $(this).parents('.sub-sys-type-item'),
								systemCode = parent.attr('data-code');
							goModule({moduleName:'devices-monitor',systemCode:systemCode})
						})
					})
					if(typeof callback == 'function') {
						callback()
					}
				});
				
			},
			pieDataReander = function(p){
				// 指定图表的配置项和数据
				p = p ? p : {};
				let data = p.data ? p.data: [],
					subSystemCode = p.subSystemCode ? p.subSystemCode: null,
					colors = p.colors ? p.colors : ['#C23531','#FDB553','#91C7AE','#6A9CFF','#8194AA'],
					names = p.names ? p.names :[],
					type = p.type ? p.type : 'physicalState';
				if(!(names && names.length >0)) {
					data.forEach(function(value){
		        		names.push(value.name);
		        	});
				}
				
		        var option = {
		        		tooltip : {
		        	        trigger: 'item',
		        	        formatter: "{a} <br/>{b} : {c} ({d}%)"
		        	    },
		        	    series : [
		        	        {
		        	        	name: '访问来源',
		        	            type: 'pie',
		        	            radius : '70%',
		        	            center: ['50%', '50%'],
	        	            	color: colors,
		        	           label: {
		        	                normal: {
		        	                    show: true,
		        	                    formatter: '{c}({d}%)'
		        	                }
		        	            },
		        	            labelLine:{  
		        	                normal:{  
		        	                    length:8,
		        	                    length2:8
		        	                }  
		        	            },
		        	            data:data,
		        	            itemStyle: {
		        	                emphasis: {
		        	                    shadowBlur: 10,
		        	                    shadowOffsetX: 0,
		        	                    shadowColor: 'rgba(0, 0, 0, 0.5)'
		        	                }
		        	            }
		        	        }
		        	    ]
		        };
		        if(data.length > 0) {
		        	// 基于准备好的dom，初始化echarts实例
		        	var echartBox = $(el + ' .sub-sys-type-' + subSystemCode + ' .echart-box.' + type),
		           		myChart;
		            echartBox.html('<div class="chart"></div><div class="legend"></div>')
		            myChart = echarts.init(echartBox.find('.chart')[0]);
		        	myChart.setOption(option); 
		        	customLegend({legends:p.legends,el:echartBox.find('.legend')});
		        } else {
		        	noData(el + ' .sub-sys-type-' + subSystemCode + ' .echart-box.' + type);
		        }
			},
			lineDataReander = function(data,subSystemCode,type) {
				type = type ? type : 'line';
		        // 指定图表的配置项和数据
		        var option = {
		            xAxis: {
		                type: 'category',
		                axisLine:{
		                    lineStyle:{
		                    	color: '#999999'
		                    }
		                },
		                data: function(){
		                	let names = [];
	        	        	data.forEach(function(value){
	        	        		names.push(value.name);
	        	        	})
	        	        	return names;
	        	        }()
		            },
		            yAxis: {
		            	name: '人',
		                type: 'value',
		                axisLabel: {
		                    interval: 0,
		                    rotate: 40,
		                    lineStyle: {
		                		color: '#999999'
		                	}
		                },
		                axisLine:{
		                    lineStyle:{
		                    	color: '#999999'
		                    }
		                } 
		            },
		            series: [{
		                data:  function(){
		                	let values = [];
	        	        	data.forEach(function(value){
	        	        		values.push(value.value);
	        	        	})
	        	        	return values;
	        	        }(),
		                type: 'line',
		                smooth: true,
		                symbolSize:5,
		                itemStyle : {  
                            normal : {  
                                color:function (params){
                                    let color = '#2D97E5';
                                    if(params.dataIndex == data.length-1) {
                                    	color ='#ff806a'
                                    }
                                    return color;
                                },
                                borderWidth: 2,
                                lineStyle:{  
                                    color:'#2D97E5',
                                    width: 1.5
                                }  
                            }  
                        },
		                label: {
		                    normal: {
		                        show: true,
		                        position: 'top',
		                        color: '#333333'
		                    }
		                }
		            }],
		            grid: {
		                x: 40,
		                x2: 20,
		                y: 30,
		                height: 160
		            },
		        };

		        // 使用刚指定的配置项和数据显示图表。
		        if(data.length > 0) {
		        	// 基于准备好的dom，初始化echarts实例
		            var myChart = echarts.init($(el + ' .sub-sys-type-' + subSystemCode + ' .echart-box.' + type)[0]);
		        	myChart.setOption(option);
		        } else {
		        	noData(el + ' .sub-sys-type-' + subSystemCode + ' .echart-box.' + type);
		        }
		        
			},
			 noData = function(El){
				let html = '<div class="no-data clear">' +
								'<p>暂无数据</p>'+
							'</div>';
				$(El).html(html)
				$(El).next('.num').addClass('hide');
			},
			compare = function(prop) {
	            return function (obj1, obj2) {
	                var val1 = obj1[prop];
	                var val2 = obj2[prop];
	                val1 = (val1=='-1' ? 'null' : val1);
	                val2 = (val2=='-1' ? 'null' : val2);
	                if (val1 < val2) {
	                    return -1;
	                } else if (val1 > val2) {
	                    return 1;
	                } else {
	                    return 0;
	                }            
	            } 
	        },
	        customLegend = function(p){
	        	let legends = p.legends,
	        		el = p.el,
	        		html = '',
	        		temp,
	        		hasList;
	        	if(!el) {
	        		return false;
	        	}
	        	if(legends && legends.length > 0) {
	        		legends.forEach(function(value,index) {
	        			if(value.statuskey || value.statuskey === 0) {
	        				temp = '<div class="legend-item">'+
        						'<span class="color-block" style="background:' + value.color + ';"></span>' +
        						'<span class="name list" data.statuskey="'+ value.statuskey +'">' + value.statusvalue + '</span>' +
        					'</div>';
	        			} else {
	        				temp = '<div class="legend-item">'+
	    						'<span class="color-block" style="background:' + value.color + ';"></span>' +
	    						'<span class="name">' + value.statusvalue + '</span>' +
	   
	    					'</div>';
	        			}
	        			html += temp;
	        		})
	        	}
	        	el.html(html);
	        	el.find('span.list').unbind().on('click',function(){
	        		let self = $(this),
	        			echartItem = self.parents('.echart-box'),
	        			systemItem = self.parents('.sub-sys-type-item'),
	        			systemCode = systemItem.attr('data-code'),
	        			systemName = systemItem.find('.above span').text();
	        			option = {
	        				params: {
	        					systemCode: systemCode,
	        					limit: 10,
	        					page: 1
	        				}
	        			},
	        			title = '【' + systemName + '】'+ self.text() + '设备列表',
	        			tpl = '';
	  
	        		if(echartItem.hasClass('business')){
	        			option.moduleName = 'device';
	        			option.oper = 'pageByBusinessState';
	        			option.params.businessState = self.attr('data.statuskey');
	        			tpl = centra_con_table_business_tpl.innerHTML;
	        		} else if(echartItem.hasClass('physicalState')) {
	        			option.moduleName = 'device';
	        			option.oper = 'page';
	        			option.params.physicalState = self.attr('data.statuskey');
	        			tpl = centra_con_table_physicalState_tpl.innerHTML;
	        		} else if(echartItem.hasClass('alarm')) {
	        			option.moduleName = 'alarm';
	        			option.oper = 'page';
	        			option.params.handlerStatus = 0;
	        			option.params.subSystemCode = systemCode;
	        			title = '【' + systemName + '】未处理报警';
	        			tpl = centra_con_table_alarm_tpl.innerHTML;
	        		}
	        		
	        		getDevides(option,function(res) {
	        			openTablePanel({title:title,result:res,option:option,tpl: tpl,systemCode:systemCode})
	        		})
	        	});
	        },
	        getDevides = function(p,callback){
	        	CommonUtil.operation({
					moduleName: p.moduleName,
					oper: p.oper,
					type: p.type ? p.type : 'get',
					params: p.params,
					forbidConfirm: true,
					forbidLoading: false,
				}, function(res) {
					
					if(typeof callback == 'function') {
						callback(res.result)
					}
				})
	        },
	        alarmLocation = function(p,callback) {
	        	CommonUtil.ajaxRequest({
	    			url: p.url,
	    			type: p.type ? p.type : 'get',
	    			data: {
	    				id: p.id
	    			},
	    			forbidConfirm: true,
	    			forbidLoading: false,
	    		}, function(res) {
					setTimeout(function(){
						let alarmLocationOpen = layer.open({
		    				type: 1,
		    				title: p.title,
		    				shadeClose: false,
		    				closeBtn: 1, 
		    				anim: 2,
		    				skin : 'layui-layer-rim', //加上边框
		    				area : [ '70%', '80%' ], //宽高
		    				btn: p.btns,
		    				content : '<div class="central-con-alarm-open">' + res + '</div>',
		    				yes:function(twoIndex){
		    					
		    					if(p.url.indexOf('alarm') == -1) {
		    						goModule({
		    							moduleName: 'device-exception',
		    							directive: 'index',
		    							handlerStatus: 300,
		    							abnormalStatus: '0,100',
		    							keyword: $('.central-con-alarm-open .device-name').text(),
		    							subSystemCode: p.systemCode
		    						});
		    					} else {
		    						goModule({moduleName:'alarm',directive:'anomaly-location?id='+p.id})
		    					}
		    					layer.close(twoIndex);
		    					layer.close(p.oneIndex);	
		    				}
		    			});
						if(typeof callback == 'function') {
							callback({el:$('.central-con-alarm-open')})
						}
						$('.central-con-alarm-open .al-detail .btn').remove();
						$('.central-con-alarm-open .left-below').remove();
						$('.central-con-alarm-open .ibox-title').remove();
					})
				})
	        }
	        openTablePanel = function(data){
	        	setTimeout(function(){
	        		let centralConTableOpen = layer.open({
	    				type: 1,
	    				title: data.title,
	    				shadeClose: false,
	    				closeBtn: 1, 
	    				anim: 2,
	    				skin : 'layui-layer-rim', //加上边框
	    				area : [ '70%', '460px' ], //宽高
	    				content : '<div class="central-con-table-open"><table class="footable table"></table><div class="text-right page" id="central-con-table-page"></div></div>',
	    			});
	        		let view = $('.central-con-table-open table'),
	        			tpl = data.tpl,
	        			renderData = data.result.resultList,
	        			option = data.option;
	        		laytpl(tpl).render(renderData, function(html){
	        			view.html(html);
	        		})
	        		view.unbind().on('click','.detail a',function(){
	        			let self = $(this),
	        				value = self.attr('data-value'),
	        				oper = self.attr('oper'),
	        				btns = [];
	        			
	        			if(oper == 'anomaly-location') {//报警定位
	        				if(operationCodes.alarm.indexOf('deal-info') != -1) { //报警管理处理异常权限
	        					btns = ['去处理']
							};
	        				alarmLocation({
	        					id: value,
	        					oneIndex:centralConTableOpen,
	        					url:'alarm/anomaly-location',
	        					title:'报警定位',
	        					btns: btns 
	        				})
	        			} else {//异常设备
	        				if(operationCodes.deviceException.indexOf('deal-info') != -1) { //异常设备处理异常权限
	        					btns = ['去处理']
							};
	        				alarmLocation({
	        					id: value,
	        					oneIndex:centralConTableOpen,
	        					url:'central-con/anomaly-device',
	        					type: 'get',
	        					title:'设备异常定位',
	        					btns: btns,
	        					systemCode: data.systemCode
	        				},function(res){
	        					res.el.find('.des').remove();
	        					res.el.find('.al-pg-cnt').css({'border-top':'1px solid #ccc','border-radius':'3px'});
	        					res.el.find('.vv-pg-cnt').css({'border-top':'1px solid #ccc','border-radius':'3px'});
	        				})
	        			}	
	        		})
	        		if(data.result.totalCount > 1) {
	        			laypage.render({
						    elem: 'central-con-table-page',
						    curr: data.result.currentPage,
						    count: data.result.totalCount,
						    layout: ['count', 'prev', 'page', 'next', 'skip'],
						    jump: function(obj, first){
							    if(!first){
							    	option.params.page = obj.curr;
							    	getDevides(option,function(res){
							    		renderData = res.resultList;
							    		laytpl(tpl).render(renderData, function(html){
							    			  view.html(html);
							    		})
							    	})
							    };
						    }
						});
	        		} else {
	        			$('#central-con-table-page').html('');
	        		}
	        		
	        	})
	        },
	        getOperationCodes = function(data,callback){
	        	CommonUtil.operation({
					moduleName: 'central-con',
					oper: 'operationCodes',
					type: 'get',
					params: data,
					forbidConfirm: true,
					forbidLoading: false,
				}, function(res) {
					if(typeof callback == 'function') {
						callback(res.result)
					}
				})
	        },
			init = function(data){
	        	let centralTimer = null,
	        		interalTime = 60 * 1000 * 30;
				if(data.allStatus) {
					allStatus = data.allStatus;
				}
				getSubSystemData({forbidLoading: false},function(){
					getOperationCodes({moduleCode: 'top-alarm'},function(res){
						operationCodes.alarm = res;
						getOperationCodes({moduleCode: 'top-device-exception'},function(res){
							operationCodes.deviceException = res;
						});
					});
				});
				
				if(centralTimer == null) {
					centralTimer = setInterval(function(){
						getSubSystemData({forbidLoading: true})
					},interalTime)
				}
				$('a.J_menuItem').on('click',function(){
					if(centralTimer != null) {
						clearInterval(centralTimer);
						centralTimer = null;
					}
				})
					
			};
		return {
			init: init
		}
	})();