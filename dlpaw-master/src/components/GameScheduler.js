import Enumerable from 'linq';
import React, { useEffect, useState, useFetch, useSyncExternalStore } from 'react';
import styled, { keyframes } from "styled-components";
import { LoadingSpinner } from "./Spinner";

export default function GameScheduler({username}){
    const [user, setUser] = useState(username);
    const [tokens, setTokens] = useState();
    const [processing, setProcessing] = useState(false);
    const [savestatus, setSavestatus] = useState();
    const [schedule, setSchedule] = useState({
                                                Player: user,
                                                StartofWeek: null,
                                                Days: [ {Play: 0, StartTime: 9},
                                                        {Play: 0, StartTime: 9},
                                                        {Play: 0, StartTime: 9},
                                                        {Play: 0, StartTime: 9},
                                                        {Play: 0, StartTime: 9},
                                                        {Play: 0, StartTime: 9},
                                                        {Play: 0, StartTime: 9}
                                                    ]
                                            });
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const UPDATE_TYPE = {Availability: "A", StartofWeek: "D", StartTime: "T"};
    let bposterror = false;

    useEffect(()=>{
        setSavestatus("");
        //console.log("Screen Change: " + screen);        
    },[schedule]);//, weekstarting

    const handleChange = (e, i, t) => {
        let updatedValue = schedule;
        if(t == UPDATE_TYPE.StartofWeek ) updatedValue.StartofWeek = e;
        if(t == UPDATE_TYPE.Availability ) updatedValue.Days[i].Play = (e=="Yes")?1:0;
        if(t == UPDATE_TYPE.StartTime ) updatedValue.Days[i].StartTime = +e;
        setSchedule(ns => ({
             ...ns,
             ...updatedValue
           }));
        console.dir(schedule);
    }

function getWeeks(){
    let list = [];
    let dtnext = new Date(new Date().toLocaleDateString());

    list.push(<option>Select Week</option>); 

    for(let n = 0; n<4; n++){
        if(dtnext.getDay() > 0){
            dtnext.setDate(dtnext.getDate() - dtnext.getDay());
        }else{
            dtnext.setDate(dtnext.getDate() + 7);
        }
        list.push(<option value={dtnext.toLocaleDateString()}>{dtnext.toLocaleDateString()}</option>)
    }
    return list;
}

async function saveSchedule(){
    //console.log("user auth attempt: " + localuser)
    if(schedule.StartofWeek == null){
        setSavestatus("Select a week date before saving.");
        return;
    }
    console.log(JSON.stringify(schedule, null, 2));
    var f = await fetch("http://192.168.1.155:3000/schedules/donkleague",
        {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({schedule: schedule}, null, 2)
        })
        .then(res => {
            if(res.status !== 200) bposterror = true;
            return res.json();
        })
        .then(data => {
            setSavestatus(data.message);
            if(bposterror){
                
            }else{
                //console.log("user: " + localuser + ", pwd: " + localpassword)
                console.log(data);
            }
        })
        .catch(error => {
            setSavestatus(error.toString());
            console.log(error.toString());
        });
}

    return(
        <div>        
            {   user &&
                <div>
                    <div>
                        <table>
                            <tr>
                                <td>Week of:</td>
                                <td colSpan={2}>
                                    <select onChange={(e) => handleChange(e.target.value, 1, UPDATE_TYPE.StartofWeek)}>
                                        {getWeeks()}
                                    </select>
                                </td>
                                <td></td>
                            </tr>
                            {[...Array(7)].map((x, i) =>{
                                if(true){

                                }
                                return (    <tr key={i}>
                                                <td>
                                                    {days[i]}
                                                </td>
                                                <td>
                                                    <select key={i} onChange={(e) => handleChange(e.target.value, i, UPDATE_TYPE.Availability)}>
                                                        <option>No</option>
                                                        <option>Yes</option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <select key={i} onChange={(e) => handleChange(e.target.value, i, UPDATE_TYPE.StartTime)}>
                                                        <option value="0">Flexible</option>
                                                        <option value="11">11pm</option>
                                                        <option value="10">10pm</option>
                                                        <option value="9" selected>9pm</option>
                                                        <option value="8">8pm</option>
                                                        <option value="7">7pm</option>
                                                        <option value="6">6pm</option>
                                                        <option value="5">5pm</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                            }
                            )}
                            <tr>
                                <td colSpan={3}>
                                    <button onClick={saveSchedule}>Save Schedule</button>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            }
            {
                savestatus &&
                <div>Schedule commit status: {savestatus}</div>
            }
        </div>
    );
  }