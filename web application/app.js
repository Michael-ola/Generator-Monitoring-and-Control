const express= require("express"),
request= require("request"),
db  =require("mysql"),
bodyparser  =require("body-parser");

const	app=express();

app.use(express.static("public"));//grant express access into public folder for effective styling
app.set("view engine","ejs");//to let express expect .ejs extension for files rendered
app.use(bodyparser.urlencoded({extended:true}));
//----------------------------------------------------------------------------------------------------

let generatorState='OFF';
let fuelVolume=0;
let generatorTankDimension=0;
let generatorMaxVolume=0;
//************************connect to mysql database******************************\\
// let con= db.createPool({
// 		host:"us-cdbr-east-05.cleardb.net",
// 		user:"bf7f29dae5027d",
// 		password:"f7085366",
// 		database:"heroku_14e144b2fe73da0"
// 	});
	
   let con= db.createConnection({
    host:"localhost",
     user:"root",
     password:"",
     database:"generator"
   });
   
   con.connect(function(err){
       if (err) {
           throw err;
       }
       console.log("connected!");
   });

//************************connect to mysql database******************************\\


app.get("/",(req,res)=>{
	//res.render("homepage");
	res.render("profile_page");
});

app.get("/register",(req,res)=>{
	res.render("reg_page");
});

app.get("/login",(req,res)=>{
	res.render("login_page");
});

app.get("/profile",(req,res)=>{
	let date = new Date();
	let year=[];
	let beginning_year=2022;
	for(let i=beginning_year; i<= date.getFullYear(); i++){
		year.push(i);
	}
	console.log(year);
	con.query("select * from generator_states",(err,response)=>{
		"use-strict";
		if (err) throw err;
		console.log(response[0]);
		generatorTankDimension=response[0].flat_dimension;
		generatorMaxVolume=response[0].total_tank_dimension;
		res.render("profile",{year,user_data:response[0]});
	})
});

app.post("/ONit",(req,res)=>{
	//UPDATE DATABASE STATE TO 1
	console.log(req.body);
	if(generatorState==='OFF'){
		if(req.body.state==="ON"){
			const query="update `generator_states` set `State`='ON'";
			con.query(query,(err)=>{
				if(err)
				   throw err;
				generatorState='ON'
				res.send("turned ON");
			});
		}
	}
});

app.post("/OFFit",(req,res)=>{
	//UPDATE DATABASE STATE TO 0
	console.log(req.body)
	if(generatorState==='ON'){
		if(req.body.state==="OFF"){
			const query="update `generator_states` set `State`='OFF'";
			con.query(query,(err)=>{
				if(err)
				   throw err;
				generatorState='OFF'
				res.send("turned OFF");
			});
		}
	}
});

app.post("/turnOn",(req,res)=>{
	if(generatorState==='OFF'){
		//UPDATE DATABASE STATE TO 1
		const query="update `generator_states` set `State`='ON'";
		con.query(query,(err)=>{
			if(err)
				throw err;
			generatorState='ON'
			res.send("ON");
		});
	}
});

app.post("/turnOff",(req,res)=>{
	if(generatorState==='ON'){
		//UPDATE DATABASE STATE TO 0
		const query="update `generator_states` set `State`='OFF'";
		con.query(query,(err)=>{
			if(err)
				throw err;
			generatorState='OFF'
			res.send("OFF");
		});
	}
});

app.get("/check_state",(req,res)=>{
	// const query="SELECT `State` FROM `generator_states`";
	// con.query(query, function(err,result){
	// 	if (err){throw err}
	// 	res.send(result[0].State);
	// });   
	res.send(generatorState);	
})


