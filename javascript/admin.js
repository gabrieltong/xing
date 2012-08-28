$(function(){
	$(".get-buildings").click(function(){
		var data = {id:"xing",name:"xing",buildings:[],data:{}}
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
		localStorage.setItem("xinghaiwanyihao-buildings",JSON.stringify(data))
	})
})