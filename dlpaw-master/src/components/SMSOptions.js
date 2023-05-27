//import Enumerable from 'linq';
import React, { useState } from 'react';
import { days, defaultschedule, UPDATE_TYPE } from "../enums";

export default function SMSOptions({ username, usertoken, status, leaguemembers }) {
    const [token, setToken] = useState(usertoken);
    const [savestatus, setSavestatus] = useState();
    const [schedules, setSchedules] = useState();
    const [schedule, setSchedule] = useState({ ...defaultschedule, Player: username });
    //const pe = process.env;
    //const sf = pe.REACT_APP_SPACE_FILLER;

    // useEffect(() => {
    //     //setSavestatus("");
    //     //console.log("Screen Change: " + screen);        
    // }, [schedule]);

    const handleChange = (e, i, t) => {
        // let updatedValue = schedule;
        // if (t == UPDATE_TYPE.StartofWeek) updatedValue.StartofWeek = e;
        // if (t == UPDATE_TYPE.Availability) updatedValue.Days[i].Play = (e == "Yes") ? 1 : 0;
        // if (t == UPDATE_TYPE.StartTime) updatedValue.Days[i].StartTime = +e;
        // setSchedule(ns => ({
        //     ...ns,
        //     ...updatedValue
        // }));
        // console.dir(schedule);
    }

    async function saveSchedule() {
        //console.log("user auth attempt: " + localuser)
        status.addToQueue();

        // var f = await fetch(postsheduleurl,
        //     {
        //         method: "POST",
        //         mode: "cors",
        //         headers: { 'Authorization': 'Bearer ' + token, "Content-Type": "application/json" },
        //         body: JSON.stringify(schedule, null, 2)
        //     })
        //     .then(res => {
        //         if (res.status !== 200) bposterror = true;
        //         return res.json();
        //     })
        //     .then(data => {
        //         setSavestatus(data.message);
        //         if (bposterror) {

        //         } else {
        //             //console.log("user: " + localuser + ", pwd: " + localpassword)
        //             console.log(data);
        //         }
        //     })
        //     .catch(error => {
        //         setSavestatus(error.toString());
        //         console.log(error.toString());
        //     });

        status.removeFromQueue();
    }
    
    return (
        <div>
            {username &&
                <div>
                    <div>
                        <br />
                        <br />
                        <table className='pokertableboard'>
                            <tbody>
                                <tr>
                                    <td className='items' align='center' colSpan={2}>Donkleague Phone :&nbsp;
                                        <select id="selecteddate" onChange={(e) => handleChange(e.target.value)}>
                                            <option value="+18449922574">+18449922574</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='items' align='center' colSpan={2}>Enter Preferred Contact Phone :&nbsp;
                                        <input type={Text} defaultValue={"+1##########"}></input>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='items' align='center' colSpan={2}>SMS Subscription Options :&nbsp;
                                        <table>
                                            <tr>
                                                <td>None</td>
                                                <td><input type={'checkbox'}></input></td>
                                            </tr>
                                            <tr>
                                                <td colSpan={2}>Or Any Combination of Following:</td>
                                            </tr>
                                            <tr>
                                                <td>Scheduling</td>
                                                <td><input type={'checkbox'}></input></td>
                                            </tr>
                                            <tr>
                                                <td>Game Results</td>
                                                <td><input type={'checkbox'}></input></td>
                                            </tr>
                                            <tr>
                                                <td>Community Board</td>
                                                <td><input type={'checkbox'}></input></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>Text "COMMANDS:?" to the number above for additional<br></br>
                                    instructions on available SMS functions.
                                    </td>
                                </tr>
                                <tr>
                                    <td align='center'>
                                        <button>Save</button>
                                    </td>
                                    <td align='center'>
                                        <button>Cancel</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            }
        </div>
    );
}