import React, {useRef} from "react";
import { Line, getElementsAtEvent } from "react-chartjs-2";
import Chart from "chart.js/auto";
// import { Chart as ChartJS, Tooltip, CategoryScale } from "chart.js";
// ChartJS.register(Tooltip, CategoryScale);

function LineChart({ chartData, title, showLegend = false, OnClickFunction }) {
  const chartRef = useRef();
  const onClick = (event) => {
    let e = getElementsAtEvent(chartRef.current, event);
    if(e.length != 0){
      const dsIdxNum = e[0].datasetIndex;
      const dataPt = e[0].index;
      console.log(e, dsIdxNum, dataPt, "label:", chartData.labels[dataPt]);
      if(OnClickFunction) OnClickFunction(chartData.labels[dataPt]);
    }  
  }

  //   const data = {
  //   labels: ["P1","P2","P3"],
  //   datasets: [{
  //     label:"Test",
  //     data: [16, 10, 5],
  //     borderColor: "black",
  //     backgroundColor: ["aqua","red", "green"],
  //     borderWidth: 1
  //   },
  //   {
  //     label:"Test",
  //     data: [16, 10, 5],
  //     borderColor: "black",
  //     backgroundColor: ["aqua","red", "green"],
  //     borderWidth: 1
  //   }]
  // };

  return (
    <div className="chart-container">
      {/* <h2 style={{ textAlign: "center" }}>Line Chart</h2> */}
      <Line
        data={chartData}
        //data={data}
        options={{
          plugins: {
            title: {
              display: true,
              text: (title)
            },
            legend: {
              display: (showLegend)
            }
          }
        }}
        onClick={onClick}
        ref = {chartRef}
      />
    </div>
  );
}
export default LineChart;