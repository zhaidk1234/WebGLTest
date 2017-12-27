Tooltip = function(keys, values) {
    this.mainContent = document.createElement('div');
    this.keys = keys;
    this.values = values;
    this.init();
}

jxdgl.Util.ext('Tooltip', Object, {
	init: function(){
		this.mainContent.setAttribute('class', 'tooltip');
		this.mainContent.setAttribute('id', 'tooltip');
		this.table = document.createElement('table');
		for(var i = 0; i < this.keys.length; i++){
			var tr = document.createElement('tr');
			var tdKey = document.createElement('td');
			tdKey.setAttribute('class', 'tooltip-key');
			tdKey.innerHTML = this.keys[i];
			tr.appendChild(tdKey);

			var tdValue = document.createElement('td');
			tdValue.setAttribute('class', 'tooltip-value');
			tdValue.innerHTML = this.values[i];
			tr.appendChild(tdValue);
			this.table.appendChild(tr);
		}
		this.mainContent.appendChild(this.table);
	},
	getView: function(){
		return this.mainContent;
	},
	setValues: function(values){
		this.values = values;
		var children = this.table.childNodes;
		for(var i = 0; i < this.values.length; i++){
			var value = this.values[i];
			var childGroup = children[i];
			childGroup.lastChild.innerHTML = value;
		}
	}
});
