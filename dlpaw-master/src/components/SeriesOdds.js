//import { permute } from '../HelperFunctions';
import React, { useState, useEffect } from "react";
import Enumerable from 'linq';
import GroupedTable from './GroupedTable';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

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

    /*
    <td>{`${o.playername}`}</td>
    <td>{`${o.place}`}</td>
    <td>{`${o.paths}`}</td>
    <td>{`${o.maxpts.toFixed(2)}`}</td>
    <td>{`${o.minpts.toFixed(2)}`}</td>
    <td>{`${o.maxgamefinish}`}</td>
    <td>{`${o.mingamefinish}`}</td>    
    */

    /***** ORIG ******/
    const [outcomes, setOutcomes] = useState([]);
    const [outcomeDetails0, setOutcomeDetails0] = useState([]);
    const [outcomeDetails, setOutcomeDetails] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState();
    const [trackedPlayer, setTrackedPlayer] = useState();
    const [trackedPlayerResults, setTrackedPlayerResults] = useState();
    const [trackedPlace, setTrackedPlace] = useState();
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

    let mycolumns1 = [
        // {
        //     Header: `Player`,
        //     columns: [
        //         {
        //             Header: 'Player',
        //             accessor: 'playername',
        //             Aggregated: ({ value }) => {isNullOrUndefined(value,"")}
        //             //Cell: ({value}) =>  <div>{value}</div>,
        //             //canGroupBy: true
        //         },
        //     ],
        // },
        {
            Header: 'Outcomes',
            columns: [
                {
                    Header: 'Player',
                    accessor: 'playername',
                    Aggregated: ({ value }) => {isNullOrUndefined(value,"")}
                    //Cell: ({value}) =>  <div>{value}</div>,
                    //canGroupBy: true
                },
                {
                    Header: 'Series Finish',
                    accessor: 'place',
                    aggregate: 'min',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: true
                },
                {
                    Header: 'Paths',
                    accessor: 'paths',
                    aggregate: 'sum',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Worst Finish',
                    accessor: 'maxgamefinish',
                    aggregate: 'max',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Best Finish',
                    accessor: 'mingamefinish',
                    aggregate: 'min',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Max Points',
                    accessor: 'maxpts',
                    aggregate: 'max',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(2)}</div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(2)}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Min Points',
                    accessor: 'minpts',
                    aggregate: 'min',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(2)}</div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(2)}</div>,
                    canGroupBy: false
                }
            ],
        },
    ];

    useEffect(() => {
        //init data
        (async () => {
            try {
                status.addToQueue();

                const loadedPoints = await getPointsInfo();
                console.log("points loaded =>", loadedPoints)
            
            } catch (error) {
                setError(error.message);
            } finally {
                status.removeFromQueue();
            }
        })();
    }, []);

    useEffect(() => {
        //init data
        if(playerIDs.length){
            (async () => {
                try {
                    status.addToQueue();

                    const loadedStandings = await getStandingsInfo();
                        
                    console.log("standings =>", loadedStandings)
                
                } catch (error) {
                    setError(error.message);
                } finally {
                    status.removeFromQueue();
                }
            })();
        }
    }, [playerIDs]);

    useEffect(() => {
        //init data
        if(playerIDs.length && standings != undefined){
            (async () => {
                try {
                    status.addToQueue();
                    const sc = Enumerable.from(playerIDs)
                        .select(id => id.shortcode)
                        .toArray();
                    const results = permute(sc);
                    const paths0 = scorePermutations(results);
                    summarizePaths(paths0);
                    console.log("standing enumerated");    
                
                } catch (error) {
                    setError(error.message);
                } finally {
                    status.removeFromQueue();
                }
            })();
        }
    }, [standings]);

    useEffect(() => {
        console.log("points =>", points);
    }, [points]);

    useEffect(() => {
        try {
            status.addToQueue();

            if (outcomeDetails0.length > 0) {
                if(pathFilters.length){
                    summarizePaths(outcomeDetails);
                } else {
                    summarizePaths(outcomeDetails0);
                }
            }

    } catch (error) {
        setError(error.message);
    } finally {
        status.removeFromQueue();
    }
    }, [pathFilters])

    useEffect(() => {
        console.log("points =>", points);
    }, [trackedPlayer]);

    async function getPlayerTrackingInfo(){
        try {
            status.addToQueue();

            if(trackedPlayer == "" || trackedPlayer == undefined) return;

            // find all paths where player finishes series in nth or better place
            // enumerate unique players that go out in all positions for player to
            //      achieve that finish

            let f0 = Enumerable.from(outcomeDetails)
                .where(f => f.player == trackedPlayer &&
                    f.place == trackedPlace)
                .select(r => ({order: r.order, place: r.place, game_place: r.game_place}))
                .toArray();

            if(f0.length == 0){
                let res = {
                    player: "No solutions.",
                    minfinish: "",
                    maxfinish: ""
                };
                setTrackedPlayerResults([res]);
                return;
            }

            // let finishes = Array(playerIDs.length);
            // for(let n = 0; n < playerIDs.length; n++) {
            //     finishes[n] = {id: playerIDs[n].shortcode, maxfinish: 0, minfinish: 0};
            // }

            // const players = {A:{min:0, max:0},  B:{min:0, max:0}, C:{min:0, max:0}, D:{min:0, max:0},
            //     E:{min:0, max:0}, F:{min:0, max:0}, G:{min:0, max:0}, H:{min:0, max:0}, I:{min:0, max:0}};
            const players = {A:{places: []},  B:{places: []}, C:{places: []}, D:{places: []},
                E:{places: []}, F:{places: []}, G:{places: []}, H:{places: []}, I:{places: []}};

            // for each player, find their max finish for tracked player to finish nth
            f0.forEach(p => {
                for(let n= 0; n < p.order.length; n++){
                    players[p.order[n]].places.push(n+1);
                }
            })

            let paths = [];
            Object.keys(players).map(o => {
                console.log(o);
                let finishes = {
                                player: playerIDs.find(id => id.shortcode == o).player.nickname,
                                minfinish: Math.min(...players[o].places),
                                maxfinish: Math.max(...players[o].places)
                            };
                paths.push(finishes);
            });

            // if(pathFilters.length == 0){
            //     paths = Enumerable.from(paths0)
            //         .orderByDescending(o => o.points)
            //         .groupBy(x => x.id)
            //         .selectMany((h, i) =>
            //             h.select((x, j) => ({ id: x.id, player: x.player, points: x.points, place: (j + 1), game_place: x.game_place, order: x.order })))
            //         .orderBy(o => o.id)
            //         .thenBy(o => o.place)
            //         .toArray();                
            // } else {
            //     paths = Enumerable.from(paths0)
            //         .join(Enumerable.from(f0),
            //             a => a.id,
            //             b => b.id,
            //             (a, b) => ({ ...a, ...b}))
            //         //.where(f => pathFilters.length == 0 || (Enumerable.from(f0).any(r => r.id == f.id)))
            //         .orderByDescending(o => o.points)
            //         .groupBy(x => x.id)
            //         .selectMany((h, i) =>
            //             h.select((x, j) => ({ id: x.id, player: x.player, points: x.points, place: (j + 1), game_place: x.game_place, order: x.order })))
            //         .orderBy(o => o.id)
            //         .thenBy(o => o.place)
            //         .toArray();
            // }
    
            // let summary = Enumerable.from(paths)
            //     //.select(x => ({...x, ...{playername: playerIDs.find(id => id.id == x.player).player.nickname}}))
            //     .groupBy(g => g.player + g.place)
            //     .select(r => ({ player: r.first().player,
            //                     playername: playerIDs.find(id => id.shortcode == r.first().player).player.nickname,
            //                     place: r.first().place,
            //                     paths: r.count(),
            //                     minpts: r.min(p => p.points),
            //                     maxpts: r.max(p => p.points),
            //                     maxgamefinish: r.max(p => p.game_place),
            //                     mingamefinish: r.min(p => p.game_place) }))
            //     .orderBy(o => o.player)
            //     .thenBy(o => o.place)
            //     .toArray();
    
            setTrackedPlayerResults(paths);
    
            console.log("Scoring permutations complete.");

        } catch (error) {
            setError(error.message);
        } finally {
            status.removeFromQueue();
        }
    }

    async function getStandingsInfo() {
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
        return true;
    }

    async function getPointsInfo() {
        let url = seasoninfosurl
            .replace(leaguetkn, league)
            .replaceAll(" ", sf)
            .replace(seasontkn, season);
        var res = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        let info = await res.json();
        setPoints(info.Points);
        getEncodedPlayers(info.Players);

        return true;
    }

    function getEncodedPlayers(playerIDs){
        //fromCharCode
        console.dir(leaguemembers);
        const i = 0;
        //const p = [];
        const pinfo = [];
        for(let n = 0; n < playerIDs.length; n++) {
            let char = String.fromCharCode(65 + n);
            pinfo.push({shortcode: char, player: leaguemembers.find(f => f.id == playerIDs[n])});
        }
        setPlayerIDs(pinfo);
        //setSelectedPlace(pinfo.length);
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
            }
        }
        return result;
    }

    function scorePermutations(results) {
        const paths = [];

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
        return paths;
    }

    function summarizePaths(paths0) {
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
    }

    function addPathsFilter() {
        if(selectedPlayer == "" || selectedPlayer == undefined) return;
        const filters = pathFilters.slice();
        if(filters && filters.length == playerIDs.length) return;
        const place = playerIDs.length - filters.length;
        filters.push({ player: selectedPlayer, place: place });
        setPathFilters(filters);
        document.getElementById('selectPlayer').selectedIndex = 0;
        setSelectedPlace(place);
    }

    async function resetOriginalPaths(){
        try {
            status.addToQueue();
            setPathFilters([]);
            //setSelectedPlace(playerIDs.length);
            //await getPlayerTrackingInfo();

        } catch (error) {
            setError(error.message);
        } finally {
            status.removeFromQueue();
        }
    }

    function isNullOrUndefined(value, replace){
        if(value == null || value == undefined || value == "")
            return replace;
        else
            return value;
    }

    return (
        <div>
            {outcomes &&
                <table className='pokertableboard'>
                    <tr>
                        <td>
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
                                    <td style={{"vertical-align": "top"}}>
                                        {outcomes &&
                                            <GroupedTable columns={mycolumns1} data={outcomes} />
                                        }
                                    </td>
                                    <td style={{"vertical-align": "top"}}>
                                        <table className='pokertableboard'>
                                            <tr>
                                                <td colSpan={2}>
                                                    <select id="selectPlayer" name="selectPlayer" defaultValue={{ label: "Select Player", value: "" }} onChange={(e) => setSelectedPlayer(e.currentTarget.value)}>
                                                        <option value={""}>Select Player</option>
                                                        {   playerIDs &&
                                                            Enumerable.from(playerIDs)
                                                            .where(f => pathFilters.length == 0 ||
                                                                ( pathFilters.length > 0 &&
                                                                !(Enumerable.from(pathFilters).any(p => p.player == f.shortcode))))
                                                            .toArray()
                                                            .map(o => {
                                                                return (
                                                                    <option value={`${o.shortcode}`}>{`(${o.shortcode}) ${o.player.nickname}`}</option>
                                                                )
                                                            })
                                                        }
                                                    </select>
                                                    {/* <input disabled={true} width={50} value={`${selectedPlace}`} /> */}
                                                    {/* <select onChange={(e) => setSelectedPlace(parseInt(e.currentTarget.value))}>
                                                        <option></option>
                                                        {   playerIDs &&
                                                            playerIDs.map((o, i) => {
                                                                return (
                                                                    <option value={i+1}>{i+1}</option>
                                                                )
                                                            })
                                                        }
                                                    </select> */}
                                                    <button onClick={() => addPathsFilter()}>Add Finish</button>
                                                    <button onClick={async () => await resetOriginalPaths()}>Remove Finishes</button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan={2}>Finished</td>
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
                                    <td style={{"vertical-align": "top"}}>
                                        <table className='pokertableboard'>
                                            <tr>
                                                <td colSpan={3}>
                                                    <select onChange={(e) => setTrackedPlayer(e.currentTarget.value)}>
                                                        <option></option>
                                                        {   playerIDs &&
                                                            playerIDs.map(o => {
                                                                return (
                                                                    <option value={`${o.shortcode}`}>{`(${o.shortcode}) ${o.player.nickname}`}</option>
                                                                )
                                                            })
                                                        }
                                                    </select>
                                                    <select onChange={(e) => setTrackedPlace(parseInt(e.currentTarget.value))}>
                                                        <option></option>
                                                        {   playerIDs &&
                                                            playerIDs.map((o, i) => {
                                                                return (
                                                                    <option value={i+1}>{i+1}</option>
                                                                )
                                                            })
                                                        }
                                                    </select>
                                                    <button onClick={() => getPlayerTrackingInfo()}>Track Results</button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan={3}>Series Finish Tracking for </td>
                                            </tr>
                                            <tr>
                                                <td colSpan={3}>
                                                {playerIDs.length > 0 &&
                                                    trackedPlayer &&
                                                    `${playerIDs.find(id => id.shortcode == trackedPlayer).player.nickname}`
                                                }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Player</td>
                                                <td>High Finish</td>
                                                <td>Low Finish</td>
                                            </tr>
                                                {   trackedPlayerResults &&
                                                    trackedPlayerResults.map(o => {
                                                        return (
                                                            <tr> {/* onClick={() => addPathsFilter(o.player, o.place)}> */}
                                                                <td>{`${o.player}`}</td>
                                                                <td>{`${o.minfinish}`}</td>
                                                                <td>{`${o.maxfinish}`}</td>
                                                            </tr>
                                                        )
                                                        console.log(o);
                                                    })
                                                }
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            }
            {error &&
                <div>Error: {error}</div>
            }
        </div>
    )
}