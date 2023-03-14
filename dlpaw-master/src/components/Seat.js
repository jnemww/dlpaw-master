import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';

export default function Seat({hand, seatid}){

  //console.log("SEAT seatid: " + props.seatid + "hand:" + props.hand);

  var s = Enumerable.from(hand.seats)
      .where(x => x.id == "seat" + (seatid))
      .toArray()[0];
  
    if(s == null){
      return (  <table className='pokertableopenseat'>
                  <tr>
                    <td>
                      <p>seat {seatid}</p>
                      <p>open</p>
                    </td>
                  </tr>
                </table>);
    }
  
    var p = Enumerable.from(hand.summary.playerinfo)
      .where(x => x.player == s.player)
      .toArray()[0];

    function isButton(){
      if(s.isbutton)
        return "pokertableseatbutton";
      else
        return "pokertableseat";
    }
  
    function isProfit(){
      if(p.profit ===0 || -p.profit === hand.ante)
        return "";
      else if(p.profit < 0)
        return "profitnegative";
      else
        return "profitpositive";
    }

    return (
      <table className={isButton()}>
        <tr>
          <td>{s.id}</td>
        </tr>
        <tr>
          <td>{s.player}</td>
        </tr>
        <tr>
          <td>{s.chipstack.toLocaleString()}</td>
        </tr>
        <tr>
          <td className={isProfit()}>{p.profit.toLocaleString()}</td>
        </tr>
        <tr>
          <td>
            <img className='holecard' src={"./images/c" + p.holecards.split(" ")[0].toLowerCase() +  ".png"} />
            &nbsp;
            <img className='holecard' src={"./images/c" + p.holecards.split(" ")[1].toLowerCase() +  ".png"} />
          </td>
        </tr>
      </table>
    );
  }