demo.registerFilter('floor', function(box, json){
	return {
		type: 'cube',
		width: 1000,
		height: 10,
		depth: 1000,
		translate: [0, -10, 0],
		shadowHost: true,
		op: '+',
		style: {
			'm.type': 'phong',
			'm.color': '#BEC9BE',
			'm.ambient': '#BEC9BE',
			'top.m.type':'basic',
			'top.m.texture.image': demo.getRes('floor.jpg'),
			'top.m.texture.repeat': new mono.Vec2(10,10),
			'top.m.color': '#DAF0F5',
			'top.m.polygonOffset':true,
			'top.m.polygonOffsetFactor':3,
			'top.m.polygonOffsetUnits':3,
		}
	};
});

demo.registerFilter('floor_cut', function(box, json){
	return {
		type: 'cube',
		width: 100,
		height: 100,
		depth: 100,
		op: '-',
		style: {
			'm.texture.image': demo.getRes('floor.jpg'),
			'm.texture.repeat': new mono.Vec2(4,4),
			'm.color': '#DAF0F5',
			'm.lightmap.image': demo.getRes('outside_lightmap.jpg'),
			'm.polygonOffset':true,
			'm.polygonOffsetFactor':3,
			'm.polygonOffsetUnits':3,
		}
	};
});

demo.registerFilter('floor_box', function(box, json){
	return {
		type: 'cube',
		width: 100,
		height: 100,
		depth: 100,
		shadow: true,
		sideColor: '#C3D5EE',
		topColor: '#D6E4EC',
		client: {
			type: 'floor_box'
		}
	};
});

demo.registerFilter('plants', function(box, json){
	var objects=[];
	var translates=json.translates;
	if(translates){
		for(var i=0;i<translates.length;i++){
			var translate=translates[i];
			var plant={
				type: 'plant',
				shadow: true,
				translate: translate,
			};
			demo.copyProperties(json, plant, ['type', 'translates', 'translate']);
			objects.push(plant);
		}
	}
	return objects;
});

demo.registerFilter('racks', function(box, json){
	var objects=[];
	var translates=json.translates;
	var severities=json.severities || [];
	var labels=json.labels || [];
	if(translates){
		for(var i=0;i<translates.length;i++){
			var translate=translates[i];
			var severity=severities[i];
			var label=labels[i] || '';
			var rack={
				type: 'rack',
				shadow: true,
				translate: translate,
				severity: severity,
				label: label,
			};
			demo.copyProperties(json, rack, ['type', 'translates', 'translate', 'severities']);
			objects.push(rack);
		}
	}
	return objects;
});

demo.registerFilter('wall', function(box, json){	
	var objects=[];

	var wall = {
		type: 'path',
		op: '+',
		width: 20,
		height: 200,
		shadow: true,
		insideColor: '#B8CAD5',
		outsideColor: '#A5BDDD',		
		topColor: '#D6E4EC',
		translate: json.translate,
		data:json.data,

		client: {
			'data': json.data,
			'type': 'wall',
			'translate': json.translate,
		},
	};
			
	objects.push(wall);		

	if(json.children){	
		var children=demo.filterJson(box, json.children);				
		objects=objects.concat(children);	
	}

	var comboChildren=[];
	var returnObjects=[];
	for(var i=0;i<objects.length;i++){
		var child=objects[i];
		if(child.op){
			comboChildren.push(child);
		}else{
			returnObjects.push(child);
		}
	}
	
	var comboWall = demo.createCombo(comboChildren);
	comboWall.shadow = true;
	comboWall.setClient('data', json.data);
	comboWall.setClient('type','wall');
	comboWall.setClient('translate',json.translate);
	box.add(comboWall);

	return returnObjects;
});

demo.registerFilter('window', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width || 100,
		height=json.height || 100,
		depth=json.depth || 50;
	var glassDepth=2;
	var platformHeight=5,
		platformDepth=45,
		platformOffsetZ=10;

	return [{
		// window cut off
		type: 'cube',
		width: width,
		height: height,
		depth: depth, 
		translate: [x, y, z],
		op: '-',
		sideColor: '#B8CAD5',
		topColor: '#D6E4EC',		
		
	},{
		//window glass
		type: 'cube',
		width: width-0.5,
		height: height-0.5,
		depth: glassDepth,
		translate: [x, y, z],
		op: '+',
		style: {			
			'm.color':'#58ACFA',
			'm.ambient':'#58ACFA',
			'm.type':'phong',
			'm.specularStrength': 0.1,
			'm.envmap.image': demo.getEnvMap(),
			'm.specularmap.image': demo.getRes('rack_inside_normal.jpg'),	
			'm.texture.repeat': new mono.Vec2(10,5),
			'front.m.transparent': true,
			'front.m.opacity':0.4,
			'back.m.transparent': true,
			'back.m.opacity':0.4,
		},			
	},{
		//window bottom platform.
		type: 'cube',
		width: width,
		height: platformHeight,
		depth: platformDepth, 
		translate: [x, y, z+platformOffsetZ],
		op: '+',
		sideColor: '#A5BDDD',
		topColor: '#D6E4EC',
	}];
});

