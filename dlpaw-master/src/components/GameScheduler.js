import Enumerable from 'linq';
import React, { useEffect, useState, useFetch, useSyncExternalStore } from 'react';
import DataTable from './DataTable';
import { days, defaultschedule, UPDATE_TYPE } from "../enums";
import { LoadingSpinner } from "./Spinner";

export default function GameScheduler({ username, usertoken, setProcessing }) {
    //const [user, setUser] = useState(username);
    const [token, setToken] = useState(usertoken);
    //const [processing, setProcessing] = useState(false);
    const [savestatus, setSavestatus] = useState();
    const [schedules, setSchedules] = useState();
    const [schedulereport, setSchedulereport] = useState();
    const [scheduledetails, setScheduledetails] = useState();
    const [schedule, setSchedule] = useState({ ...defaultschedule, Player: username });
    const pe = process.env;
    const league = pe.REACT_APP_LEAGUE;
    const dtkn = pe.REACT_APP_SCHEDULE_DATE_TOKEN;
    const postsheduleurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_POST_SCHEDULES_URL;
    const getsheduleurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_GET_SCHEDULES_URL;
    const leaguetkn = pe.REACT_APP_LEAGUE_TOKEN;
    const sf = pe.REACT_APP_SPACE_FILLER;

    let bposterror = false;

    useEffect(() => {
        setSavestatus("");
        //console.log("Screen Change: " + screen);        
    }, [schedule]);//, weekstarting

    const handleChange = (e, i, t) => {
        let updatedValue = schedule;
        if (t == UPDATE_TYPE.StartofWeek) updatedValue.StartofWeek = e;
        if (t == UPDATE_TYPE.Availability) updatedValue.Days[i].Play = (e == "Yes") ? 1 : 0;
        if (t == UPDATE_TYPE.StartTime) updatedValue.Days[i].StartTime = +e;
        setSchedule(ns => ({
            ...ns,
            ...updatedValue
        }));
        console.dir(schedule);
    }

    function getWeeks() {
        let list = [];
        let dtnext = new Date(new Date().toLocaleDateString());
        if (dtnext.getDay() > 0) 
            dtnext.setDate(dtnext.getDate() - dtnext.getDay());

        list.push(<option>Select Week</option>);

        for (let n = 0; n < 4; n++) {
            // if (dtnext.getDay() > 0) {
            //     dtnext.setDate(dtnext.getDate() - dtnext.getDay());
            // } else {
            //     dtnext.setDate(dtnext.getDate() + 7);
            // }
            list.push(<option value={dtnext.toISOString().substring(0, 10).replaceAll("-", "")}>{dtnext.toLocaleDateString()}</option>)
            dtnext.setDate(dtnext.getDate() + 7);
        }
        return list;
    }

    async function saveSchedule() {
        //console.log("user auth attempt: " + localuser)
        setProcessing(true);

        if (schedule.StartofWeek == null) {
            setSavestatus("Select a week date before saving.");
            return;
        }
        console.log(JSON.stringify(schedule, null, 2));

        var f = await fetch(postsheduleurl,
            {
                method: "POST",
                mode: "cors",
                headers: { 'Authorization': 'Bearer ' + token, "Content-Type": "application/json" },
                body: JSON.stringify(schedule, null, 2)
            })
            .then(res => {
                if (res.status !== 200) bposterror = true;
                return res.json();
            })
            .then(data => {
                setSavestatus(data.message);
                if (bposterror) {

                } else {
                    //console.log("user: " + localuser + ", pwd: " + localpassword)
                    console.log(data);
                }
            })
            .catch(error => {
                setSavestatus(error.toString());
                console.log(error.toString());
            });

        setProcessing(false);
    }

    async function getSchedule() {
        setProcessing(true);

        if (schedule.StartofWeek == null) {
            setSavestatus("Select a week date before saving.");
            return;
        }

        let url = getsheduleurl
            .replace(leaguetkn, league)
            .replace(dtkn, schedule.StartofWeek)
            .replaceAll(" ", sf);
        var f = await fetch(url, //"https://us-central1-donkleaguedataservices.cloudfunctions.net/userfunctions/schedules/Donk%20League/" + schedule.StartofWeek, 
            {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            .then(res => {
                if (res.status !== 200) bposterror = true;
                return res.json();
            })
            .catch(error => {
                setSavestatus(error.toString());
                console.log(error.toString());
            });

        let r = Enumerable.from(f)
            .selectMany(d => d.Days)
            .groupBy(d => d.Day)
            .orderBy(o => days.indexOf(o.first().Day))
            .select(z => ({
                Day: z.first().Day,
                Available: z.sum(s => (s.Play == 1 ? 1 : 0)),
                Earliest: z.min(t => t.StartTime),
                Latest: z.max(t => t.StartTime)
            }))
            .toArray();

        setSchedules(f);
        setSchedulereport(r);
        console.dir(f);
        setProcessing(false);
    }

    function getScheduleDetails(day) {
        if (schedules == null) return (<div>Please a date and try again.</div>);

        let res = Enumerable.from(schedules)
            .selectMany(x => Enumerable.from(x.Days), (player, day) => ({ player, day }))
            .where(d => d.day.Day == day)
            .select(z => ({
                Player: z.player.Player,
                Day: z.day.Day.substring(0, 3),
                Available: z.day.Play == 1 ? "Yes" : "No",
                Start: z.day.Play == 1 ? z.day.StartTime : ""
            })
            )
            .orderBy(o => o.Player.toLowerCase())
            .toArray();

        if (res?.length > 0) {
            setScheduledetails(res);
        }
        else {
            setScheduledetails(undefined);
        }
    }

    return (
        <div>
            {/* {username &&
                processing &&
                <div style={{ textAlign: "center" }}>
                    <LoadingSpinner />
                    <span className='processing'>Processing...</span>
                </div>
            } */}
            {username &&
                <div>
                    <div>
                        <br />
                        <br />
                        <table className='gamescheduler'>
                            <tr>
                                <td className='items' align='center' colSpan={3}>Week of :
                                    <select onChange={(e) => handleChange(e.target.value, 1, UPDATE_TYPE.StartofWeek)}>
                                        {getWeeks()}
                                    </select>
                                </td>
                                <td></td>
                            </tr>
                            {[...Array(7)].map((x, i) => {
                                return (<tr key={i}>
                                    <td className='items'>
                                        {schedule.Days[i].Day}
                                    </td>
                                    <td>
                                        <select key={i} onChange={(e) => handleChange(e.target.value, i, UPDATE_TYPE.Availability)}>
                                            <option>No</option>
                                            <option>Yes</option>
                                        </select>
                                    </td>

                                    <td>
                                        <select key={i} onChange={(e) => handleChange(e.target.value, i, UPDATE_TYPE.StartTime)}>
                                            <option value="0" selected>Flexible</option>
                                            <option value="11">11pm</option>
                                            <option value="10">10pm</option>
                                            <option value="9" >9pm</option>
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
                                <td align='center' colSpan={3}>
                                    <button onClick={saveSchedule}>Save Schedule</button>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={3}></td>
                            </tr>
                            <tr>
                                <td colSpan={3}></td>
                            </tr>
                            <tr>
                                <td align='center' colSpan={3}>
                                    <button onClick={getSchedule}>View Schedule</button>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={3}>
                                    <div>
                                        {schedulereport &&
                                            <DataTable tbodyData={schedulereport}
                                                rowclasses={["datatablegrey", "datatablewhite"]}
                                                classes={["text", "numeric", "numeric", "numeric", "numeric"]}
                                                functions={[getScheduleDetails, , , ,]}
                                            />
                                        }
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td colSpan={3}>
                                    <div>
                                        {scheduledetails &&
                                            <DataTable tbodyData={scheduledetails}
                                                rowclasses={["datatablegrey", "datatablewhite"]}
                                                classes={["text", "numeric", "numeric"]}
                                                functions={[, ,]}
                                            />
                                        }
                                    </div>
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