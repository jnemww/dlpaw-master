//import { permute } from '../HelperFunctions';
import React, { useState, useEffect } from "react";
import Enumerable from 'linq';

export default function SeriesOdds({ token, league, season, leaguemembers, status }) {
    const [standings, setStandings] = useState();
    const [points, setPoints] = useState();
    //const [playerShortCodes, setPlayerShortCodes] = useState();
    const [playerIDs, setPlayerIDs] = useState([]);
    const [standingsdetails, setStandingsdetails] = useState();
    const [error, setError] = useState();
    const pe = process.env;
    const standingsurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_STANDINGS_URL;
    const seasoninfosurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_SEASONINFO_URL;
    const leaguetkn = pe.REACT_APP_LEAGUE_TOKEN;
    const seasontkn = pe.REACT_APP_SEASON_TOKEN;
    const sf = pe.REACT_APP_SPACE_FILLER;

    /***** ORIG ******/
    const [outcomes, setOutcomes] = useState([]);
    const [outcomeDetails0, setOutcomeDetails0] = useState([]);
    const [outcomeDetails, setOutcomeDetails] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState();
    const [selectedPlace, setSelectedPlace] = useState();
    const [pathFilters, setPathFilters] = useState([]);
    const players = [];
    //const players = ["A", "B", "C", "D"];//,"E","F","G","H","I"];
    //const points = [10.87, 6.63, 4.25, 2.87];//,2.05,1.55,1.25,1.08,1];
    // const standings = [{ player: "A", points: 10, paths: new Array(9) },
    // { player: "B", points: 8, paths: new Array(9) },
    // { player: "C", points: 11, paths: new Array(9) },
    // { player: "D", points: 14, paths: new Array(9) }];
    /***** ORIG ******/

    useEffect(() => {
        //init data
        (async () => {
            const loadedPoints = await getPointsInfo();
            //const loadedStandings = await getStandingsInfo();

            // const results = [];//permute(playerShortCodes);
            // const paths0 = [];//scorePermutations(results);
            // summarizePaths(paths0);
            console.log("points loaded =>", loadedPoints)
        })();
    }, []);

    useEffect(() => {
        //init data
        if(playerIDs.length){
            (async () => {
                const loadedStandings = await getStandingsInfo();

                // const sc = Enumerable.from(playerIDs)
                //     .select(id => id.shortcode)
                //     .toArray();
                // const results = permute(sc);
                // const paths0 = scorePermutations(results);
                // summarizePaths(paths0);
                console.log("standings =>", loadedStandings)
            })();
        }
    }, [playerIDs]);

    useEffect(() => {
        //init data
        if(playerIDs.length && standings != undefined){
            (async () => {
                const sc = Enumerable.from(playerIDs)
                    .select(id => id.shortcode)
                    .toArray();
                const results = permute(sc);
                const paths0 = scorePermutations(results);
                summarizePaths(paths0);
                console.log("standing enumerated");
            })();
        }
    }, [standings]);

    useEffect(() => {
        console.log("points =>", points);
    }, [points]);

    useEffect(() => {
        if (outcomeDetails0.length > 0) {
            if(pathFilters.length){
                summarizePaths(outcomeDetails);
            } else {
                summarizePaths(outcomeDetails0);
            }
        }
    }, [pathFilters])

    async function getStandingsInfo() {
        let success = false;
        try {
            status.addToQueue();
            let url = standingsurl
                .replace(leaguetkn, league)
                .replaceAll(" ", sf)
                .replace(seasontkn, season);
            var res = await fetch(url, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            let info = await res.json();
            let p = Enumerable.from(info.Results.Summary)
                .select(r => ({ player: r.Player,
                                shortcode: playerIDs.find(id => id.player.mavens_login == r.Player).shortcode,
                                points: parseFloat(r.Pts),
                                gold: r.Gold,
                                silver: r.Silver,
                                bronze: r.Bronze,
                                paths: new Array(playerIDs.length)}))
                .toArray();
            setStandings(p);
            setStandingsdetails(info.Results.Details);

            success = true;

        } catch (err) {
            setError(err.message);
        } finally {
            status.removeFromQueue();
            return success;
        }
    }

    async function getPointsInfo() {
        let success = false;
        try {
            status.addToQueue();

            let url = seasoninfosurl
                .replace(leaguetkn, league)
                .replaceAll(" ", sf)
                .replace(seasontkn, season);
            var res = await fetch(url, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            let info = await res.json();
            setPoints(info.Points);
            //setPlayerIDs(info.Players);
            getEncodedPlayers(info.Players);

            success = true;

        } catch (err) {
            setError(err.message);
        } finally {
            status.removeFromQueue();
            return success;
        }
    }

    function getEncodedPlayers(playerIDs){
        //fromCharCode
        console.dir(leaguemembers);
        const i = 0;
        //const p = [];
        const pinfo = [];
        for(let n = 0; n < playerIDs.length; n++) {
            let char = String.fromCharCode(65 + n);
            //p.push(char);
            pinfo.push({shortcode: char, player: leaguemembers.find(f => f.id == playerIDs[n])});
        }
        setPlayerIDs(pinfo);
        //setPlayerShortCodes(p);
    }

    function permute(nums) {
        let result = [];
        if (nums.length === 0) return [];
        if (nums.length === 1) return [nums];
        for (let i = 0; i < nums.length; i++) {
            const currentNum = nums[i];
            const remainingNums = nums.slice(0, i).concat(nums.slice(i + 1));
            const remainingNumsPermuted = permute(remainingNums);
            for (let j = 0; j < remainingNumsPermuted.length; j++) {
                const permutedArray = [currentNum].concat(remainingNumsPermuted[j]);
                result.push(permutedArray);
                //console.dir(permutedArray);
            }
        }
        return result;
    }

    function scorePermutations(results) {
        const paths = [];
        try {
            status.addToQueue();

            for (let j = 0; j < results.length; j++) {
                for (let n = 0; n < results[j].length; n++) {
                    let standing = standings.find(r => r.shortcode == results[j][n]);
                    let sumpoints = standing.points +
                        standing.gold * .001 + 
                        standing.silver * .0001 + 
                        standing.bronze * .00001 +
                        points[n];
                    let res = { ...{ player: results[j][n] }, ...{ place: 0, points: sumpoints, id: `R${j}`, order: results[j].toString().replaceAll(",", ""), game_place: (n + 1) } };
                    paths.push(res);
                }
            }

        } catch (error) {
            setError(error.message);
        } finally {
            status.removeFromQueue();
            return paths;
        }
    }

    function summarizePaths(paths0) {
        try {
            status.addToQueue();

            let f0 = [];
            if (pathFilters.length > 0) {
                f0 = Enumerable.from(paths0)
                    .where(f => //f0.filter(r => r.id == f.id).length == 0 &&
                        f.player == selectedPlayer &&
                        f.game_place == selectedPlace)
                    .groupBy(g => g.id)
                    .select(r => ({ id: r.first().id }))
                    .toArray();
            }
    
            let paths = [];
            if(pathFilters.length == 0){
                paths = Enumerable.from(paths0)
                    .orderByDescending(o => o.points)
                    .groupBy(x => x.id)
                    .selectMany((h, i) =>
                        h.select((x, j) => ({ id: x.id, player: x.player, points: x.points, place: (j + 1), game_place: x.game_place, order: x.order })))
                    .orderBy(o => o.id)
                    .thenBy(o => o.place)
                    .toArray();                
            } else {
                paths = Enumerable.from(paths0)
                    .join(Enumerable.from(f0),
                        a => a.id,
                        b => b.id,
                        (a, b) => ({ ...a, ...b}))
                    //.where(f => pathFilters.length == 0 || (Enumerable.from(f0).any(r => r.id == f.id)))
                    .orderByDescending(o => o.points)
                    .groupBy(x => x.id)
                    .selectMany((h, i) =>
                        h.select((x, j) => ({ id: x.id, player: x.player, points: x.points, place: (j + 1), game_place: x.game_place, order: x.order })))
                    .orderBy(o => o.id)
                    .thenBy(o => o.place)
                    .toArray();
            }
    
            let summary = Enumerable.from(paths)
                //.select(x => ({...x, ...{playername: playerIDs.find(id => id.id == x.player).player.nickname}}))
                .groupBy(g => g.player + g.place)
                .select(r => ({ player: r.first().player,
                                playername: playerIDs.find(id => id.shortcode == r.first().player).player.nickname,
                                place: r.first().place,
                                paths: r.count(),
                                minpts: r.min(p => p.points),
                                maxpts: r.max(p => p.points),
                                maxgamefinish: r.max(p => p.game_place),
                                mingamefinish: r.min(p => p.game_place) }))
                .orderBy(o => o.player)
                .thenBy(o => o.place)
                .toArray();
    
            if (outcomeDetails0.length == 0) setOutcomeDetails0(paths);
            setOutcomeDetails(paths);
            setOutcomes(summary);
    
            console.log("Scoring permutations complete.");

        } catch (error) {
            setError(error.message);
        } finally {
            status.removeFromQueue();
        }
    }

    function addPathsFilter(player, place) {
        const filters = pathFilters.slice();
        filters.push({ player: player, place: place });
        setPathFilters(filters);
        setSelectedPlayer(player);
        setSelectedPlace(place);
        console.log("player/place:", player, place);
    }

    async function resetOriginalPaths(){
        try {
            status.addToQueue();
            setPathFilters([]);
        } catch (error) {
            setError(error.message);
        } finally {
            status.removeFromQueue();
        }
    }

    return (
        <div>
            {outcomes &&
                <table>
                    <tr>
                        <td>
                            <select onChange={(e) => setSelectedPlayer(e.currentTarget.value)}>
                                <option></option>
                                {   playerIDs &&
                                    playerIDs.map(o => {
                                        return (
                                            <option value={`${o.shortcode}`}>{`(${o.shortcode}) ${o.player.nickname}`}</option>
                                        )
                                    })
                                }
                            </select>
                            <select onChange={(e) => setSelectedPlace(parseInt(e.currentTarget.value))}>
                                <option></option>
                                {   playerIDs &&
                                    playerIDs.map((o, i) => {
                                        return (
                                            <option value={i+1}>{i+1}</option>
                                        )
                                    })
                                }
                            </select>
                            <button onClick={() => addPathsFilter(selectedPlayer, selectedPlace)}>Add Finish</button>
                            <button onClick={async () => await resetOriginalPaths()}>Remove Finishes</button>
                        </td>
                    </tr>
                    <tr>
                        <td>                            
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table>
                                <tr>
                                    <td>Player</td>
                                    <td>Place</td>
                                    <td>Paths</td>
                                    <td>Max Pts</td>
                                    <td>Min Pts</td>
                                    <td>Max Game Place</td>
                                    <td>Min Game Place</td>
                                </tr>
                            {
                                outcomes.map(o => {
                                    return (
                                        <tr> {/* onClick={() => addPathsFilter(o.player, o.place)}> */}
                                            <td>{`${o.playername}`}</td>
                                            <td>{`${o.place}`}</td>
                                            <td>{`${o.paths}`}</td>
                                            <td>{`${o.maxpts.toFixed(2)}`}</td>
                                            <td>{`${o.minpts.toFixed(2)}`}</td>
                                            <td>{`${o.maxgamefinish}`}</td>
                                            <td>{`${o.mingamefinish}`}</td>
                                        </tr>
                                    )
                                    console.log(o);
                                })
                            }
                            </table>
                            &nbsp;&nbsp;
                            <table>
                                <tr>
                                    <td>Finished</td>
                                </tr>
                                <tr>
                                    <td>Player</td>
                                    <td>Place</td>
                                </tr>
                                {
                                pathFilters.map(o => {
                                    return (
                                        <tr> {/* onClick={() => addPathsFilter(o.player, o.place)}> */}
                                            <td>{`${playerIDs.find(id => id.shortcode == o.player).player.nickname}`}</td>
                                            <td>{`${o.place}`}</td>
                                        </tr>
                                    )
                                    console.log(o);
                                })
                            }
                            </table>
                        </td>
                    </tr>
                    {/* <tr><td>Details</td></tr>
                    {
                        outcomeDetails.map(o => {
                            return (
                                <tr>
                                    <td>{`${o.id}`}</td>
                                    <td>{`${o.player}`}</td>
                                    <td>{`${o.place}`}</td>
                                    <td>{`${o.order}`}</td>
                                </tr>
                            )
                            console.log(o);
                        })
                    } */}
                </table>
            }
            {error &&
                <div>Error: {error}</div>
            }
        </div>
    )
}