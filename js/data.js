var dataJson={	
	objects: [{
		type: 'floor',
		width: 1600,
		depth: 1300,
	},{
		type: 'floor_cut',
		width: 200,
		height: 20,
		depth: 260,
		translate: [-348,0,530],
		rotate: [Math.PI/180*3, 0, 0],
	},{
		type: 'floor_box',
		width: 300,
		height: 50,
		depth: 100,
		translate: [350, 0, -500],	
	},{
		type: 'wall',
		height: 200,		
		translate: [-500, 0, -500],
		data:[[0, 0], [1000, 0], [1000, 500], [500, 500], [500, 1000], [0, 1000], [0,0]],
		children: [{
			type: 'window',
			translate: [200, 30, 500],
			width: 420,
			height: 150,
			depth: 50, 
		},{
			type: 'door',
			width: 205,
			height: 180,
			depth: 26,
			translate: [-350, 0, 500],
		}],
	},{
		type: 'plants',
		shadow: true,
		translates: [[560, 0, 400],[560, 0, 0],[60, 0, -100],[60, 0, -400],[-560, 0, 400],[-560, 0, 0],[-560, 0, -400]],
	},{
		type: 'plants',		
		scale: [0.5, 0.3, 0.5],
		shadow: false,
		translates: [[100, 27, 520],[300, 27, 520]],
	},{
		type: 'glass_wall',
		width: 1300,
		rotate: [0, Math.PI/180*90, 0],
		translate: [-790, 0, 0],
	},{
		type: 'glass_wall',
		width: 1300,
		rotate: [0, Math.PI/180*90, 0],
		translate: [790, 0, 0],	
	},{
		type: 'racks',		
		translates: [
			[-150, 0, 250],
			[-150-62, 0, 250],
			[-150-62-62, 0, 250],
			[-370, 0, -250],
			[-370+62, 0, -250],
			[-370+62+62, 0, -250],
			[-370+62+62+62, 0, -250],
			[150, 0, 250],
			[150+62, 0, 250],
			[150+62+62, 0, 250],
			[150+62+62+62, 0, 250],
			[150+62+62+62+62, 0, 250],
			[150-62, 0, 250],
			[150-62-62, 0, 250],			
		],
		labels: (function(){
			var labels=[];
			for(var k=0; k<14; k++){
				var label = '1A';
				if(k < 10){
 					label += '0';
				}
				labels.push(label + k);
			}
			return labels;
		})(),
		severities: [mono.AlarmSeverity.CRITICAL, null,null,mono.AlarmSeverity.WARNING,mono.AlarmSeverity.CRITICAL,null, mono.AlarmSeverity.MINOR, mono.AlarmSeverity.WARNING,mono.AlarmSeverity.WARNING,null,mono.AlarmSeverity.MINOR],
	},{
		type: 'tv',
		translate: [-130, 100, 513],	
	},{
		type: 'post',
		translate: [80, 110, 10],	
		width: 70,
		height: 120,
		pic: demo.getRes('post.jpg'),
	},{
		type: 'rail',
		data:[ [-180, 250], [-400, 250], [-400, -250], [400, -250]],
	},{
		type: 'connection',
		color: '#ED5A00',
		y: 265,
		flow: 0.05,
		data:[
			[-180, -100, -250],
			[-180, -100, -150],
			[-180, -50, -150],
			[-180, -50, -250],
			[-180, 0, -250],
			[-400, 0, -250],
			[-400, 0, 250],
			[400, 0, 250],
			[400, -50, 250],
			[400, -50, 350],
			[400, -100, 350],
			[400, -100, 250],
		],
	},{
		type: 'connection',
		color: '#21CD43',
		y: 265,
		flow: -0.05,
		data:[
			[-180+3, -100, -250],
			[-180+3, -100, -150],
			[-180+3, -50, -150],
			[-180+3, -50, -250+3],
			[-180+3, 0, -250+3],
			[-400+3, 0, -250+3],
			[-400+3, 0, 250-3],
			[400+3, 0, 250-3],
			[400+3, -50, 250-3],
			[400+3, -50, 350],
			[400+3, -100, 350],
			[400+3, -100, 250],
		],
	},{
		type: 'camera',
		translate: [80, 200, 30],
	},{
		type: 'camera',
		translate: [470, 200, 400],
		angle: 90,
	},{
		type: 'camera',
		translate: [-450, 200, -470],
		alarm: mono.AlarmSeverity.WARNING,
	},{
		type: 'extinguisher',
		translate: [-45, -470],
	},{
		type: 'extinguisher',
		translate: [-45, -450],		
		arrow: true,
	},{
		type: 'extinguisher',
		translate: [-45, -430],
	},{
		type: 'smoke',
		translate: [300, 180, 240],
		color: '#FAAC58',
	},{
		type: 'smoke',
		translate: [-300, 180, -240],
		color: '#B40431',
	},{
		type: 'water_cable',
		color: '#B45F04',
		y: 10,
		size: 3,
		data:[
			[50, 0, 50],
			[460, 0, 50],
			[460, 0, 450],
			[-460, 0, 450],
			[-460, 0, -450],
			[-100, 0, -450],
			[-50, 0, -400],
			[-50, 0, 0],
			[0, 0, 50],
			[50, 0, 50],
		],
		},{
		type: 'water_cable',
		color: '#04B431',
		y: 10,
		size: 3,
		data:[
			[-300, 0, 180],
			[440, 0, 180],
			[440, 0, 330],
			[-340, 0, 330],
			[-340, 0, -180],
			[-420, 0, -180],
			[-420, 0, -310],
			[-120, 0, -310],
			[-120, 0, -180],
			[-320, 0, -180],
		],
	},{
		type: 'laser',
		from: [-485, 330],
		to: [485, 330],
	},{
		type: 'laser',
		from: [-485, 0],
		to: [-20, 0],
	},{
		type: 'laser',
		from: [-80, 480],
		to: [-80, -480],
	}],
};