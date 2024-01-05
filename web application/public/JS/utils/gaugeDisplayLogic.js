let gaugeLogic=()=>{
    let userdata= (callback)=>{
		let field;
		$.ajax({
			url: '/userdata',
			method: 'POST',
			success:(response)=>{
				"use strict";
				field=response;
				console.log(field);
				callback(field.total_tank_dimension*0.001);
			}
		});
	}
	userdata((tank_max_volume)=>{
		//setInterval(function(){ ///removed per-second query due to excessive data consumption
			$.ajax({
				url:"/fuel_volume/getValue",
				method: 'POST',
				success: function(response){
					let volume=response.readings;
					console.log(volume,tank_max_volume,tank_max_volume-volume);
					displayVolume(volume,tank_max_volume);
				}
			})
		//},1000)
	});
	function displayVolume(volume,max_volume){
		//console.log(volume, max_volume);
		volume=12.5;
		max_volume=15;
		var gauge = new RadialGauge({
			renderTo: document.querySelector('#gauge'),
			units: "Litre",
			title: "Fuel Volume",
			value: max_volume-volume,
			minValue: 0.08,
			maxValue: max_volume,
			majorTicks: [
				0,
				Math.ceil(max_volume/5),
				Math.ceil(max_volume/5*2),
				Math.ceil(max_volume/5*3),
				Math.ceil(max_volume/5*4),
				Math.ceil(max_volume)
			],
			minorTicks: 2,
			strokeTicks: true,
			highlights: [
				{
					"from": 0,
					"to": Math.ceil(max_volume/5),
					"color": "rgba(255,0,0, .6)"
				},
				{
					"from": Math.ceil(max_volume/5),
					"to": Math.ceil(max_volume),
					"color": "rgba(0, 255, 0, .6)"
				}
			],
			ticksAngle: 225,
			startAngle: 67.5,
			colorMajorTicks: "#ffffffba",
			colorMinorTicks: "#ffffffba",
			colorTitle: "#ffffffba",
			fontTitleSize:"25",
			fontTitleWeight:"bold",
			colorUnits: "#ccc",
			fontUnitsSize: "23",
			fontUnitsWeight:"bold",
			colorNumbers: "#ffffffba",
			fontWeight:"bold",
			fontNumbersSize:"25",
			colorPlate: "#1F1B24",
			borderShadowWidth: 0,
			borders: false,
			needleType: "arrow",
			needleWidth: 2,
			needleCircleSize: 7,
			needleCircleOuter: true,
			needleCircleInner: false,
			animationDuration: 1500,
			animationRule: "linear",
			colorBorderOuter: "#333",
			colorBorderOuterEnd: "#111",
			colorBorderMiddle: "#222",
			colorBorderMiddleEnd: "#111",
			colorBorderInner: "#111",
			colorBorderInnerEnd: "#333",
			colorNeedleShadowDown: "#333",
			colorNeedleCircleOuter: "#333",
			colorNeedleCircleOuterEnd: "#111",
			colorNeedleCircleInner: "#111",
			colorNeedleCircleInnerEnd: "#222",
			valueBox:true,
			valueBoxBorderRadius: 10,
			colorValueBoxRect: "#222",
			colorValueBoxRectEnd: "#333"
		}).draw();
		
	}
}
gaugeLogic();
///export default gaugeLogic;