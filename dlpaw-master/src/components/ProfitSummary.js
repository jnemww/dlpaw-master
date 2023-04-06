import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';
import DataTable from './DataTable';
import ProfitSummaryChart from './ProfitSummaryChart';

const handsorttypes = ["Folded on PreFlop", "Folded on Flop", "Folded on Turn", "Folded on River", "Won without Showdown", "High Card", "Pair", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House", "Four of a Kind", "Straight Flush", "Royal Flush"];

export default function ProfitSummary({ gamedata, status, selectedseason, selectedgame, setQueryhanditems, leaguemembers }) {
    const [selectedplayer, setSelectedplayer] = useState();
    const [hands, setHands] = useState(gamedata);
    const [results, setResults] = useState();
    const [resultdetails, setResultdetails] = useState();
    const [playeritems, setPlayeritems] = useState();
    const [viewgraph, setViewgraph] = useState(true);

    useEffect(() => {
        if (gamedata === undefined) return;

        let src = Enumerable.from(gamedata.hands[0].seats)
            .select(x => ({ player: x.player, nickname: leaguemembers.find(r => r.mavens_login == x.player).nickname.toLowerCase() }))
            .orderBy(x => x.nickname)
            .toArray();

        let list = [];
        list.push(<option value="">Select Player</option>)
        src.forEach(s => {
            list.push(<option value={s.player}>{s.nickname}</option>)
        });
        setSelectedplayer("");
        setResultdetails(undefined);
        setResults(undefined);
        setPlayeritems(list);
        setHands(gamedata);
    }, [gamedata]);

    useEffect(() => {
        selectedplayer != "" &&
            selectedplayer &&
            GetProfitSummary();
    }, [selectedplayer]);//, hands

    function GetProfitSummary() {
        if (hands == null) return (<div>Please load a game and try again.</div>);
        if (selectedplayer == undefined || selectedplayer == "") return (<div>Please select a player and try again.</div>);

        status(true);

        let ps = Enumerable.from(hands.hands)
            .selectMany(h => Enumerable.from(h.streets).where(z => z.handequities != null), (h, s) => ({ handID: h.handID, street: s }))
            .groupBy(g => g.handID)
            .select(e => ({ handID: e.first().handID, name: e.first().street.name, street: e.last().street }))
            .selectMany(a => Enumerable.from(a.street.handequities), (h, s) => ({ handID: h.handID, name: h.name, s: s }))
            .toArray();

        let res = Enumerable.from(hands.hands)
            .where(c => Enumerable.from(c.summary.playerinfo).any(s => s.player == selectedplayer))
            .selectMany(p => Enumerable.from(p.summary.playerinfo), (h, pi) => ({ handID: h.handID, playerinfo: pi }))
            .select(np =>
            ({
                handID: np.handID,
                player: np.playerinfo.player,
                showdownhanddetails: np.playerinfo.showdownhanddetails,
                showdownhandtype: (Enumerable.from(ps).where(t => t.handID == np.handID && t.s.player == np.playerinfo.player && np.playerinfo.showdownhandtype == "Won without Showdown").count() > 0) ? (Enumerable.from(ps).where(t => t.handID == np.handID && t.s.player == np.playerinfo.player && np.playerinfo.showdownhandtype == "Won without Showdown").select(t => t.s.handrankdesc).first().toString()) : np.playerinfo.showdownhandtype,
                profit: np.playerinfo.profit,
                sort: handsorttypes.indexOf((Enumerable.from(ps).where(t => t.handID == np.handID && t.s.player == np.playerinfo.player && np.playerinfo.showdownhandtype == "Won without Showdown").count() > 0) ? (Enumerable.from(ps).where(t => t.handID == np.handID && t.s.player == np.playerinfo.player && np.playerinfo.showdownhandtype == "Won without Showdown").select(t => t.s.handrankdesc).first().toString()) : np.playerinfo.showdownhandtype)
            }))
            .where(p => p.player == selectedplayer)
            .toArray();

        setResultdetails(res);

        var r = Enumerable.from(res)
            .groupBy(l => l.showdownhandtype)
            .orderBy(r => r.first().sort)
            .select(cl =>
            ({
                HandType: cl.first().showdownhandtype,
                Count: cl.count(),
                Profit: cl.sum(c => c.profit)
            }))
            .toArray();

        setResults(r);
        status(false);
    }

    function GetProfitSummaryHandDetails(handtype) {
        if (hands == null) return (<div>Please load a game and try again.</div>);
        if (selectedplayer == null) return (<div>Please select a player and try again.</div>);

        status(true);

        let res = Enumerable.from(hands.hands)
            .where(c => Enumerable.from(resultdetails).any(h => h.handID == c.handID &&
                h.showdownhandtype == handtype))
            .toArray();

        if (res?.length > 0) {
            setQueryhanditems(res);
        }
        else {
            setQueryhanditems(null);
        }
        status(false);
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

    function ChangeView() {
        setViewgraph(!viewgraph);
    }

    return (
        <div>
            <table className='pokertableboard'>
                <tr>
                    <td>
                        <div>Click on hand type description in table or column in chart to drill into individual hands for the group.</div>
                        <select onChange={(e) => setSelectedplayer(e.target.value)} value={selectedplayer}>
                            {playeritems}
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div>
                            {!viewgraph &&
                                results &&
                                (
                                    <>
                                        <img className='chartthumbnail' src={"./images/chart2.png"} onClick={ChangeView} />
                                        <DataTable tbodyData={results}
                                            rowclasses={["datatablegrey", "datatablewhite"]}
                                            classes={["text", "numeric", "numeric"]}
                                            functions={[GetProfitSummaryHandDetails, ,]}
                                        />
                                    </>
                                )
                            }
                            {   viewgraph &&
                                results &&
                                (
                                    <>
                                        <img className='chartthumbnail' src={"./images/table.png"} onClick={ChangeView} />
                                        <ProfitSummaryChart
                                            leaguemembers={leaguemembers}
                                            selectedseason={selectedseason}
                                            selectedgame={selectedgame}
                                            selectedplayer={selectedplayer}
                                            gamedata={results} 
                                            onClickFunction={GetProfitSummaryHandDetails}
                                            />
                                    </>
                                )
                            }
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    )
}