demo.registerFilter('door', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width || 205,
		height=json.height || 180,
		depth=json.depth || 26;	
	var frameEdge=10,
		frameBottomEdge=2;

	return [{
		//door frame.
		type: 'cube',
		width: width,
		height: height,
		depth: depth,
		translate: [x, y, z],
		op: '+',
		sideColor: '#C3D5EE',
		topColor: '#D6E4EC',
	},{
		//door cut off.
		type: 'cube',
		width: width-frameEdge,
		height: height-frameEdge/2-frameBottomEdge,
		depth: depth+2,
		op: '-',
		translate:[x,y+frameBottomEdge,z],
		sideColor: '#B8CAD5',
		topColor: '#D6E4EC',			
	},{
		//left door.
		type: 'cube',
		width: (width-frameEdge)/2-2,
		height: height-frameEdge/2-frameBottomEdge-2,
		depth: 2,
		translate:[x-(width-frameEdge)/4,frameBottomEdge+1,z],
		sideColor: 'orange',
		topColor: 'orange',
		style:{
			'm.type': 'phong',
			'm.transparent': true,
			'front.m.texture.image': demo.getRes('door_left.png'),					
			'back.m.texture.image': demo.getRes('door_right.png'),					
			'm.specularStrength': 100,
			'm.envmap.image': demo.getEnvMap(),
			'm.specularmap.image': demo.getRes('white.png'),	
		},
		client:{
			'animation': 'rotate.left.-90.bounceOut',
			'type': 'left-door',
		},
	},{
		//right door.
		type: 'cube',
		width: (width-frameEdge)/2-2,
		height: height-frameEdge/2-frameBottomEdge-2,
		depth: 2,
		translate:[x+(width-frameEdge)/4,frameBottomEdge+1,z],
		sideColor: 'orange',
		topColor: 'orange',
		style:{
			'm.type': 'phong',
			'm.transparent': true,
			'front.m.texture.image': demo.getRes('door_right.png'),					
			'back.m.texture.image': demo.getRes('door_left.png'),					
			'm.specularStrength': 100,
			'm.envmap.image': demo.getEnvMap(),
			'm.specularmap.image': demo.getRes('white.png'),	
		},		
		client:{
			'animation': 'rotate.right.90.bounceOut',
			'type': 'right-door',
		},
	},{
		//door control.
		type: 'cube',
		width: 15,
		height: 32,
		depth: depth-3,
		translate: [x-width/2-13, height*0.6, z],
		style:{
			'left.m.visible': false,
			'right.m.visible': false,
			'top.m.visible': false,
			'bottom.m.visible': false,
			'm.transparent': true,
			'm.specularStrength': 50,
			'front.m.texture.image': demo.getRes('lock.png'),
			'back.m.texture.image': demo.getRes('lock.png'),
		},
		client:{
			'dbl.func': demo.showDoorTable,
			'type': 'door_lock',
		},
	}];
});

demo.registerFilter('glass_wall', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width || 100,
		height=json.height || 200,
		depth=json.depth || 20;	
	var glassHeight=height*0.6;
	var rotate=json.rotate || [0,0,0];

	var parts=[{
		//wall body.
		type: 'cube',
		width: width,
		height: height,
		depth: depth,
		shadow: true,
		translate: [x, y, z],
		rotate: rotate,
		op: '+',
		sideColor: '#A5BDDD',
		topColor: '#D6E4EC',
	},{
		//wall middle cut off
		type: 'cube',
		width: width+2,
		height: glassHeight,
		depth: depth+2,
		translate: [x, (height-glassHeight)/3*2, z],
		rotate: rotate,
		op: '-',
		sideColor: '#A5BDDD',
		topColor: '#D6E4EC',
	},{
		//wall middle glass.
		type: 'cube',
		width: width,
		height: glassHeight,
		depth: 4,
		translate: [x, (height-glassHeight)/3*2, z],
		rotate: rotate,
		op: '+',
		sideColor: '#58ACFA',
		topColor: '#D6E4EC',
		style: {
			'm.transparent': true,
			'm.opacity':0.6,
			'm.color':'#01A9DB',
			'm.ambient':'#01A9DB',
			'm.type':'phong',
			'm.specularStrength': 100,
			'm.envmap.image': demo.getEnvMap(),
			'm.specularmap.image': demo.getRes('rack_inside_normal.jpg'),	
			'm.texture.repeat': new mono.Vec2(30, 5),
		},
	}];
	
	var wall=demo.createCombo(parts);
	wall.setClient('type','glassWall');
	wall.setClient('size', wall.getBoundingBox().size());
	wall.setClient('translate',translate);
	wall.shadow = true;
	box.add(wall);
});

demo.registerFilter('rail', function(box, json){		
	var params = {
		type: 'path',
		width: 50,
		height: 8,		
		data:json.data,
	};	

	var loader=function(box, params){
		box.add(demo.createRail(params));
	};

	var loaderFunc=function(box, params){
		return function(){
			loader(box, params);
		};
	};
	setTimeout(loaderFunc(box, params), demo.getRandomLazyTime());	
});

