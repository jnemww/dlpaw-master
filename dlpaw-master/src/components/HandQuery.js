import Enumerable from 'linq';
import DataTable from './DataTable';
import {isObjectEmpty} from '../HelperFunctions';
import React, { useEffect, useState, useFetch } from 'react';

export default function HandQuery({gamedata, setQueryhanditems}){
    const [hands, setHands] = useState(gamedata?.hands);
    const [playeritems, setPlayeritems] = useState();
    const [selectedplayer, setSelectedplayer] = useState();
    const [selectedcard1, setSelectedcard1] = useState();
    const [selectedcard2, setSelectedcard2] = useState();
    const [results, setResults] = useState();

    useEffect(()=>{
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
    },[gamedata]);

    useEffect(()=>{
        
    },[gamedata]);

    function Query(){
        const pattern_test1 = "C1[schd] C2[schd]".replace("C1", selectedcard1).replace("C2", selectedcard2);
        const pattern_test2 = "C2[schd] C1[schd]".replace("C2", selectedcard1).replace("C1", selectedcard2);
        const re1 = new RegExp(pattern_test1);
        const re2 = new RegExp(pattern_test2);
        let res = null;
    
        if(selectedcard1 !== selectedcard2){
            res = Enumerable.from(gamedata.hands)
                .where(c => Enumerable.from(c.summary.playerinfo)
                .any(s => ((s.player === selectedplayer || selectedplayer ===undefined || selectedplayer === "") 
                    && (re1.test(s.holecards) || re2.test(s.holecards)))))
                .toArray();
        }
        else{
            res = Enumerable.from(gamedata.hands)
                .where(c => Enumerable.from(c.summary.playerinfo)
                .any(s => (s.player === selectedplayer || selectedplayer ===undefined || selectedplayer === "") 
                    && re1.test(s.holecards)))
                .toArray();
        }
        
        if(res?.length>0){
            setQueryhanditems(res);
            res = Enumerable.from(res)
            .select(x => ({HandID: x.handID}))
            .toArray();
            setResults(res);
        }
        else{
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
    return(
        <div>
            <div>
                <div>
                    <br/>
                    <table className='pokertableboard'>
                        <tr>
                            <td colSpan={2}><span className='actions'>Search Parameters</span></td>
                        </tr>
                        <tr>
                            <td>
                                <select onChange={(e) => setSelectedplayer(e.target.value)}>
                                    {playeritems}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}><span className='actions'>Select Holecards:</span></td>
                        </tr>
                        <tr>
                            <td>
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
                            <td colSpan={2}><button onClick={Query}>Run Query</button></td>
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