import Enumerable from 'linq';
import DataTable from './DataTable';
import React, { useEffect, useState} from 'react';
import PlayFrequenciesChart from './PlayFrequenciesChart';

export default function PlayFrequencies({gamedata, selectedseason, selectedgame, status, leaguemembers}){
    const [results, setResults] = useState();
    const [resultstable, setResultstable] = useState();
    const [viewgraph, setViewgraph] = useState(false);

    useEffect(()=>{ 
        if(gamedata == undefined) return;

        status(true);

        let o1 = Enumerable.from(gamedata.hands)
            .select(s => s.summary)
            .selectMany(pi => Enumerable.from(pi.playerinfo))
            .select(x => ({ Player : x.player }))
            .groupBy(g => g.Player)
            .select(r => ({ Game : "", Player : r.first().Player, HandsPlayed : r.count() }))
            .toArray();

        let o = Enumerable.from(gamedata.hands)
                    .selectMany(hid => Enumerable.from(hid.streets), (h, s) => ({ h, s }))
                    .where(x => !(x.s.actions == null))
                    .selectMany(s => Enumerable.from(s.s.actions), (a, p) => ({ a, p }))
                    .where(p => Enumerable.from(p.a.s.actions).any(x => x.player == p.p.player))
                    .select(hs => ({ handID : hs.a.h.handID, street : hs.a.s.name, player : hs.p.player }))
                    .groupBy(z => (z.handID + z.street + z.player))
                    .select(x => ({ Street : x.first().street, Player : x.first().player, Count : x.count()}))
                    .groupBy(z => (z.Street + z.Player))
                    .select(x => ({ Street : x.first().Street, Player : x.first().Player, Count : x.count()}))
                    .toArray();

        let r = Enumerable.from(o)
            .join(o1, a => a.Player, b => b.Player, (a, b) =>
                ({
                    Street : a.Street,
                    Player : leaguemembers.find(r => r.mavens_login == a.Player).nickname.toLowerCase(),
                    StreetSeen : a.Count,
                    HandsSeen : b.HandsPlayed,
                    PctSeen : (a.Count / b.HandsPlayed).toLocaleString(),
                    StreetOrder : ((a.Street == "FLOP") ? 1 : ((a.Street == "TURN") ? 2 : ((a.Street == "RIVER") ? 3 : 0)))
                })
                )
                .where(x => x.Street != "PREFLOP")
                .orderBy(z => z.StreetOrder)
                .thenBy(p => p.Player.toLowerCase())
                .select(x => ({ "Street": x.Street, 
                                "Player": x.Player, 
                                "Visited": x.StreetSeen, 
                                "Hands Played": x.HandsSeen, 
                                "%": (x.PctSeen * 100).toLocaleString()}))
                .toArray();

                var r1 = Enumerable.from(r)
                .groupBy(g => g.Player)
                .select(h => ({ Player: h.first().Player, HandsSeen : h.first()["Hands Played"] }))
                .join(Enumerable.from(r).where(s => s.Street == "FLOP").toArray(), a => a.Player, b => b.Player, (a, b) => ({Player: a.Player, FlopCount : b.Visited, HandsSeen: a.HandsSeen }))
                .join(Enumerable.from(r).where(s => s.Street == "TURN").toArray(), a => a.Player, b => b.Player, (a, b) => ({Player: a.Player, FlopCount: a.FlopCount, TurnCount : b.Visited, HandsSeen: a.HandsSeen }))
                .join(Enumerable.from(r).where(s => s.Street == "RIVER").toArray(), a => a.Player, b => b.Player, (a, b) => ({Player: a.Player, FlopCount: a.FlopCount, TurnCount: a.TurnCount, RiverCount: b.Visited, HandsSeen: a.HandsSeen }))
                .select(r =>    ({	Player: r.Player,
                                    "Hands" : r.HandsSeen,
                                    "Flops" : r.FlopCount,
                                    "Turns" : r.TurnCount,
                                    "Rivers" : r.RiverCount,
                                    "% F": ((r.FlopCount / r.HandsSeen) * 100).toFixed(2), 
                                    "% T": ((r.TurnCount / r.HandsSeen) * 100).toFixed(2),
                                    "% R": ((r.RiverCount / r.HandsSeen) * 100).toFixed(2),
                                    "P(F→T)": ((r.TurnCount / r.FlopCount) * 100).toFixed(2),
                                    "P(T→R)": ((r.RiverCount / r.TurnCount) * 100).toFixed(2)}))
                .toArray();
        
        setResults(r);
        setResultstable(r1);
        status(false);
    },[gamedata]);

    function ChangeView(){
        setViewgraph(!viewgraph);
    }

return(
    <div>
        {   !viewgraph &&
            results && 
            (
                <>
                    <img className='chartthumbnail' src={"./images/chart2.png"} onClick={ChangeView}/>
                    <DataTable  tbodyData={resultstable} 
                            classes={["text", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]}
                            rowclasses={["datatablegrey","datatablewhite"]}
                            functions={[,,,,,,,,]}
                    />
                </>
            )
        }
        {   viewgraph &&
            results && 
            (
                <>
                    <img className='chartthumbnail' src={"./images/table.png"} onClick={ChangeView}/>
                    <PlayFrequenciesChart
                        leaguemembers={leaguemembers}
                        selectedseason={selectedseason}
                        selectedgame={selectedgame}
                        gamedata={results} />
                </>
            )
        }
    </div>
);
}
