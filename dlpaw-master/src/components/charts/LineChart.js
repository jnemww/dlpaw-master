import React, {useRef} from "react";
import { Line, getElementsAtEvent } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip } from "chart.js";
ChartJS.register(Tooltip);

function LineChart({ chartData, title, OnClickFunction }) {
  const chartRef = useRef();
  const onClick = (event) => {
    let e = getElementsAtEvent(chartRef.current, event);
    if(e.length != 0){
      const dsIdxNum = e[0].datasetIndex;
      const dataPt = e[0].index;
      console.log(e, dsIdxNum, dataPt, "label:", chartData.labels[dataPt]);
      OnClickFunction(chartData.labels[dataPt]);
    }
      
    
  }

  return (
    <div className="chart-container">
      {/* <h2 style={{ textAlign: "center" }}>Line Chart</h2> */}
      <Line
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: (title)
            },
            legend: {
              display: true
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