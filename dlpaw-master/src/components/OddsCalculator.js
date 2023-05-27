import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';
import DataTable from './DataTable';

export default function OddsCalculator({ username, usertoken, status, leaguemembers }) {
    const entrytype = {Hand: "Hand", Board: "Board", BoardRemove:"BoardRemove", HandRemove: "HandRemove"};
    const [token, setToken] = useState(usertoken);
    const [deck, setDeck] = useState([]);
    const [hands, setHands] = useState([]);
    const [board, setBoard] = useState([]);
    const [error, setError] = useState();
    const [odds, setOdds] = useState();
    const [selectedentrytype, setSelectedentrytype] = useState(entrytype.Hand);
    const pe = process.env;
    const league = pe.REACT_APP_LEAGUE;
    const oddscalcurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_ODDS_CALCULATOR_URL;
    const CARD_RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
    const SUIT_RANKS = ["c","s","h","d"];

    let bposterror = false;


    useEffect(() => {
        let cards = []; 
        SUIT_RANKS.forEach((suit) => {
            CARD_RANKS.forEach((card, index) => {
                cards.push((card + suit).toLowerCase());
            });
        });
        setDeck(cards);
    }, []);

    const handleDeckClick = (e, type = selectedentrytype) => {
        const card = e.attributes["card"].value;
        const nh = hands.filter((c) => c != card);
        const nb = board.filter((c) => c != card);
        const cards = [];
        let index = 0;
        let restorecard = "";

        if(e.disabled) return;

        switch (type){
            case entrytype.Hand:
                if(nh.length > 9) restorecard = nh.pop();
                nh.push(card);
                break;
            case entrytype.Board:
                if(nb.length > 3) restorecard = nb.pop();
                nb.push(card);
                break;
            case entrytype.BoardRemove:
                index = nb.indexOf(card);
                if (index > -1) nb.splice(index, 1);
                break;
            case entrytype.HandRemove:
                index = nh.indexOf(card);
                if (index > -1) nh.splice(index, 1);
                break;
        }

        if(restorecard) cards.push(restorecard);
        cards.push(card);

        setHands(nh);
        setBoard(nb);

        cards.forEach((c) => {
            let btn = document.getElementById("btn" + c);
            btn.disabled = !btn.disabled;
            if(btn.disabled){
                btn.classList.add("disabled");
            } else {
                btn.classList.remove("disabled");
            }
        })
    }

    function resetParams(){
        setBoard([]);
        setHands([]);
        setOdds(undefined);
        deck.forEach((c) => {
            let o = document.getElementById("btn" + c);
            o.disabled = false;
            o.classList.remove("disabled");
        });
    }

    function getOddsBody(){
        try {
            let lhands = hands;
            let lboard = board;
            const message = {hands: "", board: ""};
    
            if(![0,3,4].includes(board.length)){
                throw new Error("Invalid board card selection. Select 0, 3, or 4 cards.");
            }

            message.board = lboard.toString().toUpperCase().replaceAll(","," ");
            
            if(hands.length%2){
                throw new Error("All player hands require 2 cards.");
            }

            for(let i = 0; i < hands.length; i++){
                message.hands += hands[i];
                if(i%2) {
                    message.hands += ",";
                } else {
                    message.hands += " ";
                }
            }
            message.hands = message.hands.substring(0, message.hands.length -1).toUpperCase();

            console.dir(message);
            return message;
        }
        catch (error) {
            setError(error.message);
        }

    }

    async function getOdds() {
        try {
            status.addToQueue();

            if(hands.length < 4){
                throw new Error("Must select at least 2 hands.");
            }

            const message = getOddsBody();
            const smessage = JSON.stringify(message, null, 2);
    
            var f = await fetch(oddscalcurl,
                {
                    method: "POST",
                    mode: "cors",
                    headers: { 'Authorization': 'Bearer ' + token, "Content-Type": "application/json" },
                    body: smessage
                })
                .then(res => {
                    if (res.status !== 200) bposterror = true;
                    return res.json();
                })
                .then(data => {
                    //setSavestatus(data.message);
                    if (bposterror) {
    
                    } else {
                        let res = Enumerable.from(data.results)
                            .select(r => ({Hand: r.hand, Description: r.handrankdesc, Wins: r.Wins, Ties: r.Ties}))
                            .toArray();
                        setOdds(res);
                        console.log(data);
                    }
                })
                .catch(error => {
                    setError(error.toString());
                    console.log(error.toString());
                });
            setError(undefined);
            console.log("results: ", f);
        }
        catch (error) {
            setError(error.message);
        }
        finally{
            status.removeFromQueue();
        }
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
                                    <td colSpan={3}>
                                        <div className="divider">
                                            <table>
                                                <tr>
                                                    <td><button onClick={(e) => setSelectedentrytype(entrytype.Hand)}>Click here then choose hands</button></td>
                                                </tr>
                                                <tr>
                                                    <td>

                                                    </td>
                                                </tr>
                                            </table>
                                            {hands.map((card, index) => {
                                                return <>
                                                            <img className="selectedoddscard" 
                                                                card={(card).toLowerCase()} 
                                                                onClick={(e) => handleDeckClick(e.currentTarget, entrytype.HandRemove)} 
                                                                src={"./images/c" + card.toLowerCase() + ".png"} />
                                                            {(index%2)?<span>,&nbsp;</span>:""}
                                                        </>
                                            })}
                                            {/* <div>{"Hands:" + hands.toString()}</div> */}
                                        </div>
                                        <div className="divider">
                                            <table>
                                                <tr>
                                                    <td>
                                                        <button onClick={(e) => setSelectedentrytype(entrytype.Board)}>Click here then choose board</button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        {board.map((card) => {
                                                            return <img className='selectedoddscard' 
                                                                        card={(card).toLowerCase()} 
                                                                        onClick={(e) => handleDeckClick(e.currentTarget, entrytype.BoardRemove)} 
                                                                        src={"./images/c" + card.toLowerCase() + ".png"} />
                                                        })}
                                                    </td>
                                                </tr>
                                            </table>
                                            {/* <div>{"Board:" + board.toString()}</div> */}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align='center'>
                                        <div className="divider">
                                        {SUIT_RANKS.map((suit) => {
                                            return <div key={suit}>
                                                {CARD_RANKS.map((card, index) => {
                                                    return <button id={"btn" + (card + suit).toLowerCase()} 
                                                                name={"btn" + (card + suit).toLowerCase()} 
                                                                key={index} inuse={""} card={(card + suit).toLowerCase()} 
                                                                className="oddscard" onClick={(e) => handleDeckClick(e.currentTarget)}>
                                                                <img className='oddscard' 
                                                                    src={"./images/c" + (card + suit).toLowerCase() + ".png"}/>
                                                            </button>
                                                })}
                                            </div>
                                        })}
                                    </div>
                                    </td>
                                </tr>
                                {/* <tr>
                                    <td align='center' colSpan={3}>
                                        <button onClick={(e) => getOddsBody()}>Show Message</button>
                                    </td>
                                </tr> */}
                                <tr>
                                    <td align='center' colSpan={3}>
                                        <button onClick={getOdds}>Calculate</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td align='center' colSpan={3}>
                                        <button onClick={(e) => resetParams()}>New Deal</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div>
                                            {odds &&
                                                <DataTable tbodyData={odds}
                                                    rowclasses={["datatablegrey", "datatablewhite"]}
                                                    classes={["text", "text", "numeric", "numeric"]}
                                                    functions={[, , , ,]}
                                                />
                                            }
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    {
                                        error &&
                                        <div>Error: {error}</div>
                                    }
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