let barChartLogic= ()=>{
    let myChart;
    function plotBarChart(sensor_data){
        const labels =["january", "february", "march", "april", "may", "june", "july", "august", "september", "october",
        "november", "december"];
        //const labels = Utils.months({count: 12});
        const data = {
        labels: labels,
        datasets: [{
            label: 'Generator fuel per-month usage',
            data: sensor_data,
            backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
            'rgba(255, 99, 132)',
            'rgba(255, 159, 64)',
            'rgba(255, 205, 86)',
            'rgba(75, 192, 192)',
            'rgba(54, 162, 235)',
            'rgba(153, 102, 255)',
            'rgba(201, 203, 207)',
            'rgba(163, 22, 203)',
            'rgba(41, 20, 27)',
            'rgba(153, 12, 25)',
            'rgba(21, 203, 20)',
            'rgba(15, 102, 255)'
            ],
            borderWidth: 0 
        }]
        };
        const config = {
            type: 'bar',
            data: data,
            options: {
              maintainAspectRatio: false,
              responsive: true,
              scales: {     
                y: {
                  beginAtZero: true
                }
              }
            },
        };
        myChart = new Chart(
            document.getElementById('myChart'),
            config
        );
    }
    let getData=(year)=>{
        $.ajax({
            url: '/sensor_reading',
            method: 'POST',
            data:{year},
            success:(response)=>{
                console.log(response);
                let data=[0,15,40,84,0,0,0,0,0,0,0,0];
                let months=["january", "february", "march", "april", "may", "june", "july", "august", "september", "october",
                "november", "december"];
                // months.forEach((month,index)=>{
                //     response.forEach(obj=>{
                //         if(obj.month==month){
                //             data.push(obj.value);
                //         }
                //     });
                // });
                console.log(data);
                plotBarChart(data);
            }
        });
    }
    let year= $("#plot-year").val();
    getData(year);
    
    const selectElement = document.getElementById('plot-year');
    selectElement.addEventListener('change',(e)=>{
        myChart &&  myChart.destroy();
        let plot_year= e.target.value;
        getData(plot_year);
    })
}
barChartLogic();
//export default barChartLogic;