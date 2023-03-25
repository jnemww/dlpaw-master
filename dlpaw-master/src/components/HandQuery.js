import Enumerable from 'linq';
import DataTable from './DataTable';
import { isObjectEmpty } from '../HelperFunctions';
import React, { useEffect, useState } from 'react';

export default function HandQuery({ gamedata, setQueryhanditems }) {
    const [hands, setHands] = useState(gamedata?.hands);
    const [playeritems, setPlayeritems] = useState();
    const [selectedplayer, setSelectedplayer] = useState();
    const [selectedcard1, setSelectedcard1] = useState();
    const [selectedcard2, setSelectedcard2] = useState();
    const [potsize, setPotsize] = useState("Enter min pot size");
    const [results, setResults] = useState();

    useEffect(() => {
        let list = [];
        list.push(<option value="">Select Player</option>)
        Enumerable.from(gamedata.hands[0].seats)
            .orderBy(x => x.player.toLowerCase())
            .select(x => x.player)
            .toArray()
            // .sort((a, b) => {
            //     return a.localeCompare(b, undefined, {sensitivity: 'base'});
            //   })
            .forEach(s => {
                list.push(<option value={s}>{s}</option>)
            });
        setPlayeritems(list);
        setQueryhanditems(undefined)
        setResults(undefined);
    }, [gamedata]);

    useEffect(() => {

    }, [gamedata]);

    function Query() {
        const pattern_test1 = "C1[schd] C2[schd]".replace("C1", selectedcard1).replace("C2", selectedcard2);
        const pattern_test2 = "C1[schd] C2[schd]".replace("C1", selectedcard2).replace("C2", selectedcard1);
        const re1 = new RegExp(pattern_test1);
        const re2 = new RegExp(pattern_test2);
        let res = null;

        if (selectedcard1 !== selectedcard2) {
            res = Enumerable.from(gamedata.hands)
                .where(c => Enumerable.from(c.summary.playerinfo)
                    .any(s => ((s.player === selectedplayer || selectedplayer === undefined || selectedplayer === "")
                        && (re1.test(s.holecards) || re2.test(s.holecards)))))
                .toArray();
        }
        else {
            res = Enumerable.from(gamedata.hands)
                .where(c => Enumerable.from(c.summary.playerinfo)
                    .any(s => (s.player === selectedplayer || selectedplayer === undefined || selectedplayer === "")
                        && re1.test(s.holecards)))
                .toArray();
        }

        if (res?.length > 0) {
            setQueryhanditems(res);
            res = Enumerable.from(res)
                .select(x => ({ HandID: x.handID }))
                .toArray();
            setResults(res);
        }
        else {
            setResults(undefined);
            setQueryhanditems(undefined);
        }
    }

    function TourneyBusts() {

        var o1 = Enumerable.from(gamedata.hands).selectMany(x => x.seats, (h, s) => ({ handID: h.handID, player: s.player, chipstack: s.chipstack })).toArray();
        var o2 = Enumerable.from(gamedata.hands).selectMany(x => x.summary.playerinfo, (h, s) => ({ handID: h.handID, player: s.player, profit: s.profit })).toArray();
        var o3 = Enumerable.from(o1).join(Enumerable.from(o2),
            ahid => ahid.handID + ahid.player,
            bhid => bhid.handID + bhid.player,
            (ahid, bhid) => ({ handID: ahid.handID, player: ahid.player, chipstack: ahid.chipstack, profit: bhid.profit }))
            .where(z => Math.abs(z.profit) == z.chipstack &&
                z.profit < 0 &&
                (z.player == selectedplayer || selectedplayer == undefined || selectedplayer == null))
            .orderBy(p => p.player)
            .thenBy(p => p.handID)
            .toArray();
        var res = Enumerable.from(gamedata.hands).where(hid => Enumerable.from(o3).any(r => r.handID == hid.handID)).toArray();

        if (res?.length > 0) {
            setQueryhanditems(res);
            res = Enumerable.from(res)
                .select(x => ({ HandID: x.handID }))
                .toArray();
            setResults(res);
        }
        else {
            setResults(undefined);
            setQueryhanditems(undefined);
        }
    }

    function BigPots() {

        var o = Enumerable.from(hands)
            .selectMany(x => Enumerable.from(x.streets).where(z => !(z.actions == null)), (h, s) => ({ handID: h.handID, name: s.name, actions: s.actions, runningpot: s.runningpot }))
            .groupBy(z => z.handID)
            .select(r => ({ handID: r.first().handID, runningpot: r.last().runningpot, street: r.last().name, actions: r.last().actions }))
            .where(z => Enumerable.from(z.actions).any(p => p.player == selectedplayer || selectedplayer == undefined) &&
                z.runningpot > potsize)
            .toArray();

        var res = Enumerable.from(hands).where(hid => Enumerable.from(o).any(r => r.handID == hid.handID)).toArray();

        if (res?.length > 0) {
            setQueryhanditems(res);
            res = Enumerable.from(res)
                .select(x => ({ HandID: x.handID }))
                .toArray();
            setResults(res);
        }
        else {
            setResults(undefined);
            setQueryhanditems(undefined);
        }

    }

    /*
    BAD BEAT
    m_hands.Where(p => !(p.streets[0].handequities is null)
            && p.streets[0].handequities.Any(s => s.player == player && s.win < equity)
            && p.summary.playerinfo.Any(x => x.player == player && x.profit > 0)).ToList();
    */
    return (
        <div>
            <div>
                <div>
                    <br />
                    <table className='pokertableboard'>
                        <tr>
                            <td colSpan={2}><span className='params'>Search Parameters</span></td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <span className='params'>A&nbsp;</span>
                                <select onChange={(e) => setSelectedplayer(e.target.value)}>
                                    {playeritems}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}><span className='actions'>Select Holecards:</span></td>
                        </tr>
                        <tr>
                            <td><span className='params'>B&nbsp;</span>
                                <select onChange={(e) => setSelectedcard1(e.target.value)}>
                                    <option>Select Card 1</option>
                                    <option value="A">A</option>
                                    <option value="K">K</option>
                                    <option value="Q">Q</option>
                                    <option value="J">J</option>
                                    <option value="T">10</option>
                                    <option value="9">9</option>
                                    <option value="8">8</option>
                                    <option value="7">7</option>
                                    <option value="6">6</option>
                                    <option value="5">5</option>
                                    <option value="4">4</option>
                                    <option value="3">3</option>
                                    <option value="2">2</option>
                                </select>
                            </td>
                            <td>
                                <select onChange={(e) => setSelectedcard2(e.target.value)}>
                                    <option>Select Card 1</option>
                                    <option value="A">A</option>
                                    <option value="K">K</option>
                                    <option value="Q">Q</option>
                                    <option value="J">J</option>
                                    <option value="T">10</option>
                                    <option value="9">9</option>
                                    <option value="8">8</option>
                                    <option value="7">7</option>
                                    <option value="6">6</option>
                                    <option value="5">5</option>
                                    <option value="4">4</option>
                                    <option value="3">3</option>
                                    <option value="2">2</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <span className='params'>C&nbsp;</span>
                                <input value={potsize} onChange={e => { setPotsize(Number(e.target.value)) }} />
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} className='underline'></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><span className='params'>Search Hole Cards :</span></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><span className='params'>=&gt;select (A) and (B), or (B)</span></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><button onClick={Query}>Search</button></td>
                        </tr>
                        <tr>
                            <td colSpan={2} className='underline'></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><span className='params'>Search Tournament Busts :</span></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><span className='params'>=&gt;select (A) or none</span></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><button onClick={TourneyBusts}>Search</button></td>
                        </tr>
                        <tr>
                            <td colSpan={2} className='underline'></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><span className='params'>Search Max Pots :</span></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><span className='params'>=&gt;select (A) and (C), or (C)</span></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><button onClick={BigPots}>Search</button></td>
                        </tr>
                    </table>
                </div>
                {/* <div>
                    {results && <DataTable 
                                            tbodyData={results} 
                                            classes={["text"]}
                                            rowclasses={["datatablegrey","datatablewhite"]}
                                />}
                </div> */}
            </div>
        </div>
    );
}