demo.createRail = function(params){
	var rail=demo.createPathObject(params);
	rail.s({
		'm.texture.image': demo.getRes('rail.png'),
		'm.type': 'phong',
		'm.transparent': true,
		'm.color': '#CEECF5',
		'm.ambient': '#CEECF5',
		'aside.m.visible': false,
		'zside.m.visible': false,
		'm.specularStrength': 50,
	});
	rail.setPositionY(263);
	rail.setClient('type', 'rail');
	rail.setVisible(false);
	
	return rail;
}

demo.registerFilter('connection', function(box, json){			
	var path = demo.create3DPath(json.data);
	path = mono.PathNode.prototype.adjustPath(path, 5);
	var color=json.color;
	var flow=json.flow;
	var y=json.y;
	
	var loader=function(box, path, color, flow, y){
		box.add(demo.createConnection(path, color, flow, y));
	};

	var loaderFunc=function(box, path, color, flow, y){
		return function(){
			loader(box, path, color, flow, y);
		};
	};
	setTimeout(loaderFunc(box, path, color, flow, y), demo.getRandomLazyTime());	
});

demo.createConnection = function(path, color, flow, y){
	var connection=new mono.PathNode(path, 100, 1);
	connection.s({
		'm.type': 'phong',
		'm.specularStrength': 30,
		'm.color': color,
		'm.ambient': color, 		
		'm.texture.image': demo.getRes('flow.jpg'),
		'm.texture.repeat': new mono.Vec2(200, 1),
		'm.texture.flipX': flow>0,
	});
	connection.setClient('flow', flow);
	connection.setStartCap('plain');
	connection.setEndCap('plain');
	connection.setPositionY(y);
	connection.setClient('type', 'connection');	
	connection.setVisible(false);
	return connection;
};

demo.registerShadowPainter('wall', function(object, context, floorWidth, floorHeight, translate, rotate){
	var translate = object.getClient('translate') || [0, 0, 0];		
	var translateX=floorWidth/2+translate[0];
	var translateY=floorHeight-(floorHeight/2+translate[2]);
	var pathData=object.getClient('data');			
	
	context.save();
	context.translate(translateX, translateY);
	context.rotate(rotate);
	context.beginPath();
	var first=true;
	for(var j=0;j<pathData.length;j++){
		var point=pathData[j];
		if(first){
			context.moveTo(point[0], -point[1]);
			first=false;
		}else{
			context.lineTo(point[0], -point[1]);
		}
	}

	context.lineWidth = object.getClient('width') || 20;		

	context.strokeStyle = 'white';
	context.shadowColor = '#222222';
	context.shadowBlur = 60;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.stroke();
	
	context.restore();
});

demo.registerShadowPainter('floor_box', function(object, context, floorWidth, floorHeight, translate, rotate){
	var translateX=floorWidth/2+translate.x;
	var translateY=floorHeight/2+translate.z;
	var width=object.getWidth();
	var lineWidth=object.getDepth();

	context.save();

	context.translate(translateX, translateY);
	context.rotate(rotate);

	context.beginPath();
	context.moveTo(-width/2, 0);
	context.lineTo(width/2, 0);
	
	context.lineWidth = lineWidth;
	context.strokeStyle = 'white';
	context.shadowColor = '#222222';
	context.shadowBlur = 60;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;						
	context.stroke();	

	context.restore();
});

demo.registerShadowPainter('rack', function(object, context, floorWidth, floorHeight, translate, rotate){
	var translateX=floorWidth/2+translate.x;
	var translateY=floorHeight/2+translate.z;
	var width=object.width || 60;
	var height=object.height || 200;
	var depth=object.depth || 80;
	var width=width*0.99;
	var lineWidth=depth*0.99;

	context.save();

	context.beginPath();
	context.moveTo(translateX-width/2, translateY);
	context.lineTo(translateX+width/2, translateY);
	
	context.lineWidth = lineWidth;
	context.strokeStyle = 'gray';
	context.shadowColor = 'black';
	context.shadowBlur = 100;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;						
	context.stroke();			
	
	context.restore();
});

demo.createRoundShadowPainter=function(radius){
	return function(object, context, floorWidth, floorHeight, translate, rotate){
		var translateX=floorWidth/2+translate.x;
		var translateY=floorHeight/2+translate.z;

		context.save();

		context.beginPath();
		context.arc(translateX, translateY, radius, 0, 2 * Math.PI, false);
		
		context.fillStyle='black';
		context.shadowColor = 'black';
		context.shadowBlur = 25;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;						
		context.fill();			

		context.restore();
	}
};

demo.registerShadowPainter('plant', demo.createRoundShadowPainter(11));
demo.registerShadowPainter('extinguisher', demo.createRoundShadowPainter(7));

demo.registerShadowPainter('glassWall', function(object, context, floorWidth, floorHeight, translate, rotate){
	var translate = object.getClient('translate');
	var size = object.getClient('size');
	var translateX=floorWidth/2+translate[0];
	var translateY=floorHeight/2+translate[2];
	var width=size.x;
	var lineWidth=size.z;
	context.save();

	context.translate(translateX, translateY);

	context.beginPath();
	context.moveTo(-width/2, 0);
	context.lineTo(width/2, 0);
	
	context.lineWidth = lineWidth;
	context.strokeStyle = 'white';
	context.shadowColor = '#222222';
	context.shadowBlur = 60;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;						
	context.stroke();	

	context.restore();						
});

