
$(function(){
	window.data = {id:"xing",name:"xing",buildings:[],data:{}}
	_(3).times(function(i){
		var _building = {index:i,name:"building_"+i,floors:[],data:{}}
		_(4).times(function(j){
			var _floor = {index:j,name:_building.name+"_floor_"+j,rooms:[],data:{}}
			_(5).times(function(k){
				_floor.rooms.push({index:k,name:_floor.name+"_room_"+k,data:{}})
			})
			_building.floors.push(_floor)
		})
		data.buildings.push(_building)		
	})	
	window.X = {
		V:{},
		M:{},
		C:{}
	}
	X.M.Base = Backbone.Model.extend({
		get_building:function(){
			return this.get("buildings").find(function(_building){
				return _building.get("selected")==true;
			})
		},
		get_floor:function(){
			var _building = this.get_building();
			if(_building){
				return _building.get("floors").find(function(_item){
					return _item.get("selected")==true;
				})
			}
			return null;
		}		
	})
	X.V.Base = Backbone.View.extend({
		_initialize:function(){
			this._init_options();
			this._init_events();
			this._bind();
		}
	})
	X.C.Base = Backbone.Collection.extend({
		
	})
	X.M.App = X.M.Base.extend({
		defaults:{
			selected:true,
			compute_way:'times'
		},		
		initialize:function(){			
			var _collection = new X.C.Building(this.get("buildings"));
			_collection.each(function(_building){
				_building.set('app',this)
			},this)
			this.set("buildings",_collection)
		}
	})
	X.M.Building = X.M.Base.extend({
		defaults:{
			selected:false,
		},		
		initialize:function(){
			var _collection = new X.C.Floor(this.get("floors"));
			_collection.each(function(_floor){
				_floor.set('building',this)
			},this)
			this.set("floors",_collection);
			var that = this;
			_.defer(function(){
				that._bind();
			})
		},
		_bind:function(){
			this.get('app').get('buildings').each(function(_building){
				if(_building!=this){
					_building.bind("change:selected",this.on_change_selected_building,this);					
				}
			},this)
		},
		on_change_selected_building:function(_building){
			if(_building.get('selected')==true){
				this.set("selected",false)
			}
		}
	})	
	X.M.Floor = X.M.Base.extend({
		defaults:{
			selected:false,
		},		
		initialize:function(){
			var _collection = new X.C.Room(this.get("rooms"));
			_collection.each(function(_floor){
				_floor.set('floor',this)
			},this)
			this.set("rooms",_collection)
			var that = this;
			_.defer(function(){
				that._bind();
			})
		},
		_bind:function(){
			this.get('building').bind("change:selected",this.on_change_selected_building,this);
			this.get('building').get("floors").each(function(_floor){
				if(_floor!=this){
					_floor.bind("change:selected",this.on_change_selected_floor,this);					
				}
			},this)
		},
		on_change_selected_building:function(){
			if(this.get("building").get("selected")==false && this.get("selected")==true){
				this.set("selected",false);
			}
		},
		on_change_selected_floor:function(_floor){
			if(_floor.get('selected')==true){
				this.set("selected",false)
			}
		}
	})
	X.M.Room = X.M.Base.extend({
		defaults:{
			selected:false,
		},		
		initialize:function(){
			var that = this;
			_.defer(function(){
				that._bind();
			})
		},
		_bind:function(){
			this.get("floor").get("rooms").each(function(_room){
				if(_room==this){
					this.bind("change:selected",this.on_change_selected_room,this);
				}
			},this)
			this.get('floor').bind("change:selected",this.on_change_selected_floor,this);
		},
		on_change_selected_room:function(_room){
			if(_room.get('selected')==true){
				this.set("selected",false)
			}	
		},
		on_change_selected_floor:function(){
			if(this.get("floor").get("selected")==false && this.get("selected")==true){
				this.set("selected",false);
			}
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
	X.V.BSelect = X.V.Base.extend({
		initialize:function(){
			this._initialize();
		},
		_init_options:function(){
			this.model.get('buildings').each(function(_item){
				this.$el.append("<option value="+_item.get("index")+">"+_item.get("name")+"</option>");
			},this)
		},
		_init_events:function(){
			var that = this;
			this.$el.change(function(){
				that.on_change_option();
			})
		},
		_bind:function(){
			this.model.get('buildings').each(function(_item){
				_item.bind('change:selected',this.on_change_selected,this);			
			},this)
		},
		on_change_option:function(){
			var _index = this.$el.val();
			if(_index != "please_select"){
				_index = parseInt(_index);
				this.model.get("buildings").each(function(_item){
					if(_item.get('index')==_index){
						_item.set('selected',true);
					}
				},this)
			}else{
				this.model.get("buildings").each(function(_item){
					if(_item.get("selected")==true){
						_item.set('selected',false);						
					}
				},this)
			}
		},
		on_change_selected:function(){
			var _item = this.model.get_building();
			if(_item){
				this.$el.val(_item.get('index'));
			}else{
				this.$el.val("please_select")
			}
		}
	})
	X.V.FSelect = X.V.Base.extend({
		initialize:function(){
			this._initialize();
		},
		_init_options:function(){
			this.$el.find(".option").remove();
			var _building =  this.model.get_building();
			if(_building){
				_building.get('floors').each(function(_item){
					this.$el.append("<option value="+_item.get("index")+" class='option'>"+_item.get("name")+"</option>");
				},this)				
			}
		},
		_init_events:function(){
			var that = this;
			this.$el.change(function(){
				that.on_change_option();
			})
		},
		_bind:function(){
			this.model.get('buildings').each(function(_building){
				_building.bind('change:selected',this.on_change_selected_building,this);
				_building.get("floors").each(function(_floor){
					_floor.bind("change:selected",this.on_change_selected_floor,this);
				},this)
			},this)
		},
		on_change_option:function(){
			var _index = this.$el.val();
			console.log(_index)
			if(_index != "please_select"){
				_index = parseInt(_index);
				var _building = this.model.get_building();
				if(_building){
					_building.get("floors").each(function(_item){
						if(_item.get("index")==_index){
							console.log("exe....")
							_item.set("selected",true)
						}
					})
				}
			}else{
				var _floor = this.model.get_floor();
				if(_floor){
					_floor.set('selected',false);											
				}
			}
			// console.log(this.model.get_floor().get("name"))
		},
		on_change_selected_building:function(){
			this._init_options();
		},
		// on_change_selected_floor:function(){
		// 			var _building = this.model.get("buildings").find(function(_item){
		// 				return _item.get("selected")==true;
		// 			},this);
		// 			if(_building){
		// 				var _floor = _building.get("floors").find(function(_item){
		// 					return _item.get("selected")==true;
		// 				},this);
		// 				if(_floor){
		// 					this.$el.val(_floor.get("index"))
		// 				}else{
		// 					this.$el.val("please_select")
		// 				}
		// 			}
		// 		}
	})
	X.V.RSelect = X.V.Base.extend({
		initialize:function(){
			this._initialize();
		},
		_init_options:function(){
			this.$el.find(".option").remove();
			try{
				var floor = this.model.get("buildings").find(function(_building){
					return _building.get("selected")==true;
				}).get("floors").find(function(_floor){
					return _floor.get("selected")==true;
				})
				floor.get('rooms').each(function(_item){
					this.$el.append("<option value="+_item.get("index")+" class='option'>"+_item.get("name")+"</option>");
				},this);
			}catch(e){
				console.log("there is no selected floor")
			}
		},
		_init_events:function(){
			
		},
		_bind:function(){
			this.model.get("buildings").each(function(_building){
				_building.get("floors").each(function(_floor){
					_floor.bind("change:selected",this.on_change_selected_floor,this)
				},this)
			},this)	
		},
		on_change_selected_floor:function(){
			this._init_options();
		},
		on_change_selected:function(){
			if(this.model.get('selected')==true){
				this.$el.show();
			}else{
				this.$el.hide();
			}
		}
	})	
	X.V.Menu = X.V.Base.extend({
		initialize:function(){
			this._init_building_select();
		},
		_init_building_select:function(){
			
		}
	})
	window.app = new X.M.App(data);
	window.building_select = new X.V.BSelect({model:app,el:$(".building_select")})
	window.floor_select = new X.V.FSelect({model:app,el:$(".floor_select")})
	window.room_select = new X.V.RSelect({model:app,el:$(".room_select")})		
})