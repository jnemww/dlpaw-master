//import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';
import ProfitSummary from './ProfitSummary';
import Standings from './Standings';
import PlayFrequencies from './PlayFrequencies';
import HandQuery from './HandQuery';
import Table from './Table';
import { SCREEN } from '../enums'
import styled, { keyframes } from "styled-components";
import { LoadingSpinner } from "./Spinner";
import GameScheduler from './GameScheduler';
import SignIn from './Auth/SignIn';
import AuthDetails from './Auth/AuthDetails';

export default function Params(){
    const [user, setUser] = useState();
    const [tokens, setTokens] = useState();
    const [processing, setProcessing] = useState(false);
    const [seasons, setSeasons] = useState();
    const [seasonitems, setSeasonitems] = useState();
    const [gameitems, setGameitems] = useState();
    const [handitems, setHanditems] = useState();
    const [selectedgame, setSelectedgame] = useState();
    const [selectedseason, setSelectedseason] = useState();
    const [selectedgamedata, setSelectedgamedata] = useState();
    const [selectedhand, setSelectedhand] = useState();
    const [seasongamedata, setSeasongamedata] = useState();
    const [screen, setScreen] = useState();
    const [queryhanditems, setQueryhanditems] = useState();
    const [token, setToken] = useState();
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


    console.log(pe.REACT_APP_DS_URL_SEASONS);

    useEffect(()=>{ 
        console.log("Screen Change: " + screen);        
    },[screen]);

    useEffect(()=>{ 
        console.log("Processing: " + processing);        
    },[processing]);

    useEffect(()=>{ 
        console.log("Processing query.");        
    },[queryhanditems]);

    useEffect(()=>{
        if(queryhanditems === undefined) return;
        console.log("Processing query results.");        
        let list = [];
        list.push(<option value="">Select a Hand</option>)
        queryhanditems.forEach(h => {
            list.push(<option value={JSON.stringify(h)}>{h.handID + ": (" + h.blind_small  + "/" + h.blind_big + ")"}</option>)
        });
        setHanditems(list);
        setSelectedhand(JSON.stringify(queryhanditems[0]));
        setScreen(SCREEN.Table);
    },[queryhanditems]);

    useEffect(()=>{

        if(seasons == undefined){
            console.log("Mounting seasons...");
            (async() => {
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
            })();
        }
        setSelectedgame(null);//added 3/11/2023 3:27pm
    },); //selectedseason

    useEffect(()=>{
        if(selectedseason == undefined){
            setSelectedgame(null);
            return;
        }
        
        (async() => {
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
        })();
    },[selectedseason]);

    useEffect(()=>{ 
        if(selectedseason == undefined || selectedgame == undefined){
            if(selectedseason == null || selectedseason == undefined)
                setSelectedgame(null);
                return;
        }

        (async() => {
                let url = snglgamesurl.replace(leaguetkn, league)
                    .replace(seasontkn, selectedseason)
                    .replace(gametkn, selectedgame);
                let res = await fetch(url, {
                    headers: { 'Authorization': 'Bearer ' + token }
                  });
                let data = await res.json();
                setSelectedgamedata(data);
    
                console.log({data});
                
                let list = [];
                list.push(<option value="">Select a Hand</option>)
                data.hands.forEach(h => {
                    list.push(<option value={JSON.stringify(h)}>{h.handID + ": (" + h.blind_small  + "/" + h.blind_big + "/" + h.ante + ")"}</option>)
                });
                setHanditems(list);
            })();
    },[selectedseason, selectedgame]);

    function getSeasonGameData(){
        if(selectedseason !== undefined){
            (async() => {
                let url = allgamesurl.replace(leaguetkn, league)
                    .replace(seasontkn, selectedseason);
                let res = await fetch(url, {
                    headers: { 'Authorization': 'Bearer ' + token }
                  });
                let list = await res.json();

                setSeasongamedata(list);
            })();
        }
    }

    function ScrollBack(){
        if(document.getElementById('selhand').selectedIndex > 1) 
            document.getElementById('selhand').selectedIndex -=1; 
        setSelectedhand(document.getElementById('selhand').value);
    }

    function ScrollFwd(){
        if(document.getElementById('selhand').selectedIndex < document.getElementById('selhand').length-1) 
            document.getElementById('selhand').selectedIndex +=1; 
        setSelectedhand(document.getElementById('selhand').value);
    }

    return(
        <div>
            {!user &&
                <div>
                    <SignIn setToken={setToken} />
                    {/* <SignUp /> */}
                    <AuthDetails setUser={setUser}/>
                    {/* <Login setUser={setUser} setTokens={setTokens} /> */}
                </div>
            }
            {   user &&
                processing && 
                <div>
                    <LoadingSpinner />
                </div>
            }
            {   user &&
                <div>
                    <div>
                        <table className='menu'>
                            <tr>
                                <td className='rightborder' onClick={()=>setScreen(SCREEN.Table)}>Game Review</td>
                                <td className='rightborder' onClick={()=>setScreen(SCREEN.Standings)}>Standings</td>
                                <td className='rightborder' onClick={()=>setScreen(SCREEN.Frequency)}>Frequencies</td>
                                <td className='rightborder' onClick={()=>setScreen(SCREEN.ProfitSummary)}>Profit Summary</td>
                            </tr>
                            <tr>
                                <td className='rightborder' onClick={()=>setScreen(SCREEN.HandQuery)}>Find Hands</td>
                                <td className='rightborder' onClick={()=>setScreen(SCREEN.GameScheduler)}>Schedule</td>
                                <td className='rightborder'></td>
                                <td className='rightborder'><AuthDetails setUser={setUser}/></td>
                            </tr>
                            {/* <tr>
                                <td colSpan={4}>{token}</td>
                            </tr> */}
                        </table>
                    </div>
                    {/* <div>&nbsp;</div> */}
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
                                    <select onChange={(e) => {setSelectedseason(e.target.value)}}>{seasonitems}</select>
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
                    <div>
                        {screen === SCREEN.Table &&
                            <div>
                                {selectedhand && <Table currenthand={selectedhand} />}
                            </div>
                        }
                        {screen === SCREEN.ProfitSummary &&
                            <div>
                            Click on hand type description to drill into individual hands for the group.
                                <ProfitSummary gamedata={selectedgamedata} status={setProcessing} setQueryhanditems={setQueryhanditems} /> 
                                {queryhanditems && <Table currenthand={selectedhand} />}
                            </div>
                        }
                        {screen === SCREEN.Standings &&
                            <div>
                                <button onClick={getSeasonGameData}>Get Standings</button> Click on player for individual results.
                                {seasongamedata && <Standings games={seasongamedata} status={setProcessing} />}
                            </div>
                        }
                        {screen === SCREEN.Frequency &&
                            <div>
                                {/* <button onClick={getSeasonGameData}>Play Frequencies</button> */}
                                {selectedgamedata && <PlayFrequencies gamedata={selectedgamedata} status={setProcessing} />}
                            </div>
                        }
                        {screen === SCREEN.HandQuery &&
                            <div>
                                {selectedgamedata && <HandQuery gamedata={selectedgamedata} setQueryhanditems={setQueryhanditems} />}
                                {queryhanditems && <Table currenthand={selectedhand} />}
                            </div>
                        }
                        {screen === SCREEN.GameScheduler &&
                            <div>
                                <GameScheduler username={user} usertoken={token} />
                            </div>
                        }
                    </div>
                </div>
            }
            

        </div>
    );
  }