var wxContext = {};
(function(w){
	/**
	 * config 配置属性
	 * wxContext: object , 代表当前wx所有环境变量
	 * wxIndex: int, 当前ws的唯一编号索引
	 * $Q: jQuery  当关注的jq对象 
	 * 
	 */
	var SmartWebSocket = function (config) {
		var _this = this,
			_wxContext = wxContext || {};
		this.wxIndex = config.wxIndex;
		this.ws=null;
		this.$Q=null;
		this.number = 0;
		this.config={
				url:"",
				wsCallbacks: {}
		};//当前默认值
		_this.config.url = config.url;
		_this.config.wsCallbacks= config.callbacks ? config.callbacks: {}
		
		/** 
		 * 内部ws的事件回调机制触发公共方法
		 * 当前返回结果集： 执行成功：true，执行失败：false
		 * @param fireType
		 * @param e
		 * @param data	  
		 */
		var fireWsEvent = function(fireType,e,data){
			if(!fireType){
				return false;
			}
			var cb = _this.config.wsCallbacks[fireType];
			if(cb && Array.isArray(cb) && cb.length > 0 ){
				cb.each(function(index,callback){
					if(typeof callback =='function'){
						callback(e,data);
					}
				})
			} else {
				if(typeof cb =='function'){
					cb(e,data);
				}
			}
			return true;
		}
		
		/**
		 * 验证当前相关配置是否正确，返回true：false
		 */
		this.checkConfig = function(callback){
			var isSuccess = true;
			if(wxContext && Object.keys(wxContext).length >= 6) {//本次使用的自定义浏览器， 最多允许6个web socket的存在
				isSuccess = false;
			}
			if(!(_this.config.url && _this.config.url != '')) {
				isSuccess = false;
			}
			if(callback && typeof callback =='function'){
				callback(isSuccess,_this);
			}
			return isSuccess;
		}
		/**
		 * 销毁当前wx连接，并销毁当前内部对象
		 */
		this.destory = function(){
			// close 之前先判断是否有效连接
			let ws = _wxContext[this.wxIndex];
			if(ws){
				//注意连接状态
				ws.close();
				ws = null;
				delete _wxContext[this.wxIndex];
			}
			if(this.checkAlive()){
				//注意连接状态
				try{
					this.ws.close();
				}catch(e){
					console.error(e);
				}
				this.ws=null;
			}
			this.ws=null;
			if(this.$Q){
				this.$Q = null;
			}
		}
		
		/**
		 * 检查ws当前管道是否存活
		 * 存活：true,
		 * 反之：false
		 */
		this.checkAlive = function(){
			return this.ws && true;
		}
		/**
		 * 发送消息
		 */
		this.onsend =function(data){
			if(!this.checkAlive()){
				console.error("管道未连接");
				return false;
			}
			this.ws.send(data);
			fireWsEvent.call("onsend",data);
		}
		
		/**
		 * 初始化，重置连接，初始相关data数据
		 * 初始化未存在的环境变量
		 */
		this.init = function(url,callbacks){
				_this.destory();
				this.number += 1;
				
				if(!this.checkConfig()){
					return false;
				};
				var _ws = new WebSocket(_this.config.url); 
				_ws.onopen = function (e) {   
					fireWsEvent("open",e);
			    }
				_ws.onmessage = function (e) {  
					console.info('接受到数据：' + e.data);
					fireWsEvent("message",e);
			    }  
				_ws.onclose = function (e) {   
					console.log('链接已经关闭');
					fireWsEvent("close",e);
			    }  
				_ws.onerror = function (e) {
			        console.log('发生异常:'+e.message);
					fireWsEvent("error",e);
			    }
				this.ws = _ws;
				wxContext[this.wxIndex] = _ws;
				return this;
			};
		/*return this.init();*/  
	}
	w['SmartWebSocket'] = SmartWebSocket
	return w;
})(window,jQuery,undefined);