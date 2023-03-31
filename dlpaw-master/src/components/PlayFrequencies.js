import Enumerable from 'linq';
import DataTable from './DataTable';
import React, { useEffect, useState, useFetch } from 'react';

export default function PlayFrequencies({gamedata, status, leaguemembers}){
    const [results, setResults] = useState();

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
        
        setResults(r);
        status(false);
    },[gamedata]);

return(
    <div>
        {   results && 
            <DataTable  tbodyData={results} 
                        classes={["text", "text", "numeric", "numeric", "numeric"]}
                        rowclasses={["datatablegrey","datatablewhite"]}
                        functions={[,,,,]}
                />
        }
    </div>
);
}
