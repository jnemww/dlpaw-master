import Enumerable from 'linq';
import DataTable from './DataTable';
import React, { useEffect, useState, useFetch } from 'react';

export default function Standings({games, status}){
    const [standings, setStandings] = useState();
    const [standingsdetails, setStandingsdetails] = useState();
    const [selectedstandingsdetails, setSelectedstandingsdetails] = useState();
    const [selectedplayer, setSelectedplayer] = useState();

    useEffect(()=>{
        if(selectedplayer == undefined || standingsdetails == undefined) return;
        let d = Enumerable.from(standingsdetails)
            .where(x => x.Player == selectedplayer)
            .toArray();
            setSelectedstandingsdetails(d);
    },[selectedplayer, games]);

    useEffect(()=>{ 
        (async() => {
            status(true);
            let ps = [];
            games.forEach(h => {
                let ss = Enumerable.from(h.hands)
                    .selectMany(x => Enumerable.from(x.seats))
                    .groupBy(z => z.player)
                    .select(p => ({ Player : p.last().player, 
                                    StartingStack : p.last().chipstack }));
    
                let o = Enumerable.from(h.hands).select(s => s.summary)
                    .selectMany(pi => Enumerable.from(pi.playerinfo))
                    .select(x => ({ Player : x.player, 
                                    Profit : x.profit, 
                                    StartingStack : ss.where(p => p.Player == x.player).select(z => z.StartingStack).first() }))
                    .groupBy(g => g.Player)
                    .select(r => ({ Game : h.game, 
                                    Player : r.first().Player, 
                                    HandsPlayed : r.count(), 
                                    Profit : r.last().Profit, 
                                    StartingStack : r.last().StartingStack }))
                    .orderByDescending(c => c.HandsPlayed)
                    .thenByDescending(c => c.StartingStack).toArray();
    
                let points = [12.7, 7.62, 5.08, 3.81, 2.86, 2.22, 1.71];
    
                var o1 = Enumerable.from(o)
                            .select(x => ({
                                Game : x.Game,
                                Player : x.Player,
                                Finish : 1 + Enumerable.from(o).select(p => ({ Player : p.Player })).toArray().findIndex(s => s.Player == x.Player),
                                Points : Enumerable.from(points).select(p => points[(Enumerable.from(o).select(p => ({ Player : p.Player })).toArray().findIndex(s => s.Player == x.Player))]).first()
                            })
                ).toArray();
    
                ps.push(o1);
            });
    
            let p0 = [];
            for(let i = 0; i < ps.length; i++){
                for(let z = 0; z < ps[i].length; z++){
                    p0.push(ps[i][z]);
                }
            }
    
            let details = Enumerable.from(p0)
                .select(x => ({ Game : x.Game,
                                Player : x.Player,
                                Finish : x.Finish,
                                Points : x.Points
                }))
                .toArray();
            setStandingsdetails(details);
            
    
            let players = Enumerable.from(p0)
                .groupBy(p => p.Player)
                .select(x => ({ p : x.first().Player, 
                                pts : x.sum(z => z.Points)}))
                .orderByDescending(o => o.pts)
                .select(z => ({ player : z.p, pts : z.pts }))
                .toArray();
    
            const r = [];
            players.forEach(p =>{
    
                let d = Enumerable.from(p0).where(z => z.Player == p.player).select(x => ({ Player : x.Player, Game : x.Game, Points : x.Points, Finish : x.Finish })).toArray();
    
                let pl = p.player;
                let tp = Enumerable.from(d).sum(x => x.Points);
                let pf = players.findIndex(s => p.player == s.player) +1;
                let pb = tp - Enumerable.from(players).max(z => z.pts);
                let f = Enumerable.from(d).where(z => z.Finish == 1).count();
                let s = Enumerable.from(d).where(z => z.Finish == 2).count();
                let t = Enumerable.from(d).where(z => z.Finish == 3).count();
                r.push({"Player": pl, "Pts": tp.toLocaleString(), "Place": pf, "Back": pb.toLocaleString(), Gold: f, Silver: s, Bronze: t});
            });
            
            setStandings(r);
            status(false);
        })();
    },[games]);

    return(
        <div>
            {   standings && 
                <DataTable  tbodyData={standings} 
                            classes={["text", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]}
                            rowclasses={["datatablegrey","datatablewhite"]}
                            functions={[setSelectedplayer,,,,,,]}
                    />
            }
            <p/>
            {   selectedplayer && 
                selectedstandingsdetails && 
                <DataTable tbodyData={selectedstandingsdetails}
                            classes={["text", "numeric", "numeric", "numeric"]}
                            rowclasses={["datatablegrey","datatablewhite"]}
                            functions={[,,,,]}
                    />
            }
        </div>
        );
}