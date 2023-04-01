import Enumerable from 'linq';
import DataTable from './DataTable';
import React, { useEffect, useState, useFetch, useSyncExternalStore } from 'react';

export default function Standings({ games, season, status, leaguemembers, getSeasonGameData }) {
    const [standings, setStandings] = useState();
    const [standingsdetails, setStandingsdetails] = useState();
    const [selectedstandingsdetails, setSelectedstandingsdetails] = useState();
    const [selectedplayer, setSelectedplayer] = useState();
    const [points, setPoints] = useState();
    const [error, setError] = useState();

    useEffect(() => {
        setSelectedplayer(undefined);
        setSelectedstandingsdetails(undefined);
        setStandings(undefined);
    }, [season]);

    useEffect(() => {
        if(games == undefined) return;
        setSelectedstandingsdetails(null);
        if (selectedplayer == undefined || standingsdetails == undefined) return;

        let d = Enumerable.from(standingsdetails)
            .where(x => x.Player == selectedplayer)
            .toArray();
        setSelectedstandingsdetails(d);
    }, [selectedplayer, games]);

    useEffect(() => {
        if(games == undefined) return;
        
        (async () => {
            status(true);

            try {
                let pts = games.filter(g => g.id == season + "Points")[0].points;
                let g = games.filter(g => g.id != season + "Points");
                let ps = [];

                if (pts == undefined || pts?.length == 0)
                    throw new Error(`Missing point scoring data for season ${season}.`);
                if (g == undefined || g?.length == 0)
                    throw new Error(`Missing point scoring data for season ${season}.`);

                setPoints(pts);

                g.forEach(h => {
                    let ss = Enumerable.from(h.hands)
                        .selectMany(x => Enumerable.from(x.seats))
                        .groupBy(z => z.player)
                        .select(p => ({
                            Player: p.last().player,
                            StartingStack: p.last().chipstack
                        }));

                    let o = Enumerable.from(h.hands).select(s => s.summary)
                        .selectMany(pi => Enumerable.from(pi.playerinfo))
                        .select(x => ({
                            Player: x.player,
                            Profit: x.profit,
                            StartingStack: ss.where(p => p.Player == x.player).select(z => z.StartingStack).first()
                        }))
                        .groupBy(g => g.Player)
                        .select(r => ({
                            Game: h.game,
                            Player: r.first().Player,
                            HandsPlayed: r.count(),
                            Profit: r.last().Profit,
                            StartingStack: r.last().StartingStack
                        }))
                        .orderByDescending(c => c.HandsPlayed)
                        .thenByDescending(c => c.StartingStack).toArray();

                    var o1 = Enumerable.from(o)
                        .select(x => ({
                            Game: x.Game,
                            Player: x.Player,
                            Finish: 1 + Enumerable.from(o).select(p => ({ Player: p.Player })).toArray().findIndex(s => s.Player == x.Player),
                            Points: Enumerable.from(pts).select(p => pts[(Enumerable.from(o).select(p => ({ Player: p.Player })).toArray().findIndex(s => s.Player == x.Player))]).first()
                        })
                        ).toArray();

                    ps.push(o1);
                });


                let p0 = [];
                for (let i = 0; i < ps.length; i++) {
                    for (let z = 0; z < ps[i].length; z++) {
                        p0.push(ps[i][z]);
                    }
                }

                let details = Enumerable.from(p0)
                    .select(x => ({
                        Game: x.Game,
                        Player: leaguemembers.find(r => r.mavens_login == x.Player).nickname.toLowerCase(),
                        Finish: x.Finish,
                        Points: x.Points
                    }))
                    .orderBy(x => x.Game.length)
                    .thenBy(x => x.Game)
                    .toArray();
                setStandingsdetails(details);


                let players = Enumerable.from(p0)
                    .groupBy(p => p.Player)
                    .select(x => ({
                        p: x.first().Player,
                        pts: x.sum(z => z.Points)
                    }))
                    .orderByDescending(o => o.pts)
                    .select(z => ({ player: z.p, pts: z.pts }))
                    .toArray();

                const r = [];
                players.forEach(p => {

                    let d = Enumerable.from(p0).where(z => z.Player == p.player).select(x => ({ Player: x.Player, Game: x.Game, Points: x.Points, Finish: x.Finish })).toArray();

                    let pl = p.player;
                    let pc = leaguemembers.find(r => r.mavens_login == p.player).nickname.toLowerCase();
                    let tp = Enumerable.from(d).sum(x => x.Points);
                    let pf = players.findIndex(s => p.player == s.player) + 1;
                    let pb = tp - Enumerable.from(players).max(z => z.pts);
                    let f = Enumerable.from(d).where(z => z.Finish == 1).count();
                    let s = Enumerable.from(d).where(z => z.Finish == 2).count();
                    let t = Enumerable.from(d).where(z => z.Finish == 3).count();
                    r.push({ "Player": pc, "Pts": tp.toLocaleString(), "Place": pf, "Back": pb.toLocaleString(), Gold: f, Silver: s, Bronze: t });
                });

                setStandings(r);
                status(false);
            }
            catch (err) {
                setError(err);
                return;
            };
        })();
    }, [games]);

    return (
        <div>
            <table className='pokertableboard'>
                <tr>
                    <td>
                        <button onClick={getSeasonGameData}>Get Standings</button> Click on player for individual results.
                    </td>
                </tr>
                <tr>
                    <td>
                        {standings &&
                            <DataTable tbodyData={standings}
                                classes={["text", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]}
                                rowclasses={["datatablegrey", "datatablewhite"]}
                                functions={[setSelectedplayer, , , , , ,]}
                            />
                        }
                    </td>
                </tr>
                <tr>
                    <td>
                        {selectedplayer &&
                            selectedstandingsdetails &&
                            <DataTable tbodyData={selectedstandingsdetails}
                                classes={["text", "numeric", "numeric", "numeric"]}
                                rowclasses={["datatablegrey", "datatablewhite"]}
                                functions={[, , , ,]}
                            />
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