demo.registerCreator('rack', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width || 60;
	var height=json.height || 200;
	var depth=json.depth || 80;
	var severity=json.severity;
	var label=json.label;
	var shadow = json.shadow;

	var rack= new mono.Cube(width, height, depth);
	rack.s({				
		'm.color': '#557E7A',
		'left.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'right.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'front.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'back.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'top.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'left.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'right.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'back.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'top.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'left.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'right.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'back.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'top.m.envmap.image': demo.getEnvMap(),
		'left.m.envmap.image': demo.getEnvMap(),
		'right.m.envmap.image': demo.getEnvMap(),
		'back.m.envmap.image': demo.getEnvMap(),
		'm.ambient': '#557E7A',
		'm.type':'phong',
		'm.specularStrength': 50,
		'front.m.texture.image':demo.getRes('rack.jpg'),
		'front.m.texture.repeat': new mono.Vec2(1,1),
		'front.m.specularmap.image':demo.getRes('white.png'),
		'front.m.color':'#666',
		'front.m.ambient':'#666',
		'front.m.specularStrength': 200,
	});
	rack.setPosition(x, height/2+1+y, z);

	var labelCanvas=demo.generateAssetImage(label);
	rack.setStyle('top.m.texture.image', labelCanvas);
	rack.setStyle('top.m.specularmap.image', labelCanvas);
	rack.setClient('label', label);
	rack.setClient('type', 'rack');
	rack.setClient('origin', rack.getPosition().clone());
	rack.setClient('loaded', false);
	rack.shadow = shadow;

	var rackDoor = new mono.Cube(width, height, 2);
	rackDoor.s({
		'm.type':'phong',
		'm.color': '#A5F1B5',
		'm.ambient': '#A4F4EC',
		'front.m.texture.image': demo.getRes('rack_front_door.jpg'),
		'back.m.texture.image': demo.getRes('rack_door_back.jpg'),
		'm.envmap.image': demo.getEnvMap(),
	});
	rackDoor.setParent(rack);
	rack.door=rackDoor;
	rackDoor.setPosition(0, 0, depth/2+1); 
	rackDoor.setClient('animation','rotate.right.100');
	rackDoor.setClient('type', 'rack.door');
	rackDoor.setClient('animation.done.func', function(){	
		if(rack.getClient('loaded') || !rackDoor.getClient('animated')){
			return;
		}
		var fake=rack.clone();
		fake.s({
			'm.color': 'red',
			'm.ambient': 'red',
			'm.texture.image': null,
			'top.m.normalmap.image': demo.getRes('outside_lightmap.jpg'),
			'top.m.specularmap.image': demo.getRes('white.png'),
		});
		fake.setDepth(fake.getDepth()-2);
		fake.setWidth(fake.getWidth()-2);
		box.add(fake);

		rack.s({
			'm.transparent': true,
			'm.opacity': 0.5,
		});

		new jxdgl.Animate({
			from: 0,
			to: fake.getHeight(),
			dur: 2000,
			easing: 'easeOut',
			onUpdate: function (value) {
				fake.setHeight(value);
				fake.setPositionY(value/2);
			},
			onDone: function(){
				box.remove(fake);
				rack.s({
					'm.transparent': false,
					'm.opacity': 1,
				});
				var loader = rack.getClient('rack.loader');
				if(loader && rackDoor.getClient('animated') && !rack.getClient('loaded')){
					loader();
					rack.setClient('loaded', true);

					if(rack.getClient('loaded.func')){
						rack.getClient('loaded.func')(rack);
					}
				}
			}
		}).play();
	});

	var loader=function(box, width, height, depth, severity, rack, json){
		var cut=new mono.Cube(width*0.75, height-10, depth*0.7);
		cut.s({
			'm.color': '#333333',
			'm.ambient': '#333333',
			'm.lightmap.image': demo.getRes('inside_lightmap.jpg'),
			'bottom.m.texture.repeat': new mono.Vec2(2,2),			
			'left.m.texture.image': demo.getRes('rack_panel.jpg'),
			'right.m.texture.image': demo.getRes('rack_panel.jpg'),
			'back.m.texture.image': demo.getRes('rack_panel.jpg'),
			'back.m.texture.repeat': new mono.Vec2(1,1),
			'top.m.lightmap.image': demo.getRes('floor.jpg'),
		});
		cut.setPosition(0, 0, depth/2-cut.getDepth()/2+1);
		box.remove(rack);
		if(rack.alarm){
			box.getAlarmBox().remove(rack.alarm);
		}

		var cube = rack.clone();
		cube.p(0, 0, 0);
		
		var newRack=new mono.ComboNode([cube, cut], ['-']);
		
		var x=rack.getPosition().x;
		var y=rack.getPosition().y;
		var z=rack.getPosition().z;

		newRack.p(x, y, z);
		newRack.setClient('type', 'rack');
		newRack.oldRack=rack;
		rack.newRack=newRack;
		newRack.shadow = shadow;
		box.add(newRack);

		if(severity){
			var alarm = new mono.Alarm(newRack.getId(), newRack.getId(), severity);
			newRack.setStyle('alarm.billboard.vertical', true);
			newRack.alarm=alarm;
			box.getAlarmBox().add(alarm);
		}

		//set child for newrack
		var children = rack.getChildren();
		children.forEach(function(child){
			if(child && !(child instanceof mono.Billboard)){
				child.setParent(newRack);
			}
		});

		demo.loadRackContent(box, x, y, z, width, height, depth, severity, cube, cut, json, newRack, rack);		
	};

	box.add(rack);
	box.add(rackDoor);
	if(severity){
		var alarm = new mono.Alarm(rack.getId(), rack.getId(), severity);
		rack.setStyle('alarm.billboard.vertical', true);
		rack.alarm=alarm;
		box.getAlarmBox().add(alarm);
	}			
	var loadFunction = function(){
		loader(box, width, height, depth, severity, rack, json);
	};
	rack.setClient('rack.loader', loadFunction);
});

