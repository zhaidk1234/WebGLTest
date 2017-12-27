var demo={
	LAZY_MIN: 1000,
	LAZY_MAX: 6000,
	CLEAR_COLOR: '#39609B',	
	RES_PATH: 'images',
	
	lastElement: null,
	timer: null,
	
	getRes: function(file){
		return demo.RES_PATH+'/'+file;
	},

	getEnvMap: function(){
		if(!demo.defaultEnvmap){			
			demo.defaultEnvmap=[];
			var image=demo.getRes('room.jpg');
			for(var i=0;i<6;i++){
				demo.defaultEnvmap.push(image);
			}
		}
		return demo.defaultEnvmap;
	},
	
	//all registered object creaters.
	_creators: {},

	//all registered object filters.
	_filters: {},

	//all registered shadow painters.
	_shadowPainters: {},

	registerCreator: function(type, creator){
		this._creators[type] = creator;
	},
	
	getCreator: function(type){
		return this._creators[type];
	},
	
	registerFilter: function(type, filter){
		this._filters[type] = filter;
	},
	
	getFilter: function(type){
		return this._filters[type];
	},

	registerShadowPainter: function(type, painter){
		this._shadowPainters[type] = painter;
	},
	
	getShadowPainter: function(type){
		return this._shadowPainters[type];
	},

	initOverview : function(network){
      var overView = new mono.Overview3D(network);
	},
	
	init: function(htmlElementId){				
		var network = window.network = new mono.Network3D();
		demo.typeFinder = new mono.QuickFinder(network.getDataBox(), 'type', 'client');
		demo.labelFinder = new mono.QuickFinder(network.getDataBox(), 'label', 'client');

		var camera = new mono.PerspectiveCamera(30, 1.5, 30, 30000);		
		network.setCamera(camera);
		
		var interaction = new mono.DefaultInteraction(network);
		interaction.yLowerLimitAngle=Math.PI/180*2;
		interaction.yUpLimitAngle=Math.PI/2;
		interaction.maxDistance=20000;
		interaction.minDistance=50;
		interaction.zoomSpeed=3;
		interaction.panSpeed=0.2;

		var editInteraction = new mono.EditInteraction(network);
		editInteraction.setShowHelpers(true);
        editInteraction.setScaleable(false);
        editInteraction.setRotateable(false);
        editInteraction.setTranslateable(true);

		network.setInteractions([interaction, new mono.SelectionInteraction(network), editInteraction]);

		network.isSelectable = function(element){
			return network.moveView && element.getClient('type') === 'rack';
		};	
		network.editableFunction = function(element){
			return network.moveView && element.getClient('type') === 'rack';
		}	
		document.getElementById(htmlElementId).appendChild(network.getRootView());
		var tooltip = new Tooltip(['BusinessId'],['000000']);
		document.body.appendChild(tooltip.getView());

		var personLoaded = false;
		
		var buttons=[{
			label: '场景复位',
			icon: 'reset.png',
			clickFunction: function(){							
				demo.resetView(network);
			},
		},{
			label: '走线管理',
			icon: 'connection.png',
			clickFunction: function(){
				var showing=network.connectionView;
				demo.resetView(network);
				if(!showing){
					demo.toggleConnectionView(network);
				}
			}
		},{
			label: '人工路径',
			icon: 'person.png',
			clickFunction: function(){
				demo.togglePersonVisible(personLoaded, network);
				personLoaded = !personLoaded;
			}
		},{
			label: '调试信息',
			icon: 'fps.png',
			clickFunction: function(){
				demo.toggleFpsView(network);
			}
		},{
			label: '拖拽机柜',
			icon: 'edit.png',
			clickFunction: function(){
				var showing=network.moveView;
				demo.resetView(network);
				if(!showing){
					demo.toggleMoveView(network);
				}
			}
		},{
			label: '温度图',
			icon: 'temperature.png',
			clickFunction: function(){				
				var showing=network.temperatureView;
				demo.resetView(network);
				if(!showing){
					demo.toggleTemperatureView(network);
				}
			}
		},{
			label: '可用空间',
			icon: 'space.png',
			clickFunction: function(){			
				var showing=network.spaceView;
				demo.resetView(network);
				if(!showing){
					demo.toggleSpaceView(network);
				}
			}
		},{
			label: '机柜利用率',
			icon: 'usage.png',
			clickFunction: function(){
				var showing=network.usageView;
				demo.resetView(network);
				if(!showing){
					demo.toggleUsageView(network);
				}
			}
		},{
			label: '空调风向',
			icon: 'air.png',
			clickFunction: function(){		
				var showing=network.airView;
				demo.resetView(network);
				if(!showing){
					demo.toggleAirView(network);
				}
			}
		},{
			label: '烟雾监控',
			icon: 'smoke.png',
			clickFunction: function(){		
				var showing=network.smokeView;
				demo.resetView(network);
				if(!showing){
					demo.toggleSmokeView(network);
				}
			}
		},{
			label: '漏水监测',
			icon: 'water.png',
			clickFunction: function(){		
				var showing=network.waterView;
				demo.resetView(network);
				if(!showing){
					demo.toggleWaterView(network);
				}
			}
		},{
			label: '防盗监测',
			icon: 'security.png',
			clickFunction: function(){			
				var showing=network.laserView;
				demo.resetView(network);
				if(!showing){
					demo.toggleLaserView(network);
				}
			}
		},{
			label: '供电电缆',
			icon: 'power.png',
			clickFunction: function(){			
				var showing=network.powerView;
				demo.resetView(network);
				if(!showing){
					demo.togglePowerView(network);
				}
			}
		},{
			label: '告警巡航',
			icon: 'alarm.png',
			clickFunction: function(){			
				if(network.inspecting){
					return;
				}
				demo.resetView(network);
				demo.resetRackPosition(network);
				network.inspecting=true;
				demo.inspection(network);
			}		
		},
		{
			label: '端口连线',
			icon: 'connection.png',
			clickFunction: function(){			
				if(network.inspecting){
					return;
				}
				demo.resetView(network);
				demo.inspection(network);
			}		
		}
		];
		demo.setupToolbar(buttons);

		this.setupControlBar(network);

		mono.Utils.autoAdjustNetworkBounds(network,document.documentElement,'clientWidth','clientHeight');
		network.getRootView().addEventListener('dblclick', function(e){
			demo.handleDoubleClick(e, network);
		});	
		network.getRootView().addEventListener('mousemove',function(e){
			demo.handleMouseMove(e, network, tooltip);
		});

		demo.setupLights(network.getDataBox());
		network.getDataBox().getAlarmBox().addDataBoxChangeListener(function(e){
			var alarm = e.data;
			if(e.kind === 'add'){
				var node = network.getDataBox().getDataById(alarm.getElementId());
				node.setStyle('m.alarmColor', null);
			}
		});

		network.getDataBox().addDataPropertyChangeListener(function(e){
			var element = e.source, property = e.property, oldValue = e.oldValue, newValue = e.newValue;
			if(property == 'position' && network.moveView){
				if(oldValue.y != newValue.y){
					element.setPositionY(oldValue.y);
				}
			}

		});
		
		network.addInteractionListener(function(e){
			if(e.kind == 'liveMoveEnd'){				
				demo.dirtyShadowMap(network);
			}
		});

		var time1=new Date().getTime();
		demo.loadData(network);
		var time2=new Date().getTime();		
		console.log('time:  ' + (time2-time1));

		demo.startSmokeAnimation(network);
		demo.startFpsAnimation(network);
		demo.resetCamera(network);

		this.initOverview(network);
	},
	
	resetCamera: function(network){
		network.getCamera().setPosition(2000,1200,3000);
		network.getCamera().lookAt(new mono.Vec3(0,0,0));
	},

	dirtyShadowMap: function(network){
		var floor = network.getDataBox().shadowHost;
		var floorCombo = demo.typeFinder.findFirst('floorCombo');
		demo.updateShadowMap(floorCombo, floor, floor.getId(),network.getDataBox());
	},

	togglePersonVisible: function(visible, network){
		var camera = network.getCamera();
		var databox = network.getDataBox();
		if(!visible){
			this.loadObj(camera, databox);
		}else{
			this.removeObj(databox);
		}
	},

	removeObj: function(box){
		var person = demo.typeFinder.find('person').get(0);
		person.animate.stop();
		box.removeByDescendant(person);

		var trail = demo.typeFinder.find('trail').get(0);
		box.removeByDescendant(trail);
	},

	_playRackDoorAnimate: function(label){
		var element = demo.labelFinder.findFirst(label);
		var rackDoor = element.getChildren().get(0);
		if(rackDoor.getClient('animation')){
			demo.playAnimation(rackDoor, rackDoor.getClient('animation'));
		}
	},
	
	loadObj: function(camera, box){
		var obj=demo.getRes('worker.obj');
		var mtl=demo.getRes('worker.mtl');               
			
		var loader = new mono.OBJMTLLoader();
		loader.load(obj, mtl, {'worker': demo.getRes('worker.png'),}, function (object) {                    			
			object.setScale(3,3,3);		
			object.setClient('type', 'person');	
			box.addByDescendant(object);
			
			var updater=function(element){
				if(element && element.getChildren()){
					element.getChildren().forEach(function(child){
						child.setStyle('m.normalType', mono.NormalTypeSmooth);
						updater(child);
					});
				}
			}
			updater(object);

			var x=-650, z=600, angle=0;
			object.setPosition(x, 0, z);
			object.setRotationY(angle);
			//var points=[[650, 600], [650, -300], [130, -300], [130, -600], [-650, -600], [-650, 580], [-450, 580], [-400, 550]];
			var points=[[-350, 600], [-350, 400], [450, 400], [450, 100], [-200, 100], [-200, -100], [-370, -100], [-370, -150]];
            
            var cameraFollow = new CameraFollow(camera);

            cameraFollow.setHost(object);

            var leftDoor = demo.typeFinder.findFirst('left-door');
			var rightDoor = demo.typeFinder.findFirst('right-door'); 
			demo.playAnimation(leftDoor, leftDoor.getClient('animation'));
			demo.playAnimation(rightDoor, rightDoor.getClient('animation'), function(){
				object.animate=demo.createPathAnimates(camera, object, points, false, null,function(){demo._playRackDoorAnimate('1A03')});
				object.animate.play();
			});

			var path=new mono.Path();
			path.moveTo(object.getPositionX(), object.getPositionZ());
			for(var i=0;i<points.length; i++){
				path.lineTo(points[i][0], points[i][1]);
			}
			path = mono.PathNode.prototype.adjustPath(path, 5);

			var trail=new mono.PathCube(path, 3, 1);
			trail.s({
				'm.type': 'phong',
				'm.specularStrength': 30,
				'm.color': '#298A08',
				'm.ambient': '#298A08', 		
				'm.texture.image': demo.getRes('flow.jpg'),
				'm.texture.repeat': new mono.Vec2(150, 1),
			});
			trail.setRotationX(Math.PI);
			trail.setPositionY(5);
			trail.setClient('type', 'trail');
			box.add(trail);
		});
	},

	createPathAnimates: function(camera, element, points, loop, finalAngle, done){
		var animates=[];		

		if(points && points.length>0){
			var x=element.getPositionX();
			var z=element.getPositionZ();
			var angle=element.getRotationY();

			var createRotateAnimate=function(camera, element, toAngle, angle){
				if(toAngle!=angle && toAngle!=NaN){
					if(toAngle-angle > Math.PI){
						toAngle-=Math.PI*2;
					}
					if(toAngle-angle < -Math.PI){
						toAngle+=Math.PI*2;
					}
					//console.log(angle, toAngle);
					var rotateAnimate = new jxdgl.Animate({
						from: angle,
						to: toAngle,
						type: 'number',
						dur: Math.abs(toAngle-angle)*300,
						easing: 'easeNone',
						onPlay : function  () {
							element.animate =  this;
						},
						onUpdate: function(value){
							element.setRotationY(value);
						},

					});
					rotateAnimate.toAngle=toAngle;
					return rotateAnimate;
				}
			}

			for(var i=0;i<points.length;i++){
				var point=points[i];				
				var x1=point[0];
				var z1=point[1];
				var rotate=Math.atan2(-(z1-z), x1-x);
				
				var rotateAnimate=createRotateAnimate(camera, element, rotate, angle);
				if(rotateAnimate){
					animates.push(rotateAnimate);
					angle=rotateAnimate.toAngle;
				}
				
				var moveAnimate = new jxdgl.Animate({
					from: {x: x, y: z},
					to: {x: x1, y: z1},
					type: 'point',
					dur: Math.sqrt((x1-x)*(x1-x)+(z1-z)*(z1-z))*5,
					easing: 'easeNone',
					onPlay : function  () {
							element.animate =  this;
					},
					onUpdate: function(value){
						element.setPositionX(value.x);
						element.setPositionZ(value.y);
					},
				});
				animates.push(moveAnimate);				

				x=x1;
				z=z1;
			}			

			if(finalAngle!=undefined && angle!=finalAngle){
				var rotateAnimate=createRotateAnimate(camera, element, finalAngle, angle);
				if(rotateAnimate){
					animates.push(rotateAnimate);
				}
			}
		}
		animates[animates.length - 1].onDone = done;
		var animate;
		for(var i=0;i<animates.length;i++){
			if(i>0){
				animates[i-1].chain(animates[i]);
				if(loop &&i==animates.length-1){
					animates[i].chain(animate);
				}
			}else{
				animate=animates[i];
			}
		}
		return animate;
	},

	toggleConnectionView: function(network){
		network.connectionView=!network.connectionView;

		var connectionView=network.connectionView;
		var box=network.getDataBox();
		var connections = demo.typeFinder.find('connection');
		var rails = demo.typeFinder.find('rail');
		connections.forEach(function(connection){
			connection.setVisible(connectionView);
			if(!connection.billboard){
				connection.billboard=new mono.Billboard();
				connection.billboard.s({
					'm.texture.image': demo.createConnectionBillboardImage('0'),
					'm.vertical': true,
				});
				connection.billboard.setScale(60,30,1);
				connection.billboard.setPosition(400,230,330);
				box.add(connection.billboard);
			}
			connection.billboard.setVisible(connectionView);
			if(connection.isVisible()){
				var offsetAnimate = new jxdgl.Animate({
					from: 0 ,
					to: 1,
					type: 'number',
					dur: 1000,
					repeat:Number.POSITIVE_INFINITY,
					reverse: false,
					onUpdate: function(value){
						connection.s({
							'm.texture.offset': new mono.Vec2(value, 0),
						});
						if(value===1){
							var text='54'+parseInt(Math.random()*10)+'.'+parseInt(Math.random()*100);
							connection.billboard.s({
								'm.texture.image': demo.createConnectionBillboardImage(text),
							});
						}
					},
				});
				offsetAnimate.play();
				connection.offsetAnimate = offsetAnimate;
			}else{
				if(connection.offsetAnimate){
					connection.offsetAnimate.stop();
				}
			}
		});
		rails.forEach(function(rail){
			rail.setVisible(connectionView);
		});
	},

	setupLights: function(box){
		var pointLight = new mono.PointLight(0xFFFFFF,0.3);
		pointLight.setPosition(0,1000,-1000);
		box.add(pointLight);     
		
		var pointLight = new mono.PointLight(0xFFFFFF,0.3);
		pointLight.setPosition(0,1000,1000);
		box.add(pointLight);        

		var pointLight = new mono.PointLight(0xFFFFFF,0.3);
		pointLight.setPosition(1000,-1000,1000);
		box.add(pointLight);        

		box.add(new mono.AmbientLight('white'));	
	},

	handleDoubleClick: function(e, network){
		var camera=network.getCamera();
		var interaction=network.getDefaultInteraction();
		var firstClickObject=demo.findFirstObjectByMouse(network,e);
		if(firstClickObject){
			var element=firstClickObject.element;		
			var newTarget=firstClickObject.point;
			var oldTarget=camera.getTarget();
			if(element.getClient('animation')){
				demo.playAnimation(element, element.getClient('animation'));
			}else if(element.getClient('dbl.func')){				
				var func=element.getClient('dbl.func');
				func();
			}else{
				demo.animateCamera(camera, interaction, oldTarget, newTarget);
			}
		}else{
			var oldTarget=camera.getTarget();
			var newTarget=new mono.Vec3(0,0,0);
			demo.animateCamera(camera, interaction, oldTarget, newTarget);
		}
	},

	//鼠标移动到网元上1S后显示tooltip
    handleMouseMove: function(e, network, tooltipObj){ 
        var objects = network.getElementsByMouseEvent(e);
        //获取当前网元，如果当前鼠标下有对象并且类型为group，那么就设置currentElement为鼠标下的网元
        var currentElement = null;
        var tooltip = tooltipObj.getView();
        // var tooltip = document.getElementById('tooltip');
        if (objects.length) {           
            var first = objects[0];
            var object3d = first.element;
            if(object3d.getClient('type') === 'card' && object3d.getClient('isAlarm')){ 
                currentElement = object3d;
                tooltipObj.setValues([object3d.getClient('BID')]);
            }
        }
        //如果当前和上一次的网元不一致，先清除timer。
        //如果当前网元有值，起一个timer，2S后显示tooltip。
        //tooltip显示的位置为最近一次鼠标移动时的位置
        if (demo.lastElement != currentElement ) {
            clearTimeout(demo.timer);
            if(currentElement){
               demo.timer = setTimeout(function(){
                    tooltip.style.display = 'block';
                    tooltip.style.position = 'absolute';
                    tooltip.style.left = (window.lastEvent.pageX - tooltip.clientWidth/2) + 'px';
                    tooltip.style.top = (window.lastEvent.pageY - tooltip.clientHeight - 15) + 'px';
                },1000); 
            }     
        }
        //设置上一次的网元为当前网元
        demo.lastElement = currentElement; 
        //如果当前鼠标下没有网元，隐藏tooltip
        if(currentElement == null){
            tooltip.style.display = 'none';
        }
        //设置每次移动时鼠标的事件对象
        window.lastEvent = e;
    },

	copyProperties: function(from, to, ignores){
		if(from && to){
			for(var name in from){
				if(ignores && ignores.indexOf(name)>=0){
					//ignore.
				}else{
					to[name]=from[name];
				}
			}
		}
	},

	createCubeObject: function(json){
		var translate=json.translate || [0,0,0];
		var width=json.width;
		var height=json.height;
		var depth=json.depth;
		var sideColor=json.sideColor;
		var topColor=json.topColor;

		var object3d=new mono.Cube(width, height, depth);				
		object3d.setPosition(translate[0], translate[1]+height/2, translate[2]);					
		object3d.s({
			'm.color': sideColor,
			'm.ambient': sideColor,
			'left.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
			'right.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
			'front.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
			'back.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
			'top.m.color': topColor,
			'top.m.ambient': topColor,						
			'bottom.m.color': topColor,
			'bottom.m.ambient': topColor,						
		});
		object3d.setClient('type','rack');
		return object3d;
	},
	
	create2DPath: function(pathData) {
		var path;
		for(var j=0;j<pathData.length;j++){
			var point=pathData[j];
			if(path){
				path.lineTo(point[0],point[1], 0);
			}else{
				path=new mono.Path();
				path.moveTo(point[0],point[1], 0);
			}
		}

		return path;
	},
	
	create3DPath: function(pathData) {
		var path;
		for(var j=0;j<pathData.length;j++){
			var point=pathData[j];
			if(path){
				path.lineTo(point[0],point[1], point[2]);
			}else{
				path=new mono.Path();
				path.moveTo(point[0],point[1], point[2]);
			}
		}

		return path;
	},

	createPathObject: function(json){
		var translate=json.translate || [0,0,0];
		var pathWidth=json.width;
		var pathHeight=json.height;		
		var pathData=json.data;					
		var path=this.create2DPath(pathData);
		var pathInsideColor=json.insideColor;
		var pathOutsideColor=json.outsideColor;
		var pathTopColor=json.topColor;
		
		var object3d=this.createWall(path, pathWidth, pathHeight, pathInsideColor, pathOutsideColor, pathTopColor);
		object3d.setPosition(translate[0], translate[1], -translate[2]);	
		object3d.shadow=json.shadow;

		return object3d;
	},

	filterJson: function(box, objects){
		var newObjects=[];

		for(var i=0; i<objects.length; i++){
			var object=objects[i];
			var type=object.type;
			var filter=this.getFilter(type);
			if(filter){
				var filteredObject=filter(box, object);
				if(filteredObject){
					if(filteredObject instanceof Array){
						newObjects=newObjects.concat(filteredObject);						
					}else{
						this.copyProperties(object, filteredObject, ['type']);
						newObjects.push(filteredObject);
					}
				}
			}else{
				newObjects.push(object);				
			}
		}
		
		return newObjects;
	},

	createCombo: function(parts){
		var children=[];		
		var ops=[];
		var ids=[];
		for(var i=0;i<parts.length;i++){
			var object=parts[i];
			var op=object.op || '+';
			var style=object.style;
			var translate=object.translate || [0,0,0];
			var rotate=object.rotate || [0,0,0];
			var object3d=null;
			if(object.type==='path'){				
				object3d=this.createPathObject(object);
			}
			if(object.type==='cube'){
				object3d=this.createCubeObject(object);
			}			
			if(object3d){
				object3d.setRotation(rotate[0], rotate[1], rotate[2]);
				if(style){
					object3d.s(style);
				}						
				children.push(object3d);
				if(children.length>1){
					ops.push(op);
				}
				ids.push(object3d.getId());
			}
		}

		if(children.length>0){
			var combo=new mono.ComboNode(children, ops);
			combo.setNames(ids);
			return combo;
		}
		return null;
	},

	loadData: function(network){
		var json= demo.filterJson(network.getDataBox(), dataJson.objects);
		var box=network.getDataBox();

		network.setClearColor(demo.CLEAR_COLOR);

		var children=[];
		var ops=[];
		var ids=[];
		var shadowHost;
		var shadowHostId;
		for(var i=0;i<json.length;i++){
			var object=json[i];
			var op=object.op;
			var style=object.style;
			var client=object.client;
			var translate=object.translate || [0,0,0];
			var rotate=object.rotate || [0,0,0];
			var object3d=null;

			if(object.type==='path'){				
				object3d=this.createPathObject(object);
			}
			if(object.type==='cube'){
				object3d=this.createCubeObject(object);				
			}

			if(object.shadowHost){
				shadowHost=object3d;
				shadowHostId=object3d.getId();
				box.shadowHost = shadowHost;
			}

			var creator=demo.getCreator(object.type);
			if(creator){
				creator(box, object);
				continue;
			}

			if(object3d){
				object3d.shadow = object.shadow;
				object3d.setRotation(rotate[0], rotate[1], rotate[2]);
				if(style){
					object3d.s(style);
				}		
				if(client){
					for(var key in client){
						object3d.setClient(key,client[key]);		
					}
				}	
				if(op){
					children.push(object3d);
					if(children.length>1){
						ops.push(op);
					}
					ids.push(object3d.getId());
				}else{						
					box.add(object3d);
				}
			}
		}
		
		if(children.length>0){
			var combo=new mono.ComboNode(children, ops);			
			combo.setNames(ids);
			combo.setClient('type', 'floorCombo');
			box.add(combo);

			//lazy load floor shadow map.
			if(shadowHost && shadowHostId){
				setTimeout(function(){demo.updateShadowMap(combo, shadowHost, shadowHostId,box)}, demo.LAZY_MAX);
			}
		}
	},

	updateShadowMap: function(combo, shadowHost, shadowHostId,box){					
		var shadowMapImage=demo.createShadowImage(box, shadowHost.getWidth(), shadowHost.getDepth());
		var floorTopFaceId=shadowHostId+'-top.m.lightmap.image';						
		combo.setStyle(floorTopFaceId, shadowMapImage);
	},

	loadRackContent: function(box, x, y, z, width, height, depth, severity, cube, cut, json, parent, oldRack){
		var positionY=10;
		var serverTall=9;
		var serverGap=2;
		var findFaultServer=false;
		while(positionY<height-20){
			var number = parseInt(Math.random()*3)+1;
			var pic='server'+number+'.jpg';
			if(number === 3 ){
				pic='server3.png';
			}
			
			var color= (number === 3 || positionY>100) && !findFaultServer && severity ? severity.color : null;
			var server=this.createServer(box, cube, cut, pic, color, oldRack);

			var size = server.getBoundingBox().size();
			if(color){
				findFaultServer=true;
			}
			server.setPositionY(positionY + size.y/2 - height/2);
			server.setPositionZ(server.getPositionZ()+5);	
			server.setParent(parent);
			positionY = positionY + size.y + serverGap;
			if(positionY>200){
				box.removeByDescendant(server,true);
				break;
			}

		}
	},

	createServer: function(box, cube, cut, pic, color, oldRack){
		var picMap = {
			'server1.jpg': 4.445*2,
			'server2.jpg': 4.445*3,
			'server3.png': 4.445*6,
		}
		var x=cube.getPositionX();
		var z=cube.getPositionZ();
		var width=cut.getWidth();
		var height = picMap[pic];
		var depth=cut.getDepth();

		var serverBody=new mono.Cube(width-2, height-2, depth-4);
		var bodyColor=color?color:'#5B6976';
		serverBody.s({
			'm.color': bodyColor,
			'm.ambient': bodyColor,
			'm.type':'phong',
			'm.texture.image': demo.getRes('rack_inside.jpg'),
		});
		serverBody.setPosition(0, 0.5, (cube.getDepth()-serverBody.getDepth())/2);

		var serverPanel=new mono.Cube(width+2, height+1, 0.5);
		color=color?color:'#FFFFFF';
		serverPanel.s({			
			'm.texture.image': demo.getRes('rack_inside.jpg'),
			'front.m.texture.image': demo.RES_PATH + '/' +pic,
			'front.m.texture.repeat': new mono.Vec2(1,1),
			'm.specularStrength': 100,
			'm.transparent': true,
			'm.color': color,
			'm.ambient': color,
		});
		serverPanel.setPosition(0, 0, serverBody.getDepth()/2+(cube.getDepth()-serverBody.getDepth())/2);
		if(pic == 'server3.png'){
			var serverColor = '#FFFFFF';
			serverPanel.s({
				'm.color': serverColor,
				'm.ambient': serverColor,
			});
		}

		var server=new mono.ComboNode([serverBody, serverPanel], ['+']);
		server.setClient('animation', 'pullOut.z');
		server.setPosition(0.5, 0, -5);
		box.add(server);

		if(pic == 'server3.png'){
			var isRendered = false;
			var xoffset = 2.1008, yoffset = 0.9897;
			var width = width + 2;
			var height = height +1;
			var cardWidth = (width - xoffset*2)/14;
			var count = 14;

			for(var i = 0; i< count; i++){
				var cardColor = '#FFFFFF';
				if(i > 5 && !isRendered) {
					cardColor = color;
					isRendered = true;
				}
				var params={
					'height': height-yoffset*2, 
					'width': cardWidth, 
					'depth':depth*0.4, 
					'pic': demo.RES_PATH + '/'+ 'card'+(i%4+1) +'.png',
					'color': cardColor
				};
				var card=demo.createCard(params);
				box.add(card);

				card.setParent(server);	
				card.setClient('type','card');	
				card.setClient('BID','card-'+i);	
				card.setClient('isAlarm', cardColor != '#FFFFFF');				
		  		card.p(-width/2 + xoffset + (i+0.5) * cardWidth,-height/2+yoffset,serverPanel.getPositionZ()-1);
		  		card.setClient('animation', 'pullOut.z');

				if(card.getClient('isAlarm')){
					oldRack.alarmCard=card;					
				}
		  	}
		}
		return server;
	},

	createCard: function(json){
		var translate=json.translate || [0,0,0];
		var x=translate[0],
			y=translate[1],
			z=translate[2];
		var width=json.width || 10,
			height=json.height || 50,
			depth=json.depth || 50;	
		var rotate=json.rotate || [0,0,0];
		var color = json.color || 'white';
		var pic = json.pic || demo.getRes('card1.png');

		var parts=[{
			//card panel
			type: 'cube',
			width: width,
			height: height,
			depth: 1,
			translate: [x, y, z+1],
			rotate: rotate,
			op: '+',			
			style:{
				'm.color': color,
				'm.ambient': color,
				'm.texture.image': demo.getRes('gray.png'),
				'front.m.texture.image': pic,
				'back.m.texture.image': pic,
			}
		},{
			//card body
			type: 'cube',
			width: 1,
			height: height*0.95,
			depth: depth,
			translate: [x, y, z-depth/2+1],
			rotate: rotate,
			op: '+',
			style:{
				'm.color': color,
				'm.ambient': color,
				'm.texture.image': demo.getRes('gray.png'),
				'left.m.texture.image': demo.getRes('card_body.png'),
				'right.m.texture.image': demo.getRes('card_body.png'),
				'left.m.texture.flipX': true,
				'm.transparent': true,	
				'm.lightmap.image':demo.getRes('outside_lightmap.jpg'),
			} 
		}];
		
		return demo.createCombo(parts);
	},	

	createShadowImage: function(box, floorWidth, floorHeight){			
		var canvas = document.createElement('canvas');
		canvas['width']=floorWidth;
		canvas['height']=floorHeight;
		var context = canvas.getContext('2d');
		context.beginPath();
		context.rect(0, 0, floorWidth, floorHeight);
		context.fillStyle = 'white';
		context.fill();

		var marker=function(context, text, text2, x, y){
			var color='#0B2F3A';//'#0B2F3A';//'#FE642E';
			context.font = 60+'px "Microsoft Yahei" ';
			context.fillStyle = color;
			context.textAlign = 'center';
			context.textBaseline = 'middle';		
			//context.shadowBlur = 30;
			context.fillText(text, x, y);
			context.strokeStyle=color;
			context.lineWidth=3;			
			context.strokeText(text, x, y);

			if(!text2) return;
			y+=52;
			color='#FE642E';
			context.font = 26+'px "Microsoft Yahei" ';
			context.fillStyle = color;
			context.textAlign = 'center';
			context.textBaseline = 'middle';		
			context.fillText(text2, x, y);
		}
		marker(context, '阿里巴巴', '192.168.1.100', 530, 500);
		marker(context, '乐视', '192.168.1.150', 590, 1000);
		marker(context, '亚马逊', 'ip待分配', 1020, 1000);

		box.forEach(function(object){
			if(object instanceof mono.Entity && object.shadow){
				var translate=object.getPosition() || {x:0, y:0, z:0};	
				var rotate=object.getRotation() || {x:0, y:0, z:0};
				var rotate=-rotate[1];

				demo.paintShadow(object, context, floorWidth, floorHeight, translate, rotate);
			}
		});
		
		return canvas;
	},

	paintShadow: function(object, context, floorWidth, floorHeight, translate, rotate){
		var type=object.getClient('type');
		var shadowPainter=demo.getShadowPainter(type);

		if(shadowPainter){
			shadowPainter(object, context, floorWidth, floorHeight, translate, rotate);
		}
	},	
	
	findFirstObjectByMouse: function(network, e){
		var objects = network.getElementsByMouseEvent(e);
		if (objects.length) {
			for(var i=0;i<objects.length;i++){			
				var first = objects[i];
				var object3d = first.element;
				if(! (object3d instanceof mono.Billboard)){
					return first;
				}
			}
		}
		return null;
	},

	animateCamera: function(camera, interaction, oldPoint, newPoint, onDone){
		//jxdgl.Util.stopAllAnimates(true);
		
		var offset=camera.getPosition().sub(camera.getTarget());
		var animation=new jxdgl.Animate({
			from: 0,
			to: 1,
			dur: 500,
			easing: 'easeBoth',
			onUpdate: function (value) {
				var x=oldPoint.x+(newPoint.x-oldPoint.x)*value;
				var y=oldPoint.y+(newPoint.y-oldPoint.y)*value;
				var z=oldPoint.z+(newPoint.z-oldPoint.z)*value;
				var target=new mono.Vec3(x,y,z);				
				camera.lookAt(target);
				interaction.target=target;
				var position=new mono.Vec3().addVectors(offset, target);
				camera.setPosition(position);
			},
		});
		animation.onDone=onDone;
		animation.play();
	},
	
	playAnimation: function(element, animation, done){
		var params=animation.split('.');
		if(params[0]==='pullOut'){
			var direction=params[1];
			demo.animatePullOut(element, direction, done);
		}
		if(params[0]==='rotate'){
			var anchor=params[1];
			var angle=params[2];
			var easing=params[3];
			demo.animateRotate(element, anchor, angle, easing, done);
		}		
	},

	animatePullOut: function(object, direction, done){
		//jxdgl.Util.stopAllAnimates(true);

		var size=object.getBoundingBox().size().multiply(object.getScale());

		var movement=0.8;
		
		var directionVec=new mono.Vec3(0, 0, 1);
		var distance=0;
		if(direction==='x'){
			directionVec=new mono.Vec3(1, 0, 0);
			distance=size.x;
		}
		if(direction==='-x'){
			directionVec=new mono.Vec3(-1, 0, 0);
			distance=size.x;
		}
		if(direction==='y'){
			directionVec=new mono.Vec3(0, 1, 0);
			distance=size.y;
		}
		if(direction==='-y'){
			directionVec=new mono.Vec3(0, -1, 0);
			distance=size.y;
		}
		if(direction==='z'){
			directionVec=new mono.Vec3(0, 0, 1);
			distance=size.z;
		}
		if(direction==='-z'){
			directionVec=new mono.Vec3(0, 0, -1);
			distance=size.z;
		}

		distance=distance*movement;
		if(object.getClient('animated')){
			directionVec=directionVec.negate();
		}

		var fromPosition=object.getPosition().clone();		
		object.setClient('animated', !object.getClient('animated'));

		new jxdgl.Animate({
			from: 0,
			to: 1,
			dur: 2000,
			easing: 'bounceOut',			
			onUpdate: function (value) {
				//don't forget to clone new instance before use them!
				object.setPosition(fromPosition.clone().add(directionVec.clone().multiplyScalar(distance * value)));
			},
			onDone: function(){
				demo.animationFinished(object);			

				if(done) {
					done();
				}
			},
		}).play();
	},

	animateRotate: function(object, anchor, angle, easing, done){
		//jxdgl.Util.stopAllAnimates(true);
		easing = easing || 'easeInStrong';

		var size=object.getBoundingBox().size().multiply(object.getScale());
		
		var from=0;
		var to=1;
		if(object.getClient('animated')){
			to=-1;
		}
		object.setClient('animated', !object.getClient('animated'));
		
		var position;
		var axis;
		if(anchor==='left'){
			position=new mono.Vec3(-size.x/2, 0, 0);
			var axis=new mono.Vec3(0,1,0);
		}
		if(anchor==='right'){
			position=new mono.Vec3(size.x/2, 0, 0);
			var axis=new mono.Vec3(0,1,0);
		}

		var animation=new jxdgl.Animate({
			from: from,
			to: to,
			dur: 1500,
			easing: easing,
			onUpdate: function (value) {					
				if(this.lastValue===undefined){
					this.lastValue=0;
				}
				object.rotateFromAxis(axis.clone(), position.clone(), Math.PI/180*angle*(value-this.lastValue));
				this.lastValue=value;
			},
			onDone: function(){
				delete this.lastValue;
				demo.animationFinished(object);

				if(done) {
					done();
				}
			},
		});
		animation.play();
	},
	
	animationFinished: function(element){
		var animationDoneFuc=element.getClient('animation.done.func');
		if(animationDoneFuc){
			animationDoneFuc();
		}
	},

	getRandomInt: function(max){
		return parseInt(Math.random()*max);
	},
	
	getRandomLazyTime: function(){
		var time=demo.LAZY_MAX-demo.LAZY_MIN;
		return demo.getRandomInt(time)+demo.LAZY_MIN;
	},

	generateAssetImage: function(text){         
		var width=512, height=256;

		var canvas = document.createElement('canvas');
		canvas.width  = width;
		canvas.height = height;

		var ctx = canvas.getContext('2d');		
		ctx.fillStyle='white';
		ctx.fillRect(0,0,width,height);
		
		ctx.font = 150+'px "Microsoft Yahei" ';
		ctx.fillStyle = 'black';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, width/2,height/2);
		ctx.strokeStyle='black';
		ctx.lineWidth=15;
		ctx.strokeText(text, width/2,height/2);

		return canvas;   
	},

	toggleTemperatureView: function(network){
		network.temperatureView=!network.temperatureView;

		network.getDataBox().forEach(function(element){						
			var type=element.getClient('type');

			if(type==='rack' || type==='rack.door'){	
				element.setVisible(!network.temperatureView);
				if(type==='rack'){
					if(!element.temperatureFake){
						var fake=new mono.Cube(element.getWidth(), element.getHeight(), element.getDepth());
						element.temperatureFake = fake;
						var sideImage=demo.createSideTemperatureImage(element, 3+Math.random()*10);
						fake.s({
							'm.texture.image': sideImage,
							'top.m.texture.image': element.getStyle('top.m.texture.image'),
							'top.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
							'top.m.specularmap.image': element.getStyle('top.m.texture.image'),
							'top.m.envmap.image': demo.getEnvMap(),
							'top.m.type':'phong',
						});								
						network.getDataBox().add(fake);
					}
					element.temperatureFake.setPosition(element.getPosition());
					element.temperatureFake.setVisible(network.temperatureView);
				}
			}
		});
		if(network.temperatureView){
			demo.createTemperatureBoard(network.getDataBox());
			demo.createTemperatureWall(network.getDataBox());
		}else{
			network.getDataBox().remove(network.getDataBox().temperaturePlane);
			delete network.getDataBox().temperaturePlane;
			network.getDataBox().remove(network.getDataBox().temperatureWall);
			delete network.getDataBox().temperatureWall;
		}
	},

	createTemperatureBoard: function(box){
		var floor=box.shadowHost;
		var board = new TemperatureBoard(512,512,'h', 20);

		box.forEach(function(element){						
			var type=element.getClient('type');
			if(type==='rack'){
				var x=element.getPositionX()/floor.getWidth()*512+256;
				var y=element.getPositionZ()/floor.getDepth()*512+256;
				var value=0.1+Math.random()*0.3;
				var width=element.getWidth()/floor.getWidth()*512;
				var depth=element.getDepth()/floor.getWidth()*512;

				board.addPoint(x-width/2,y+depth/2,value);
				board.addPoint(x+width/2,y+depth/2,value);
				board.addPoint(x-width/2,y-depth/2,value);
				board.addPoint(x+width/2,y-depth/2,value);
				board.addPoint(x,y,value);				
			}
		});

		var image = board.getImage();
		
		var plane=new mono.Plane(floor.getWidth(), floor.getDepth());
		plane.s({
			'm.texture.image': image,
			'm.transparent': true,
			'm.side': mono.DoubleSide,
			'm.type': 'phong',
		});
		plane.setPositionY(10);
		plane.setRotationX(-Math.PI/2);
		box.add(plane);
		
		box.temperaturePlane=plane;
	},

	createTemperatureWall: function(box){		
		var cube=new mono.Cube(990, 200, 10);
		cube.s({
			'm.visible': false,
		});
		cube.s({
			'front.m.visible': true,
			'm.texture.image': demo.getRes('temp1.jpg'),
			'm.side': mono.DoubleSide,
			'm.type': 'phong',
		});
		cube.setPosition(0, cube.getHeight()/2, 400);
		cube.setRotationX(Math.PI);
		box.add(cube);
		
		box.temperatureWall=cube;
	},	
	
	createSideTemperatureImage: function(rack, count){
		var width=2;
		var height=rack.getHeight();
		var step=height/count;
		var board = new TemperatureBoard(width,height,'v', height/count);		

		for(var i=0;i<count;i++){		
			var value=0.3+Math.random()*0.2;
			if(value<4){
				value=Math.random()*0.9;
			}
			board.addPoint(width/2,step*i,value);
		};

		return board.getImage();
	},

	toggleSpaceView: function(network){
		network.spaceView=!network.spaceView;

		network.getDataBox().forEach(function(element){						
			var type=element.getClient('type');

			if(type==='rack' || type==='rack.door'){	
				element.setVisible(!network.spaceView);
				if(type==='rack'){
					if(!element.spaceCubes){
						element.spaceCubes=demo.createRackSpaceCubes(network.getDataBox(), element);
					}
					for(var i=0;i<element.spaceCubes.length;i++){
						element.spaceCubes[i].setPosition(element.getPositionX(), 
							element.spaceCubes[i].getPositionY(),
							element.getPositionZ());
						element.spaceCubes[i].setVisible(network.spaceView);
					}
				}
			}
		});
	},

	createRackSpaceCubes: function(box, rack){	
		var cubes=[];
		var width=rack.getWidth();
		var height=rack.getHeight();
		var depth=rack.getDepth();

		var total=42;
		var step=height/total;
		var index=0;

		var colors=['#8A0808', '#088A08', '#088A85', '#6A0888','#B18904'];

		var solid=false;
		while(index<42){
			var size=parseInt(1+Math.random()*5);
			solid=!solid;
			var color=solid? colors[size-1] : '#A4A4A4';
			if(solid){
				size*=2;
			}else{
				size*=4;
			}
			if(index+size>total){
				size=total-index;
			}
			
			var cube=new mono.Cube(width, step*size-2, depth);
			var y=(index+size/2)*step;
			cube.setPosition(rack.getPositionX(), y, rack.getPositionZ());
			cube.s({
				'm.type': 'phong',
				'm.color': color,
				'm.ambient': color,
				'm.specularStrength': 50,
			});
			if(solid){
				cube.s({
					'm.transparent': true,
					'm.opacity': 0.6,
				});				
			}			
			box.add(cube);
			cubes.push(cube);

			index+=size;
		}
		return cubes;
	},

	toggleUsageView: function(network){
		network.usageView=!network.usageView;

		network.getDataBox().forEach(function(element){						
			var type=element.getClient('type');

			if(type==='rack' || type==='rack.door'){	
				element.setVisible(!network.usageView);
				if(type==='rack'){
					if(!element.usageFakeTotal){
						var usage=Math.random();
						var color=demo.getHSVColor((1-usage)*0.7, 0.7, 0.7);

						var usageFakeTotal=new mono.Cube(element.getWidth(), element.getHeight(), element.getDepth());
						element.usageFakeTotal = usageFakeTotal;
						usageFakeTotal.s({
							'm.wireframe': true,
							'm.transparent': true,
							'm.opacity': 0.2,
						});		
						usageFakeTotal.setPosition(element.getPosition());
						network.getDataBox().add(usageFakeTotal);
						
						var height=element.getHeight()*usage;

						var usageFakeUsed=new mono.Cube(element.getWidth(), 0, element.getDepth());
						element.usageFakeUsed = usageFakeUsed;						
						usageFakeUsed.s({
							'm.type': 'phong',
							'm.color': color,
							'm.ambient': color,
							'm.specularStrength': 20,
							'left.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
							'right.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
							'back.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
							'front.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
						});		
						usageFakeUsed.setPosition(element.getPosition());
						usageFakeUsed.setPositionY(0);
						network.getDataBox().add(usageFakeUsed);

						var usageAnimation=new jxdgl.Animate({
							from: 0,
							to: height,
							type: 'number',
							dur: 2000,
							delay: Math.random()*200,
							easing: 'bounceOut',
							onUpdate: function(value){
								usageFakeUsed.setHeight(value);
								usageFakeUsed.setPositionY(usageFakeUsed.getHeight()/2);
							},
						});
						element.usageAnimation=usageAnimation;
					}

					element.usageFakeTotal.setVisible(network.usageView);
					element.usageFakeUsed.setVisible(network.usageView);
					element.usageFakeTotal.setPosition(element.getPosition().clone());
					element.usageFakeUsed.setHeight(0);
					element.usageFakeUsed.setPosition(element.getPosition().clone());
					element.usageFakeUsed.setPositionY(0);

					if(network.usageView){
						element.usageAnimation.play();
					}else{
						element.usageAnimation.stop();
					}
				}
			}
		});
	},

	toggleAirView: function(network){
		network.airView=!network.airView;

		if(!network.getDataBox().airPlanes){
			network.getDataBox().airPlanes=demo.createAirPlanes();
		}

		for(var i=0;i<network.getDataBox().airPlanes.length;i++){
			var plane=network.getDataBox().airPlanes[i];
			if(network.airView){
				network.getDataBox().add(plane);
				plane.airAnimation.play();
			}else{
				network.getDataBox().remove(plane);
				plane.airAnimation.stop();
			}
		}		
	},

	toggleMoveView: function(network){
		network.getDataBox().getSelectionModel().clearSelection();
		network.moveView=!network.moveView;
		network.dirtyNetwork();
	},

	/* h, s, v (0 ~ 1) */
	getHSVColor: function (h, s, v) {
		var r, g, b, i, f, p, q, t;
		if (h && s === undefined && v === undefined) {
			s = h.s, v = h.v, h = h.h;
		}
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
		var rgb='#'+this.toHex(r * 255)+this.toHex(g * 255)+this.toHex(b * 255);
		return rgb;
	},

	toHex: function (value){
		var result=parseInt(value).toString(16);
		if(result.length==1){
			result='0'+result;
		}
		return result;
	},
	
	showDialog: function(content, title, width, height) {
		title= title || '';
		width=width || 600;
		height=height || 400;
		var div=document.getElementById('dialog');
		if(div){
			document.body.removeChild(div);
		}
		div=document.createElement('div');
		div.setAttribute('id', 'dialog');

		div.style.display = 'block';
		div.style.position = 'absolute';
		div.style.left = '100px';
		div.style.top = '100px';
		div.style.width=width+'px';
		div.style.height=height+'px';
		div.style.background='rgba(164,186,223,0.75)';						
		div.style['border-radius']='5px';
		document.body.appendChild(div);

		var span=document.createElement('span');
		span.style.display = 'block';
		span.style['color']='white';
		span.style['font-size']='13px';
		span.style.position = 'absolute';
		span.style.left = '10px';
		span.style.top = '2px';
		span.innerHTML=title;
		div.appendChild(span);

		var img=document.createElement('img');
		img.style.position = 'absolute';
		img.style.right= '4px';
		img.style.top = '4px';
		img.setAttribute('src', demo.getRes('close.png'));
		img.onclick = function () {
			document.body.removeChild(div);
		};
		div.appendChild(img);

		if(content){
			content.style.display = 'block';
			content.style.position = 'absolute';
			content.style.left = '3px';
			content.style.top = '24px';
			content.style.width=(width-6)+'px';
			content.style.height=(height-26)+'px';
			div.appendChild(content);
		}
	},

	showVideoDialog: function(title){
		var video=document.createElement('video');		
		video.setAttribute('src', demo.getRes('test.mp4'));
		video.setAttribute('controls', 'true');
		video.setAttribute('autoplay', 'true');			
		
		demo.showDialog(video, title, 610, 280);
	},

	createConnectionBillboardImage: function(value){
		var width=512, height=256;
		var text='当前网络流量';
		var canvas = document.createElement('canvas');
		canvas['width']=width;
		canvas['height']=height;
		var context = canvas.getContext('2d');
		context.fillStyle = '#FE642E';
		context.fillRect(0, 0, width, height-height/6);

		context.beginPath();
		context.moveTo(width*0.2, 0);
		context.lineTo(width/2, height);
		context.lineTo(width*0.8, 0);
		context.fill();
		
		var color='white';
		context.font = 40+'px "Microsoft Yahei" ';
		context.fillStyle = color;
		context.textAlign = 'left';
		context.textBaseline = 'middle';		
		context.fillText(text, height/10, height/5);

		var color='white';
		text=value;
		context.font = 100+'px "Microsoft Yahei" ';
		context.fillStyle = color;
		context.textAlign = 'left';
		context.textBaseline = 'middle';		
		context.fillText(text, height/10, height/2);
		context.strokeStyle=color;
		context.lineWidth=4;			
		context.strokeText(text, height/10, height/2);

		text='Mb/s';
		context.font = 50+'px "Microsoft Yahei" ';
		context.fillStyle = color;
		context.textAlign = 'right';
		context.textBaseline = 'middle';		
		context.fillText(text, width-height/10, height/2+20);

		return canvas;
	},

	inspection: function(network){
		var leftDoor, rightDoor;
		var rack;
		network.getDataBox().forEach(function(element){
			if(element.getClient('type')==='left-door') {
				leftDoor=element;
			}
			if(element.getClient('type')==='right-door') {
				rightDoor=element;
			}
			if(element.getClient('label')==='1A04'){
				rack=element;
			}
		});

		var actions1=[
			{'px':2000, 'py':500, 'pz':2000, 'tx':0, 'ty':0, 'tz':0, }, 			
			{'px':2000,'pz':-2000},
			{'px':0,'pz':-2500},
			{'px':-2000},
			{'px':-2500,'pz':0},
			{'pz':2000},
			{'px':-1200, 'tx':-350, 'ty':170, 'tz':500}, 
			{'px': -550, 'py': 190, 'pz':1100}, 
		];

		var actions2=[
			{'px': -350, 'py': 120, 'pz':600, 'tx':-340, 'ty':150, 'tz':-300}, 
			{'py': 100, 'pz':200, }, 
			{'px': -300, 'py': 300, 'pz':150, 'ty':70}, 
		];

		var showAlarmAction=function(element){
			var card=element.alarmCard;
			var position=card.getWorldPosition();
			var actions3=[
				{'px': position.x, 'py': position.y, 'pz': position.z+120, 'tx':position.x, 'ty':position.y+10, 'tz':position.z}, 
				{'px': position.x-30, 'py': position.y+30, 'pz': position.z+90, 'ty':position.y+15}, 
			];
			mono.AniUtil.playInspection(network, actions3, function(){
				demo.playAnimation(card, card.getClient('animation'), function(){
					network.inspecting=false;
					demo.showAlarmDialog();
				});				
			});			
		}

		rack.setClient('loaded.func', showAlarmAction);

		var doorOpen=function(){			
			demo.playAnimation(leftDoor, leftDoor.getClient('animation'), function(){
				mono.AniUtil.playInspection(network, actions2, function(){
					var door=rack.door;
					demo.playAnimation(door, door.getClient('animation'));					
				});		
			});
			demo.playAnimation(rightDoor, rightDoor.getClient('animation'));
		}
		mono.AniUtil.playInspection(network, actions1, doorOpen);
	},

	showAlarmDialog: function(){
		var span=document.createElement('span');		
		span.style['background-color']='rgba(255,255,255,0.85)';
		span.style['padding']='10px';
		span.style['color']='darkslategrey';
		span.innerHTML='<b>告警描述</b>'+
			'<p>中兴S330板卡有EPE1，LP1，OL16，CSB,SC，EPE1（2M电口）与LP1（155M光）与用户路由器连接。'+
			'EPE1上发生TU-AIS ,TU-LOP，UNEQ，误码秒告警，所配业务均出现，用户路由器上出现频繁up，down告警。'+
			'用户路由器上与1块LP1（有vc12级别的交叉）连接的cpos板卡上也有频繁up，down告警，与另一块LP1（vc4穿通）'+
			'连接的cpos卡上无告警</p>'+
			'<b>故障分析</b>'+
			'<p>情况很多。如果只是单站出现，首先判断所属环上保护，主用光路有没有告警；如果有，解决主用线路问题；'+
			'如果没有，做交叉板主备切换--当然是在晚上进行；很少出现主备交叉板都坏的情况。'+
			'还没解决的话，依次检查单板和接口板。</p>';

		demo.showDialog(span, 'SDH 2M支路板告警', 510, 250);
		span.style['width']='484px';
		span.style['height']='203px';
	},

	toggleLinkVisible: function(network){
		

	},

	resetView: function(network){		
		demo.resetCamera(network);

		//reset all racks. unload contents, close door.
		var loadedRacks=[];
		network.getDataBox().forEach(function(element){
			if(element.getClient('type')==='rack' && element.oldRack){
				loadedRacks.push(element);
			}
		});
		for(var i=0;i<loadedRacks.length;i++){
			//restore the old rack.
			var newRack=loadedRacks[i];
			var oldRack=newRack.oldRack;

			if(newRack.alarm){
				network.getDataBox().getAlarmBox().remove(newRack.alarm);
			}
			network.getDataBox().removeByDescendant(newRack,true);

			network.getDataBox().add(oldRack);
			if(oldRack.alarm){
				network.getDataBox().getAlarmBox().add(oldRack.alarm);
			}
			oldRack.door.setParent(oldRack);
			oldRack.setClient('loaded', false);
			
			//reset door.
			var door=oldRack.door;
			network.getDataBox().add(door);
			if(door.getClient('animated')){
				demo.playAnimation(door, door.getClient('animation'));
			}
		}

		//reset room door.
		var doors=[];
		network.getDataBox().forEach(function(element){
			if(element.getClient('type')==='left-door' || element.getClient('type')==='right-door'){
				doors.push(element);
			}
		});
		for(var i=0;i<doors.length;i++){
			var door=doors[i];
			if(door.getClient('animated')){
				demo.playAnimation(door, door.getClient('animation'));
			}
		}

		//reset all views.
		if(network.temperatureView){
			demo.toggleTemperatureView(network);
		}
		if(network.spaceView){
			demo.toggleSpaceView(network);
		}
		if(network.usageView){
			demo.toggleUsageView(network);
		}
		if(network.airView){
			demo.toggleAirView(network);
		}
		if(network.moveView){
			demo.toggleMoveView(network);
		}
		if(network.connectionView){
			demo.toggleConnectionView(network);
		}
		if(network.smokeView){
			demo.toggleSmokeView(network);
		}
		if(network.waterView){
			demo.toggleWaterView(network);
		}
		if(network.laserView){
			demo.toggleLaserView(network);
		}
		if(network.powerView){
			demo.togglePowerView(network);
		}
	},

	resetRackPosition: function(network){		
		//reset all rack position
		network.getDataBox().forEach(function(element){
			if(element.getClient('type')==='rack'){
				element.setPosition(element.getClient('origin'));
			}
		});
		demo.dirtyShadowMap(network);
	},

	showDoorTable: function(){
		var table=document.createElement('table');
		table.setAttribute('class', 'gridtable');
		for(var k=0;k<8;k++){
			var tr=document.createElement('tr');
			table.appendChild(tr);
			for(var i=0;i<3;i++){
				var tagName= k==0 ? 'th' : 'td';
				var td=document.createElement(tagName);
				tr.appendChild(td);
				if(k==0){
					if(i==0){
						td.innerHTML='#';
					}
					if(i==1){
						td.innerHTML='Time';
					}
					if(i==2){
						td.innerHTML='Activity';
					}
				}else{
					if(i==0){
						td.innerHTML=parseInt(Math.random()*1000);
					}
					if(i==1){
						td.innerHTML=new Date().format('yyyy h:mm');
					}
					if(i==2){
						if(Math.random()>0.5){
							td.innerHTML='Door access allowed';
						}else{
							td.innerHTML='Instant Alart - Door access denied';
						}
					}
				}
			}
		}

		demo.showDialog(table, 'Door Security Records', 330, 240);
	},

	toggleSmokeView: function(network){
		network.smokeView=!network.smokeView;
		network.getDataBox().forEach(function(element){
			var type=element.getClient('type');
			if(type==='smoke' || type==='extinguisher_arrow'){
				element.setVisible(network.smokeView);				
			}
		});
	},

	startSmokeAnimation: function(network){
		setInterval(demo.updateSmoke(network), 200);
	},

	startFpsAnimation: function(network){
		var span=document.createElement('span');
		span.style.display = 'block';
		span.style['color']='white';
		span.style['font-size']='10px';
		span.style.position = 'absolute';
		span.style.left = '10px';
		span.style.top = '10px';
		span.style.visibility='hidden';
		document.body.appendChild(span);
		network.fpsDiv=span;		

		demo.fps=0;		
		network.setRenderCallback(function(){
			demo.fps++;
		});
		setInterval(demo.updateFps(network), 1000);		
	},
	
	toggleFpsView: function(network){							
		network.fpsView=!network.fpsView;

		if(network.fpsView){
			network.fpsDiv.style.visibility='inherit';
		}else{
			network.fpsDiv.style.visibility='hidden';
		}
	},


	updateSmoke: function(network){
		return function(){
			if(network.smokeView){
				network.getDataBox().forEach(function(element){
					if(element.getClient('type')==='smoke' && element.isVisible()){
						var smoke=element;
						var count = smoke.vertices.length;
						for (var i = 0; i < count; i++) {
							var point= smoke.vertices[i];
							point.y = Math.random() * 200;
							point.x = Math.random() * point.y/2-point.y/4;				
							point.z = Math.random() * point.y/2-point.y/4;
						}
						smoke.verticesNeedUpdate = true;
						network.dirtyNetwork();
					}
				});
			}
		}
	},

	updateFps: function(network){
		return function(){
			network.fpsDiv.innerHTML='FPS:  ' + demo.fps;
			demo.fps=0;
		}
	},

	toggleWaterView: function(network){
		network.waterView=!network.waterView;
		if(network.waterView){
			demo.createWaterLeaking(network.getDataBox());
			network.getDataBox().oldAlarms=network.getDataBox().getAlarmBox().toDatas();
			network.getDataBox().getAlarmBox().clear();
		}else{
			if(network.getDataBox().waterLeakingObjects){
				for(var i=0;i<network.getDataBox().waterLeakingObjects.length;i++){
					network.getDataBox().remove(network.getDataBox().waterLeakingObjects[i]);
				}
			}
			network.getDataBox().oldAlarms.forEach(function(alarm){
				network.getDataBox().getAlarmBox().add(alarm);
			});
		}

		network.getDataBox().forEach(function(element){
			var type=element.getClient('type');
			if(type==='water_cable'){
				element.setVisible(network.waterView);
			}else if(type && type!=='floorCombo' && type!=='extinguisher' && type!=='glassWall'){
				if(network.waterView){		
					if(type==='rack' || type==='rack_door'){
						element.oldTransparent=element.getStyle('m.transparent');
						element.oldOpacity=element.getStyle('m.opacity');
						element.setStyle('m.transparent', true);
						element.setStyle('m.opacity', 0.1);
					}else{
						element.oldVisible=element.isVisible();
						element.setVisible(false);
					}
				}else{
					if(type==='rack' || type==='rack_door'){
						element.setStyle('m.transparent', element.oldTransparent);
						element.setStyle('m.opacity', element.oldOpacity);
					}else{
						element.setVisible(element.oldVisible);
					}
				}
			}
		});
	},

	createWaterLeaking: function(box){
		var sign=new mono.Billboard();
		sign.s({
			'm.texture.image': demo.getRes('alert.png'),
			'm.vertical': true,				
		});
		sign.setScale(80,160,1);
		sign.setPosition(50, 90, 50);
		box.add(sign);

		var ball=new mono.Sphere(30);
		ball.s({
			'm.transparent': true,
			'm.opacity': 0.8,
			'm.type': 'phong',
			'm.color': '#58FAD0',
			'm.ambient': '#81BEF7',
			'm.specularStrength': 50,
			'm.normalmap.image': demo.getRes('rack_inside_normal.jpg'),
		});	
		ball.setPosition(50, 0, 50);
		ball.setScale(1, 0.1, 0.7);
		box.add(ball);

		box.waterLeakingObjects=[sign, ball];
	},

	toggleLaserView: function(network){
		network.laserView=!network.laserView;		

		network.getDataBox().forEach(function(element){
			if(element.getClient('type')==='laser'){
				element.setVisible(network.laserView);
			}
		});
	},

	setupControlBar : function(network){
		var div = document.createElement('div');

	    div.setAttribute('id', 'toolbar');
		div.style.display = 'block';
		div.style.position = 'absolute';
		div.style.left = '20px';
		div.style.top = '10px';
		div.style.width='auto';
        document.body.appendChild(div);      
	},

	setupToolbar: function(buttons){		
		var count=buttons.length;
		var step=32;

		var div=document.createElement('div');
		div.setAttribute('id', 'toolbar');
		div.style.display = 'block';
		div.style.position = 'absolute';
		div.style.left = '10px';
		div.style.top = '75px';
		div.style.width='32px';
		div.style.height=(count*step+step)+'px';
		div.style.background='rgba(255,255,255,0.75)';						
		div.style['border-radius']='5px';
		document.body.appendChild(div);

		for(var i=0;i<count;i++){
			var button=buttons[i];
			var icon=button.icon;
			var img=document.createElement('img');
			img.style.position = 'absolute';
			img.style.left=  '4px';
			img.style.top = (step/2+(i * step))+'px';			
			img.style['pointer-events']='auto';
			img.style['cursor']='pointer';
			img.setAttribute('src', demo.getRes(icon));		
			img.style.width='24px';
			img.style.height='24px';
			img.setAttribute('title', button.label);
			img.onclick = button.clickFunction;
			div.appendChild(img);
		}
	},

	togglePowerView: function(network){
		if(!network.powerLineCreated){
			demo.createPowerLines(network);
		}
		network.powerView=!network.powerView;		

		network.getDataBox().forEach(function(element){
			var type=element.getClient('type');
			if(type==='power_line'){
				element.setVisible(network.powerView);
			}
		});
	},

	createPowerLines: function(network){
		var box=network.getDataBox();		

		var createRackLines=function(labels, offsetZ){
			box.forEach(function(element){
				if(element.getClient('type')==='rack'){				
					var label=element.getClient('label');
					if(labels.indexOf(label)>-1){
						var position=element.getPosition();
						var points=[];
						points.push([position.x, position.y, position.z]);
						points.push([position.x, position.y, position.z-60]);
						points.push([position.x, 240, position.z-60]);
						points.push([position.x, 240, offsetZ]);
						points.push([-550, 240, offsetZ]);
						demo.createPathLink(box, points, '#FE9A2E', 'power_line');

						var points=[];
						points.push([position.x-5, position.y, position.z]);
						points.push([position.x-5, position.y, position.z-60]);
						points.push([position.x-5, 250, position.z-60]);
						points.push([position.x-5, 250, offsetZ]);
						points.push([-550, 250, offsetZ]);
						demo.createPathLink(box, points, 'cyan', 'power_line');

						offsetZ-=5;
					}
				}
			});
		}

		createRackLines(['1A07', '1A08', '1A09', '1A10', '1A11', '1A12', '1A13'], 150);
		createRackLines(['1A00', '1A01', '1A02',], 160);
		createRackLines(['1A03', '1A04', '1A05','1A06'], -300);

		demo.createPathLink(box, [[-1000, 420, 600], [-800, 250, 500], [-550, 250, 500], [-550, 250, -315]], 'cyan', 'power_line');
		demo.createPathLink(box, [[-1000, 410, 600], [-800, 240, 500], [-550, 240, 500], [-550, 240, -315]], '#FE9A2E', 'power_line');
	},

	createPathLink: function(box, points, color, clientType){
		if(points && points.length>1){			
			color = color || 'white';
			for(var i=1;i<points.length;i++){
				var from=points[i-1];
				var to=points[i];
				
				var fromNode=new mono.Cube(0.001, 0.001, 0.001);
				fromNode.s({
					'm.color': color,
				})
				fromNode.setPosition(from[0], from[1], from[2]);
				fromNode.setClient('type', clientType);
				box.add(fromNode);

				var toNode=fromNode.clone();
				toNode.setPosition(to[0], to[1], to[2]);
				toNode.setClient('type', clientType);
				box.add(toNode);

				var link=new mono.Link(fromNode, toNode);
				link.s({
					'm.color': color,
				});
				link.setClient('type', clientType);
				box.add(link);
			}
		}
	},
}