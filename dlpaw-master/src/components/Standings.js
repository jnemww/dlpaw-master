import Enumerable from 'linq';
import DataTable from './DataTable';
import React, { useEffect, useState } from 'react';

export default function Standings({ token, league, season, status }) {
    const pe = process.env;
    const standingsurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_STANDINGS_URL;
    const leaguetkn = pe.REACT_APP_LEAGUE_TOKEN;
    const seasontkn = pe.REACT_APP_SEASON_TOKEN;
    const sf = pe.REACT_APP_SPACE_FILLER;
    const [standings, setStandings] = useState();
    const [standingsdetails, setStandingsdetails] = useState();
    const [selectedstandingsdetails, setSelectedstandingsdetails] = useState();
    const [selectedplayer, setSelectedplayer] = useState();
    //const [points, setPoints] = useState();
    const [error, setError] = useState();
    let games = {};

    useEffect(() => {
        getStandings();
    }, []);

    async function getStandings(){
        try{
            status.addToQueue();
            let url = standingsurl
                .replace(leaguetkn, league)
                .replaceAll(" ", sf)
                .replace(seasontkn, season);
            var res = await fetch(url, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            games = await res.json();
            setStandings(games.Results.Summary);
            setStandingsdetails(games.Results.Details);
        } catch(err) {
            setError(err);
        } finally {
            status.removeFromQueue();
        }
    }

    useEffect(() => {
        setSelectedplayer(undefined);
        setSelectedstandingsdetails(undefined);
        getStandings();
    }, [season]);

    useEffect(() => {
        if (games == undefined) return;
        setSelectedstandingsdetails(null);
        if (selectedplayer == undefined || standingsdetails == undefined) return;

        let d = Enumerable.from(standingsdetails)
            .where(x => x.Player == selectedplayer)
            .toArray();
        setSelectedstandingsdetails(d);
    }, [selectedplayer]);

    return (
        <div>
            <table className='pokertableboard'>
                <tr>
                    <td>
                        {/* <button onClick={getSeasonGameData}>Get Standings</button>  */}
                        Click on player name for individual results.
                    </td>
                </tr>
                <tr>
                    <td>
                        {standings &&
                            <DataTable tbodyData={standings}
                                classes={["text", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]}
                                rowclasses={["datatablegrey", "datatablewhite"]}
                                functions={[setSelectedplayer, , , , , ,]}
                                columns = {["Player", "Pts", "Place", "Back", "Gold", "Silver", "Bronze"]}
                            />
                        }
                    </td>
                </tr>
                <tr>
                    <td>
                        {selectedplayer &&
                            selectedstandingsdetails &&
                            <DataTable tbodyData={selectedstandingsdetails}
                                classes={["text", "numeric", "numeric", "numeric"]}
                                rowclasses={["datatablegrey", "datatablewhite"]}
                                functions={[, , , ,]}
                            />
                        }
                    </td>
                </tr>
            </table>
            <p />
            {error &&
                <div>Error: {error}</div>
            }
        </div>
    );
}