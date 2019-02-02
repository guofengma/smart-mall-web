var CentralConManage = (function(){
	let moduleId = '#central-con',
		allSystemPanels = [],//允许被配置的所有子系统模块
		systemPanels = [],//监控界面显示的模块
		monitorData = [],//监控界面的监控数据
		locationHost = null,
		operationCodes = {},
		centralTimer = null;
		
	let getData = function(data,callback){
		CommonUtil.operation({
			moduleName: 'central-con',
			oper: data.oper,
			type: data.type ? data.type : 'get',
			params: data.params ? data.params : {},
			forbidConfirm: true,
			forbidLoading: false,
		}, function(res) {
			if(typeof callback == 'function') {
				callback(res.result)
			}
		})
	},
	pieDataReander = function(p){
		// 指定图表的配置项和数据
		p = p ? p : {};
		
		let data = p.data ? p.data: [],
			subSystemCode = p.subSystemCode ? p.subSystemCode: null,
			colors = p.colors ? p.colors : ['#49ddb6','#e4edeb'],
			names = p.names ? p.names :[],
			type = p.type ? p.type : 'physicalState',
			el = p.el ? p.el : moduleId;
		if(!(names && names.length >0)) {
			data.forEach(function(value){
        		names.push(value.name);
        	});
		}
		
        var option = {
        		/*tooltip : {
        	        trigger: 'item',
        	        formatter: "{a} <br/>{b} : {c} ({d}%)"
        	    },*/
                graphic: {
                  type: 'text',
                  left: 'center',
                  top: 'center',
                  z: 2,
                  zlevel: 100,
                  style: {
                      text: '',
                      x: 100,
                      y: 100,
                      textAlign: 'center',
                      fill: 'red',
                      width: 100,
                      height: 100,
                      fontSize: '22'
                  }
                },
        	    series : [
        	        {
        	        	name:'访问来源',
                        type:'pie',
                        avoidLabelOverlap: false,
                        radius: ['55%', '80%'],
                        center : ['50%', '55%'],
    	            	color: colors,
    	            	label: {
        	                normal: {
        	                    show: false,
        	                    formatter: '{c}({d}%)'
        	                }
        	            },
        	            labelLine:{  
        	                normal:{  
        	                    length:8,
        	                    length2:8
        	                },
        	                show: false
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
        	var echartBox = $(el + ' .sub-sys-type-' + subSystemCode).find('div[data-code="'+ type +'"] .echart-box .chart'),
           		myChart;
            myChart = echarts.init(echartBox[0]);
        	myChart.setOption(option);
        	echartBox.next('div.text').html('<p>' + p.percent + '</p><p>' + p.text + '</p>')
        }
	},
	barLineDataReander = function(p) {//折柱切换图
		let el = p.el ? p.el : moduleId,
			type = p.type ? p.type : 'line',
			subSystemCode = p.subSystemCode,
			lineData = p.lineData ? p.lineData : {}
			data = [],
			names = [];
		for(key in lineData) {
			if(lineData[key].name) {
				data.push(lineData[key].value);
				names.push(lineData[key].name);
			}
			
		}
        // 指定图表的配置项和数据
		let option = {
		    toolbox: {
		        feature: {  
		            magicType: {show: true, type: ['line', 'bar']},
		        },
		        right: '20'
		    },
		    grid: {
		    	top: '50px',
		        left: '50px',
		        right: '16px',
		        bottom: '40px',
		        containLabel: false
		    },
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
		            data: names,
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
		    series: [
		        {
		            name:'人数',
		            type:'bar',
		            data:data,
		            label: {
		                show: true,
		                position: 'top'
		            },
		        	barWidth: 24,
		        	itemStyle: {   
	                    //通常情况下：
	                    normal:{  
	    　　　　　　　　　　　　//每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
	                        color: function (params){
	                            return ['#7fb7fc'];
	                        }
	                    }
	                },
		        }
		    ]
		};

        // 使用刚指定的配置项和数据显示图表。
        if(data.length > 0) {
        	// 基于准备好的dom，初始化echarts实例
            var echartBox = $(el + ' .sub-sys-type-' + subSystemCode).find('div[data-code="'+ type +'"] .echart-box'),
            	myChart = echarts.init(echartBox[0]);
        	myChart.setOption(option);
        } 
        
	},
	barDataReander = function(p){//柱状图
		// 指定图表的配置项和数据
		p = p ? p : {};
		let data = p.data ? p.data: [],
			subSystemCode = p.subSystemCode ? p.subSystemCode: null,
			names = [],
			type = p.type ? p.type : 'business',
			tempData = [],
			el = p.el ? p.el : moduleId;
		data.forEach(function(value){
    		names.push(value.name);
    		tempData.unshift(value.value + 0.1);//保证数据为0时，也有色块
    	});
		
		let option = {
				grid: {
					top: '30px',
			        left: '10px',
			        right: '10px',
			        bottom: '10px'
			    },
			    xAxis: {
			       type: 'value',
			       axisTick: {
			            show: false
			        },
			        splitLine: {
			        	show:false
			        },
			        show:false
			    },
			    yAxis: {
			        type: 'category',
			        axisTick: {
			            show: true
			        },
			    	splitLine: {
			    		show:false
			    	},
			    	show:false,
			    },
			    series: [{
			        data: tempData,
			        type: 'bar',
			        itemStyle: {   
	                    //通常情况下：
	                    normal:{  
	    　　　　　　　　　　　　//每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
	                        color: function (params){
	                            return ['#49ddb6'];
	                        }
	                    },
	                    //鼠标悬停时：
	                    emphasis: {
	                            shadowBlur: 10,
	                            shadowOffsetX: 0,
	                            shadowColor: 'rgba(0, 0, 0, 0.5)'
	                    }
	                },
	                barWidth: 20
			    },{
			        type: 'bar',
			        itemStyle: {
			            normal: {
			                color: 'transparent'
			            }
			        },
			        silent: true,
			        barWidth: 0,
			        barGap: '0', // Make series be overlap
			        data: [10]
			    }]
			};
		if(data.length > 0) {
        	// 基于准备好的dom，初始化echarts实例
        	var echartBox = $(el + ' .sub-sys-type-' + subSystemCode).find('div[data-code="'+ type +'"] .echart-box'),
           		myChart;
            myChart = echarts.init(echartBox[0]);
        	myChart.setOption(option); 
        }
		
	},
	noData = function(el) {
		if(!el) {
			return false;
		}
		el.html('<div class="no-data"></div>')
	},
	//渲染监控界面的子系统及模块（无监控数据）
	renderSystemPanel = function(data){
		data = data ? data : {}
		let renderData = data.renderData ? data.renderData : systemPanels,
			tpl = centra_con_system_panel_tpl.innerHTML,
			view = $(moduleId + ' #central-con-bar');
		laytpl(tpl).render(renderData,function(html){
			view.html(html)
			CentralConSortFn.subMoudleSortFn({systemPanels:renderData})
			
			if(operationCodes.systemPanel && operationCodes.systemPanel.indexOf('remove-system') == -1) {//移除子系统的权限
				$(moduleId + ' a[data-opt="removeView"]').remove();
			}
			if(operationCodes.systemPanel && operationCodes.systemPanel.indexOf('manage-sub-module') == -1) {//'显示模块'的权限
				$(moduleId + ' .show-sub-modules').remove();
			}
			if(typeof data.callback == 'function'){
				data.callback()
			}
			getMonitorData(renderData);
			eventInit();
		});
	},
	getRightPanel = function(data,callback){//打开监控面板管理界面
		data = data ? data: {};
		CommonUtil.ajaxRequest({
			url: 'central-con/basic-Panel',
			type: 'get',
			data: data,
			forbidConfirm: true,
			forbidLoading: false,
		}, function(res) {
			if(typeof callback == 'function') {
				callback(res)
			}
		});
	},
	rightPanelEventInit = function(el){
		let NewSystemPanels = getCurrentPanels();
		//初始化全选、全不选、部分选中的方法
		if(allSystemPanels.length > 0) {
			allSystemPanels.forEach(function(value) {
				CommonUtil.itemsCheck({
					allSelector: el + ' input[name="' + value.code + '-selected-all"]',
					itemSelector: el + ' input[name="' + value.code + '-selected-item"]'
				});
			})
		}
		//初始化已选面板数据
		if(NewSystemPanels.length > 0) {
			NewSystemPanels.forEach(function(value) {
				let userSystemMonitorDtos = value.userSystemMonitorDtos,
					systemCode = value.code;
				$(el + ' .system-type-' + systemCode).attr('data-serialNumber',value.serialNumber);
				if(userSystemMonitorDtos.length > 0) {
					userSystemMonitorDtos.forEach(function(value2){
						$(el + ' input[value="' + value2.code + '"]').iCheck('check');
						$(el + ' input[value="' + value2.code + '"]').attr('data-serialNumber',value2.serialNumber)
					})
				}
			})
		}
		//展开与收起 
		$(el + ' .up-or-down').unbind().on('click',function(){
			let self = $(this),
				parent = self.parents('.system-item');
			if(self.hasClass('icon-down')) {
				self.removeClass('icon-down');
				self.addClass('icon-up');
				parent.find('.sub-modules').css({'height':'0px','overflow':'hidden'});
			} else {
				self.removeClass('icon-up');
				self.addClass('icon-down');
				parent.find('.sub-modules').css({'height':'auto'});
			}
		})
		//查询
		$(el + ' .search').unbind().on('click',function(){
			let keyword = $(el + ' input[name="keyword"]').val();
			getRightPanel({keyword: keyword},function(res) {
				$(el + ' .fixed-wrap > div').html(res);
				$(el + ' .i-checks').iCheck({
				    checkboxClass: 'icheckbox_square-green',
				    radioClass: 'iradio_square-green',
				});
				rightPanelEventInit(el);
			})	
		})
		//重置
		$(el + ' .reset').unbind().on('click',function(){
			getRightPanel({},function(res) {
				$(el + ' .fixed-wrap > div').html(res);
				$(el + ' .i-checks').iCheck({
				    checkboxClass: 'icheckbox_square-green',
				    radioClass: 'iradio_square-green',
				});
				rightPanelEventInit(el);
			})	
		})
		//保存
		$(el + ' .submit').unbind().on('click',function(){
			let selectedData = {},
				parent = null,
				systemD = null,
				itemD = null,
				tempCode = null,
				confirmMsg = '确认保存';
			$(el + ' .sub-module-type input:checked').each(function(index,value) {
				let self = $(value);
				
				tempCode = null;
				hasHourPassengerFlow = false;
				itemD = self.data();
				itemD.serialNumber = itemD.serialnumber;
				
				/*delete itemD.serialnumber;*/
				parent = self.parents('.system-item');
				systemD = {
					code: parent.attr('data-code'),
					name: parent.attr('data-name'),
					serialNumber: parent.attr('data-serialNumber'),
					subModuleNum: parent.attr('data-subModuleNum')
				};
				itemD.show = true;
				if(selectedData != {}) {
					for(key in selectedData) {
						if(key == systemD.code) {
							tempCode = systemD.code;
						}
					}
				}
				if(selectedData == {} || tempCode == null) {
					systemD.show = true;
					systemD.userSystemMonitorDtos = [itemD];
					selectedData[systemD.code] = systemD;
				} else {
					selectedData[tempCode].userSystemMonitorDtos.push(itemD)
				}
				if(itemD.code == 'passengerflow-visitor-count') {//判断是否有客流统计模块,它的宽度是普通模块的2倍
					selectedData[systemD.code].hasHourPassengerFlow = true;
				}
			});
			
			if(selectedData != {}) {
				let tempArr = [];
				for(key in selectedData) {
					let userSystemMonitorDtos = selectedData[key].userSystemMonitorDtos ? selectedData[key].userSystemMonitorDtos: [];
					userSystemMonitorDtos.sort(compare('serialNumber'));
					userSystemMonitorDtos.forEach(function(value,index) {
						userSystemMonitorDtos[index].serialNumber = index+1;
					})
					selectedData[key].userSystemMonitorDtos = userSystemMonitorDtos;
					tempArr.push(selectedData[key]);
				}
				tempArr.sort(compare('serialNumber'));
				selectedData = tempArr;
				selectedData.forEach(function(value,index) {
					selectedData[index].serialNumber = index+1;
				})
			}
			if(selectedData.length == 0) {
				confirmMsg = '未选中任何模块，确认保存？'
			}
			$(moduleId + ' .fixed-wrap > div').addClass('animated fadeOutRight');
			
			setTimeout(function() {
				$(moduleId + ' .fixed-wrap').css('display', 'none');
				$(moduleId + ' .fixed-wrap > div').removeClass('fadeOutRight');
			},800);
			renderSystemPanel({renderData:selectedData,callback:function(){
				$(moduleId + ' .show-sub-modules').addClass('hide');
			}});
		})
	},
	savePersonality = function(data,successFn,errorFn){
		data = data ? data: {};
		
		if(data.forbidConfirm == false) {
			let confirmMsg = data.confirmMsg ? data.confirmMsg : '确认保存';
			layer.confirm(confirmMsg, {
				icon : 3,
				btn : [ '确认', '取消' ]
			}, saveFn);
		} else {
			saveFn()
		}
		function saveFn() {
			CommonUtil.ajaxRequest({
				url: 'central-con/savePersonality',
				type: 'post',
				data: data.params,
				forbidLoading: data.forbidLoading ? data.forbidLoading: false,
			}, function(res) {
				if(!res.success) {
					layer.msg(res.message ? res.message :'保存失败',{icon:5});
					if(typeof errorFn == 'function') {
						errorFn(res)
					}
				} else {
					if(typeof successFn == 'function') {
						successFn(res)
					}
				}
			});
		}
		
	},
	getMonitorData = function(p){
		p = p ? p : systemPanels
		if(p == []) {
			return false;
		} else {
			monitorData = [];
			if(typeof(Worker)!=="undefined") {
				p.forEach(function(value1) {
					let systemCode = value1.code,
						userSystemMonitorDtos = value1.userSystemMonitorDtos ? value1.userSystemMonitorDtos : [];
					
					userSystemMonitorDtos.forEach(function(v2) {
						let worker=new Worker('js/modules/views/central-con/worker.js'),
				        	url = null,
				        	type = null;
						if(v2.code.indexOf('device-status') != -1) {
							type = 'getPhysicalStateData'
						} else if(v2.code.indexOf('run-status') != -1) {
							type = 'getBusinessData'
						} else if(v2.code.indexOf('alarm') != -1) {
							type = 'getAlarmData';
						} else if(v2.code.indexOf('visitor-count') != -1) {
							type = 'getPpassengerFlowData';
						}
						url = 'http://'+locationHost + '/central-con/' + type + '?subSystemCode=' + systemCode
						worker.postMessage({url:url,methodType:'GET'});
						worker.onmessage=function(e){
				            let data = JSON.parse(e.data);
				            monitorData.push(data);
				            renderMonitorData([data]);
						}
					})
				})
			} else {
		        console.log('不支持 web worker')
		    }
		}
	},
	renderMonitorData = function(p) {
		p = p ? p: monitorData;
		let data = {};
	    	view= null,
	    	tpl = null,
	    	renderData = null;
	    if(p.length == 0) {
	    	return false;
	    }
	    p.forEach(function(value) {
	    	data = value;
	    	view = $(moduleId + ' .echart-item[data-code="' + data.type + '"] .content');
	    	if(!data.type) {
	    		return false;
	    	}
		    if(data.type.indexOf('device-status') != -1) {//设备状态
		    	tpl = central_con_physicalState_tpl.innerHTML;
		    	renderData = data.result;
		    	laytpl(tpl).render(renderData, function(html){
					view.html(html);
					/*if(data.type.indexOf('passengerflow') == -1) {}*/
						let pieData = [
						    {name:'正常',value: renderData.deviceNum - renderData.unusualDeviceNum},      
						    {name:'异常',value: renderData.unusualDeviceNum}, 
						],
						percent;
						if(renderData.deviceNum > 0 ) {
							percent = (renderData.deviceNum - renderData.unusualDeviceNum)/renderData.deviceNum;
			    			percent = parseInt(percent * 10000)/100 + '%';
						} else {
			    			percent = '0%';
			    			pieData = [
			    			    {name:'正常',value: 0},      
			  					{name:'异常',value: 1}
			  				]
						}
						
						pieDataReander({
							data: pieData,
							names: ['正常','异常'],
							type: data.type,
							subSystemCode: data.subSystemCode,
							percent: percent,
							text:'正常率'
						})
					
					
		    	})
			} else if(data.type.indexOf('run-status') != -1) {//业务状态
				renderData = allStatus[data.subSystemCode] ? allStatus[data.subSystemCode] : [];
				tpl = central_con_business_tpl.innerHTML;
				renderData.forEach(function(v1,index1){
					renderData[index1].value = 0;
					renderData[index1].name = renderData[index1].statusvalue;
					data.result.forEach(function(v2) {
						if(v1.statuskey == v2.businessStateKey) {
							renderData[index1].value = v2.businessStateCount;
						}
					})
				})
				if(renderData.length == 0) {
					noData(view);
					return false;
				}
				laytpl(tpl).render(renderData, function(html){
					view.html(html);
					barDataReander({
						data:renderData,
						type:data.type,
						subSystemCode:
						data.subSystemCode
					})
				})
			} else if(data.type.indexOf('alarm') != -1) {//报警
				renderData = data.result;
				tpl = central_con_alarm_tpl.innerHTML;
				laytpl(tpl).render(renderData, function(html){
					view.html(html);
					let pieData = [
					    {name:'已处理',value: renderData.dealAlarmNum},      
					    {name:'未处理',value: renderData.alarmNum - renderData.dealAlarmNum}, 
					],
					percent;
					if(renderData.alarmNum > 0 ) {
						percent = renderData.dealAlarmNum/renderData.alarmNum;
		    			percent = parseInt(percent * 10000)/100 + '%';
					} else {
		    			percent = '0%';
					}
					pieDataReander({
						data:pieData,
						names:['已处理','未处理'],
						type:data.type,
						subSystemCode:data.subSystemCode,
						percent:percent,
						text: '处理率'
					})
		    	})
			} else if(data.type.indexOf('visitor-count') != -1) {//客流统计
				tpl = central_con_passengerFlow_line_tpl.innerHTML;
				renderData = data.result.passengerFlow;
				if(!(renderData && data.result.hourPassengerFlow != {})) {
					noData(view);
					return false;
				}
				laytpl(tpl).render(renderData, function(html){
					view.html(html);
					let hourPassengerFlow = data.result.hourPassengerFlow,
						lineData = [];
					
					for(var key in hourPassengerFlow) {
						let tempValue = hourPassengerFlow[key],
							tempKey = key;
						tempKey = tempKey.split(' ')[1];
						tempKey = tempKey.split(':')[0];
						
						lineData.push({value:tempValue,name:tempKey+':00'})
					}
					lineData.sort(compare('name'));
					if(lineData.length > 12) {
						lineData = lineData.slice(-12);
					}
					barLineDataReander({
						lineData:lineData,
						type:data.type,
						subSystemCode:data.subSystemCode,
					})
				})
				
			}
	    })  
	},
	compare = function(property) {
	    return function(a,b){
	        var value1 = parseInt(a[property] ? a[property] : 999);
	        var value2 = parseInt(b[property] ? b[property] : 999);
	        return value1 - value2;
	    }
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
    },
    openTablePanel = function(data){
    	setTimeout(function(){
    		let centralConTableOpen = layer.open({
				type: 1,
				title: data.title,
				shadeClose: false,
				closeBtn: 1, 
				anim: 2,
				skin : 'layui-layer-rim', //加上边框
				area : [ '70%', '480px' ], //宽高
				content : '<div class="central-con-table-open" style="padding: 0 10px;"><table class="footable table"></table><div class="text-right page" id="central-con-table-page"></div></div>',
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
	eventInit = function() {
		//提示信息
		let lIndex = null;
		$(moduleId + ' .echart-item .help').unbind().on('mouseenter',function(){
			lIndex = null;
			$(moduleId + ' .echart-item .help').unbind('click').on('click',function(){
				let self = $(this),
					type = self.parents('.echart-item').attr('data-code'),
					msg = '';
				if(type.indexOf('device-status') != -1) {
					msg = '点击红色异常设备个数，可以查看所有异常设备'
				} else if(type.indexOf('run-status') != -1) {
					msg = '点击设备个数，可以查看该业务状态下的所有设备'
				} else if(type.indexOf('alarm') != -1) {
					msg = '点击未处理条数，可以查看所有未处理报警';
				}
				setTimeout(function(){
					lIndex = layer.tips("<span style='color:#666666'>"+msg+"</span>", self[0], {
						tips: [2, '#F3F3F3'],
						time: 100000
					});
				})
			})
		}).on('mouseleave', function(){
			if(lIndex) {
				setTimeout(function(){
					layer.close(lIndex);
				})
			}
		});
		//点击红色字体，获取设备列表
		$(moduleId + ' .echart-item').unbind('click').on('click', '.getData',function(){
			let self = $(this),
				echartItem = self.parents('.echart-box'),
				systemItem = self.parents('.sub-sys-item'),
				systemCode = systemItem.attr('data-code'),
				systemName = systemItem.find('.above .system-name').text(),
				type = self.parents('.echart-item').attr('data-code');
				option = {
					params: {
						systemCode: systemCode,
						limit: 10,
						page: 1
					}
				},
				title = '【' + systemName + '】'+ self.attr('data-text') + '设备列表',
				tpl = '';
			
			if(type.indexOf('run-status') != -1){
				option.moduleName = 'device';
				option.oper = 'pageByBusinessState';
				option.params.businessState = self.attr('data-statuskey');
				tpl = centra_con_table_business_tpl.innerHTML;
			} else if(type.indexOf('device-status') != -1) {
				option.moduleName = 'device';
				option.oper = 'page';
				option.params.physicalState = 1;//1表示异常
				tpl = centra_con_table_physicalState_tpl.innerHTML;
			} else if(type.indexOf('alarm') != -1) {
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
		//显示模块
		$(moduleId + ' .show-sub-modules').unbind().on('click',function(){
			let systemCode = $(this).parents('.sub-sys-item').attr('data-code');
			chooseSubModule({systemCode:systemCode})
		})
		//移除子系统
		$(moduleId + ' a[data-opt="removeView"]').unbind().on('click',function(){
			let parent = $(this).parents('.sub-sys-item'),
				systemCode = parent.attr('data-code');
			parent.remove();
			if($(moduleId + ' .sub-sys-item').length == 0) {
				$(moduleId + ' #central-con-bar').html('<div class="col-sm-12 no-sub-panel text-center">'+
					'<p class="text-center">当前未选中任何监控模块</p>' +
				'</div>')
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
    //展示‘显示模块’的弹框
    chooseSubModule = function(p){
    	p = p ? p : {};
    	let systemCode = p.systemCode,
    		systemPanel	= {},
    		html = '';
    	if(!systemCode) {
    		return false;
    	}
    	
    	allSystemPanels.forEach(function(value) {
    		if(value.code == systemCode) {
    			systemPanel = value;
    		}
    	})
    	systemPanel.userSystemMonitorDtos.forEach(function(value) {
    		html += '<div class="sub-module-item">'+
    					'<div class="checkbox i-checks personal-i-check right">'+
							'<input type="checkbox" value="'+value.code+'">&nbsp;'+ value.name +
						'</div>'+
    				'</div>'
    	})
    	setTimeout(function() {
			let lwIndex = layer.open({
				type : 1,
				title : '显示模块',
				shadeClose: false,
				closeBtn: 1, 
				anim: 2,
				skin : 'layui-layer-rim', //加上边框
				area : [ '400px', '250px' ], //宽高
				btn:['确定','取消'],
				content : '<div class="choose-sub-module-open">' + html + '</div>',
				yes: function() {
					let selectedData = [],
						chooseSubModuleSelector =$('.choose-sub-module-open'),
						selectedInput = chooseSubModuleSelector.find('input:checked');
					if(selectedInput.length == 0) {
						layer.msg('请选择模块',{icon:5});
						return false;
					}
		    		systemPanel.userSystemMonitorDtos.forEach(function(v1) {
		    			v1.serialNumber = $(moduleId + ' .echart-item[data-code="'+v1.code+'"]').attr('data-serialNumber') ? $(moduleId + ' .echart-item[data-code="'+v1.code+'"]').attr('data-serialNumber') : 999;
		    			selectedInput.each(function(index2,v2){
			    			let self = $(v2);
			    			if(self.val() == v1.code) {
			    				selectedData.push({
			    					code: v1.code,
			    					serialNumber: v1.serialNumber,
			    					show: true
			    				});
			    			}
			    			
			    		})
			    	})
			    	selectedData.sort(compare('serialNumber'));
		    		selectedData.forEach(function(value,index) {
		    			value.serialNumber = index + 1;
		    		})
		    		systemPanel.userSystemMonitorDtos = selectedData;
		    		systemPanel.serialNumber = $(moduleId + ' .sub-sys-type-'+systemCode ).attr('data-serialNumber') ? $(moduleId + ' .sub-sys-type-'+systemCode ).attr('data-serialNumber'): allSystemPanels.length+1;

			    	savePersonality({
			    		params:{personality: JSON.stringify([systemPanel]),systemCode: systemCode},
			    		forbidConfirm:true
			    	},function(res){
						goPage('index');
					})
				}
			});
			let chooseSubModuleSelector =$('.choose-sub-module-open');
			
	    	chooseSubModuleSelector.find('.i-checks').iCheck({
			    checkboxClass: 'icheckbox_square-green',
			    radioClass: 'iradio_square-green',
			});
	    	systemPanels.forEach(function(value) {
	    		if(value.code == systemCode) {
	    			value.userSystemMonitorDtos.forEach(function(v2){
	    				chooseSubModuleSelector.find('input[value="' + v2.code + '"]').iCheck('check');
	    			})
	    		}
	    	})
		})
    	
    	
    },
    //移除子系统
    removePersonality = function(p,callback) {
    	let lindex = layer.confirm('确认移除？', {
    		btn: ['确认','取消'] //按钮
    	}, function(){
    		CentralConManage.getData({oper:'delPersonality',params:{systemCode:p.systemCode},type:'get'},function(res){
    			let removeIndex = null;
    			layer.close(lindex);
    			systemPanels.forEach(function(value,index){
    				if(value.code == p.systemCode) {
    					removeIndex = index;
    				}
    			})
    			systemPanels.splice(removeIndex,1);
    			if(typeof callback == 'function'){
    				callback(res)
    			}
    		})
    	});
    },
    
    //保存子系统移动
    saveSystemMove = function(callback){
    	let NewSystemPanels = getCurrentPanels(),
    		forbidConfirm = true,
    		confirmMsg = '确认保存';
    	if(NewSystemPanels.length == 0) {
    		forbidConfirm = false;
    		confirmMsg = '监控界面无任何模块，确认保存'
    	}
    	savePersonality({
    		params:{personality: JSON.stringify(NewSystemPanels)},
    		forbidConfirm:forbidConfirm,
    		confirmMsg: confirmMsg,
    		forbidLoading: true
    	},function(res){
    		systemPanels = NewSystemPanels;
    		if(typeof callback == 'function') {
    			callback(res)
    		}
    	},function(res){
    		renderMonitorData();
    	});
    },
    //获取当前界面的上的子系统及其模块
    getCurrentPanels = function() {
    	let currentPanels = [],
    	systemEl = $(moduleId + ' .sub-sys-item'),
    	subModuleEl = null;
		tempSys = {};
		tempSub = {};
    	if(systemEl.length == 0) {
    		return currentPanels;
    	}
    	systemEl.each(function(index1,v1) {
    		tempSys = $(v1).data();
    		tempSys.serialNumber = index1 + 1;
    		delete tempSys.serialnumber;
    		tempSys.show = true;
    		if(tempSys.hashourpassengerflow) {
    			tempSys.hasHourPassengerFlow = tempSys.hashourpassengerflow;
    		}
    		tempSys.userSystemMonitorDtos = [];
    		subModuleEl = $(v1).find('.echart-item');
    		subModuleEl.each(function(index2,v2) {
    			tempSub = $(v2).data()
    			tempSub.serialNumber = index2 + 1;
    			delete tempSub.serialnumber;
    			tempSub.show = true;
    			tempSys.userSystemMonitorDtos.push(tempSub);
    		})
    		currentPanels.push(tempSys);
    	})
    	
    	return currentPanels;
    },
    //获取接入的子系统和显示在监控区域的子系统
    getSubsystemPanels = function(){
	 	getData({oper:'subsystem-panels'},function(res){
	 		systemPanels = res.susSystems;
	 		allSystemPanels = res.allSystemPanels;
	 		console.log(res)
	 		getMonitorData();
	 	})
	},
	init = function(data){
    	let interalTime = 60 * 1000 * 10;
		systemPanels = data.systemPanels ? data.systemPanels : [];
		allStatus = data.allStatus ? data.allStatus : {};
		allSystemPanels = data.allSystemPanels ? data.allSystemPanels : [];
		operationCodes.systemPanel = data.operationCodes ? data.operationCodes : '';
		if(allSystemPanels.length > 0) {
			locationHost = location.host;
			eventInit();
			getMonitorData();
			//获取用户的处理报警、处理异常设备的权限
			getOperationCodes({moduleCode: 'top-alarm'},function(res){
				operationCodes.alarm = res;
				getOperationCodes({moduleCode: 'top-device-exception'},function(res){
					operationCodes.deviceException = res;
				});
			});
			window.onresize = function(){
				renderMonitorData()
			}
			
			if(centralTimer == null) {
				centralTimer = setInterval(function(){
					if(!$(moduleId + ' a[data-opt="editView"]').hasClass('active')) {
						getSubsystemPanels()
					}
				},interalTime)
			}
			$('a.J_menuItem').on('click',function(){
				if(centralTimer != null) {
					clearInterval(centralTimer);
					centralTimer = null;
				}
			})
		} else {
			$(moduleId + ' .view-opers').remove();
			$(moduleId + ' .tips').remove();
		}
	};
	return {
		init: init,
		getRightPanel: getRightPanel,
		rightPanelEventInit: rightPanelEventInit,
		getData: getData,
		removePersonality: removePersonality,
		saveSystemMove: saveSystemMove,
		renderSystemPanel: renderSystemPanel,
		getSubsystemPanels: getSubsystemPanels
	}
}());