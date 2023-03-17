//import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';
import ProfitSummary from './ProfitSummary';
import Standings from './Standings';
import PlayFrequencies from './PlayFrequencies';
import HandQuery from './HandQuery';
import Table from './Table';
import { SCREEN } from '../enums'
import { LoadingSpinner } from "./Spinner";
import GameScheduler from './GameScheduler';
import SignIn from './Auth/SignIn';
import AuthDetails from './Auth/AuthDetails';

export default function Params() {
    const [user, setUser] = useState(null);
    const [tokens, setTokens] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [seasons, setSeasons] = useState(null);
    const [seasonitems, setSeasonitems] = useState(null);
    const [gameitems, setGameitems] = useState(null);
    const [handitems, setHanditems] = useState(null);
    const [selectedgame, setSelectedgame] = useState(null);
    const [selectedseason, setSelectedseason] = useState(null);
    const [selectedgamedata, setSelectedgamedata] = useState(null);
    const [selectedhand, setSelectedhand] = useState(null);
    const [seasongamedata, setSeasongamedata] = useState(null);
    const [screen, setScreen] = useState(null);
    const [queryhanditems, setQueryhanditems] = useState(null);
    const [token, setToken] = useState(null);
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
            setSeasons(data);

            let list = [];
            list.push(<option value="">Select a Season</option>)
            data.forEach(s => {
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
            setProcessing(true);
            let url = gameslisturl.replace(leaguetkn, league)
                .replace(seasontkn, selectedseason);
            let res = await fetch(url, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            let data = await res.json();

            let list = [];
            list.push(<option value="">Select a Game</option>)
            data.forEach(s => {
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
            setProcessing(false);
        })();
    }, [selectedgame]);

    useEffect(() => {
        if (queryhanditems == null) return;
        console.log("Processing query results.");
        let list = [];
        list.push(<option value="">Select a Hand</option>)
        queryhanditems.forEach(h => {
            list.push(<option value={JSON.stringify(h)}>{h.handID + ": (" + h.blind_small + "/" + h.blind_big + ")"}</option>)
        });
        setHanditems(list);
        setSelectedhand(JSON.stringify(queryhanditems[0]));
        setScreen(SCREEN.Table);
    }, [queryhanditems]);

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

    return (
        <div>
            {!user &&
                <div>
                    <SignIn setToken={setToken} />
                    {/* <SignUp /> */}
                    <AuthDetails setUser={setUser} />
                    {/* <Login setUser={setUser} setTokens={setTokens} /> */}
                </div>
            }
            {user &&
                <div>
                    <div>
                        <table className='menu'>
                            <tr>
                                <td className='rightborder' onClick={() => setScreen(SCREEN.Table)}>Game Review</td>
                                <td className='rightborder' onClick={() => setScreen(SCREEN.Standings)}>Standings</td>
                                <td className='rightborder' onClick={() => setScreen(SCREEN.Frequency)}>Frequencies</td>
                                <td className='rightborder' onClick={() => setScreen(SCREEN.ProfitSummary)}>Profit Summary</td>
                            </tr>
                            <tr>
                                <td className='rightborder' onClick={() => setScreen(SCREEN.HandQuery)}>Find Hands</td>
                                <td className='rightborder' onClick={() => setScreen(SCREEN.GameScheduler)}>Schedule</td>
                                <td className='rightborder'></td>
                                <td className='rightborder'><AuthDetails setUser={setUser} /></td>
                            </tr>
                            {/* <tr>
                                <td colSpan={4}>{token}</td>
                            </tr> */}
                        </table>
                    </div>
                    {(screen === SCREEN.Frequency ||
                        screen === SCREEN.Table ||
                        screen === SCREEN.ProfitSummary ||
                        screen === SCREEN.Games ||
                        screen === SCREEN.Standings ||
                        screen === SCREEN.HandQuery) &&
                        <div>
                            <table className='pokertableboard'>
                                <tr>
                                    <td>
                                        {screen}: {selectedseason}, Game: {selectedgame}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <select onChange={(e) => { setSelectedseason(e.target.value) }}>{seasonitems}</select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <select onChange={(e) => setSelectedgame(e.target.value)}>{gameitems}</select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <button onClick={ScrollBack}>&lt;&lt;</button>
                                        <select id="selhand" onChange={(e) => setSelectedhand(e.target.value)}>{handitems}</select>
                                        <button onClick={ScrollFwd}>&gt;&gt;</button>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    }
                    {user &&
                        processing &&
                        <div style={{textAlign:"center"}}>
                            <LoadingSpinner />
                            <span className='processing'>Processing...</span>
                        </div>
                    }
                    <div>
                        {screen === SCREEN.Table &&
                            <div>
                                {selectedhand && <Table currenthand={selectedhand} />}
                            </div>
                        }
                        {screen === SCREEN.ProfitSummary &&
                            selectedgamedata &&
                            <div>
                                Click on hand type description to drill into individual hands for the group.
                                <ProfitSummary gamedata={selectedgamedata} status={setProcessing} setQueryhanditems={setQueryhanditems} />
                                {/* {queryhanditems && <Table currenthand={selectedhand} />} */}
                            </div>
                        }
                        {screen === SCREEN.Standings &&
                            <div>
                                <button onClick={getSeasonGameData}>Get Standings</button> Click on player for individual results.
                                {seasongamedata && <Standings games={seasongamedata} season={selectedseason} status={setProcessing} />}
                            </div>
                        }
                        {screen === SCREEN.Frequency &&
                            <div>
                                {selectedgamedata && <PlayFrequencies gamedata={selectedgamedata} status={setProcessing} />}
                            </div>
                        }
                        {screen === SCREEN.HandQuery &&
                            <div>
                                {selectedgamedata && <HandQuery gamedata={selectedgamedata} setQueryhanditems={setQueryhanditems} />}
                            </div>
                        }
                        {screen === SCREEN.GameScheduler &&
                            <div>
                                <GameScheduler username={user} usertoken={token} setProcessing={setProcessing} />
                            </div>
                        }
                    </div>
                </div>
            }


        </div>
    );
}