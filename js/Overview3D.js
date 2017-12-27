

TGL.Overview3D = function  (network3d,parameters) {
   TGL.Network3D.call(this,network3d.getDataBox());
   this.network3d = network3d;

   this.adjustBounds(200,200);
   var rootView = this.getRootView();
   network3d.getRootView().appendChild(rootView);
   this.setInteractions([]);

   rootView.addEventListener('mousemove',function(e){
     e.stop = true;
   });

   rootView.addEventListener('mousewheel',function(e){
     e.stop = true;
   });

   this.zoomEstimateOverview();
   
   var camera = this.getCamera();
   camera.p(new mono.Vec3(0,camera.getDistance() * 1.2,0.1));
   camera.lookAt(new mono.Vec3(0,0,0));

   rootView.addEventListener('dblclick',handleDoubleClick);
   var self = this;
   function handleDoubleClick(e){
   	 event.stopPropagation();
     var element = self.getFirstElementByMouseEvent(e, false);
     self.animateCamera(network3d.getCamera(),network3d.getDefaultInteraction(),network3d.getCamera().t(),element.point);
   }
};

TGL.extend(TGL.Overview3D,TGL.Network3D,{
   
   destory : function(){

   },

   adjustBounds : function(w,h){
     TGL.Network3D.prototype.adjustBounds.call(this,w,h);
     var rootView = this.getRootView();
     rootView.style.position = "absolute";
     rootView.style.right = "10px";
     rootView.style.bottom = "10px";
   },

   animateCamera: function(camera, interaction, oldPoint, newPoint, onDone){		
		var offset=camera.getPosition().sub(camera.getTarget());
		var animation=new mono.Animate({
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
});