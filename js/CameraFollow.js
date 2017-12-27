var CameraFollow = function (camera) {
    
    this.setHost = function(hostNode){
        if(camera._hostNode){
        	  camera._hostNode.removePropertyChangeListener(follow);
    	  }
    		camera._hostNode = hostNode;
    		hostNode.addPropertyChangeListener(function(e){
    	       follow(e,hostNode);
    		});
    };

	function follow(e,node){
       var property = e.property;
       if(property.startsWith('position') || property.startsWith('rotation')){
     	   	var pos = node.p();
     	   	var distance = camera.getDistance();
     	   	var pos2 = node.worldPosition(new mono.Vec3(-2,1,0),distance);			
		      camera.lookAt(pos);
		      camera.setPosition(pos2);
       }
	};
}