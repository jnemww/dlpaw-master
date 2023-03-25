import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';
import DataTable from './DataTable';
const handsorttypes = ["Folded on PreFlop", "Folded on Flop", "Folded on Turn", "Folded on River", "Won without Showdown", "High Card", "Pair", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House", "Four of a Kind", "Straight Flush", "Royal Flush"];

export default function ProfitSummary({ gamedata, status, setQueryhanditems }) {
    const [selectedplayer, setSelectedplayer] = useState();
    const [hands, setHands] = useState(gamedata);
    const [results, setResults] = useState();
    const [playeritems, setPlayeritems] = useState();

    useEffect(() => {
        if (gamedata === undefined) return;
        let list = [];
        list.push(<option value="">Select Player</option>)
        Enumerable.from(gamedata.hands[0].seats)
            .orderBy(x => x.player.toLowerCase())
            .select(x => x.player)
            .toArray()
            .forEach(s => {
                list.push(<option value={s}>{s}</option>)
            });
        setPlayeritems(list);
        setHands(gamedata);
    }, []);

    useEffect(() => {
        GetProfitSummary();
    }, [selectedplayer]);//, hands

    // useEffect(()=>{
    //     //setHands(gamedata);
    //     //setQueryhanditems(undefined);
    // },[gamedata]);

    function GetProfitSummary() {
        if (hands == null) return (<div>Please load a game and try again.</div>);
        if (selectedplayer == null) return (<div>Please select a player and try again.</div>);

        status(true);

        let r = Enumerable.from(hands.hands)
            .where(c => Enumerable.from(c.summary.playerinfo).any(s => s.player == selectedplayer))
            .selectMany(p => Enumerable.from(p.summary.playerinfo))
            .select(np =>
            ({
                player: np.player,
                showdownhanddetails: np.showdownhanddetails,
                showdownhandtype: np.showdownhandtype,
                profit: np.profit,
                sort: handsorttypes.indexOf(np.showdownhandtype)
            })
            )
            .where(p => p.player == selectedplayer)
            .groupBy(l => l.showdownhandtype)
            .orderBy(r => r.first().sort)
            .select(cl =>
            ({
                HandType: cl.first().showdownhandtype,
                //HandTypeDetails : cl.first().showdownhanddetails,
                Count: cl.count(),
                Profit: cl.sum(c => c.profit).toLocaleString()
            })
            )
            .toArray();

        setResults(r);
        status(false);
    }

    function GetProfitSummaryHandDetails(handtype) {
        if (hands == null) return (<div>Please load a game and try again.</div>);
        if (selectedplayer == null) return (<div>Please select a player and try again.</div>);

        //status(true);

        let res = Enumerable.from(hands.hands)
            .where(c => Enumerable.from(c.summary.playerinfo)
                .any(s => s.player == selectedplayer
                    && s.showdownhandtype == handtype))
            .toArray();

        if (res?.length > 0) {
            setQueryhanditems(res);
            //setResults(res);
        }
        else {
            //setResults(undefined);
            setQueryhanditems(null);
        }
    }

    function FormatOutput() {
        let list = [];
        for (let i = 0; i < results.Count; i++) {
            list.push(
                <div>
                    {results[i].HandType}
                    {results[i].Count}
                    {results[i].Profit}
                </div>);
        }
        return list;
    }

    /*
    details
    resultdetails = m_hands.Where(c => c.summary.playerinfo.Any(s => s.player == lvwplayer.SelectedItem.ToString() && s.showdownhandtype == ps.HandType)).ToList()
    resultdetails = m_hands.where(c => c.summary.playerinfo.Any(s => s.player == lvwplayer.SelectedItem.ToString() 
        && s.showdownhandtype == ps.HandType)).ToList()

    */

    return (
        <div>
            <table className='pokertableboard'>
                <tr>
                    <td>
                        <div>Click on hand type description to drill into individual hands for the group.</div>
                        <select onChange={(e) => setSelectedplayer(e.target.value)}>
                            {playeritems}
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div>
                            {results &&
                                <DataTable tbodyData={results}
                                    rowclasses={["datatablegrey", "datatablewhite"]}
                                    classes={["text", "numeric", "numeric"]}
                                    functions={[GetProfitSummaryHandDetails, ,]}
                                />
                            }
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    )
}