app.post("/timer/:action",(req,res)=>{
	let client_hour= parseInt(req.body.hours);
	let client_minute= parseInt(req.body.minutes);
	let control= req.params.action;
	let client_time=(client_hour*60)+client_minute;
	console.log(client_time);

	function update(target,input,callback) {
		con.query(`update generator_states set ${target}=${input}`,(err,response)=>{
			if(err) throw err
			else{
				console.log("done");
				callback();
			}
		});
	}
	
	if(control=="start"){
		update('start_time',client_time,()=>{
			compareTime("start_time",()=>{
				generatorState='ON';
				update('State','\'ON\'',()=>update('start_time',0,()=>console.log("updated")));
			});
		});
	}
	else if(control=="stop"){
		update('stop_time',client_time,()=>{
			compareTime("stop_time",()=>{
				generatorState='OFF';
				update('State','\'OFF\'',()=>update('stop_time',0,()=>console.log("updated")));
			});
		});
	}

	function compareTime(target,callback){
		const _date= new Date();
		const init_hour= _date.getHours(), init_minute= _date.getMinutes();
		let dbResponse;
		con.query(`select ${target} from generator_states`,(err,response)=>{
			if(err) throw err
			else{
				dbResponse=response;
			}
		});

		let handle=setInterval(() => {
			let date = new Date();
			let server_time = (date.getHours() - init_hour) * 60 + (date.getMinutes() - init_minute);
			if (dbResponse) {
				let [holder] = dbResponse;
				console.log(server_time);
				if (server_time >= holder[target]) {
					res.send(control);
					console.log("TIME_ELAPSED");
					callback();
					clearInterval(handle);
				}
				else {
					console.log("not time");
				}
			}
		}, 1000);
	}
});


app.post("/store_sensor_data",(req,res)=>{
	let reading=fuelVolume;
	if(generatorMaxVolume*0.001 - reading > 0){
		let date= new Date();
		let fdate=`${date.toLocaleDateString('en-US',{month:'long'}).toLowerCase()}-${date.getFullYear()}`;
		console.log(reading);

		con.query("select flat_dimension from generator_states",(err,response)=>{
			if (err) throw err;
			const dimension=response[0].flat_dimension;
			console.log(dimension);
			let query =`insert into sensor_data(readings,date) values('${generatorMaxVolume*0.001 - reading}','${fdate}')`;
			con.query(query,(err, response)=>{
				if(err)
					throw err;
				res.send("recorded");
			});
		})
	}
});

app.post('/userdata',(req,res)=>{
	con.query("select * from generator_states",(err, response)=>{
		if (err) throw err;
		res.send(response[0]);
	})
});

app.post("/sensor_reading",(req,res)=>{ 
	const month=["january", "february", "march", "april", "may", "june", "july", "august", "september", "october",
	"november", "december"];
	let data = [];
	month.forEach((month,index)=>{
		let year=req.body.year;
		
		let queryDB= async ()=>{
			return new Promise((resolve, reject)=>{
				let query =`select readings from sensor_data where date ='${month}-${year}'`;
				con.query(query,(err, response)=>{
					if(err){
						throw err;
					}
					resolve(response);
				});
			});
		}
		let calling_function= async ()=>{
			let month_readings= await queryDB();
			obtainDataSet(month, month_readings, data);
			if(index==11){
				console.log(data);
				res.send(data);
			}
		}
		calling_function();
	});


})

app.post('/fuel_volume/:param',(req,res)=>{
	if(req.params.param==='getValue'){
		if(fuelVolume===0){
			res.send({readings:generatorMaxVolume*0.001});
		}
		res.send({readings:fuelVolume});
	}

	else{
		fuelVolume=req.params.param * generatorTankDimension * 0.001;
		res.send("sent");
	}
});

function obtainDataSet(month, response,_data=[]){
	let total=0;
	if(response.length>0){
		for(let i=1; i<response.length; i++){
			if(response[i].readings < response[i-1].readings){
				total+=(response[i-1].readings-response[i].readings);
			}
		}
		//_data.push(parseFloat(total.toFixed(2)));
		_data.push({
			month,
			value: parseFloat(total.toFixed(2))
		});
	}
	else{
		//_data.push(parseFloat(0));
		_data.push({
			month,
			value: 0
		});
	}
}
//------------------------------------------------------------------------------------------------------



//app.listen(process.env.PORT,process.env.IP,function(){
app.listen(3000,"0.0.0.0",function(){
       console.log("server has started");
});



