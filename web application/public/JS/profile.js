let sendData= (val)=>{
	setInterval(()=>{
		val-=0.5;
		$.ajax({
			url: '/store_sensor_data',
			method: 'POST',
			data:{reading: val},
			success:(response)=>console.log(response)
		})
	},3000)
}
//sendData(20);