demo.registerCreator('plant', function(box, json){
	var scale=json.scale || [1,1,1];
	var scaleX=scale[0], scaleY=scale[1], scaleZ=scale[2];
	var shadow = json.shadow;
	var translate=json.translate || [0,0,0];
	var x=translate[0], y=translate[1], z=translate[2];

	var loader=function(x, y, z, scaleX, scaleY, scaleZ){
		var plant=demo.createPlant(x, y, z, scaleX, scaleY, scaleZ);
		plant.shadow = shadow;
		box.add(plant);
	};

	var loaderFunc=function(x, y, z, scaleX, scaleY, scaleZ){
		return function(){
			loader(x, y, z, scaleX, scaleY, scaleZ);
		};
	};
	setTimeout(loaderFunc(translate[0],translate[1],translate[2],scale[0],scale[1],scale[2]), demo.getRandomLazyTime());					
});

demo.registerCreator('tv', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var edgeX=4,
		edgeY=2;
	var picture=json.picture || demo.getRes('tv.jpg');
	var rotate=json.rotate || [0,0,0];

	var parts = [{
		//tv body
		type: 'cube',
		width: 150,
		height: 80,
		depth: 5,
		translate: [x, y, z],
		rotate: rotate,
		op: '+',
		style: {
			'm.type': 'phong',
			'm.color': '#2D2F31',
			'm.ambient': '#2D2F31',
			'm.normalmap.image':demo.getRes('metal_normalmap.jpg'),
			'm.texture.repeat': new mono.Vec2(10,6),
			'm.specularStrength': 20,
		},
	},{
		//'tv cut off',
		type: 'cube',
		width: 130,
		height: 75,
		depth: 5,
		translate: [x, y+edgeY, z+edgeX],
		rotate: rotate,
		op: '-',
		style: {
			'm.type': 'phong',
			'm.color': '#2D2F31',
			'm.ambient': '#2D2F31',
			'm.normalmap.image':demo.getRes('metal_normalmap.jpg'),
			'm.texture.repeat': new mono.Vec2(10,6),
			'm.specularStrength': 100,
		},
	},{
		//'tv screen',
		type: 'cube',
		width: 130,
		height: 75,
		depth: 1,
		translate: [x, y+edgeY, z+1.6],
		rotate: rotate,
		op: '+',
		style: {
			'm.type': 'phong',
			'm.specularStrength': 200,
			'front.m.texture.image': picture,
		},
	}];

	var tv=demo.createCombo(parts);
	tv.setClient('type', 'tv');
	box.add(tv);
});

demo.registerCreator('post', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width, height=json.height;
	var pic=json.pic;

	var post=new mono.Cube(width, height, 0);
	post.s({
		'm.visible': false,
	});
	post.s({
		'm.texture.image': pic,
		'front.m.visible': true,
	});
	post.setPosition(x, y, z);
	post.setClient('type', 'post');

	box.add(post);
});

demo.registerCreator('extinguisher', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0], z=translate[1];
	var arrow=json.arrow;

	var loader=function(box, translate, x, z){
		var extinguisher=demo.createExtinguisher(box, translate, x, z, arrow);
		box.add(extinguisher);
	}

	var loaderFunc=function(box, translate, x, z, arrow){
		return function(){
			loader(box, translate, x, z, arrow);
		}
	}
	setTimeout(loaderFunc(box, translate, x, z, arrow), demo.getRandomLazyTime());					
});

demo.registerCreator('smoke', function(box, json){
	var translate=json.translate || [0,0,0];	
	var color=json.color;

	var loader=function(box, translate, color){
		var smoke=demo.createSmoke(translate, color);
		box.add(smoke);
	}

	var loaderFunc=function(box, translate, color){
		return function(){
			loader(box, translate, color);
		}
	}
	setTimeout(loaderFunc(box, translate, color), demo.getRandomLazyTime());					
});

