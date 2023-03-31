import Seat from './Seat';
import Enumerable from 'linq';

export default function Table({ currenthand, leaguemembers }) {

    let o = {};
    if (currenthand !== undefined) {
        o = JSON.parse(currenthand);
    }

    function isEVPos(amt) {
        if (amt === 0)
            return "evzero";
        else if (amt < 0)
            return "evnegative";
        else
            return "evpositive";
    }

    function getActions(o, leaguemembers) {
        var list = [];
        if (o?.streets == undefined) return "";

        o?.streets?.forEach(s => {
            let c = [];
            if (s.cards_dealt !== null && s.cards_dealt !== undefined)
                c = s?.cards_dealt?.replace("[", "")?.replace("]", "")?.split(" ");

            list.push(
                <div>
                    <div>
                        <span className='street'>{s.name}</span>&nbsp;
                        {
                            c.map((x) => {
                                return (<img className='actionscard' src={"./images/c" + x.toLowerCase() + ".png"} />)


                            })
                        }
                    </div>
                    <div>
                        <span className='substreet'>POT: {s.runningpot} {(s.name != "PREFLOP") ? ", +" + s.pot : ""}</span>
                    </div>
                </div>
            );

            if (s?.handequities?.length > 0) {
                list.push(<div><span className='equitiestitle'>{s.name} ODDS: </span></div>);
                s.handequities.forEach(e => {
                    let playername = leaguemembers.find(({ mavens_login }) => mavens_login === e.player).nickname.toLowerCase();
                    //console.dir("playername", playername);
                    //console.dir(leaguemembers);
                    list.push(
                        <div>
                            <span className='equities'>{playername + " W: " + e.win + ", T: " + e.tie}</span>&nbsp;
                            {(Enumerable.from(s.handequities).where(p => p.player == e.player)?.toArray()[0]?.win ==100) && <img className='check' src="./images/redcheck3.png"/>}
                        </div>
                    );
                })
            }

            if (s?.actions?.length > 0) {
                list.push(<div><span className='equitiestitle'>{s.name} ACTION: </span></div>);
                s.actions.forEach(a => {
                    var amt = "";
                    if (a.amount != 0) amt = a.amount;
                    let playername = leaguemembers.find(({ mavens_login }) => mavens_login === a.player).nickname.toLowerCase()
                    list.push(
                        <div>
                            {(a.action.includes("posts") || a.action.includes("folds") || a.action.includes("refunded")) &&
                                <span className='actions'>{`${playername} ${a.action} ${amt}`}</span>
                            }
                            {(a.action.includes("posts")==false) && 
                                (a.action.includes("folds")==false) &&
                                (a.action.includes("refunded")==false) &&
                                <><span className='actions'>{`${playername} ${a.action} ${amt} into ${a?.running_amount-a.amount}`}</span>
                                {/* <span>`find win ${Enumerable.from(s.handequities).where(p => p.player == a.player)?.toArray()[0]?.win}`</span> */}
                                </>
                            }
                            {((s.handequities != null) &&
                                (amt > 0) && 
                                (a.action.includes("post") == false) &&
                                (a.action.includes("refunded") == false)) &&
                                <div><span className={isEVPos(a?.ev_total)}>{`+${a?.ev_winning} / -${a?.ev_losing}, n:${a?.ev_total}`}</span></div>
                            }
                        </div>
                    );
                })
            }
        });

        return list;
    }

    return (
        <table className='pokertable'>
            <tbody>
                <tr>
                    <td colSpan="3">
                        <table className='pokertableboarddesc'>
                            <tr><td>Hand: {o.handID + ", Blinds: (" + o.blind_small + "/" + o.blind_big + "/" + o.ante + ")"}</td></tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3}>
                        <table className='centercontent'>
                            <tr>
                                <td>
                                    {
                                        o?.summary?.board &&
                                        <table className='pokertableboard'>
                                            <tr>
                                                <td>
                                                    {
                                                        o?.summary?.board.split(" ").map((x) => (<img className='boardcard' src={"./images/c" + x.toLowerCase() + ".png"} />))
                                                    }
                                                </td>
                                            </tr>
                                        </table>
                                    }
                                </td>
                                <td>
                                    {
                                        o?.summary?.rabbit &&
                                        <table className='pokertablerabbit'>
                                            <tr>
                                                <td>
                                                    {
                                                        o?.summary?.rabbit.split(" ").map((x) => (<img className='rabbitcard' src={"./images/c" + x.toLowerCase() + ".png"} />))
                                                    }
                                                </td>
                                            </tr>
                                        </table>
                                    }
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td><Seat hand={o} seatid={9} leaguemembers={leaguemembers} /></td>
                    <td rowSpan="4">
                        <div className='pokertable'>{getActions(o, leaguemembers)}</div>
                    </td>
                    <td><Seat hand={o} seatid={1} leaguemembers={leaguemembers} /></td>
                </tr>
                <tr>
                    <td><Seat hand={o} seatid={8} leaguemembers={leaguemembers} /></td>
                    <td><Seat hand={o} seatid={2} leaguemembers={leaguemembers} /></td>
                </tr>
                <tr>
                    <td><Seat hand={o} seatid={7} leaguemembers={leaguemembers} /></td>
                    <td><Seat hand={o} seatid={3} leaguemembers={leaguemembers} /></td>
                </tr>
                <tr>
                    <td><Seat hand={o} seatid={6} leaguemembers={leaguemembers} /></td>
                    <td><Seat hand={o} seatid={4} leaguemembers={leaguemembers} /></td>
                </tr>
                <tr>
                    <td colSpan={3}>
                        <Seat hand={o} seatid={5} leaguemembers={leaguemembers} />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}