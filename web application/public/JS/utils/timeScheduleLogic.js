let timeScheduleLogic=()=>{
    let state;
	$("#start").on('click',()=>{
		state=1;
		$("#start").addClass('startStyle');
		$("#stop").removeClass('stopStyle');
	});
	$("#stop").on('click',()=>{
		state=0;
		$("#stop").addClass('stopStyle');
		$("#start").removeClass('startStyle');
	});

	$("#hours").on('focus',()=>{
		$("#save_time_input").css({'background':'#1f1b24','color':'rgba(255,255,255,0.73'});	
	});
	$("#minutes").on('focus',()=>{
		$("#save_time_input").css({'background':'#1f1b24','color':'rgba(255,255,255,0.73'});	
	});

	$("#save_time_input").on('click',()=>{
		let hours=$("#hours").val();
		let minutes=$("#minutes").val();
		if(hours===""){
			hours=0;
		}
		if(minutes===""){
			minutes=0;
		}
		let control;
		if(state===1){
			$("#save_time_input").css({'background':'#fff','color':'#000'});
			control="start";
			sendTime(hours,minutes,control);
		}
		else if(state===0){
			$("#save_time_input").css({'background':'#fff','color':'#000'});
			control="stop";
			sendTime(hours,minutes,control);
		}
		else{
			alert("choose an action");
		}
		console.log(hours, minutes, control);
		function sendTime(hours,minutes,control){
			$.ajax({
				url: `/timer/${control}`,
				method: 'POST',
				data:{
					hours,
					minutes
				},
				success:(response)=>{
					console.log(response)
					if(response==="start" || response==="stop"){
						location.replace("/profile");
					}
				}
			  });//close ajax
		}
	});
}
timeScheduleLogic();
//export default timeScheduleLogic;