demo.createSmoke=function(translate, color){
	var x=translate[0], y=translate[1], z=translate[2];
	var smoke = new mono.Particle();
	var count=300;
	for (var i = 0; i < count; i++) {
		smoke.vertices.push(new mono.Vec3());
	}

	smoke.verticesNeedUpdate = true;
	smoke.sortParticles = false;
	smoke.setStyle('m.size', 20);
	smoke.setStyle('m.transparent', true);
	smoke.setStyle('m.opacity', 0.5);
	smoke.setStyle('m.texture.image', demo.getRes('smoking.png'));
	smoke.setStyle('m.color', color);
	smoke.setStyle('m.depthTest',false);

	smoke.setClient('type', 'smoke');

	smoke.setVisible(false);
	smoke.setPosition(x,y,z);
	return smoke;
}


demo.createExtinguisher=function(box, translate, x, z, arrow){
	var body=new mono.Cylinder(8,8,50,20);
	body.setPositionY(body.getHeight()/2);
	body.s({
		'side.m.texture.image': demo.getRes('fire_extinguisher_side.jpg'),
		'm.type': 'phong',
		'm.specularStrength': 50,
	});
	body.shadow=true;
	body.setClient('type', 'extinguisher');
	body.setPosition(x,body.getHeight()/2,z);
	box.add(body);

	var top=new mono.Sphere(8,20);
	top.setParent(body);
	top.setPositionY(body.getHeight()/2);
	top.setScaleY(0.5);
	top.s({
		'm.color': '#DF0101',
		'm.ambient': '#DF0101',
		'm.type': 'phong',
		'm.specularStrength': 50,
	});
	box.add(top);

	var nozzle=new mono.Cylinder(2,3,10);
	nozzle.setParent(top);
	nozzle.setPositionY(top.getRadius());			
	nozzle.s({
		'm.color': 'orange',
		'm.ambient': 'orange',
		'm.type': 'phong',
	}); 
	box.add(nozzle);

	var handleA=new mono.Cube(14,1,3);
	handleA.setParent(nozzle);
	handleA.setPositionY(nozzle.getHeight()-3);	
	handleA.setPositionX(handleA.getWidth()/2-2);
	handleA.setRotationZ(Math.PI/180*45);
	handleA.s({
		'm.texture.image': demo.getRes('metal.png'),
		'm.type': 'phong',
	}); 
	box.add(handleA);

	var handleB=new mono.Cube(14,1,3);
	handleB.setParent(nozzle);
	handleB.setPositionY(nozzle.getHeight()-8);	
	handleB.setPositionX(handleB.getWidth()/2);
	handleB.setRotationZ(Math.PI/180*-10);
	handleB.s({
		'm.texture.image': demo.getRes('metal.png'),
		'm.type': 'phong',
	}); 
	box.add(handleB);

	var path=new mono.Path();
	path.moveTo(0,0,0);
	path.curveTo(-10,0,0,-15,-10,0);
	path.curveTo(-20,-20,0,-15,-55,0);
	var pipe=new mono.PathNode(path,50,2,10,'round','round');
	pipe.setParent(nozzle);
	pipe.s({
		'm.texture.image': demo.getRes('metal.png'),
		'm.type': 'phong',
	}); 
	box.add(pipe);			

	if(arrow){
		var count=6;
		var height=60;
		var planes=[];
		for(var i=0; i<count; i++){
			var plane=new mono.Plane(height/2, height);
			plane.s({
				'm.texture.image': demo.getRes('down.png'),
				'm.transparent': true,
				'm.side': mono.DoubleSide,
				'm.type': 'phong',				
			});			
			plane.setParent(nozzle);
			plane.setPositionY(height+i*height);
			plane.setVisible(false);
			plane.setClient('type', 'extinguisher_arrow');
			box.add(plane);
			planes.push(plane);

			planes.index=10000;
		}

		var func=function(){
			if(planes[0].isVisible()){		
				planes.index--;
				if(planes.index==0){
					planes.index=10000;
				}
				var offset=planes.index % count;
				for(var i=count-1;i>=0;i--){
					var plane=planes[i];
					if(i===offset){
						plane.s({
							'm.color': '#FF8000',
							'm.ambient': '#FF8000',				
						});
					}else{
						plane.s({
							'm.color': 'white',
							'm.ambient': 'white',
						});
					}
				}
			}
			setTimeout(func, 200);
		}
		setTimeout(func, 200);
	}
}

demo.registerFilter('camera', function(box, json){
	var x=json.translate[0], y=json.translate[1], z=json.translate[2];
	var angle=json.angle || 0;
	var direction=130;

	var loader=function(box, x, y, z, angle, direction){		
		var camera=demo.createCamera(box, x, y, z, angle, direction);
		box.add(camera);
	}

	var loaderFunc=function(box, x, y, z, angle, direction){		
		return function(){
			loader(box, x, y, z, angle, direction);
		}
	}
	setTimeout(loaderFunc(box, x, y, z, angle, direction), demo.getRandomLazyTime());					
});

