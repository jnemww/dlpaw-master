import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';

export default function Seat({hand, seatid, leaguemembers}){

  //console.log("SEAT seatid: " + props.seatid + "hand:" + props.hand);

  var s = Enumerable.from(hand.seats)
      .where(x => x.id == "seat" + (seatid))
      .toArray()[0];

  let pinfo = Enumerable.from(leaguemembers)
      .where(p => p.mavens_login == s.player)
      .toArray();
  
    if(s == null){
      return (  <table className={`seat${seatid} pokertableopenseat`}>
                  <tr>
                    <td>
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
        return "pokertableseatbutton seat" + seatid;
      else
        return "pokertableseat seat" + seatid;
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
          <td><img className='playerimg' height={20} width={20} src={pinfo[0].url}/></td>
        </tr>
        <tr>
          <td><span className='substreet'>{s.player}</span></td>
        </tr>
        <tr>
          <td><span className='substreet'>{s.chipstack.toLocaleString()}</span></td>
        </tr>
        <tr>
          <td className={isProfit()}><span className='substreet'>{p.profit.toLocaleString()}</span></td>
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