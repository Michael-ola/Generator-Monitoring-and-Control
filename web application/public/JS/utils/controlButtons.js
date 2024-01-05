let on_off_button_logic=()=>{
    let checkState=(callback)=>{
		$.ajax({
			url:"/check_state",
			method:"GET",
			success:(response)=>{
				callback(response);
			}
		})
    }
    
    let start= ()=>{
        $.ajax({
            url: '/ONit',
            method: 'POST',
            data:{
                state:"ON"
            },
            success:(response)=>console.log(response)
        });//close ajax
    }
    
    let stop= ()=>{
        $.ajax({
            url: '/OFFit',
            method: 'POST',
            data:{
                state:"OFF"
            },
            success:(response)=>console.log(response)
        });//close ajax
    }

    $("#ON").on('click',()=>{
        $('#ON').addClass('onStyle');
        $("#OFF").removeClass('offStyle');
        start();
    });
    
    $("#OFF").on('click',()=>{
        $('#OFF').addClass('offStyle');
        $("#ON").removeClass('onStyle');
        stop();
    });
    
    window.addEventListener('load',()=>{
        console.log('listening');
        checkState((state)=>{
            console.log(state);
            if(state=="ON"){
                $("#ON").addClass('onStyle');
                $("#OFF").removeClass('offStyle');
            }
            else if(state=="OFF"){
                $("#OFF").addClass('offStyle');
                $("#ON").removeClass('onStyle');
            }
        })
    });
}
on_off_button_logic();
//export default on_off_button_logic;