demo.createCamera=function(box, x, y, z, angle, direction){		
	var body=new mono.Cylinder(4,4,15);
	body.s({
		'm.texture.image': demo.getRes('bbb.png'),
		'top.m.texture.image': demo.getRes('camera.png'),
		'bottom.m.texture.image': demo.getRes('eee.png'),
		'm.type': 'phong',
	});
	
	var style={
		'side.m.normalType': mono.NormalTypeSmooth,
	};
	var cover1=new mono.Cylinder(6,6,20);	
	cover1.s(style);
	var cover2=new mono.Cylinder(5,5,20);
	cover2.s(style);
	var cover3=new mono.Cube(10,20,10);				
	var path=new mono.Path();
	path.moveTo(0,0,0);
	path.lineTo(0,-10,0);
	path.lineTo(0,-11,-1);
	path.lineTo(0,-12,-13);
	path.lineTo(0,-12,-30);
	
	var camera=new mono.ComboNode([cover1,cover3,cover2, body],['+','-','+']);
	camera.s({
		'm.type': 'phong',
		'm.color': '#2E2E2E',
		'm.ambient': '#2E2E2E',
		'm.specularStrength': 50,
	});
	camera.setRotation(Math.PI/180*100, 0, Math.PI/180*angle);
	camera.setPosition(x,y,z);		
	camera.setClient('type', 'camera');
	camera.setClient('dbl.func', function(){
		demo.showVideoDialog('Camera #: C300-493A  |  Status: OK');
	});
	box.add(camera);

	var pipe=new mono.PathNode(path,10,2,10,'plain','plain');
	pipe.s({
		'm.color': '#2E2E2E',
		'm.ambient': '#2E2E2E',
		'm.type': 'phong',
		'm.specularStrength': 50,
		'm.normalType': mono.NormalTypeSmooth,
	});
	pipe.setRotationX(-Math.PI/2);		
	pipe.setParent(camera);
	
	box.add(pipe);
};

demo.createWall = function(path, thick, height, insideColor, outsideColor, topColor){
	var wall= new mono.PathCube(path, thick, height);
	wall.s({
		'outside.m.color': outsideColor,
		'inside.m.type': 'basic',
		'inside.m.color': insideColor,
		'aside.m.color': outsideColor,
		'zside.m.color': outsideColor,
		'top.m.color': topColor,
		'bottom.m.color': topColor,
		'inside.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
		'outside.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
		'aside.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
		'zside.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
	});
	return wall;
}

