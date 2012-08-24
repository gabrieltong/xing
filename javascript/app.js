//todo:add style to item selected(_building,_floor,_room) for left 
//warning:for binding problem , we suppose the buildings data will not remove after page show , if data changes , refresh the page .

$(function(){
	window.data = {id:"xing",name:"xing",buildings:[],data:{}};
	_(10).times(function(i){
		var _building = {index:i,name:"building_"+i,floors:[],data:{}}
		_(20).times(function(j){
			var _floor = {index:j,name:j,rooms:[],data:{}}
			_(8).times(function(k){
				_floor.rooms.push({index:k,name:"room_"+k,data:{},area:parseInt(Math.random()*1000).toString(),type:"四室两厅"})
			})
			_building.floors.push(_floor)
		})
		data.buildings.push(_building)		
	})
	function zh_for_int(val){
		var _time = '';
		switch(val){
			case 1:_time = "一";break;			
			case 2:_time = "二";break;
			case 3:_time = "三";break;
			case 4:_time = "四";break;
			case 5:_time = "五";break;			
			case 6:_time = "六";break;
			case 7:_time = "七";break;
			case 8:_time = "八";break;			
		}
		return	_time;
	}
	window.X = {
		V:{},
		M:{},
		C:{}
	};
	X.M.Base = Backbone.Model.extend({
		get_building:function(){
			return this.get("buildings").find(function(_building){
				return _building.get("selected")===true;
			})
		},
		get_floor:function(){
			var _building = this.get_building();
			if(_building){
				return _building.get("floors").find(function(_item){
					return _item.get("selected")===true;
				})
			}
			return null;
		},
		get_room:function(){
			var _floor = this.get_floor();
			if(_floor){
				return _floor.get("rooms").find(function(_item){
					return _item.get("selected")===true;
				});
			}
			return null;
		},
		get_compute:function(){
			return this.get(this.get("compute_way"));
		}
	});
	X.V.Base = Backbone.View.extend({
		_initialize:function(){
			this._render();
			this._bind();
		},
		_init_options:function(){
			console.log("super _init_options");
		},
		_bind:function(){
			console.log("super _bind");					
		},
		_render:function(){
			$(this.el).html(this.template(this.model?this.model.attributes:{}));
		}
	});
	X.V.Details = X.V.Base.extend({
		_render_room:function(){
			var _room = this.model.get_room();
			this.$el.find(".building_name").html(_room===null?'':_room.get_building_name());
			this.$el.find(".room_name").html(_room===null?'':_room.get('name'));
			this.$el.find(".room_type").html(_room===null?'':_room.get('type'));
			this.$el.find(".room_area").html(_room===null?'':_room.get('area'));
		},
		_bind:function(){
			this.model.get("buildings").each(function(_building){
				_building.get("floors").each(function(_floor){					
					_floor.get("rooms").each(function(_room){
						_room.bind("change:selected",this._render,this);											
					},this);
				},this);
			},this);
		}
	});
	X.C.Base = Backbone.Collection.extend({

	});
	X.M.Times = X.M.Base.extend({
		defaults:{
			danjia:null,
			qishu:3
		},
		is_valid:function(){
			var _r = {success:true,errors:[]};
			if(_.isNull(this.get("app").get_room())){
				_r.success = false;
				_r.errors.push({key:"room",msg:"请选择房间"});
			}			
			if(!_.isNumber(this.get("danjia")) || _.isNaN(this.get("danjia"))){
				_r.success = false;
				_r.errors.push({key:"danjia",msg:"请输入正确的单价"});
			}
			return _r;
		},
		compute:function(){
			var _room = this.get("app").get_room();
			if(!_room){
				return;
			}
			var _danjia = this.get("danjia");
			var _qishu = this.get("qishu");
			var _area = _room.get("area");
			var _total = _area*_danjia;
			var _info =  {total:_area*_danjia,qishu:[],danjia:_danjia};
			_.times(_qishu,function(_item){
				_info.qishu.push(parseInt(_total/_qishu));
			},this);
			return _info;
		}		
	});
	X.M.All = X.M.Base.extend({
		defaults:{
			danjia:10000
		},
		compute:function(){
			var _room = this.get("app").get_room();
			if(!_room){
				return;
			}
			var _danjia = this.get("danjia");
			var _area = _room.get("area");
			var _total = _area*_danjia;
			return {total:parseInt(_total),danjia:_danjia}
		}
	});
	X.M.Credit = X.M.Base.extend({
		defaults:{
			base_lilv:0.07,
			danjia:null,
			leixing:'money',
			anjie:null,
			anjie_choices:[
				{name:"二成",value:0.2},
				{name:"三成",value:0.3},
				{name:"六成",value:0.6},
				{name:"八成",value:0.8}				
			],
			nianshu:null,
			nianshu_choices:[
				{name:5 ,value:5},
				{name:10,value:10},
				{name:20,value:20},
				{name:30,value:30}	
			],
			lilv:null,
			lilv_choices:[
				{name:0.7 ,value:0.7 },
				{name:0.85,value:0.85},
				{name:1   ,value:1},
				{name:1.1 ,value:1.1}	
			]		
		},
		is_valid:function(){
			var _r = {success:true,errors:[]};
			if(_.isNull(this.get("app").get_room())){
				_r.success = false;
				_r.errors.push({key:"room",msg:"请选择房间"});
			}
			if(!_.isNumber(this.get("danjia")) || _.isNaN(this.get("danjia"))){
				_r.success = false;
				_r.errors.push({key:"danjia",msg:"请输入正确的单价"});
			}
			if(_.isNull(this.get("anjie"))){
				_r.success = false;
				_r.errors.push({key:"anjie",msg:"请选择按揭"});
			}			
			if(_.isNull(this.get("nianshu"))){
				_r.success = false;
				_r.errors.push({key:"nianshu",msg:"请选择年数"});
			}			
			if(_.isNull(this.get("lilv"))){
				_r.success = false;
				_r.errors.push({key:"lilv",msg:"请选择利率"});
			}			
			return _r;
		},		
		compute:function(){
			var _room = this.get("app").get_room();
			if(!_room){
				return;
			}
			var _area    = _room.get("area");			
			var _anjie  = this.get("anjie");
			var _danjia  = this.get("danjia");
			var _nianshu = this.get("nianshu");
			var _lilv    = this.get("lilv");
			var _leixing = this.get("leixing");
			var _base_lilv = this.get("base_lilv");
			var _total = _area*_danjia;
			var _info;
			var _shoufu = _total*_anjie;
			var _credit = _total*(1-_anjie);
			if(_leixing==='money'){
				_info =  this.compute_equal_money(_credit,_base_lilv*_lilv,_nianshu);
			}else{
				_info =  this.compute_equal_tax(_credit,_base_lilv*_lilv,_nianshu);
			}
			_info.total = _total;
			_info.danjia = _danjia;
			_info.shoufu = parseInt(_shoufu);
			return _info;
		},
		compute_equal_money:function(money,rate,year){					
			return this._equal_money(money,rate,year*12,year*12);
		},
		compute_equal_tax:function(money,rate,year){
			return this._equal_tax(money,rate,year*12,year*12);			
		},
		_equal_tax:function(money,rate,months,to_month){
			var _money = money/months;
			var _obj = [];
			var _taxes = 0;
			for(var i=1;i<=to_month;i++){
				var _tax = money*rate/12;
				var _total = _money + _tax;
				money -= _money;
				_taxes +=_tax;
				_obj.push({total:parseInt(_total),tax:parseInt(_tax),money:parseInt(_money)});
			}
			return {months:_obj,tax:parseInt(_taxes)};
		},
		_equal_money:function(money,rate,months,to_month){
			var _obj = [];	
			var _taxes = 0;	
			var _total =  money*[rate/12*Math.pow((1+rate/12),months)]/[Math.pow((1+rate/12),months)-1] ;
			for(var i=1;i<=to_month;i++){
				var _tax = money*rate/12;
				var _money = _total-_tax;
				money -= _money;
				_taxes +=_tax;		
				_obj.push({total:parseInt(_total),tax:parseInt(_tax),money:parseInt(_money)});	
			}
			return {months:_obj,tax:parseInt(_taxes)};
		}
	});
	
	X.M.App = X.M.Base.extend({
		defaults:{
			selected:true,
			compute_way:'compute_times',
			guwen:null,
			guwen_choices:[
				{name:"刘德华",value:1},
				{name:"张学友",value:2},
				{name:"前学僧",value:3},
				{name:"比尔盖斯",value:4}				
			]
		},		
		initialize:function(){			
			var _collection = new X.C.Building(this.get("buildings"));
			_collection.each(function(_building){
				_building.set('app',this);
			},this);
			this.set("buildings",_collection);
			var _times = new X.M.Times();
			_times.set("app",this);
			this.set("compute_times",_times);
			var _all = new X.M.All();
			_all.set("app",this);
			this.set("compute_all",_all);
			var _credit = new X.M.Credit();
			_credit.set("app",this);
			this.set("compute_credit",_credit);			
		}
	});
	X.M.Building = X.M.Base.extend({
		defaults:{
			selected:false
		},		
		initialize:function(){
			var _collection = new X.C.Floor(this.get("floors"));
			_collection.each(function(_floor){
				_floor.set('building',this);
			},this);
			this.set("floors",_collection);
			var that = this;
			_.defer(function(){
				that._bind();
			});
		},
		_bind:function(){
			this.get('app').get('buildings').each(function(_building){
				if(_building!==this){
					_building.bind("change:selected",this.on_change_selected_building,this);					
				}
			},this);
		},
		on_change_selected_building:function(_building){
			if(_building.get('selected')===true){
				this.set("selected",false);
			}
		}
	});
	X.M.Floor = X.M.Base.extend({
		defaults:{
			selected:false
		},		
		initialize:function(){
			var _collection = new X.C.Room(this.get("rooms"));
			_collection.each(function(_floor){
				_floor.set('floor',this);
			},this);
			this.set("rooms",_collection)
			var that = this;
			_.defer(function(){
				that._bind();
			});
		},
		_bind:function(){
			this.get('building').bind("change:selected",this.on_change_selected_building,this);
			this.get('building').get("floors").each(function(_floor){
				if(_floor!==this){
					_floor.bind("change:selected",this.on_change_selected_floor,this);					
				}
			},this);
		},
		on_change_selected_building:function(){
			if(this.get("building").get("selected")===false){
				this.set("selected",false);
			}
		},
		on_change_selected_floor:function(_floor){
			if(_floor.get('selected')===true){
				this.set("selected",false);
			}
		}
	});
	X.M.Room = X.M.Base.extend({
		defaults:{
			selected:false,
			type:'一室一厅',
			area:100
		},		
		initialize:function(){
			var that = this;
			_.defer(function(){
				that._bind();
			});
		},
		_bind:function(){
			this.get('floor').bind("change:selected",this.on_change_selected_floor,this);			
			this.get("floor").get("rooms").each(function(_room){
				if(_room!==this){
					_room.bind("change:selected",this.on_change_selected_room,this);
				}
			},this);
		},
		on_change_selected_floor:function(){
			if(this.get("floor").get("selected")===false){
				this.set("selected",false);
			}
		},
		on_change_selected_room:function(_room){
			if(_room.get('selected')==true){
				this.set("selected",false)
			}	
		},
		get_building_name:function(){
			return this.get("floor").get('building').get("name")+this.get("floor").get('name');
		}
	})
	X.C.Building = X.C.Base.extend({
		model:X.M.Building
	})	
	X.C.Floor = X.C.Base.extend({
		model:X.M.Floor		
	})
	X.C.Room = X.C.Base.extend({
		model:X.M.Room		
	})
	X.V.Li = X.V.Base.extend({
		tagName:'li',
		events:{
			'click a':'on_click'
		},
		template:_.template("<a href='#'><%=name%></a>"),
		initialize:function(){
			this._render();
		},
		on_click:function(){
			this.model.set("selected",!this.model.get("selected"))
		}
	})
	X.V.Td = X.V.Base.extend({
		tagName:'td',
		events:{
			'click a':'on_click'
		},
		template:_.template("<a href='#'><%=name%></a>"),
		initialize:function(){
			this._render();
		},
		on_click:function(){
			this.model.set("selected",!this.model.get("selected"))
		}
	})	
	X.V.Left = X.V.Base.extend({
		initialize:function(){
			this._render();
			this._bind();
		},
		events:{
			'click .action_math'  :'_on_action_math'  ,			
			'click .logo'  :'_on_click_logo'  ,						
			'click .action_intro'  :'_on_action_intro'  ,
			'click .action_design' :'_on_action_design' ,
			'click .action_live'   :'_on_action_live'   ,
			'click .action_space'  :'_on_action_space'  ,
			'click .action_service':'_on_action_service',
			'click .action_sale'   :'_on_action_sale'   ,
			'click .action_client' :'_on_action_client' 
		},
		_on_click_logo:function(){
			this.options.route.navigate("views",{trigger:true})
		},		
		_on_action_math:function(){
			this.options.route.navigate("compute",{trigger:true})
		},		
		_on_action_intro:function(){},
		_on_action_design:function(){},
		_on_action_live:function(){},
		_on_action_space:function(){},	
		_on_action_service:function(){},			
		_on_action_sale:function(){},
		_on_action_client:function(){},								
		_render:function(){
			this._render_buildings();
			this._render_floors();
			this._render_rooms();
		},
		_render_buildings:function(){
			this.$el.find('.buildings .dropdown-menu').empty();
			this.model.get("buildings").each(function(_building){
				this.$el.find('.buildings .dropdown-menu').append(new X.V.Li({model:_building}).el)
			},this)
			var _building = this.model.get_building();
			this.$el.find('.buildings .result').html(_building==null?"请选择:":_building.get("name"))
		},
		_render_floors:function(){
			this.$el.find('.floors .dropdown-menu').empty();
			var _building = this.model.get_building();
			if(_building){
				_building.get("floors").each(function(_floor,i){
					if(i%4==0){
						this.$el.find('.floors .dropdown-menu').append('<tr></tr>');
					}
					this.$el.find('.floors .dropdown-menu tr:last').append(new X.V.Td({model:_floor}).el)
				},this)
			}
			var _floor = this.model.get_floor();
			this.$el.find('.floors .result').html(_floor==null?"请选择:":_floor.get("name"))			
		},
		_render_rooms:function(){
			this.$el.find('.rooms .dropdown-menu').empty();
			var _floor = this.model.get_floor();
			if(_floor){
				_floor.get("rooms").each(function(_room,i){
					this.$el.find('.rooms .dropdown-menu').append(new X.V.Li({model:_room}).el)
				},this)
			}
			var _room = this.model.get_room();
			this.$el.find('.rooms .result').html(_room==null?"请选择:":_room.get("name"))			
		},
		_bind:function(){
			this.model.get("buildings").each(function(_building){
				_building.bind("change:selected",this._render,this);
				_building.get("floors").each(function(_floor){
					_floor.bind("change:selected",this._render,this);					
					_floor.get("rooms").each(function(_room){
						_room.bind("change:selected",this._render,this);											
					},this)
				},this)
			},this)
			this.options.route.bind("route:views",function(){
				this.$el.show();
			},this)
			this.options.route.bind("route:compute",function(){
				this.$el.show();
			},this)			
			this.options.route.bind("route:details",function(){
				this.$el.hide();
			},this)
		},
	})
	X.V.Times = X.V.Base.extend({
		initialize:function(){
			this._render();
			this._bind();
		},
		events:{
			'click .qishu .btn':"_on_change_qishu",
		},
		_bind:function(){
			var that = this;
			this.model.bind("change:qishu",this._render,this);
			this.$el.find(".danjia").keyup(function(){
				that._on_change_danjia();
			})
		},
		_render:function(){
			this._render_qishu();
		},
		_render_qishu:function(){
			this.$el.find(".qishu .btn").removeClass("active");
			this.$el.find(".qishu .btn").eq(this.model.get('qishu')-2).addClass("active");
		},
		_on_change_qishu:function(e){
			this.model.set("qishu",parseInt($(e.target).attr("value")))
		},
		_on_change_danjia:function(e){
			this.model.set("danjia",parseInt(this.$el.find(".danjia").val()))
		}
	})
	X.V.Credit = X.V.Base.extend({
		initialize:function(){
			this._render();
			this._bind();
			var that = this;
			
		},
		events:{
			'click .leixing .btn':"_on_change_leixing",
		},
		_bind:function(){
			this.model.bind("change:leixing",this._render,this);
			this.model.bind("change:nianshu",this._render,this);			
			var that = this;
			this.$el.find(".danjia").keyup(function(){
				that._on_change_danjia();
			})
		},
		_render_leixing:function(){
			var that = this;
			this.$el.find(".leixing .btn").removeClass("active");
			this.$el.find(".leixing .btn").each(function(){
				if($(this).attr('value')==that.model.get("leixing")){
					$(this).addClass('active');
				}
			})
		},
		_render_nianshu:function(){
			var that = this;
			this.$el.find(".nianshu .btn").removeClass("active");
			this.$el.find(".nianshu .btn").each(function(){
				if($(this).attr('value')==that.model.get("nianshu")){
					$(this).addClass('active');
				}
			})
		},		
		_on_change_leixing:function(e){
			this.model.set("leixing",$(e.target).attr("value"))
		},		
		_render:function(){
			this._render_leixing();
			this._render_nianshu();
		},
		_on_change_danjia:function(e){
			this.model.set("danjia",parseInt(this.$el.find(".danjia").val()))
		}
	})	
	X.V.All = X.V.Base.extend({
		initialize:function(){
			this._render();
			this._bind();
		},
		_bind:function(){
			var that = this;
			this.$el.find(".danjia").keyup(function(){
				that._on_change_danjia();
			})
		},
		_render:function(){},
		_on_change_danjia:function(e){
			this.model.set("danjia",parseInt(this.$el.find(".danjia").val()))
		}
	})

	X.M.DDLi = X.M.Base.extend({

	})	
	X.V.DDUl = X.V.Base.extend({
		initialize:function(){
			this._render();
			this._bind();
		},
		_render:function(){
			this.$el.find('ul').empty();
			console.log(this.model.get(this.options.choices))
			_.each(this.model.get(this.options.choices),function(_item){
				var _model = new X.M.DDLi(_item);
				var _li = new X.V.DDLi({model:_model,target:this.model,key:this.options.key})
				this.$el.find('ul').append(_li.el);
			},this)
		},
		_bind:function(){
			this.model.bind("change:"+this.options.key,this._on_change,this);
		},
		_on_change:function(){
			var _choice = _.find(this.model.get(this.options.choices),function(_item){
				return this.model.get(this.options.key) == _item.value;
			},this)
			if(_choice){
				this.$el.find('.please').html(_choice.name);				
			}
		}
	})
	X.V.DDLi = X.V.Base.extend({
		tagName:"li",
		events:{
			'click a':'on_click',
		},
		initialize:function(){
			this._render();
		},
		on_click:function(){
			this.options.target.set(this.options.key,this.model.get("value"));
		},
		template:_.template("<li><a href='#'><%=name%></a></li>")
	})
	X.V.Right = X.V.Details.extend({
		initialize:function(){
			this._render();
			this._bind();
			this.options.route.bind("route:views",function(){
				this.$el.hide();
			},this)
			this.options.route.bind("route:compute",function(){
				this.$el.show();
			},this)			
			this.options.route.bind("route:details",function(){
				this.$el.hide();
			},this)			
			this.compute_times = new X.V.Times({model:this.model.get("compute_times"),el:this.$el.find("div.compute_times")});
			this.compute_all = new X.V.All({model:this.model.get("compute_all"),el:this.$el.find("div.compute_all")});			
			this.compute_credit = new X.V.Credit({model:this.model.get("compute_credit"),el:this.$el.find("div.compute_credit")});						
			this.nianshu = new X.V.DDUl({model:this.model.get("compute_credit"),key:'nianshu',choices:'nianshu_choices',el:$(".compute_credit .nianshu")})
			this.anjie = new X.V.DDUl({model:this.model.get("compute_credit"),key:'anjie',choices:'anjie_choices',el:$(".compute_credit .anjie")})	
			this.lilv = new X.V.DDUl({model:this.model.get("compute_credit"),key:'lilv',choices:'lilv_choices',el:$(".compute_credit .lilv")})			
		},
		_render:function(){
			this._render_room();
		},
		events:{
			'click li.compute_times'  :'_on_tab_compute_times'  ,
			'click li.compute_all'    :'_on_tab_compute_all'    ,
			'click li.compute_credit'    :'_on_tab_compute_credit'    ,
			'click .compute'    		: 	'_on_action_math'    ,						
		},
		_on_action_math:function(){
			var is_valid = this.model.get_compute().is_valid();
			if(is_valid.success){
				this.options.route.navigate("details",{trigger:true})				
			}else{
				this.options.warning.warn(is_valid.errors);
			}
		},		
		_on_tab_compute_times:function(){
			this.model.set("compute_way","compute_times");
		},
		_on_tab_compute_all:function(){
			this.model.set("compute_way","compute_all");
		},
		_on_tab_compute_credit:function(){
			this.model.set("compute_way","compute_credit");
		},		
	})
	X.V.PayDetails = X.V.Details.extend({
		initialize:function(){
			this._render();
			this._bind();
		},
		events:{
			"click .compute_again":"_on_compute_again",
			"click .print":"_on_print",			
		},
		_on_compute_again:function(){
			this.options.route.navigate("compute",{trigger:true})
		},
		_on_print:function(){
			this.options.confirm.$el.modal("show");
		},
		_bind:function(){
			this.options.route.bind("route:views",function(){
				this.$el.hide();
			},this)
			this.options.route.bind("route:compute",function(){
				this.$el.hide();
			},this)			
			this.options.route.bind("route:details",function(){
				this._render();
				this.$el.show();
			},this)			
		},
		_render:function(){
			this._render_room();
			this._render_compute_way();
			this._render_compute_pay();
		},
		_render_compute_way:function(){
			var _base;
			var _way = '';	
			if(this.model.get("compute_way")=='compute_times'){
				_base = this.model.get("compute_times").compute();
			}else if(this.model.get("compute_way")=='compute_credit'){
				_base = this.model.get("compute_credit").compute();
			}else if(this.model.get("compute_way")=='compute_all'){
				_base = this.model.get("compute_all").compute();
			}else{
				return;
			}
			
			console.log(_base);
			if(!_base){
				return;
			}
			switch(this.model.get("compute_way")){
				case 'compute_times':_way  = "分期付款";break;
				case 'compute_all':_way    = "一次性付清";break;
				case 'compute_credit':_way = "商业贷款";break;				
			}
			this.$el.find(".compute_way").html(_way);
			this.$el.find(".danjia").html("￥"+_base.danjia+'m<sup>2</sup>');
			this.$el.find(".total").html("￥"+_base.total);			
		},
		_render_compute_pay:function(){
			this.$el.find(".pay_h1,.credit,.times").hide();
			console.log(this.model.get("compute_way"));
			if(this.model.get("compute_way")=='compute_times'){
				this._render_compute_times();
			}else if(this.model.get("compute_way")=='compute_credit'){
				this._render_compute_credit();				
			}
		},
		_render_compute_times:function(){
			console.log("in console")
			this.$el.find(".times_list").empty();
			this.$el.find(".times,.pay_h1").show();			
			var _time = zh_for_int(this.model.get("compute_times").get("qishu"));
			this.$el.find(".times_value").html(_time+"期");
			var _info = this.model.get("compute_times").compute();
			console.log(_info)
			if(_info){
				_.each(_info.qishu,function(_item,i){
					this.$el.find(".times_list").append("<div class='g_span'> \
						<span>"+zh_for_int((i+1))+"期：</span>                                    \
						<span>￥"+_item+"</span>                         \
					</div>");
				},this)				
			}
		},
		_render_compute_credit:function(){
			this.$el.find(".credit,.pay_h1").show('');
			var _info = this.model.get("compute_credit").compute();
			this.$el.find(".credit .leixing").html(this.model.get("compute_credit").get('leixing'));
			this.$el.find(".credit .nianshu").html(this.model.get("compute_credit").get('nianshu'));
			this.$el.find(".credit .anjie").html(this.model.get("compute_credit").get('anjie'));
			this.$el.find(".credit .shoufu").html("￥"+_info.shoufu);
			this.$el.find(".credit .money_month").html("￥"+_info.months[0].total);
		},		
	})
	X.V.Views = X.V.Base.extend({
		initialize:function(){
			this._bind();
		},
		_bind:function(){
			this.options.route.bind("route:views",function(){
				this.$el.show();
			},this)
			this.options.route.bind("route:compute",function(){
				this.$el.hide();
			},this)			
			this.options.route.bind("route:details",function(){
				this.$el.hide();
			},this)			
		}
	})
	X.R = Backbone.Router.extend({
		routes: {
			"views": "views" ,
			"compute": "compute" ,
			"details": "details" 						
		}
	});
	X.V.Warning = X.V.Base.extend({
		initialize:function(){},
		warn:function(errors){
			this.$el.find(".body").empty();
			_.each(errors,function(_error){
				console.log(errors)
				this.$el.find(".body").append("<p>"+_error.msg+"</p>")
			},this)
			this.$el.modal("show")
		}
	})
	X.V.ConfirmPrint = X.V.Base.extend({
		initialize:function(){
			this.guwen = new X.V.DDUl({model:this.model,key:'guwen',choices:'guwen_choices',el:this.$el.find(".guwen")})
		},
		confirm:function(errors){
			this.$el.modal("show")
		}
	})	
	X.V.App = X.V.Base.extend({
		initialize:function(){
			var that = this;
			this.route = new X.R;
			this.warning = new X.V.Warning({el:$(".warning_panel")});
			this.confirm = new X.V.ConfirmPrint({model:this.model,el:$(".confirm_print")});			
			this.left = new X.V.Left({model:this.model,el:$(".left"),route:this.route,warning:this.warning,confirm:this.confirm});	
			this.right = new X.V.Right({model:this.model,el:$(".right"),route:this.route,warning:this.warning,confirm:this.confirm});
			this.views = new X.V.Views({model:this.model,el:$(".views"),route:this.route,warning:this.warning,confirm:this.confirm})
			this.pay = new X.V.PayDetails({model:this.model,el:$(".pay_details"),route:this.route,warning:this.warning,confirm:this.confirm});
			_.defer(function(){
				Backbone.history.start();
				that.route.navigate('views',{trigger:true})
			})
		}
	})
	window.app = new X.V.App({model:new X.M.App(data)})
})