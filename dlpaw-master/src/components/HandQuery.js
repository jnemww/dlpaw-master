import Enumerable from 'linq';
import DataTable from './DataTable';
import { isObjectEmpty } from '../HelperFunctions';
import React, { useEffect, useState } from 'react';

export default function HandQuery({ gamedata, setQueryhanditems, leaguemembers }) {
    const [hands, setHands] = useState(gamedata?.hands);
    const [playeritems, setPlayeritems] = useState();
    const [selectedplayer, setSelectedplayer] = useState();
    const [selectedcard1, setSelectedcard1] = useState();
    const [selectedcard2, setSelectedcard2] = useState();
    const [potsize, setPotsize] = useState("Min pot size or max equity");
    const [results, setResults] = useState();
    const [resultsmsg, setResultsmsg] = useState();
    const noresults = "***No hands found.***";

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
                list.push(<option value={s}>{leaguemembers.find(r => r.mavens_login == s).nickname.toLowerCase()}</option>)
            });
        setPlayeritems(list);
        setQueryhanditems(undefined)
        setResults(undefined);
    }, [gamedata]);

    useEffect(() => {

    }, [gamedata]);

    function Holecards() {
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
            setResultsmsg(undefined);
        }
        else {
            setResults(undefined);
            setQueryhanditems(undefined);
            setResultsmsg(noresults);
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
            setResultsmsg(undefined);
        }
        else {
            setResults(undefined);
            setQueryhanditems(undefined);
            setResultsmsg(noresults);
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
            setResultsmsg(undefined);
        }
        else {
            setResults(undefined);
            setQueryhanditems(undefined);
            setResultsmsg(noresults);
        }

    }

    function BadBeats() {
        var res = [];

        if(potsize == undefined || !parseInt(potsize)){
            setResultsmsg("Enter a maximum equity value.(1 >= i < 100)");
            return;
        }

        if(selectedplayer == undefined){
            setResultsmsg("Select a player.");
            return;
        }

        var o1 = Enumerable.from(hands)
            .where(p => Enumerable.from(p.streets).count() > 0)
            .where(p => !(p.streets[0].handequities == null)
                && Enumerable.from(p.streets[0].handequities).any(s => (s.player == selectedplayer || selectedplayer == undefined) && s.win < potsize)
                && Enumerable.from(p.summary.playerinfo).any(x => (x.player == selectedplayer || selectedplayer == undefined) && x.profit > 0))
            .toArray();

        var o2 = Enumerable.from(hands)
            .where(p => Enumerable.from(p.streets).count() > 1)
            .where(p => !(p.streets[1].handequities == null)
                && Enumerable.from(p.streets[1].handequities).any(s => (s.player == selectedplayer || selectedplayer == undefined) && s.win < potsize)
                && Enumerable.from(p.summary.playerinfo).any(x => (x.player == selectedplayer || selectedplayer == undefined) && x.profit > 0))
            .toArray();

        var o3 = Enumerable.from(hands)
            .where(p => Enumerable.from(p.streets).count() > 2)
            .where(p => !(p.streets[2].handequities == null)
                && Enumerable.from(p.streets[2].handequities).any(s => (s.player == selectedplayer || selectedplayer == undefined) && s.win < potsize)
                && Enumerable.from(p.summary.playerinfo).any(x => (x.player == selectedplayer || selectedplayer == undefined) && x.profit > 0))
            .toArray();

        try {
            o1.forEach((h) => {
                if (res.find(p => p.handID == h.handID) == undefined) {
                    res.push(h);
                }
            })
            o2.forEach(h => {
                if (res.find(p => p.handID == h.handID) == undefined) {
                    res.push(h);
                }
            })
            o3.forEach(h => {
                if (res.find(p => p.handID == h.handID) == undefined) {
                    res.push(h);
                }
            })
            //res = o1.concat(o2.concat(o3));
        } catch (error) {
            console.log(error);
        }

        if (res?.length > 0) {
            setQueryhanditems(res);
            res = Enumerable.from(res)
                .select(x => ({ HandID: x.handID }))
                .toArray();
            setResults(res);
            setResultsmsg(undefined);
        }
        else {
            setResults(undefined);
            setQueryhanditems(undefined);
            setResultsmsg(noresults);
        }
    }
    function ClearValue(){
        document.getElementById('quantity').value = '';
    }

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
                                <input id="quantity" value={potsize} onFocus={ClearValue} onChange={e => { setPotsize(Number(e.target.value)) }} />
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
                            <td colSpan={2}><button onClick={Holecards}>Search</button></td>
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
                        <tr>
                            <td colSpan={2} className='underline'></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><span className='params'>Search Improbable Odds :</span></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><span className='params'>=&gt;select (A) and (C)</span></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><button onClick={BadBeats}>Search</button></td>
                        </tr>
                        <tr>
                            <td colSpan={2} className='underline'></td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <div>
                                    {resultsmsg &&
                                        <div><span className='resultsmsg'>{resultsmsg}</span></div>
                                    }
                                </div>
                            </td>
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