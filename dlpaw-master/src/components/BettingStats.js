import Enumerable from 'linq';
import DataTable from './DataTable';
import React, { useEffect, useState } from 'react';
import { SEATS } from '../enums'
import { arrayRemove } from 'firebase/firestore';
//import { OAuthCredential } from 'firebase/auth';

export default function BettingStats({ token, league, season, status }) {
    const pe = process.env;
    const gamessurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_ALL_GAMES_URL;
    const leaguetkn = pe.REACT_APP_LEAGUE_TOKEN;
    const seasontkn = pe.REACT_APP_SEASON_TOKEN;
    const sf = pe.REACT_APP_SPACE_FILLER;
    const BETTYPE = {Opens: "Opens", ThreeBet: "3-Betting"};
    const [thrbsumry, setThrbsumry] = useState();
    const [thrbdetails, setThrbdetails] = useState();
    //const [selthrbresults, setSelthrbresults] = useState();
    const [selthrbdetails, setSelthrbdetails] = useState();
    const [bets, setBets] = useState();
    const [openingbets, setOpeningbets] = useState();
    const [openingbetdetails, setOpeningbetdetails] = useState();
    const [nemesis, setNemesis] = useState();
    const [selnemesis, setSelnemesis] = useState();
    const [selectedgame, setSelectedgame] = useState();
    const [selectedgamedetails, setSelectedgamedetails] = useState();
    const [selecteddetails, setSelecteddetails] = useState();
    const [selectedplayer, setSelectedplayer] = useState();
    const [street, setStreet] = useState();
    const [selbettype, setSelbetType] = useState(BETTYPE.ThreeBet);
    const [error, setError] = useState();
    
    useEffect(() => {
        if(season == undefined || street == undefined) return;
        getGames();
    }, [season, street]);

    async function getGames() {
        try {
            status(true);

            const re0 = /G[0-9]/;
            const re1 = /SeasonInfo/;

            // if (docID === undefined ||
            // !docID.match(re0)) {
            //     console.log("Document doesn't qualify for update.");
            //     return;
            // }

            let url = gamessurl
                .replace(leaguetkn, league)
                .replaceAll(" ", sf)
                .replace(seasontkn, season);
            var res = await fetch(url, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const games = await res.json();
            const bets = await calcStats(games.filter(g => g.id.match(re0)));
            setThrbsumry(bets.threebetsummary);
            setThrbdetails(bets.threebdetail);
            //setBets(bets.allbets);
            //setNemesis(bets.nemesis);

        } catch (err) {
            setError(err);
            return;
        } finally {
            status(false);
        }
    }

    function getOpponent(handID, actionidx, raiselevel, actions){
        try{
            let p = Enumerable.from(actions)
                .where(a => a.handID == handID && 
                    a.action_idx < actionidx && 
                    a.raise_idx == raiselevel)
                .select(x => x.player).first();
                console.log("p=",p);
            return p;
        }
        catch(error) {
            return "";
        }
    }

    function labelSeats(hands){
        let results = [];
        let labels = SEATS.ids; 
        let handids = Enumerable.from(hands)
            .groupBy(g => g.handID)
            .select(h => h.first().handID)
            .toArray()

        let players0 = Enumerable.from(hands)
            .where(h => h.handID == "#2261-1")
            .toArray();

        handids.forEach((handid) => {
            let players = Enumerable.from(hands)
                .where(h => h.handID == handid)
                .toArray();

            let button = players.find(p => p.isbutton == 1);
            let bi = players.indexOf(button);
            let pc = players.length;
            let positions = Array(pc);
            let configs = SEATS.configs.find(c => c.players == pc).ids;

            for(let n = 0; n < positions.length; n++){
                let idx = n - bi;
                if(idx < 0) idx += pc;
                positions[n] = {...labels[configs[idx]], handID: handid, player: players[n].player, nhanded: pc};
            }
            results.push(...positions);
        })
        return results;
    }

    async function calcStats(games) {
        //let allbets = [];
        let handcounts = [];
        let threebdetail = [];
        //let allactions = [];
        //let allhndsmry = [];
        let thrbopps = [];

        games.forEach(h => {
            var position = Enumerable.from(h.hands)
                .selectMany(hid => Enumerable.from(hid.seats), (h, s) => ({ h, s }))
                .select((p) => ({ handID: p.h.handID, player: p.s.player, id: p.s.id, isbutton: p.s.isbutton }))
                .groupBy(x => x.handID)
                .selectMany((h, i) =>
                    h.select((x, j) => ({ handID: x.handID, player: x.player, id: x.id, isbutton: x.isbutton, position: j })))
                .toArray();
            
            let handcount = Enumerable.from(position)
                .groupBy(g => g.player)
                .select(p => ({player: p.first().player, handsseen: p.count()}))
                .toArray();

            let seats = labelSeats(position);

            let game = h.id;

            var actions = Enumerable.from(h.hands)
                .selectMany((hid) => Enumerable.from(hid.streets).where(s => s.name == street), (h, s) => ({ h, s }))
                .where(x => !(x.s.actions == null))
                .selectMany(s => s.s.actions, (a, p) => ({ a, p }))
                .where(p => Enumerable.from(p.a.s.actions).any(x => x.player == p.p.player))
                .select(hs => ({ handID: hs.a.h.handID, street: hs.a.s.name, player: hs.p.player, actions: Enumerable.from(hs.a.s.actions).where(a => a.player == hs.p.player && a.action == hs.p.action && a.amount == hs.p.amount) }))
                .selectMany(hid => hid.actions, (h, s) => ({ h, s }))
                .select(hs => ({ handID: hs.h.handID, street: hs.h.street, player: hs.h.player, action: hs.s.action, amount: hs.s.amount }))
                .groupBy(x => x.handID)
                .selectMany((h, i) =>
                    h.select((x, j) => ({ game: game, handID: x.handID, player: x.player, action: x.action, amount: x.amount, action_idx: j })))
                .toArray();
            
            var hndsmry = Enumerable.from(h.hands)
                .selectMany(hid => hid.summary.playerinfo, (h, pi) => ({h, pi}))
                .select(r => ({handID: r.h.handID, player: r.pi.player, holecards: r.pi.holecards, profit: r.pi.profit}))
                .toArray();

            var bets0 = Enumerable.from(actions)
                .where(a => a.action == "bets" || a.action == "raises to")
                .groupBy(x => x.handID)
                .selectMany(h =>
                    h.select((x, j) => ({...x,
                                            position: Enumerable.from(seats)
                                                .where(a => a.handID == x.handID && a.player == x.player)
                                                .select(x => x.id).first(),
                                            nhanded: Enumerable.from(seats)
                                                .where(a => a.handID == x.handID && a.player == x.player)
                                                .select(x => x.nhanded).first(),
                                            raise_idx: j
                    })))
                .toArray();

            bets0 = Enumerable.from(bets0)
                .select(x => ({...x, ...{opponent: getOpponent(x.handID, x.action_idx, x.raise_idx-1, bets0)}}))
                .toArray();

            var bets = Enumerable.from(bets0)
                .join(Enumerable.from(hndsmry),
                    a => a.handID + a.player,
                    b => b.handID + b.player,
                    (a, b) => ({...a, ...b, ...{bettor_holecards: b.holecards} }))
                .toArray();

            var j = Enumerable.from(bets)
            .where(f => f.handID == "#2986-1" &&
                f.raise_idx == 0 && 
                5 > f.action_idx && 
                f.player == "twetherald")
            .toArray();


            var oppty = Enumerable.from(actions)
                .where(a => 
                    // (a.action == "folds" || 
                    // a.action == "calls" ||
                    // a.action == "raises to" ||
                    // a.action == "bets" ) && 
                    Enumerable.from(bets)
                        .where(w => w.handID == a.handID)
                        // .where(w => w.handID == a.handID &&
                        //     a.action_idx > w.action_idx &&
                        //     w.raise_idx == 0)
                        .any(f => {
                            let minid = Enumerable.from(bets)
                                .where(n => n.handID == f.handID && 
                                    n.raise_idx == 0)
                                .select(r => r.action_idx)
                                .defaultIfEmpty(0)
                                .toArray()[0];
                            let maxid = Enumerable.from(bets)
                                .where(n => n.handID == f.handID && 
                                    n.raise_idx == 1)
                                .select(r => r.action_idx)
                                .defaultIfEmpty(0)
                                .toArray()[0];

                            let p = a.player !== f.player;
                            let g = ((maxid == 0 || maxid >= a.action_idx) && a.action_idx > minid);
                            if(p && g){
                                return true;
                            }
                            return false;
                            // f.handID == a.handID &&
                            // f.raise_idx == 0 && 
                            // a.action_idx > f.action_idx && 
                            // a.player !== f.player
                        }))
                //.groupBy(p => ({handID: p.handID, player: p.player}))
                // .select(p => ({ game: game, 
                //                 player: p.first().player, 
                //                 handID: p.first().handID, 
                //                 count: 1
                //             }))
                .select(p => ({ game: game, 
                                player: p.player,
                                handID: p.handID,
                                action_idx: p.action_idx,
                                count: 1
                }))
                .toArray();

            // var opptysum = Enumerable.from(oppty)
            //     .groupBy(g => g.player)
            //     .select(r => ({player: r.first().player, opptys: r.count()}))
            //     .toArray();

            var threebet = Enumerable.from(bets)
                .select(x => ({
                    game: game, 
                    handID: x.handID,
                    player: x.player,
                    action: x.action,
                    amount: x.amount,
                    action_idx: x.action_idx,
                    raise_idx: x.raise_idx,
                    profit: x.profit,
                    opponent: x.opponent,
                    bettor_holecards: x.bettor_holecards,
                    opponent_holecards: x.raise_idx>0?Enumerable.from(hndsmry).where(a => a.player == x.opponent && a.handID == x.handID).select(x => x.holecards).first():"",
                    position: x.position,
                    nhanded: x.nhanded
                    }))
                .where(f => f.raise_idx == 1)
                .toArray();

            // var threebets = Enumerable.from(threebet)
            //     .groupBy(g => g.player)
            //     .select(o => ({ game: game, 
            //                     player: o.first().player,
            //                     threebets: o.count(),
            //                     opptys: Enumerable.from(opptysum).where(a => a.player == o.first().player).select(x => x.opptys).first() }))
            //     .select(r => ({ Game: game,
            //                     Player: r.player,
            //                     "3-Bets": r.threebets,
            //                     "Oppty's": r.opptys,
            //                     "3-Bet %": ((r.threebets/r.opptys)*100.00).toFixed(2) }))
            //     .toArray();

            handcounts.push(...handcount);
            //allbets.push(...bets);
            //allactions.push(...threebet);
            threebdetail.push(...threebet);
            thrbopps.push(...oppty);
            //allhndsmry.push(...hndsmry);
        });

        var opptysum = Enumerable.from(thrbopps)
            .groupBy(g => g.player)
            .select(r => ({player: r.first().player, opptys: r.count()}))
            .toArray();

        var threebsumry = Enumerable.from(threebdetail)
            .groupBy(g => g.player)
            .select(o => ({ player: o.first().player,
                            threebets: o.count(),
                            opptys: Enumerable.from(opptysum).where(a => a.player == o.first().player).select(x => x.opptys).first() }))
            .select(r => ({ Player: r.player,
                            "3-Bets": r.threebets,
                            "Oppty's": r.opptys,
                            "3-Bet %": ((r.threebets/r.opptys)*100.00).toFixed(2) }))
            .toArray();

        // var threebsumry = Enumerable.from(threebdetail)
        //     .groupBy(p => p.Player)
        //     .select(s => ({ Player: s.first().Player, 
        //                     "3-Bets": s.sum(x => x["3-Bets"]), 
        //                     "Oppty's": s.sum(x => x["Oppty's"]), 
        //                     "3-Bet %" : ((s.sum(x => x["3-Bets"]) / s.sum(x => x["Oppty's"]))*100.00).toFixed(2)
        //                 }))
        //     .toArray();

        // var nemesis = Enumerable.from(allactions)
        //     .groupBy(g => g.player + g.opponent)
        //     .select(x => ({	Player: x.first().player,
        //                     Opponent: x.first().opponent,
        //                     Raised: x.count()
        //     }))
        //     .orderBy(o => o.Player)
        //     .thenByDescending(o => o.Raised)
        //     .toArray();

        // var betsbypos = Enumerable.from(allbets)
        //     .where(b => b.raise_idx == 0)
        //     .groupBy(g => g.player + g.position)
        //     .select(b => ({ Player: b.first().player,
        //                     Position: b.first().position,
        //                     Profit: b.sum(p => p.profit),
        //                     Count: b.count(),
        //                     TotalHands: Enumerable.from(handcounts)
        //                         .where(p => p.player == b.first().player)
        //                         .groupBy(g => g.player)
        //                         .select(r => r.sum(s => s.handsseen)).first()
        //                 }))
        //     .toArray();

        return {threebetsummary: threebsumry,
                threebdetail: threebdetail,
                //summary: betssummary, 
                //details: betresults, 
                //allbets:allactions,
                //nemesis: nemesis,
                //position: betsbypos
            };
    }

    useEffect(() => {
        setSelthrbdetails(undefined);
        //setSelectedgamedetails(undefined);
        if (selectedplayer == undefined || thrbdetails == undefined) return;

        let d = Enumerable.from(thrbdetails)
            .where(x => x.player == selectedplayer)
            .toArray();
        setSelthrbdetails(d);

        // let n = Enumerable.from(nemesis)
        //     .where(x => x.Player == selectedplayer)
        //     .toArray();
        // setSelnemesis(n);

    }, [selectedplayer]);

    // useEffect(() => {
    //     console.log(selectedgame);
    //     setSelectedgamedetails(undefined);
    //     if (selectedgame == undefined || selectedplayer == undefined) return;

    //     let d = Enumerable.from(bets)
    //         .where(x => x.player == selectedplayer && x.game == selectedgame)
    //         .toArray();
    //         setSelectedgamedetails(d);
    // }, [selectedgame]);

    return (
        <div>
            <table className='pokertableboard'>
                <tr>
                    <td>
                        {/* <button onClick={getSeasonGameData}>Get Standings</button>  */}
                        Click on player name for individual results.
                    </td>
                </tr>
                <tr>
                    <td>
                        <select onChange={(e) => { setStreet(e.target.value) }}>
                            <option>Select a Street</option>
                            <option>PREFLOP</option>
                            <option>FLOP</option>
                            <option>TURN</option>
                            <option>RIVER</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>
                        <select onChange={(e) => { setSelbetType(e.target.value) }}>
                            <option>{BETTYPE.ThreeBet}</option>
                            <option>{BETTYPE.Opens}</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>
                        {selbettype == BETTYPE.ThreeBet &&
                        <table>
                            <tr>
                                <td>
                                    {thrbsumry &&
                                        <DataTable tbodyData={thrbsumry}
                                            classes={["text", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]}
                                            rowclasses={["datatablegrey", "datatablewhite"]}
                                            functions={[setSelectedplayer, , , , , ,]}
                                        // columns = {["Player", "Pts", "Place", "Back", "Gold", "Silver", "Bronze"]}
                                        />
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td align='top'>
                                    {selthrbdetails &&
                                        <DataTable tbodyData={selthrbdetails}
                                            classes={["text", "text", "numeric", "numeric", "numeric", "numeric"]}
                                            rowclasses={["datatablegrey", "datatablewhite"]}
                                            //functions={[setSelectedgame, , , ,]}
                                        />
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td align='top'>
                                    {selnemesis &&
                                        <DataTable tbodyData={selnemesis}
                                            classes={["text", "text", "numeric", "numeric", "numeric", "numeric"]}
                                            rowclasses={["datatablegrey", "datatablewhite"]}
                                            functions={[setSelectedgame, , , ,]}
                                        />
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {selectedgamedetails &&
                                        <DataTable tbodyData={selectedgamedetails}
                                            classes={["text", "numeric", "numeric", "numeric", "numeric"]}
                                            rowclasses={["datatablegrey", "datatablewhite"]}
                                            functions={[, , , ,]}
                                        />
                                    }
                                </td>
                            </tr>
                        </table>
                        }
                    </td>
                </tr>
            </table>
            <p />
            {error &&
                <div>Error: {error}</div>
            }
        </div>
    );
}