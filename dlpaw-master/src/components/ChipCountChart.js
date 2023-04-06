import Enumerable from 'linq';
import DataTable from './DataTable';
import React, { useEffect, useState } from 'react';
import { SCREEN, COLORS } from '../enums'
import LineChart from './charts/LineChart';

export default function ChipCountChart({ gamedata, status, leaguemembers, selectedseason, selectedgame, setScreen, setQueryhanditems }) {
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

        status(true);

        let cd = data;

        try {
            var ps = Enumerable.from(gamedata.hands)
                .selectMany(h => Enumerable.from(h.seats),
                    (h, s) => ({ handID: h.handID, player: s.player, chipstack: s.chipstack }))
                .toArray();

            let series = [];
            let i = 0;

            var l = Enumerable.from(ps)
                .groupBy(g => g.handID)
                .select(h => ({ handID: h.first().handID }))
                .toArray();
            cd.labels = l.map((data) => data.handID);

            leaguemembers.forEach(p => {
                let d = Enumerable.from(ps)
                    .where(r => r.player == p.mavens_login)
                    .toArray();
                let r = d.map((data) => data.chipstack);

                if (r.length) {
                    let s = {
                        label: (p.nickname),
                        data: (r),
                        backgroundColor: ["rgba(75,192,192,1)", "#ecf0f1", "#50AF95", "#f3ba2f", "#2a71d0"],
                        borderColor: (COLORS[i]),
                        borderWidth: 2
                    }
                    i += 1;
                    series.push(s);
                }
            });

            cd.datasets = series;
            setChartData(cd);
            status(false);
        }
        catch (err) {
            setError(err);
            return;
        };

        // (async () => {

        // })();
    }, [gamedata]);

    function NavigateToHand(handID) {
        //set queryhanditems and set screen to table
        console.log(`HandID returned is ${handID}`)
        let res = Enumerable.from(gamedata.hands)
            .where(h => h.handID == handID)
            .toArray();

        if (res?.length > 0) {
            setQueryhanditems(res);
            setScreen(SCREEN.Table);
        }
    }

    return (
        <>
            {
                selectedgame && 
                <table className='pokertableboard'>
                    <tr>
                        <td>
                            <div className="chart">
                                {chartData &&
                                    <LineChart chartData={chartData} 
                                        title={`Chip Count Progressions: ${selectedseason}${selectedgame}`} 
                                        OnClickFunction={NavigateToHand}
                                        showLegend={true} />
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

