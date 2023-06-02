import Enumerable from 'linq';
import React, { useEffect, useState } from 'react';
import { SEATS } from '../enums';

export default function Seat({ hand, seatid, leaguemembers }) {
  var s = Enumerable.from(hand.seats)
    .where(x => x.id == "seat" + (seatid))
    .toArray()[0];

  if (s == null) {
    return (<table className={`seat${seatid} pokertableopenseat`}>
      <tbody>
        <tr>
          <td>
            <p>open</p>
          </td>
        </tr>
      </tbody>
    </table>);
  }

  let pinfo = Enumerable.from(leaguemembers)
    .where(p => p.mavens_login == s.player)
    .toArray();

  var p = Enumerable.from(hand.summary.playerinfo)
    .where(x => x.player == s.player)
    .toArray()[0];

  function isButton() {
    let sl = labelSeats(hand);

    if (s.isbutton)
      return `pokertableseatbutton ${sl.find(s => s.seatid == `seat${seatid}`).id.toLowerCase()}`;//`pokertableseatbutton seat${seatid}`;
    else
      return `pokertableseat ${sl.find(s => s.seatid == `seat${seatid}`).id.toLowerCase()}`;//`pokertableseat seat${seatid}`;
  }

  function isProfit() {
    if (p.profit === 0 || -p.profit === hand.ante)
      return "";
    else if (p.profit < 0)
      return "profitnegative";
    else
      return "profitpositive";
  }

  function labelSeats(hand) {
    let results = [];
    let labels = SEATS.ids;

    let players = Enumerable.from(hand.seats)
        .toArray();

    let button = players.find(p => p.isbutton == 1);
    let bi = players.indexOf(button);
    let pc = players.length;
    let positions = Array(pc);
    let configs = SEATS.configs.find(c => c.players == pc).ids;

    for (let n = 0; n < positions.length; n++) {
        let idx = n - bi;
        if (idx < 0) idx += pc;
        positions[n] = { ...labels[configs[idx]], player: players[n].player, seatid: players[n].id };
    }

    return positions;
}

  return (
    <table className={isButton()}>
      <tr>
        <td rowSpan={3}><span className='playername substreet'>{pinfo[0].nickname.toLowerCase()}</span></td>
        <td><img className='playerimg' src={pinfo[0].url} /></td>
        <td className='container'>
          <img className='top holecard' src={"./images/c" + p?.holecards?.split(" ")[0]?.toLowerCase() + ".png"} />
          <img className='bottom holecard' src={"./images/c" + p?.holecards?.split(" ")[1]?.toLowerCase() + ".png"} />
        </td>
      </tr>
      <tr>
        <td colSpan={2}><span className='substreet'>{s.chipstack.toLocaleString()}</span></td>
      </tr>
      <tr>
        <td colSpan={2} className={isProfit()}><span className='substreet'>{p.profit.toLocaleString()}</span></td>
      </tr>
    </table>
  );
}