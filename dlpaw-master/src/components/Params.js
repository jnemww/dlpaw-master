import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';
import ProfitSummary from './ProfitSummary';
import Standings from './Standings';
import PlayFrequencies from './PlayFrequencies';
import HandQuery from './HandQuery';
import Table from './Table';
import { SCREEN, PARAMETERS, menu } from '../enums'
import { LoadingSpinner } from "./Spinner2";
import GameScheduler from './GameScheduler';
import SignIn from './Auth/SignIn';
import AuthDetails from './Auth/AuthDetails';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import ChipCountGraph from './ChipCountGraph';

export default function Params() {
    //user data
    const [leaguemembers, setLeaguemembers] = useState(null);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    //const [seasons, setSeasons] = useState(null);

    //drop down parameter values
    const [seasonitems, setSeasonitems] = useState(null);
    const [gameitems, setGameitems] = useState(null);
    const [handitems, setHanditems] = useState(null);
    const [orighanditems, setOrighanditems] = useState(null);
    const [queryhanditems, setQueryhanditems] = useState(null);

    //selected parameter values
    const [selectedgame, setSelectedgame] = useState(null);
    const [selectedseason, setSelectedseason] = useState(null);
    const [selectedgamedata, setSelectedgamedata] = useState(null);
    const [selectedhand, setSelectedhand] = useState(null);

    //loaded game data
    const [seasongamedata, setSeasongamedata] = useState(null);

    //app data
    const [screen, setScreen] = useState(null);
    const [processing, setProcessing] = useState(false);
    const pe = process.env;
    const league = pe.REACT_APP_LEAGUE;
    const seasonslisturl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_DS_URL_SEASONS_LIST;
    const gameslisturl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_DS_URL_SEASON_GAMES_LIST;
    const allgamesurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_ALL_GAMES_URL;
    const snglgamesurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_SINGLE_GAME_URL;
    const leaguetkn = pe.REACT_APP_LEAGUE_TOKEN;
    const seasontkn = pe.REACT_APP_SEASON_TOKEN;
    const gametkn = pe.REACT_APP_GAME_TOKEN;
    const sf = pe.REACT_APP_SPACE_FILLER;
    const options = menu;
    const defaultOption = options[0];
    const [screenstack, setScreenstack] = useState([]);
    //const [paramvisibiity, setParamvisibiity] = useState(Object.keys(PARAMETERS).map((i) => ({ ...{ i }, visible: false })));

    const setParameterFunctions = [
        //setSeasonitems,
        setGameitems,
        setHanditems,
        setOrighanditems,
        setQueryhanditems,
        setSelectedseason,
        setSelectedgame,
        setSelectedhand,
        setSelectedgamedata
    ];

    useEffect(() => {
        let s = screenstack;
        s.push(screen);
        setScreenstack(s);
        console.log("Screen => ", screen);
        console.dir(screenstack);
    }, [screen]);

    //load seasons
    useEffect(() => {
        if (token == null)
            return;

        console.log("Mounting seasons...");

        (async () => {
            setProcessing(true);
            let url = seasonslisturl
                .replace(leaguetkn, league)
                .replaceAll(" ", sf);;
            var res = await fetch(url, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            var data = await res.json();
            //setSeasons(data);

            let list = [];
            list.push(<option value={null}>Select a Season</option>)
            data.forEach(s => {
                //let selected = (s.id == selectedseason)?"selected":"";
                list.push(<option value={s.id}>{s.id}</option>)
            });
            setSeasonitems(list);
            setProcessing(false);
        })();

        setHanditems(null);
        setQueryhanditems(null);
        setSelectedgame(null);
        setSelectedhand(null);
    }, [token]);

    //selected new season, now get games
    useEffect(() => {
        if (selectedseason == null) {
            return;
        }

        (async () => {
            if (selectedseason == null ||
                league == null ||
                token == null) return;
            setProcessing(true);
            let url = gameslisturl.replace(leaguetkn, league)
                .replace(seasontkn, selectedseason);
            let res = await fetch(url, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            let data = await res.json();

            let list = [];
            list.push(<option value="">Select a Game</option>)
            Enumerable.from(data)
                .orderBy(x => x.id.length)
                .thenBy(x => x.id)
                .toArray()
                .forEach(s => {
                    list.push(<option value={s.id}>{s.id}</option>)
                });
            setGameitems(list);
            setProcessing(false);
        })();

        setQueryhanditems(null);
        setHanditems(null);
        setSelectedgame(null);
        setSelectedhand(null);
    }, [selectedseason]);

    //selected new game, now get hands
    useEffect(() => {
        if (selectedseason == null || selectedgame == null) {
            setSelectedgame(null);
            return;
        }

        (async () => {
            setProcessing(true);
            let url = snglgamesurl.replace(leaguetkn, league)
                .replace(seasontkn, selectedseason)
                .replace(gametkn, selectedgame);
            let res = await fetch(url, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            let data = await res.json();
            setSelectedgamedata(data);

            let list = [];
            list.push(<option value="">Select a Hand</option>)
            data.hands.forEach(h => {
                list.push(<option value={JSON.stringify(h)}>{h.handID + ": (" + h.blind_small + "/" + h.blind_big + "/" + h.ante + ")"}</option>)
            });
            setHanditems(list);
            setOrighanditems(list);
            setProcessing(false);
        })();
    }, [selectedgame]);

    //set hand dropdown query items
    useEffect(() => {
        if (queryhanditems == null) return;
        console.log("Processing query results.");
        let list = [];
        list.push(<option value="">Select a Hand</option>)
        queryhanditems.forEach(h => {
            list.push(<option value={JSON.stringify(h)}>{h.handID + ": (" + h.blind_small + "/" + h.blind_big + "/" + h.ante + ")"}</option>)
        });
        setHanditems(list);
        setSelectedhand(JSON.stringify(queryhanditems[0]));
        setScreen(SCREEN.Table);
    }, [queryhanditems]);

    function RefreshHands() {
        setHanditems(orighanditems);
    }

    function getSeasonGameData() {
        if (selectedseason !== null) {
            (async () => {
                setProcessing(true);
                let url = allgamesurl.replace(leaguetkn, league)
                    .replace(seasontkn, selectedseason);
                let res = await fetch(url, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                let list = await res.json();

                setSeasongamedata(list);
                setProcessing(false);
            })();
        }
    }

    function ScrollBack() {
        if (document.getElementById('selhand').selectedIndex > 1)
            document.getElementById('selhand').selectedIndex -= 1;
        setSelectedhand(document.getElementById('selhand').value);
    }

    function ScrollFwd() {
        if (document.getElementById('selhand').selectedIndex < document.getElementById('selhand').length - 1)
            document.getElementById('selhand').selectedIndex += 1;
        setSelectedhand(document.getElementById('selhand').value);
    }

    function isVisible(parameter, screen) {
        try {
            let p = Enumerable.from(options)
                .selectMany(o => o.items)
                .where(itm => itm.value == screen && 
                    Enumerable.from(itm.params).any(p => p == parameter))
                .select(p => p.params)
                .toArray()[0];

            if (p == undefined || p.length == 0) return false;

            return true;
        }
        catch (error) {
            return false;
        }
    }

    function changeScreen(e) {
        ResetParameters();
        setScreen(e.value);
        
    //     if (reset) ResetParameters();

    //     //setScreen(e.value);

    //     //document.getElementById('selseason').selectedIndex = 0;

    //     let p = Enumerable.from(options)
    //         .selectMany(o => o.items)
    //         .where(itm => itm.value == e)//e.value)
    //         .select(p => p.params)
    //         .toArray()[0];

    //     if (p == undefined || p.length == 0) return;

    //     let params = paramvisibiity;
    //     params.forEach(pm => {
    //         pm.visible = false;
    //         if (p.find(pv => pv.i == pm))
    //             pm.visible = true;
    //     });

    //     // p.forEach(v => {
    //     //     if(params.find(p => p.i == v)){
    //     //         params.find(p => p.i == v).visible = true;
    //     //     }else{
    //     //         params.find(p => p.i == v).visible = false;
    //     //     }
    //     // });
    //     setParamvisibiity(params);
    //     console.log(p);
    //     //return 0;
    }

    function ResetParameters() {
        setParameterFunctions.forEach(f => {
            f(undefined);
        });
        
        if(document.getElementById('selseason'))
            document.getElementById('selseason').selectedIndex = 0;
        console.log("Params reset.");
    }

    return (
        <div>
            {!user &&
                <div>
                    <SignIn setToken={setToken} setUser={setUser} setLeaguemembers={setLeaguemembers} />
                    {/* <AuthDetails setUser={setUser} /> */}
                </div>
            }
            {user &&
                <div>
                    <table className='menu'>
                        <tbody>
                            <tr>
                                <td>
                                    <Dropdown options={options} onChange={(e) => { changeScreen(e) }} value={defaultOption} placeholder="Select an option" />
                                    {/* <Dropdown options={options} onChange={(e) => { printmenuitem(e, options, paramvisibiity) }} value={defaultOption} placeholder="Select an option" /> */}
                                </td>
                                <td>
                                    <span className='navpath'>{screen} {selectedseason && `/ Season: ${selectedseason}`} {selectedgame && `/ Game: ${selectedgame}`}</span>
                                </td>
                                <td rowSpan={2} align="right"><AuthDetails setUser={setUser} userimageref={leaguemembers.find(p => p.email == user).url} /></td>
                            </tr>
                        </tbody>
                    </table>
                    {(screen === SCREEN.Frequency ||
                        screen === SCREEN.Table ||
                        screen === SCREEN.ProfitSummary ||
                        screen === SCREEN.Games ||
                        screen === SCREEN.Standings ||
                        screen === SCREEN.HandQuery ||
                        screen === SCREEN.ChipCountChart) &&
                        <div>
                            {(screenstack.length > 2) && <img onClick={() => setScreen(screenstack[screenstack.length - 2])} height={20} src='./images/back.png' />}
                            <table className='pokertableboard'>
                                <tbody>
                                    {/* <tr>
                                        <td>
                                            {screen}: {selectedseason}, Game: {selectedgame}
                                        </td>
                                    </tr> */}
                                    {isVisible(PARAMETERS.SEASON, screen) &&
                                        <tr>
                                            <td>
                                                <select id="selseason" onChange={(e) => { setSelectedseason(e.target.value) }} defaultValue={selectedseason}>{seasonitems}</select>
                                            </td>
                                        </tr>
                                    }

                                    {isVisible(PARAMETERS.GAME, screen) &&
                                        <tr>
                                            <td>
                                                <select onChange={(e) => setSelectedgame(e.target.value)} defaultValue={selectedgame}>{gameitems}</select>
                                                <button onClick={RefreshHands}>Clear Filter</button>
                                            </td>
                                        </tr>
                                    }

                                    {isVisible(PARAMETERS.HAND, screen) &&
                                        <tr>
                                            <td>
                                                <button onClick={ScrollBack}>&lt;&lt;</button>
                                                <select id="selhand" defaultValue={selectedhand} onChange={(e) => setSelectedhand(e.target.value)}>{handitems}</select>
                                                <button onClick={ScrollFwd}>&gt;&gt;</button>
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    }
                    {user &&
                        processing &&
                        <div style={{ textAlign: "center" }}>
                            <LoadingSpinner url={leaguemembers.find(p => p.email == user).url} />
                        </div>
                    }
                    <div>
                        {screen === SCREEN.Table &&
                            <div>
                                {/* {(screenstack[screenstack.length - 1] === SCREEN.ProfitSummary ||
                                    screenstack[screenstack.length - 1] === SCREEN.HandQuery)
                                && <button onClick={() => setScreen(screenstack[screenstack.length - 1])}>Back</button>} */}
                                {selectedhand &&
                                    <Table
                                        currenthand={selectedhand}
                                        leaguemembers={leaguemembers} />}
                            </div>
                        }
                        {screen === SCREEN.ProfitSummary &&
                            selectedgamedata &&
                            <div>
                                <ProfitSummary
                                    gamedata={selectedgamedata}
                                    status={setProcessing}
                                    setQueryhanditems={setQueryhanditems}
                                    leaguemembers={leaguemembers} />
                            </div>
                        }
                        {screen === SCREEN.Standings &&
                            <div>
                                {selectedseason &&
                                    <Standings
                                        games={seasongamedata}
                                        season={selectedseason}
                                        status={setProcessing}
                                        leaguemembers={leaguemembers}
                                        getSeasonGameData={getSeasonGameData} />}
                            </div>
                        }
                        {screen === SCREEN.Frequency &&
                            <div>
                                {selectedgamedata &&
                                    <PlayFrequencies
                                        gamedata={selectedgamedata}
                                        status={setProcessing}
                                        leaguemembers={leaguemembers} />}
                            </div>
                        }
                        {screen === SCREEN.HandQuery &&
                            <div>
                                {selectedgamedata &&
                                    <HandQuery
                                        gamedata={selectedgamedata}
                                        setQueryhanditems={setQueryhanditems}
                                        leaguemembers={leaguemembers} />}
                            </div>
                        }
                        {screen === SCREEN.GameScheduler &&
                            <div>
                                <GameScheduler
                                    username={user}
                                    usertoken={token}
                                    setProcessing={setProcessing}
                                    leaguemembers={leaguemembers} />
                            </div>
                        }
                        {screen === SCREEN.ChipCountChart &&
                            <div>
                                {selectedgamedata &&
                                    <ChipCountGraph
                                        selectedseason={selectedseason}
                                        selectedgame={selectedgame}
                                        gamedata={selectedgamedata}
                                        status={setProcessing}
                                        leaguemembers={leaguemembers}
                                        setQueryhanditems={setQueryhanditems}
                                        setScreen={setScreen} />}
                            </div>
                        }
                    </div>
                </div>
            }


        </div>
    );
}