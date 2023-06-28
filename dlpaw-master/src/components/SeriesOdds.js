//import { permute } from '../HelperFunctions';
import React, { useState, useEffect } from "react";
import Enumerable from 'linq';
import GroupedTable from './GroupedTable';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import TreeView, { flattenTree } from "react-accessible-treeview";
import { FunctionSubscription } from "./FunctionSubscription";
//import "./styles.css";

export default function SeriesOdds({ token, league, season, leaguemembers, status }) {
    const [standings, setStandings] = useState();
    const [points, setPoints] = useState();
    const [seriesLength, setSeriesLength] = useState();
    const [dataTree, setDataTree] = useState([]);
    const [trackingMessage, setTrackingMessage] = useState([]);
    const [totalPaths, setTotalPaths] = useState([]);
    const [seriesGamesPlayed, setSeriesGamesPlayed] = useState();
    const [canUse, setCanUse] = useState(false);
    const [subCode, setSubCode] = useState();
    const [playerIDs, setPlayerIDs] = useState([]);
    const [standingsdetails, setStandingsdetails] = useState();
    const [error, setError] = useState();
    const pe = process.env;
    const standingsurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_STANDINGS_URL;
    const seasoninfosurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_SEASONINFO_URL;
    const leaguetkn = pe.REACT_APP_LEAGUE_TOKEN;
    const seasontkn = pe.REACT_APP_SEASON_TOKEN;
    const sf = pe.REACT_APP_SPACE_FILLER;

    /*** treeview **/
    const folder = {
        name: "",
        children: [
            {
                name: "B",
                children: [
                    {
                        name: "D",
                        children: [
                            {
                                name: "C"
                            }
                        ]
                    },
                    {
                        name: "C",
                        children: [
                            {
                                name: "A"
                            },
                            {
                                name: "D"
                            }
                        ]
                    }
                ],
            }
        ],
    };

    const data = flattenTree(folder);

    /*** treeview ****/

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
    const settterFunctions = [
        {name: setOutcomes, defaultValue: []}, //([]),
        {name: setOutcomeDetails0, defaultValue: []}, //([]),
        {name: setOutcomeDetails, defaultValue: []}, //([]),
        {name: setPlayerIDs, defaultValue: []}, //([]),
        {name: setSelectedPlayer, defaultValue: undefined}, //(undefined);
        {name: setTrackedPlayer, defaultValue: undefined}, //(undefined);
        {name: setTrackedPlayerResults, defaultValue: []}, //(undefined);
        {name: setTrackedPlace, defaultValue: undefined}, //(undefined);
        {name: setSelectedPlace, defaultValue: undefined}, //(undefined);
        {name: setPathFilters, defaultValue: []}, //(undefined);
        {name: setStandings, defaultValue: []}, //(undefined);
        {name: setPoints, defaultValue: []}, //(undefined);
        {name: setSeriesLength, defaultValue: undefined}, //(undefined);
        {name: setDataTree, defaultValue: []}, //(undefined);
        {name: setSeriesGamesPlayed, defaultValue: undefined}, //(undefined);
        {name: setStandingsdetails, defaultValue: []}, //(undefined);
        {name: setTotalPaths, defaultValue: undefined}
    ];

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
            Header: `${season} Series Outcomes Contingent on Game ${seriesGamesPlayed + 1} Finishes`,
            columns: [
                {
                    Header: 'Player',
                    accessor: 'playername',
                    Aggregated: ({ value }) => { isNullOrUndefined(value, "") }
                    //Cell: ({value}) =>  <div>{value}</div>,
                    //canGroupBy: true
                },
                {
                    Header: 'Series Finish',
                    accessor: 'place',
                    aggregate: 'min',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    Cell: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: true
                },
                {
                    Header: 'Paths',
                    accessor: 'paths',
                    aggregate: 'sum',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    Cell: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Paths(%)',
                    accessor: 'paths_pct',
                    aggregate: 'sum',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(0)}</div>,
                    Cell: ({ value }) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(2)}</div>,
                    canGroupBy: false
                },
                {
                    Header: `${season}G${seriesGamesPlayed + 1}\nWorst Finish`,
                    accessor: 'maxgamefinish',
                    aggregate: 'max',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    Cell: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                },
                {
                    Header: `${season}G${seriesGamesPlayed + 1}\nBest Finish`,
                    accessor: 'mingamefinish',
                    aggregate: 'min',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    Cell: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Current Points',
                    accessor: 'currentpts',
                    aggregate: 'max',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(2)}</div>,
                    Cell: ({ value }) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(2)}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Max Points',
                    accessor: 'maxpts',
                    aggregate: 'max',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(2)}</div>,
                    Cell: ({ value }) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(2)}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Min Points',
                    accessor: 'minpts',
                    aggregate: 'min',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(2)}</div>,
                    Cell: ({ value }) => <div style={{ textAlign: "right" }}>{parseFloat(value).toFixed(2)}</div>,
                    canGroupBy: false
                }
            ],
        },
    ];
 
    // useEffect(() => {
    //     //init data
        
    // }, []);

    useEffect(() => {
        //init 
        if(season == undefined) return;
        
        (async () => {
            try {
                status.addToQueue();

                resetComponent();

                const loadedPoints = await getPointsInfo();
                console.log("points loaded =>", loadedPoints)

            } catch (error) {
                setError(error.message);
            } finally {
                status.removeFromQueue();
            }
        })();
    }, [season]);

    useEffect(() => {
        //init data
        if (playerIDs.length) {
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
        if (playerIDs.length && standings != undefined) {
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

        status.addToQueue();
        
            setTimeout(() => {
                console.log("waiting...");

                try {
                

                        console.log("waiting...");

                        if (outcomeDetails0.length > 0) {
                            if (pathFilters.length) {
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

            }, 3000);


        // try {
        //     status.addToQueue();

        //         console.log("waiting...");

        //         if (outcomeDetails0.length > 0) {
        //             if (pathFilters.length) {
        //                 summarizePaths(outcomeDetails);
        //             } else {
        //                 summarizePaths(outcomeDetails0);
        //             }
        //         }
            
        // } catch (error) {
        //     setError(error.message);
        // } finally {
        //     status.removeFromQueue();
        // }

    }, [pathFilters])

    useEffect(() => {
        console.log("points =>", points);
    }, [trackedPlayer]);

    function resetComponent(){
        settterFunctions.forEach(f => {
            f.name(f.defaultValue);
        })
    }

    function placementSuffix(num){
        if(!Number.isInteger(num)) return "";
        const ns = num.toString();
        const char = ns[ns.length-1];
        let retval = "";

        switch (char){
            case "1":
                retval = "st";
                break;
            case "2":
                retval = "nd";
                break;
            case "3":
                retval = "rd";
                break;
            default:
                retval = "th";
                break;
        }
        return retval;
    }

    async function getPlayerTrackingInfo() {
        status.addToQueue();
        
            setTimeout(() => {
                console.log("waiting...");

                try {
                

                        console.log("waiting...");



//////
try {
    //status.addToQueue();

    setTrackingMessage("");

    if (trackedPlayer == "" || trackedPlayer == undefined) return;

    let f0 = Enumerable.from(outcomeDetails)
        .where(f => f.player == trackedPlayer &&
            f.place == trackedPlace)
        .select(r => ({ order: r.order, place: r.place, game_place: r.game_place }))
        .toArray();

    if (f0.length == 0) {
        let res = {
            player: "No solutions.",
            minfinish: "",
            maxfinish: ""
        };
        setTrackedPlayerResults([res]);
        return;
    }

    const mypaths = Enumerable.from(f0).select(r => r.order).toArray();

    let level1 = Enumerable.from(mypaths)
        .select(r => ({ value: r[playerIDs.length-1] }))
        .groupBy(r => r.value)
        .select(r => ({ value: r.first().value, count: r.count() }))
        .toArray();

    const mytree = { name: "", children: [] };
    function getChildren(values, level, parent) {
        const res = Enumerable.from(values)
            .where(r => r.count > 4000)
            .toArray()
        if(res.length > 0){
            setTrackingMessage("Too many paths for tree processing. Eliminate player(s).")
            return parent;
        }

        values.forEach(v => {
            if (values.length > 0 && level >= 0) {
                let level1 = Enumerable.from(mypaths)
                    .where(w => w.substring(level) == v.value)
                    .select(r => ({ value: r.substring(level - 1) }))
                    .groupBy(r => r.value)
                    .select(r => ({ value: r.first().value, count: r.count() }))
                    .toArray();

                const child = { name: `${(level + 1)}${placementSuffix(level + 1)} - ${playerIDs.find(id => id.shortcode == v.value.substring(0,1)).player.nickname}, Paths: ${v.count}, Encoding: (${v.value})`, children: [] }
                parent.children.push(child);
                getChildren(level1, level - 1, child)
            }
        })
    }

    getChildren(level1, playerIDs.length-1, mytree);
    const data = flattenTree(mytree);
    setDataTree(data);

    const players = {
        A: { places: [] }, B: { places: [] }, C: { places: [] }, D: { places: [] },
        E: { places: [] }, F: { places: [] }, G: { places: [] }, H: { places: [] }, I: { places: [] },
        J: { places: [] }
    };

    // for each player, find their max finish for tracked player to finish nth
    f0.forEach(p => {
        for (let n = 0; n < p.order.length; n++) {
            players[p.order[n]].places.push(n + 1);
        }
    })

    let paths = [];
    let count = 0;
    Object.keys(players).every(o => {
        //console.log(o);
        let finishes = {
            player: playerIDs.find(id => id.shortcode == o).player.nickname,
            minfinish: Math.min(...players[o].places),
            maxfinish: Math.max(...players[o].places)
        };
        paths.push(finishes);
        count++;
        if (count == playerIDs.length) return false;
        return true;
    });

    paths = Enumerable.from(paths)
        .orderBy(o => o.player)
        .toArray();

    setTrackedPlayerResults(paths);

    console.log("Scoring permutations complete.");

} catch (error) {
    setError(error.message);
} finally {
    status.removeFromQueue();
    return 0;
}

/////


                    
                } catch (error) {
                    setError(error.message);
                } finally {
                    status.removeFromQueue();
                }

            }, 3000);

        
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
            .select(r => ({
                player: r.Player,
                shortcode: playerIDs.find(id => id.player.mavens_login == r.Player).shortcode,
                points: parseFloat(r.Pts),
                gold: r.Gold,
                silver: r.Silver,
                bronze: r.Bronze,
                paths: new Array(playerIDs.length)
            }))
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
        setSeriesLength(info.SeriesLength);
        setSeriesGamesPlayed(info.GameCount);
        getEncodedPlayers(info.Players);

        return true;
    }

    function getEncodedPlayers(playerIDs) {
        //fromCharCode
        console.dir(leaguemembers);
        const i = 0;
        //const p = [];
        const pinfo = [];
        for (let n = 0; n < playerIDs.length; n++) {
            let char = String.fromCharCode(65 + n);
            pinfo.push({ shortcode: char, player: leaguemembers.find(f => f.id == playerIDs[n]) });
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

    function factorial(num) {
        var result = num;
        if (num === 0 || num === 1)
            return 1;
        while (num > 1) {
            num--;
            result *= num;
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
        const pathCount = factorial(playerIDs.length - pathFilters.length);

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
        if (pathFilters.length == 0) {
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
                    (a, b) => ({ ...a, ...b }))
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
            .select(r => ({
                player: r.first().player,
                playername: playerIDs.find(id => id.shortcode == r.first().player).player.nickname,
                place: r.first().place,
                paths: r.count(),
                paths_pct: parseFloat(((parseFloat(r.count()) / parseFloat(pathCount))*100.).toFixed(2)),
                currentpts: standings.find(f => f.shortcode == r.first().player).points.toFixed(2),
                minpts: r.min(p => p.points),
                maxpts: r.max(p => p.points),
                maxgamefinish: r.max(p => p.game_place),
                mingamefinish: r.min(p => p.game_place)
            }))
            .orderBy(o => o.playername)
            .thenBy(o => o.place)
            .toArray();

        if (outcomeDetails0.length == 0) setOutcomeDetails0(paths);
        setOutcomeDetails(paths);
        setOutcomes(summary);
        setTotalPaths(pathCount);

        // localStorage.setItem(`${season}summary`, JSON.stringify(summary));
        // localStorage.setItem(`${season}paths`, JSON.stringify(paths));
        // localStorage.setItem(`${season}pathCount`, JSON.stringify(pathCount));

        console.log("Scoring permutations complete.");
    }

    function addPathsFilter() {
        if (selectedPlayer == "" || selectedPlayer == undefined) return;
        const filters = pathFilters.slice();
        if (filters && filters.length == playerIDs.length) return;
        if (filters && filters.filter(f => f.player == selectedPlayer).length) return;
        const place = playerIDs.length - filters.length;
        filters.push({ player: selectedPlayer, place: place });
        setPathFilters(filters);
        document.getElementById('selectPlayer').selectedIndex = 0;
        setSelectedPlace(place);
    }

    async function resetOriginalPaths() {
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

    function isNullOrUndefined(value, replace) {
        if (value == null || value == undefined || value == "")
            return replace;
        else
            return value;
    }

    // function isSubscribed(){
    //     let sum = 0;
    //     if(subCode){
    //         [...subCode].forEach(l => {
    //             sum += l.charCodeAt(0);
    //         })
    //     }
    //     return sum == 304;
    // }

    return (
        <div>
            <FunctionSubscription>
                <>
                    {outcomes &&
                        <Tabs>
                            <TabList>
                                <Tab>Paths to Victory</Tab>
                                <Tab>Eliminations</Tab>
                                <Tab>Player Result Tracking</Tab>
                            </TabList>

                            <TabPanel>
                                {outcomes &&
                                    <GroupedTable columns={mycolumns1} data={outcomes} />
                                }
                            </TabPanel>
                            <TabPanel>
                                <table className='pokertableboard'>
                                    <tr style={{backgroundColor: "gainsboro", color: "blue", fontWeight: "bold"}}>
                                        <td colSpan={2}>{`Enter game G${seriesGamesPlayed + 1} eliminations below.`}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>
                                            <select id="selectPlayer" name="selectPlayer" defaultValue={{ label: "Select Player", value: "" }} onChange={(e) => setSelectedPlayer(e.currentTarget.value)}>
                                                <option value={""}>Select Player</option>
                                                {playerIDs &&
                                                    Enumerable.from(playerIDs)
                                                        .where(f => pathFilters.length == 0 ||
                                                            (pathFilters.length > 0 &&
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
                                    <tr style={{backgroundColor: "blue", color: "white", fontWeight: "bold"}}>
                                        <td colSpan={2}>Finished</td>
                                    </tr>
                                    <tr>
                                        <td style={{backgroundColor: "gray", color: "blue", fontWeight: "bold"}}>Player</td>
                                        <td style={{backgroundColor: "gray", color: "blue", fontWeight: "bold"}}>Place</td>
                                    </tr>
                                    {
                                        pathFilters.map((o, i) => {
                                            let style1 = {backgroundColor: "white", color: "blue", fontWeight: "bold"};
                                            let style2 = {backgroundColor: "gainsboro", color: "blue", fontWeight: "bold"};
                                            let selstyle = i%2==0? style1: style2;
                                            return (
                                                <tr style={selstyle}> {/* onClick={() => addPathsFilter(o.player, o.place)}> */}
                                                    <td>{`${playerIDs.find(id => id.shortcode == o.player).player.nickname}`}</td>
                                                    <td>{`${o.place}`}</td>
                                                </tr>
                                            )
                                            console.log(o);
                                        })
                                    }
                                </table>
                            </TabPanel>
                            <TabPanel>
                                <table className='pokertableboard'>
                                    <tr>
                                        <td colSpan={3}>
                                            <select onChange={(e) => setTrackedPlayer(e.currentTarget.value)}>
                                                <option></option>
                                                {playerIDs &&
                                                    playerIDs.map(o => {
                                                        return (
                                                            <option value={`${o.shortcode}`}>{`(${o.shortcode}) ${o.player.nickname}`}</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                            <select onChange={(e) => setTrackedPlace(parseInt(e.currentTarget.value))}>
                                                <option></option>
                                                {playerIDs &&
                                                    playerIDs.map((o, i) => {
                                                        return (
                                                            <option value={i + 1}>{i + 1}</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                            <button onClick={async () => {
                                                    status.addToQueue();
                                                    const res = await getPlayerTrackingInfo();
                                                    console.log("getPlayerTrackingInfo", res);
                                                    status.removeFromQueue();
                                                    }}>Track Results</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{verticalAlign: "top"}}>
                                            <table className='pokertableboard'>
                                                <tr>
                                                    <td style={{backgroundColor: "blue", color: "white", fontWeight: "bold"}} colSpan={3}>Series Finish Tracking</td>
                                                </tr>
                                                <tr style={{backgroundColor: "gainsboro", color: "blue", fontWeight: "bold"}}>
                                                    <td colSpan={3}>
                                                        {playerIDs.length > 0 &&
                                                            trackedPlayer &&
                                                            `${playerIDs.find(id => id.shortcode == trackedPlayer).player.nickname}
                                                            needs the following G${seriesGamesPlayed + 1} results to finish the
                                                            series in ${trackedPlace}${placementSuffix(trackedPlace)}.`
                                                        }
                                                    </td>
                                                </tr>
                                                <tr style={{backgroundColor: "blue", color: "white", fontWeight: "bold"}}>
                                                    <td>Player</td>
                                                    <td>Best Finish</td>
                                                    <td>Worst Finish</td>
                                                </tr>
                                                {trackedPlayerResults &&
                                                    trackedPlayerResults.map((o, i) => {
                                                        let style1 = {backgroundColor: "white", color: "blue", fontWeight: "bold"};
                                                        let style2 = {backgroundColor: "gainsboro", color: "blue", fontWeight: "bold"};
                                                        let selstyle = i%2==0? style1: style2;
                                                        return (
                                                            <tr> {/* onClick={() => addPathsFilter(o.player, o.place)}> */}
                                                                <td style={selstyle}>{`${o.player}`}</td>
                                                                <td style={selstyle}>{`${o.minfinish}${placementSuffix(o.minfinish)}`}</td>
                                                                <td style={selstyle}>{`${o.maxfinish}${placementSuffix(o.maxfinish)}`}</td>
                                                            </tr>
                                                        )
                                                        console.log(o);
                                                    })
                                                }
                                            </table>
                                        </td>
                                        <td style={{verticalAlign: "top"}}>
                                            {  
                                                (dataTree.length > 0) &&
                                                trackedPlayer &&
                                                trackedPlace &&
                                                <table className='pokertableboard'>
                                                    <tr style={{backgroundColor: "gainsboro", color: "blue", fontWeight: "bold"}}>
                                                        <td>
                                                            {   (playerIDs.length > 0) &&
                                                                trackedPlayer &&
                                                                trackedPlace &&
                                                                `G${seriesGamesPlayed + 1} Paths to a ${trackedPlace}${placementSuffix(trackedPlace)} place ${season} finish for ${playerIDs.find(id => id.shortcode == trackedPlayer).player.nickname}.`
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <TreeView
                                                                    data={dataTree}
                                                                    className="basic"
                                                                    aria-label="basic example tree"
                                                                    nodeRenderer={({ element, getNodeProps, level, handleSelect }) => (
                                                                        <div {...getNodeProps()} style={{ paddingLeft: 20 * (level - 1) }}>
                                                                            {element.name}
                                                                        </div>
                                                                    )}
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            {
                                                                trackingMessage &&
                                                                    <span style={{backgroundColor: "white", color: "blue", fontWeight: "bold"}}>{trackingMessage}</span>
                                                            }
                                                        </td>
                                                    </tr>
                                                </table>
                                            }
                                                    </td>
                                    </tr>
                                </table>
                            </TabPanel>
                        </Tabs>
                    }
                    {error &&
                        <div>Error: {error}</div>
                    }
                </>
            </FunctionSubscription>
        </div>
    )
}