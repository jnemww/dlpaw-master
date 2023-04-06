import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';
import { SCREEN, COLORS } from '../enums'
import BarChart from './charts/BarChart';

export default function ProfitSummaryChart({ gamedata, selectedseason, selectedgame, selectedplayer, onClickFunction, leaguemembers }) {
    const [chartData, setChartData] = useState();
    const [error, setError] = useState();
    const data = {
        labels: [],
        datasets: []
    };

    useEffect(() => {
        setChartData(undefined);
    }, [selectedgame, selectedseason]);

    useEffect(() => {
        if (gamedata == undefined) return;

        //status(true);

        let cd = data;

        try {

            let series = [];
            let i = 0;

            let s = Enumerable.from(gamedata)
                .select(p => p.HandType)
                //.select(p => ({HandType: p.HandType}))
                .toArray();
            cd.labels = s.map((data) => data);//Array(s.length);//selectedplayer;//[""];//

            //s.forEach(p => {
                //let data = new Array(s.length).fill(0);
                let d = Enumerable.from(gamedata)
                    //.where(r => r.HandType == p)
                    .toArray();
                let r = d.map((data) => data.Profit);

                //data[i] = d[0].Profit;

                if (d.length) {
                    let sx = {
                        label: (selectedplayer),
                        data: (r),
                        backgroundColor: COLORS,
                        borderColor: ["black"],
                        borderWidth: 2
                    }
                    i += 1;
                    series.push(sx);
                }
            //});

            cd.datasets = series;
            setChartData(cd);
            //status(false);
        }
        catch (err) {
            setError(err);
            return;
        };

        // (async () => {

        // })();
    }, [gamedata]);

    return (
        <>
            {
                selectedgame &&
                <table className='pokertableboard'>
                    <tr>
                        <td>
                            <div className="chart">
                                {chartData &&
                                    <BarChart
                                        chartData={chartData}
                                        // showLegend={true}
                                        OnClickFunction={onClickFunction}
                                        title={`Profit Summary for : ${selectedplayer}, ${selectedseason}${selectedgame}`} />
                                }
                                {/* <PieChart chartData={chartData} /> */}
                                {error &&
                                    <div>Error: {error}</div>
                                }
                            </div>
                        </td>
                    </tr>
                </table>
            }
        </>

    );
}
