import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';
import { SCREEN, COLORS } from '../enums'
import BarChart from './charts/BarChart';

export default function PlayFrequenciesChart({ gamedata, selectedseason, selectedgame, leaguemembers }) {
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
            let ps = Enumerable.from(gamedata)
                .select(h => ({ key: h.Player + h.Street, Player: h.Player, Street: h.Street, Pct: h["%"] }))
                .toArray();

            let series = [];
            let i = 0;

            let p = Enumerable.from(ps)
                .groupBy(z => z.Player)
                .select(p => ({ Player: p.first().Player }))
                .toArray();
            cd.labels = p.map((data) => data.Player);

            let s = Enumerable.from(ps)
                .groupBy(z => z.Street)
                .select(p => p.first().Street)
                //.select(p => ({ Street: p.first().Street }))
                .toArray();

            s.forEach(p => {
                let d = Enumerable.from(ps)
                    .where(r => r.Street == p)
                    .toArray();
                let r = d.map((data) => data.Pct);
                //let r = [p.Pct];

                if (r.length) {
                    let sx = {
                        label: (p),
                        data: (r),
                        backgroundColor: COLORS,
                        borderColor: COLORS,
                        borderWidth: 2
                    }
                    i += 1;
                    series.push(sx);
                }
            });

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
                                        title={`Play Frequencies: ${selectedseason}${selectedgame}`} />
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
