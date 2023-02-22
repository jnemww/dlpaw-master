import Enumerable from 'linq';
import React, { useEffect, useState, useFetch } from 'react';
import ProfitSummary from './ProfitSummary';
import Standings from './Standings';
import PlayFrequencies from './PlayFrequencies';
import HandQuery from './HandQuery';
import Table from './Table';
import Enums, { SCREEN } from '../enums'
import styled, { keyframes } from "styled-components";
import { LoadingSpinner } from "./Spinner";

export default function Params(){
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
    const [screen, setScreen] = useState(SCREEN.Table);
    const [queryhanditems, setQueryhanditems] = useState();

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
    },[queryhanditems]);

    useEffect(()=>{ 

        if(seasons == undefined){
            console.log("Mounting seasons...");
            (async() => {
                var res = await fetch("./results/pm_seasons.json");
                var data = await res.json();
                setSeasons(data);
                
                let list = [];
                list.push(<option value="">Select a Season</option>)
                data.seasons.forEach(s => {
                    list.push(<option value={s.name}>{s.name}</option>)
                });
                setSeasonitems(list);
            })();
        }
    },[selectedseason]);

    useEffect(()=>{ 
        if(selectedseason == undefined || selectedgame == undefined) return;
        (async() => {

                let res = await fetch("./results/" + selectedseason + selectedgame + ".json");
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

    function getGames(sseason){
        let list = [];
            list.push(<option value="">Select a Game</option>)
            let s = Enumerable.from(seasons.seasons).where(x => x.name == sseason).first();
            s.games.forEach(g => {
                list.push(<option value={g}>{g}</option>)
            });
            setGameitems(list);
    }

    function getSeasonGameData(){
        if(selectedseason !== undefined){
            let list = [];

            (async() => {
                let games = Enumerable.from(seasons.seasons)
                    .where(s => s.name == selectedseason)
                    .select(x => x.games)
                    .toArray();

                for(let n = 0; n < games[0].length; n++){
                    console.log("retrieving..." + "./results/" + selectedseason + games[0][n] + ".json");
                    let res = await fetch("./results/" + selectedseason + games[0][n] + ".json");
                    let data = await res.json();
                    list.push(data)
                    console.log("League Standings: Data for " + selectedseason + games[0][n] + ".json retrieved.");
                }

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
            {processing && //[FETCH_STATE.LOADING, FETCH_STATE.IDLE].includes(fetchState) 
                <div>
                    <LoadingSpinner />
                </div>
            }
            <div>
                <table className='menu'>
                    <tr>
                        <td className='rightborder' onClick={()=>setScreen(SCREEN.Table)}>Game Review</td>
                        <td className='rightborder' onClick={()=>setScreen(SCREEN.Standings)}>Standings</td>
                        <td className='rightborder' onClick={()=>setScreen(SCREEN.Frequency)}>Frequencies</td>
                        <td className='rightborder' onClick={()=>setScreen(SCREEN.ProfitSummary)}>Profit Summary</td>
                        <td className='rightborder' onClick={()=>setScreen(SCREEN.HandQuery)}>Find Hands</td>
                    </tr>
                </table>
            </div>
            <div>&nbsp;</div>
            <div>
                <table className='pokertableboard'>
                    <tr>
                        <td>
                        {screen}: {selectedseason}, Game: {selectedgame}
                        </td>
                    </tr>
                    <tr>
                        <td>
                        <select onChange={(e) => {setSelectedseason(e.target.value); getGames(e.target.value);}}>{seasonitems}</select>
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
                        {/* {React.createElement('button', {onClick: () => {if(document.getElementById('selhand').selectedIndex > 1) document.getElementById('selhand').selectedIndex -=1; setSelectedhand(document.getElementById('selhand').value)}}, "<<")} */}
                        <select id="selhand" onChange={(e) => setSelectedhand(e.target.value)}>{handitems}</select>
                        {/* {React.createElement('button', {onClick: () => {if(document.getElementById('selhand').selectedIndex < document.getElementById('selhand').length-1) document.getElementById('selhand').selectedIndex +=1; setSelectedhand(document.getElementById('selhand').value)}}, ">>")} */}
                        <button onClick={ScrollFwd}>&gt;&gt;</button>
                        </td>
                    </tr>
                </table>
            </div>
            <div>&nbsp;</div>
            <div>
                {screen === SCREEN.Table &&
                    <div>
                        {selectedhand && <Table currenthand={selectedhand} />}
                    </div>
                }
                {screen === SCREEN.ProfitSummary &&
                    <div>
                        <ProfitSummary gamedata={selectedgamedata} status={setProcessing} setQueryhanditems={setQueryhanditems} />
                        {queryhanditems && <Table currenthand={selectedhand} />}
                    </div>
                }
                {screen === SCREEN.Standings &&
                    <div>
                        <button onClick={getSeasonGameData}>Get Standings</button>
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
            </div>

        </div>
    );
  }