demo.createPlant = function(x, y, z, scaleX, scaleY, scaleZ){
	var plant;
	if(!demo._plantInstance){
		var w=30;
		var h=120;
		var pic=demo.getRes('plant.png');
		var objects=[];

		var cylinderVase=new mono.Cylinder(w*0.6,w*0.4,h/5,20,1,false,false);
		cylinderVase.s({
			'm.type': 'phong',
			'm.color': '#845527',
			'm.ambient': '#845527',
			'm.texture.repeat': new mono.Vec2(10,4),
			'm.specularmap.image': demo.getRes('metal_normalmap.jpg'),
			'm.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		});			
		var cylinderHollow=cylinderVase.clone();
		cylinderHollow.setScale(0.9,1,0.9);
		var cylinderMud=cylinderHollow.clone();
		cylinderMud.setScale(0.9,0.7,0.9);
		cylinderMud.s({
			'm.type': 'phong',
			'm.color': '#163511',
			'm.ambient': '#163511',
			'm.texture.repeat': new mono.Vec2(10,4),
			'm.specularmap.image': demo.getRes('metal_normalmap.jpg'),
			'm.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		});
		var vase=new mono.ComboNode([cylinderVase,cylinderHollow,cylinderMud],['-','+']);
		objects.push(vase);

		var count=5;
		for(var i=0;i<count;i++){
			var plant=new mono.Cube(w*2,h,0.01);	

			plant.s({
				'm.visible': false,
				'm.alphaTest': 0.5,
				'front.m.visible': true,
				'front.m.texture.image': pic,
				'back.m.visible': true,
				'back.m.texture.image': pic,
			});
			plant.setParent(vase);
			plant.setPositionY(cylinderVase.getHeight()/2+plant.getHeight()/2-3);
			plant.setRotationY(Math.PI * i/count);
			objects.push(plant);
		}

		demo._plantInstance=new mono.ComboNode(objects);				
		demo._plantInstance.setClient('plant.original.y', cylinderVase.getHeight()/2);			
		plant = demo._plantInstance;
		//console.log('create plant from brand new');
	}else{
		plant = demo._plantInstance.clone();
		//console.log('create plant from instance');
	}

	plant.setPosition(x,plant.getClient('plant.original.y')+y,z);
	plant.setScale(scaleX, scaleY, scaleZ);
	plant.setClient('type', 'plant');
	return plant;
}

demo.createAirPlanes = function(){
	var planes=[];
	var wavePath= new mono.Path();
	wavePath.moveTo(0,0,230);
	// wavePath.curveTo(0,80,30,0,100,150);
	// wavePath.curveTo(0,120,200,0,200,230);
	wavePath.curveTo(0,80,200,0,100,80);
	wavePath.curveTo(0,120,30,0,200,0);

	var creator=function(length, x, z){
		var path = new mono.Path();
		path.moveTo(0,0,0);
		path.lineTo(length,0,0);			
		var curvePlane = new mono.CurvePlane(path, wavePath);
		curvePlane.setPosition(x, 0, z);
		curvePlane.s({
			'm.texture.image': demo.getRes('arrow.png'),
			'm.side': 'both',
			'm.texture.repeat': new mono.Vec2(parseInt(length/50), 8),				
			'm.transparent': true,
			'm.gradient': {0: '#84DF29', 0.6: '#DF6029', 1: '#DF2929'},
			'm.gradientType': 2,				
		});

		var airAnimation=new jxdgl.Animate({
			from: 0,
			to: 1,
			dur: 1000,
			reverse: false,
			repeat:Number.POSITIVE_INFINITY,
			onUpdate: function(value){
				curvePlane.s({
					'm.texture.offset': new mono.Vec2(0, -value),
				});
			},
		});
		curvePlane.airAnimation=airAnimation;						

		return curvePlane;
	}

	planes.push(creator(450, -10, 150));
	planes.push(creator(195, -310, 150));
	planes.push(creator(250, -400, -350));
	return planes;
}

demo.registerFilter('water_cable', function(box, json){			
	var path = demo.create3DPath(json.data);
	path = mono.PathNode.prototype.adjustPath(path, 5);
	var color=json.color;
	var size=json.size;
	var y=json.y;
	
	var loader=function(box, path, color, size, y){
		box.add(demo.createWaterCable(path, color, size, y));
	};

	var loaderFunc=function(box, path, color, size, y){
		return function(){
			loader(box, path, color, size, y);
		};
	};
	setTimeout(loaderFunc(box, path, color, size, y), demo.getRandomLazyTime());	
});

demo.createWaterCable = function(path, color, size, y){
	var cable=new mono.PathNode(path, 100, size);
	cable.s({
		'm.type': 'phong',
		'm.specularStrength': 50,
		'm.color': color,
		'm.ambient': color, 		
		'm.texture.image': demo.getRes('flow.jpg'),
		'm.texture.repeat': new mono.Vec2(100, 1),
	});
	cable.setStartCap('plain');
	cable.setEndCap('plain');
	cable.setPositionY(y);
	cable.setClient('type', 'water_cable');	
	cable.setVisible(false);
	return cable;
};

demo.registerFilter('laser', function(box, json){			
	var loader=function(box, json){
		box.add(demo.createLaser(box, json));
	};

	var loaderFunc=function(box, json){
		return function(){
			loader(box, json);
		};
	};
	setTimeout(loaderFunc(box, json), demo.getRandomLazyTime());	
});

demo.createLaser = function(box, json){
	var angle=Math.atan2(json.to[1]-json.from[1], json.to[0]-json.from[0]);
	
	var offset=1.5;
	var fromOffsetZ=offset*Math.sin(angle);
	var fromOffsetX=offset*Math.cos(angle);
	var toOffsetZ=offset*Math.sin(angle+Math.PI);
	var toOffsetX=offset*Math.cos(angle+Math.PI);

	//from side.
	var pole=new mono.Cylinder(5, 5, 170);
	pole.s({
		'm.texture.image': demo.getRes('rack_inside.jpg'),
		'm.texture.repeat': new mono.Vec2(1, 3),
		'm.color': '#A4A4A4',
		'm.ambient': '#A4A4A4',
		'm.type': 'phong',
		'm.specularStrength': 10,
	});
	pole.setPosition(json.from[0], pole.getHeight()/2, json.from[1]);
	pole.setClient('type', 'laser');
	pole.setVisible(false);
	box.add(pole);

	var glass=new mono.Cylinder(4, 4, 130);
	glass.s({			
		'm.type': 'phong',
		'm.color': '#A9F5D0',
		'm.ambient': '#A9F5D0',
		'm.envmap.image': demo.getEnvMap(),

	});
	glass.setParent(pole);
	glass.setPosition(fromOffsetX, 0, fromOffsetZ);
	glass.setClient('type', 'laser');
	glass.setVisible(false);
	box.add(glass);

	//another side.
	var pole2=pole.clone();
	pole2.setPosition(json.to[0], pole2.getHeight()/2, json.to[1]);
	pole2.setClient('type', 'laser');
	pole2.setVisible(false);
	box.add(pole2);

	var glass2=glass.clone();
	glass2.setParent(pole2);
	glass2.setPosition(toOffsetX, 0, toOffsetZ);
	glass2.setClient('type', 'laser');
	glass2.setVisible(false);
	box.add(glass2);

	//create laser lines.
	var color='red';
	for(var i=0;i<5;i++){
		var from=new mono.Cube(1,1,1);
		from.s({
			'm.color': color,
			'm.ambient': color,
		});
		from.setPosition(json.from[0], 30+i*27, json.from[1]);
		from.setClient('type', 'laser');
		from.setVisible(false);
		box.add(from);

		var to=from.clone();
		to.setPosition(json.to[0], 30+i*27, json.to[1]);
		to.setClient('type', 'laser');
		to.setVisible(false);
		box.add(to);

		var link=new mono.Link(from, to);
		link.s({
			'm.color': color,
			'm.ambient': color,
			'm.type': 'phong',
			'm.transparent': true,
			'm.opacity': 0.7,
		});
		link.setClient('type', 'laser');
		link.setVisible(false);
		box.add(link);
	}
};