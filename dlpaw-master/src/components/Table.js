import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';
import Seat from './Seat';

export default function Table(props){

    console.log("Table loading...");

    let o = {};
    if(props.currenthand !== undefined){
        o = JSON.parse(props.currenthand);
    }

    function getActions(o){
        var list = [];
        if(o?.streets == undefined) return "";

        o?.streets?.forEach(s => {
            if(s.cards_dealt !== null && s.cards_dealt !== undefined)
                var c = s?.cards_dealt?.replace("[","")?.replace("]","")?.split(" ");
            else
                var c = [];

            list.push(
                <div>
                    <span className='street'>{s.name}</span>
                    {
                         c.map((x) => {
                            return (<img className='actionscard' src={"./images/c" + x + ".png"}/>)


                        })
                    }
                </div>
            );  
            
/*
                        if(s.cards_dealt !== null){
                            let c = s?.cards_dealt?.replace("[","")?.replace("]","")?.split(" ");
                            c.map((x) => (<img className='holecard' src={"./images/c" + x + ".png"}/>))
                        }
*/

              s?.handequities?.forEach(e => {
                list.push(
                  <div><span className='equities'>{e.player + " W: " + e.win + ", T: " + e.tie}</span></div>
                );
            })

            s?.actions?.forEach(a => {
                var amt ="";
                if(a.amount != 0) amt = a.amount;
                list.push(
                  <div><span className='actions'>{a.player + " " + a.action + " " + amt}</span></div>
                );
            })
        });

        return list;
    }

    return(
        <table className='pokertable'>
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
                                o?.summary?.board  && 
                                <table className='pokertableboard'>
                                    <tr>
                                        <td>
                                            {
                                                o?.summary?.board.split(" ").map((x) => (<img className='boardcard' src={"./images/c" + x + ".png"}/>))
                                            }
                                        </td>
                                    </tr>
                                </table>
                            }
                            </td>
                            <td>
                            {
                                o?.summary?.rabbit  && 
                                <table className='pokertablerabbit'>
                                    <tr>
                                        <td>
                                            {
                                                o?.summary?.rabbit.split(" ").map((x) => (<img className='rabbitcard' src={"./images/c" + x + ".png"}/>))
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
                <td><Seat hand={o} seatid={9} class=""/></td>
                <td rowSpan="4">
                    <div className='scroll'>{getActions(o)}</div>
                </td>
                <td><Seat hand={o} seatid={1} /></td>
            </tr>
            <tr>
                <td><Seat hand={o} seatid={8} /></td>
                <td><Seat hand={o} seatid={2} /></td>
            </tr>
            <tr>
                <td><Seat hand={o} seatid={7} /></td>
                <td><Seat hand={o} seatid={3} /></td>
            </tr>
            <tr>
                <td><Seat hand={o} seatid={6} /></td>
                <td><Seat hand={o} seatid={4} /></td>
            </tr>
            <tr>
                <td colSpan={3}>
                    <Seat hand={o} seatid={5} />
                </td>
            </tr>
        </table>
    );
}