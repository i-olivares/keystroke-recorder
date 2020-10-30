document.getElementById("email").addEventListener("keydown",keyDownMail);
document.getElementById("email").addEventListener("keyup",keyUpMail);
document.getElementById("password").addEventListener("keydown",keyDownPswd);
document.getElementById("password").addEventListener("keyup",keyUpPswd);


function keyStroke(key,keydown,keyup,code,ctrl,alt,shift,caps){
	this.key=key;
	this.keydown=keydown;
	this.keyup=keyup;
	this.code=code;
	this.ctrl="false";
	this.alt="false";
	this.shift="false";
	this.caps="nal";
}

var mail = new Array();
var password = new Array();

function keyDownMail(e){
	e = (e) ? e : window.event;
	keyDown(e,mail)
}
function keyUpMail(e){
	e = (e) ? e : window.event;
	keyUp(e,mail)
}

function keyDownPswd(e){
	e = (e) ? e : window.event;
	keyDown(e,password)
}
function keyUpPswd(e){
	e = (e) ? e : window.event;
	keyUp(e,password)
}


function keyDown(e,arr){
	var key = new keyStroke();
	key.keydown = Date.now();
	key.code=e.code;
	key.key=e.key;
	if(e.ctrlKey){
		key.ctrl="true";
	}
	if(e.altKey){
		key.ctrl="true";
	}
	if(e.shiftKey){
		key.shift="true";
	}
	if(e.key.length == 1 && /^[0-9]+$/.test(e.key)){
		key.caps="number";
	}
	if(e.key.length == 1 && /^[a-z]+$/.test(e.key)){
		key.caps="false";
	}
	if(e.key.length == 1 &&/^[A-Z]+$/.test(e.key)){
		key.caps="true";
	}
	arr.push(key);

	//console.log("new key created. Keycode: "+key.code+", key: "+key.key+", down: "+key.keydown+", up:"+key.keydown);
}



function keyUp(e,arr){
	t = Date.now();
	for (var i=0;i<arr.length;i++){
		if(arr[arr.length-1-i].code == e.code){
			arr[arr.length-1-i].keyup=t;
			arr.splice(arr.length-1-i,1,arr[arr.length-1-i])
			//console.log(i+", keyup updated. Keycode: "+e.code+", keyup:"+arr[arr.length-1-i].keyup);
			break;
		}
	}
}

function outputData(){
	var mailRecord = JSON.stringify(mail);
	var pswdRecord = JSON.stringify(password);
	document.getElementById('emailpattern').value = mailRecord;
	document.getElementById('passwordpattern').value = pswdRecord;

	var textFile = null,
	makeTextFile = function (text) {
	    var data = new Blob([text], {type: 'text/plain'});
	    if (textFile !== null) {
	      window.URL.revokeObjectURL(textFile);
	    }
	    textFile = window.URL.createObjectURL(data);
	    return textFile;
	  };

	 var link = document.getElementById('downloadlink');
	 link.href = makeTextFile('Email pattern:\n' + mailRecord + '\nPassword pattern: \n' + pswdRecord);
	 link.style.display = 'block';

	 draw()

}

function draw(){
	var margin = { top: 10, right: 50, bottom: 50, left: 70 }
	var h = 400 - margin.top - margin.bottom  // altura de la gráfica
	var w = 1200 - margin.left - margin.right
	var svg = d3.select('#graph').append('svg')
									.attr('height',h + margin.top + margin.bottom)
									.attr('width',w + margin.left + margin.right)
								.append('g')
									.attr('transform','translate(' + margin.left + ',' + margin.top + ')')


	var xScale = d3.scaleLinear()
										.domain([d3.min(mail,function (d) { return d.keydown }),
											d3.max(mail,function (d) { return d.keyup })
											]).range([0,w])


	var yScale = d3.scaleBand().domain(['AltGraph','CapsLock','Control','Alt','Shift','keys']).range([h-margin.top,margin.bottom]);

	// Creamos los ejes x e y haciendo uso de las escalas que hemos creado
	var xAxis = d3.axisBottom(xScale);
	var yAxis = d3.axisLeft(yScale);

	// X-axis. Lo añadimos a nuestro elemento "g"
	svg.append('g').attr('class','axis')
									.attr('transform', 'translate(0,' + h + ')')
									.call(xAxis)

	svg.append('g').attr('class', 'axis')
									.attr("transform", 'translate(0,' + (- h/15) + ')')
									.call(yAxis)

var dominio = [d3.min(mail,function (d) { return d.keydown }),
	d3.max(mail,function (d) { return d.keyup })];


svg.selectAll("rect").data(mail)
										.enter()
										.append("rect")
	                  .style("fill", function(d,i) {
											if (d.key == " "){
												return "Lightgrey"
											}else if (d.key == "Backspace") {
												return "FireBrick"
											}else{
		        					return "teal"
											}
		        			   })
										.style("stroke","black")
										.attr("x", d => xScale(d.keydown))
										.attr("y", d => {
											switch (d.key){
												case 'AltGraph':
														return yScale('AltGraph');
												case 'CapsLock':
														return yScale('CapsLock');
												case 'Control':
														return yScale('Control');
												case 'Alt':
														return yScale('Alt');
												case 'Shift':
														return yScale('Shift');
												default:
														return yScale('keys');
											}
											})
										.attr("height", h/40)
										.attr("width", function(d) {
											var barLength = (d.keyup - d.keydown)*w/(dominio[1]-dominio[0]);
											return barLength + "px";
										}).on('mouseover', function () { // Se agranda el círculo al pasar el ratón
		                  d3.select(this)
		                    .transition()
		                    .duration(100)
												.attr('height',h/20)
		                    .attr('width',function(d) {
													var barLength = (d.keyup - d.keydown)*w/(dominio[1]-dominio[0]);
													return barLength + "px";
												})
		                })
		                .on('mouseout', function () {// vuelve a su tamaño inicial
		                  d3.select(this)
		                    .transition()
		                    .duration(50)
		                    .attr('height',h/40)
		                    .attr('width',function(d) {
													var barLength = (d.keyup - d.keydown)*w/(dominio[1]-dominio[0]);
													return barLength + "px";
												})
		                })
		              .append('title') // cuando se posa el ratón, además, se muestran los datos de dicho punto
		                .text(function (d) { return ('Key: ' + d.key +
		                                     '\nKeyDown: ' + d.keydown +
																			 		'\nKeyUp: ' + d.keyup) });

svg.selectAll("text.bar").data(mail)
				       			.enter()
										.append("text")
										.attr("class", "bar")
				       			.text(function(d) {
				       			   		return d.key;
				       			})
				       			.attr("text-anchor", "right")
										.attr("x", d => (xScale(d.keydown)+5))
										.attr("y", d => {
											switch (d.key){
												case 'AltGraph':
														return (yScale('AltGraph')-5);
												case 'CapsLock':
														return (yScale('CapsLock')-5);
												case 'Control':
														return (yScale('Control')-5);
												case 'Alt':
														return (yScale('Alt')-5);
												case 'Shift':
														return (yScale('Shift')-5);
												default:
														return (yScale('keys')-5);
											}
											}).attr("font-family", "sans-serif")
											.attr("font-size", "12px")
											.attr("fill", "black");

}
