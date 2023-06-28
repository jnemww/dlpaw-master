import Enumerable from 'linq';
import DataTable from './DataTable';
import React, { useEffect, useState, useContext } from 'react';
import { SEATS } from '../enums';
import GroupedTable from './GroupedTable';
//import {GameDataContext} from './Params'
//import {FunctionSubscription, canUse} from './FunctionSubscription'
import {FunctionSubscription} from './FunctionSubscription'

export default function BettingStats({ token, league, season, status }) {
    //const gameData = useContext(GameDataContext);

    const pe = process.env;
    const gamessurl = pe.REACT_APP_SERVICE_URL + pe.REACT_APP_ALL_GAMES_URL;
    const leaguetkn = pe.REACT_APP_LEAGUE_TOKEN;
    const seasontkn = pe.REACT_APP_SEASON_TOKEN;
    const sf = pe.REACT_APP_SPACE_FILLER;
    const BETTYPE = [{Name: "Post/Open", RaiseIndex: 1},
        {Name: "Raise", RaiseIndex: 2},
        {Name: "3-Bet", RaiseIndex: 3},
        {Name: "4-Bet", RaiseIndex: 4},
        {Name: "5-Bet", RaiseIndex: 5}];
    const [thrbsumry, setThrbsumry] = useState();
    const [selthrbdetails, setSelthrbdetails] = useState();
    const [games, setGames] = useState();
    const [selnemesis, setSelnemesis] = useState();
    const [selectedgamedetails, setSelectedgamedetails] = useState();
    const [selectedplayer, setSelectedplayer] = useState();
    const [street, setStreet] = useState();
    const [selbettype, setSelbetType] = useState(BETTYPE.ThreeBet);
    const [error, setError] = useState();
    const [selecteddetails, setSelecteddetails] = useState();
    const [selectedgame, setSelectedgame] = useState();
    const [bets, setBets] = useState();
    const [openingbets, setOpeningbets] = useState();
    const [openingbetdetails, setOpeningbetdetails] = useState();
    const [nemesis, setNemesis] = useState();
    const [thrbdetails, setThrbdetails] = useState();
    //const [hasPermission, setHasPermission] = useState(isPermitted.value);

    //setHasPermission(isPermitted.value);

    // const [canUse, setCanUse] = useState(false);
    // const [subCode, setSubCode] = useState();

    /******************************************/

    const configCols = {
        PREFLOP: {},
        FLOP: {}
    };

    let mycolumns1 = [
        {
            Header: `${selectedplayer}(B) vs`,
            columns: [
                {
                    Header: 'Opponent(O)',
                    accessor: 'opponent',
                    Aggregated: ({ value }) => {isNullOrUndefined(value,"")}
                    //Cell: ({value}) =>  <div>{value}</div>,
                    //canGroupBy: true
                },
            ],
        },
        {
            Header: 'Hand Info',
            columns: [
                {
                    Header: 'Game',
                    accessor: 'game',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) => <div style={{ textAlign: "center" }}>{value}</div>,
                    canGroupBy: true
                },
                {
                    Header: 'HandID',
                    accessor: 'handID',
                    canGroupBy: false
                },
                {
                    Header: 'B',
                    accessor: 'bettor_holecards',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) =>  <div>{getCardImages(value)}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'O',
                    accessor: 'opponent_holecards',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) =>  <div>{getCardImages(value)}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Board',
                    accessor: 'board',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) => <div>{getCardImages(value)}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'BB',
                    accessor: 'blind_big',
                    aggregate: 'sum',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Pos B',
                    accessor: 'position_b',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) => <div style={{ textAlign: "center" }}>{value}</div>,
                    canGroupBy: true
                },
                {
                    Header: 'Pos O',
                    accessor: 'position_o',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) => <div style={{ textAlign: "center" }}>{value}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Seated',
                    accessor: 'nhanded',
                    aggregate: 'sum',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                }
            ]
        },
        {
            Header: 'Quantities (in big blinds)',
            columns: [
                {
                    Header: 'Stack(B)',
                    accessor: 'chipstack_bb',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Stack(O)',
                    accessor: 'opp_chipstack_bb',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Bet',
                    accessor: 'amount_bb',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Profit',
                    accessor: 'bb_profit',
                    aggregate: 'sum',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}></div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                },
                {
                    Header: 'Profit($)',
                    accessor: 'profit',
                    aggregate: 'sum',
                    Aggregated: ({ value }) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    Cell: ({value}) => <div style={{ textAlign: "right" }}>{parseInt(value).toLocaleString()}</div>,
                    canGroupBy: false
                }
            ],
        },
    ];

    // let mycolumns1 = React.useMemo(
    //     () => [
    //         {
    //             Header: `${selectedplayer} vs`,
    //             columns: [
    //                 // {
    //                 //     Header: 'Bettor',
    //                 //     accessor: 'player',
    //                 //     // Use a two-stage aggregator here to first
    //                 //     // count the total rows being aggregated,
    //                 //     // then sum any of those counts if they are
    //                 //     // aggregated further
    //                 //     aggregate: 'count',
    //                 //     Aggregated: ({ value }) => `${value} Jerks`,
    //                 // },
    //                 {
    //                     Header: 'Opponent',
    //                     accessor: 'opponent',
    //                     // Use another two-stage aggregator here to
    //                     // first count the UNIQUE values from the rows
    //                     // being aggregated, then sum those counts if
    //                     // they are aggregated further
    //                     aggregate: 'uniqueCount',
    //                     Aggregated: ({ value }) => `${value} Unique Names`,
    //                 },
    //             ],
    //         },
    //         {
    //             Header: 'Hand Info',
    //             columns: [
    //                 {
    //                     Header: 'Game',
    //                     accessor: 'game'
    //                 },
    //                 {
    //                     Header: 'HandID',
    //                     accessor: 'handID'
    //                 },
    //                 {
    //                     Header: 'B-Hand',
    //                     accessor: 'bettor_holecards'
    //                 },
    //                 {
    //                     Header: 'O-Hand',
    //                     accessor: 'opponent_holecards'
    //                 },
    //                 {
    //                     Header: 'Profit',
    //                     accessor: 'profit',
    //                     aggregate: 'sum',
    //                     Aggregated: ({ value }) => `${value} (total)`,
    //                 }
    //             ],
    //         },
    //     ],
    //     []
    // );

    //const data = React.useMemo(() => makeData(10000), []);


    const mycolumns = [
        { Header: "ID", accessor: "handID" },
        { Header: "Player", accessor: "player" },
        { Header: "Oppnt", accessor: "opponent" },
        { Header: "Bettor Hand", accessor: "bettor_holecards" },
        { Header: "Opp. Hand", accessor: "opponent_holecards" }
    ];
    const cgroups = [
        { Header: "Id", Footer: "Id", accessor: "id" },
        {
            Header: "Name",
            Footer: "Name",
            columns: [
                { Header: "First Name", Footer: "First Name", accessor: "first_name" },
                { Header: "Last Name", Footer: "Last Name", accessor: "last_name" }
            ]
        },
        {
            Header: "Info",
            Footer: "Info",
            columns: [
                { Header: "Date of Birth", accessor: "date_of_birth" },
                { Header: "Country", accessor: "country", Footer: "Country" }
            ]
        }
    ];
    // const columns = useMemo(() => mycolumns,[]);//cgroups, []);
    // const data = useMemo(() => mydata, []);

    /************************************/

    useEffect(() => {
        (async () => {
            if (!(season == undefined)) {
                status.addToQueue();
                const results = await getGames();
                if(results.Success){
                    setGames(results.Value);
                } else {
                    setError(results.Value);
                }
                status.removeFromQueue();
            }
        })();
    }, [season]);

    useEffect(() => {
        if (!(games == undefined || street == undefined || selbettype == undefined)) {
            (async() => {
                status.addToQueue();
                setSelthrbdetails(undefined);
                const result = await calcStats(games);
                if(result.Success){
                    setThrbsumry(result.selectedbetssummary);
                    if(result.threebdetail.length > 0){
                        setThrbdetails(result.threebdetail);
                    }
                } else {
                    setError(result.Message)
                }
                status.removeFromQueue();
            })();
            // calcStats(games)
            //     .then((result) => {
            //         setThrbsumry(result.threebetsummary);
            //         setThrbdetails(result.threebdetail);  
            //     })
            //     .catch((error) => setError(error.message))
        }
    }, [street, games, selbettype]);

    useEffect(() => {
        setSelthrbdetails(undefined);
    }, [street]);

    useEffect(() => {
        //status.addToQueue();
        setSelthrbdetails(undefined);
        //setSelectedgamedetails(undefined);
        if (selectedplayer == undefined || street == undefined || thrbdetails == undefined) return;

        let d = Enumerable.from(thrbdetails)
            .where(x => x.player == selectedplayer)
            .toArray();
        if(d.length > 0){
            setSelthrbdetails(d);
        }
        //status.removeFromQueue();

        // let n = Enumerable.from(nemesis)
        //     .where(x => x.Player == selectedplayer)
        //     .toArray();
        // setSelnemesis(n);

    }, [selectedplayer, street]);

    // useEffect(() => {
    //     console.log(selectedgame);
    //     setSelectedgamedetails(undefined);
    //     if (selectedgame == undefined || selectedplayer == undefined) return;

    //     let d = Enumerable.from(bets)
    //         .where(x => x.player == selectedplayer && x.game == selectedgame)
    //         .toArray();
    //         setSelectedgamedetails(d);
    // }, [selectedgame]);

    function getGames() {
        return new Promise(async (resolve, reject) => {
            try {
                //status(true);
                let url = gamessurl
                    .replace(leaguetkn, league)
                    .replaceAll(" ", sf)
                    .replace(seasontkn, season);
                var res = await fetch(url, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const games = await res.json();
                const fg = games.filter(g => g.id.match(/G[0-9]/));
                //setGames(fg);
                resolve({ Success: true, Value: fg });
                //status(false);

            } catch (err) {
                reject({ Success: false, Value: err.message });
                //setError(err);
                //return false;
                //status(false);
            }
        })
    }

    // async function getGames() {}
    //     try {
    //         status(true);

    //         const re0 = /G[0-9]/;
    //         const re1 = /SeasonInfo/;

    //         // if (docID === undefined ||
    //         // !docID.match(re0)) {
    //         //     console.log("Document doesn't qualify for update.");
    //         //     return;
    //         // }

    //         let url = gamessurl
    //             .replace(leaguetkn, league)
    //             .replaceAll(" ", sf)
    //             .replace(seasontkn, season);
    //         var res = await fetch(url, {
    //             headers: { 'Authorization': 'Bearer ' + token }
    //         });
    //         const games = await res.json();
    //         setGames(games.filter(g => g.id.match(re0)));
    //         status(false);
    //         return true;

    //     } catch (err) {
    //         setError(err);
    //         return false;
    //     }
    // }

    function getOpponent(handID, actionidx, raiselevel, actions) {
        try {
            let p = Enumerable.from(actions)
                .where(a => a.handID == handID &&
                    a.action_idx < actionidx &&
                    a.raise_idx == raiselevel)
                .select(x => x.player).first();
            //console.log("p=",p);
            return p;
        }
        catch (error) {
            return "";
        }
    }

    function labelSeats(hands) {
        let results = [];
        let labels = SEATS.ids;
        let handids = Enumerable.from(hands)
            .groupBy(g => g.handID)
            .select(h => h.first().handID)
            .toArray()

        handids.forEach((handid) => {
            let players = Enumerable.from(hands)
                .where(h => h.handID == handid)
                .toArray();

            let button = players.find(p => p.isbutton == 1);
            let bi = players.indexOf(button);
            let pc = players.length;
            let positions = Array(pc);
            let configs = SEATS.configs.find(c => c.players == pc).ids;

            for (let n = 0; n < positions.length; n++) {
                let idx = n - bi;
                if (idx < 0) idx += pc;
                positions[n] = { ...labels[configs[idx]], handID: handid, player: players[n].player, nhanded: pc };
            }
            results.push(...positions);
        })
        return results;
    }

    function getCardImages(value){
        const cards = [];
        if(value == undefined || value == null || value == ""){
            cards.push(<></>);
        } else {
            value = value.replace("]","").replace("[","[ ").trim();
            const i = value.indexOf("[");
            
            value.split(" ").forEach((c) => {
                if(c.length>0){
                    if(c.trim() == "["){
                        cards.push(<span> x </span>)
                    } else {
                        cards.push(<img className='bettingcard' src={`./images/c${c.toLowerCase()}.png`} />);
                    }
                }
            })
        }
        return cards;
    }

    function calcStats(games) {
        return new Promise((resolve, reject) => {
            try {
                const raiseIndex = BETTYPE.find(b => b.Name == selbettype).RaiseIndex;
                let allbets = [];
                let handcounts = [];
                let selbetsdetail = [];
                //let allactions = [];
                //let allhndsmry = [];
                let betopps = [];

                games.forEach(h => {
                    var position = Enumerable.from(h.hands)
                        .selectMany(hid => Enumerable.from(hid.seats), (h, s) => ({ h, s }))
                        .select((p) => ({ handID: p.h.handID, blind_big: p.h.blind_big, player: p.s.player, chipstack: p.s.chipstack, id: p.s.id, isbutton: p.s.isbutton }))
                        .groupBy(x => x.handID)
                        .selectMany((h, i) =>
                            h.select((x, j) => ({ handID: x.handID, player: x.player, id: x.id, chipstack: x.chipstack, isbutton: x.isbutton, position: j })))
                        .toArray();

                    let handcount = Enumerable.from(position)
                        .groupBy(g => g.player)
                        .select(p => ({ player: p.first().player, handsseen: p.count() }))
                        .toArray();

                    let seats = labelSeats(position);

                    let game = h.id;

                    var actions = Enumerable.from(h.hands)
                        .selectMany((hid) => Enumerable.from(hid.streets).where(s => s.name == street), (h, s) => ({ h, s }))
                        .where(x => !(x.s.actions == null))
                        .selectMany(s => s.s.actions, (a, p) => ({handID: a.h.handID, blind_big: a.h.blind_big, street: a.s.name, player: p.player, action: p.action, amount: p.amount}))
                        .groupBy(x => x.handID)
                        .selectMany((h, i) =>
                            h.select((x, j) => ({ game: game, handID: x.handID, blind_big: x.blind_big, player: x.player, action: x.action, amount: x.amount, action_idx: j })))
                        .toArray();

                    var hndsmry = Enumerable.from(h.hands)
                        .selectMany(hid => hid.summary.playerinfo, (h, pi) => ({ h, pi, ...{board: `${h.summary.board} ${h.summary.rabbit.length>0?"[":""}${h.summary.rabbit}${h.summary.rabbit.length>0?"]":""}`} }))
                        .select(r => ({ handID: r.h.handID, player: r.pi.player, board: r.board, holecards: r.pi.holecards, profit: r.pi.profit }))
                        .toArray();

                    var bets0 = Enumerable.from(actions)
                        .where(a => a.action == "posts big blind" || a.action == "bets" || a.action == "raises to")
                        .groupBy(x => x.handID)
                        .selectMany(h =>
                            h.select((x, j) => ({
                                ...x,
                                position: Enumerable.from(seats)
                                    .where(a => a.handID == x.handID && a.player == x.player)
                                    .select(x => x.id).first(),
                                nhanded: Enumerable.from(seats)
                                    .where(a => a.handID == x.handID && a.player == x.player)
                                    .select(x => x.nhanded).first(),
                                raise_idx: j + 1,
                                bet_name: BETTYPE.find(b => b.RaiseIndex == (j+1)).Name
                            })))
                        //.where(f => f.raise_idx == raiseIndex)
                        .toArray();

                    bets0 = Enumerable.from(bets0)
                        .select(x => ({ ...x, ...{ opponent: isNullOrUndefined(getOpponent(x.handID, x.action_idx, x.raise_idx - 1, bets0), "NA") } }))
                        .toArray();

                    var bets = Enumerable.from(bets0)
                        .join(Enumerable.from(hndsmry),
                            a => a.handID + a.player,
                            b => b.handID + b.player,
                            (a, b) => ({ ...a, ...b, ...{ bettor_holecards: b.holecards, board: b.board } }))
                        .toArray();

 
/*
                    var oppty0 = Enumerable.from(actions)
                        .select(p => ({
                            game: game,
                            player: p.player,
                            handID: p.handID,
                            action_idx: p.action_idx,
                            opportunity_idx: -1,
                            opportunity_raise_idx: p.raise_idx,
                            count: 1
                        }))
                        .toArray();

                    oppty0.forEach(o => {
                            //what two bet actions does this action lie between
                        try{
                            let minid = Enumerable.from(bets)
                                .where(n => n.handID == o.handID &&
                                    n.raise_idx == (raiseIndex - 1) &&
                                    n.player != o.player)
                                .select(r => r.action_idx)
                                .defaultIfEmpty(-1)
                                .toArray()[0];

                            let maxid = Enumerable.from(bets)
                                .where(n => n.handID == o.handID &&
                                    n.raise_idx == raiseIndex &&
                                    n.player != o.player)
                                .select(r => r.action_idx)
                                .defaultIfEmpty(1000)
                                .toArray()[0];

                            //let p = f.player_b !== f.player_o;
                            //let g = ((maxid == 0 || maxid > f.action_idx_o) && f.action_idx_o > minid);
                            //if (p && g) { 
                            if(minid < o.action_idx && o.action_idx < maxid) {
                                o.opportunity_idx = maxid;
                                o.opportunity_raise_idx = raiseIndex;
                            }

                        } catch (error) {
                            console.log("", error.message);

                        }
                    });

                    var oppty = Enumerable.from(oppty0)
                        .select(p => ({
                            game: game,
                            player: p.player,
                            handID: p.handID,
                            action_idx: p.action_idx,
                            opportunity_idx: p.opportunity_idx,
                            opportunity_raise_idx: p.opportunity_raise_idx,
                            count: 1
                        }))
                        .toArray();

                    var opptysum = Enumerable.from(oppty)
                        .groupBy(g => g.player)
                        .select(r => ({ player: r.first().player, opptys: r.count() }))
                        .toArray();
*/

                    var selectedbets0 = Enumerable.from(bets)
                        .join(Enumerable.from(position),
                            a => a.handID + a.player,
                            b => b.handID + b.player,
                            (a, b) => ({ ...a, ...{chipstack: b.chipstack} }))
                        .where(s => s.raise_idx == raiseIndex)
                        .toArray();

                    let selectedbets1 = selectedbets0.map(m => {return {...m, ...{opp_chipstack: -1}}});

                    if(raiseIndex > 1) {
                        selectedbets1 = Enumerable.from(selectedbets1)
                            .join(Enumerable.from(position),
                                a => a.handID + a.player,
                                b => b.handID + b.player,
                                (a, b) => ({ ...a, ...{chipstack: b.chipstack} }))
                            .join(Enumerable.from(position),
                                a => a.handID + a.opponent,
                                b => b.handID + b.player,
                                (a, b) => ({ ...a, ...{opp_chipstack: b.chipstack} }))
                            .toArray()
                    }

                    let selectedbets = Enumerable.from(selectedbets1)
                        .select(x => ({
                            game: game,
                            handID: x.handID,
                            player: x.player,
                            chipstack_bb: x.chipstack/x.blind_big,
                            opp_chipstack_bb: x.opp_chipstack/x.blind_big,
                            blind_big: x.blind_big,
                            action: x.action,
                            amount_bb: x.amount/x.blind_big,
                            action_idx: x.action_idx,
                            raise_idx: x.raise_idx,
                            bb_profit: x.profit/x.blind_big,
                            profit: x.profit,
                            opponent: x.opponent,
                            board: x.board,
                            bettor_holecards: x.bettor_holecards,
                            opponent_holecards: x.raise_idx > 0 ? Enumerable.from(hndsmry).where(a => a.player == x.opponent && a.handID == x.handID).select(x => x.holecards).defaultIfEmpty().first() : "",
                            position_b: x.position,
                            position_o: Enumerable.from(seats)
                                .where(a => a.handID == x.handID && a.player == x.opponent)
                                .select(x => x.id).defaultIfEmpty().first(),
                            nhanded: x.nhanded
                        }))
                        .toArray();
/* original */
                //    var oppty0 = Enumerable.from(actions)
                //         .join(Enumerable.from(bets),
                //             a => a.handID,
                //             b => b.handID,
                //             (a, b) => ({handID: a.handID,
                //                         player_o: a.player,
                //                         player_b: b.player,
                //                         action_idx_o: a.action_idx,
                //                         action_idx_b: b.action_idx,
                //                         raise_idx: b.raise_idx}))
                //         .toArray();

                //     var oppty = Enumerable.from(oppty0)
                //         .where(f => {
                //             // is there a bet posed to a.action in b
                //             //   where a.action_idx is greater than b.action_idx
                //             //   and a.action_idx is less than b.action_idx where b.raise_idx
                //             //   equals b.raise_idx + 1
                            
                //             let minid = f.action_idx_b;
                //             let maxid = Enumerable.from(bets)
                //                 .where(n => n.handID == f.handID &&
                //                     n.raise_idx == (f.raise_idx + 1))
                //                 .select(r => r.action_idx)
                //                 .defaultIfEmpty(0)
                //                 .toArray()[0];

                //             let p = f.player_b !== f.player_o;
                //             let g = ((maxid == 0 || maxid > f.action_idx_o) && f.action_idx_o > minid);
                //             if (p && g) {
                //                 return true;
                //             }
                //             return false;
                //         })
                //         .select(p => ({
                //             game: game,
                //             player: p.player_o,
                //             handID: p.handID,
                //             action_idx: p.action_idx_o,
                //             opportunity_idx: p.action_idx_b,
                //             opportunity_raise_idx: p.raise_idx,
                //             count: 1
                //         }))
                //         .toArray();
/************/

/* new */
                    //for all n-bets:
                    //find all actions having n-bet opportunities
                    Enumerable.from(bets)
                        .where(f => f.raise_idx == (raiseIndex -1))
                        .toArray()
                        .forEach((bet) => {
                            try{
                                let minid = bet.action_idx;
                                let maxid = Enumerable.from(bets)
                                    .where(n => n.handID == bet.handID &&
                                        n.raise_idx == raiseIndex &&
                                        n.player != bet.player)
                                    .select(r => r.action_idx)
                                    .defaultIfEmpty(1000)
                                    .toArray()[0];

                                let oppty = Enumerable.from(actions)
                                        .where(f => f.handID == bet.handID &&
                                                f.action_idx > minid &&
                                                f.action_idx <= maxid)
                                    .select(p => ({
                                        game: game,
                                        player: p.player,
                                        handID: p.handID,
                                        action_idx: p.action_idx,
                                        opportunity_idx_start: minid,
                                        opportunity_idx_end: maxid,
                                        opportunity_raise_idx: raiseIndex,
                                        count: 1
                                    }))
                                    .toArray();

                                if(oppty.length) {
                                    betopps.push(...oppty);
                                }

                            } catch (error) {
                                console.log("", error.message);

                            }
                        })
/*********/
                    handcounts.push(...handcount);
                    allbets.push(...bets);
                    //allactions.push(...selectedbets);
                    selbetsdetail.push(...selectedbets);
                    //betopps.push(...oppty);
                    //allhndsmry.push(...hndsmry);
                });

                var totalhands = Enumerable.from(handcounts)
                    .groupBy(g => g.player)
                    .select(p => ({ player: p.first().player, handsdealt: p.sum(s => s.handsseen) }))
                    .toArray();

                var opptysum = Enumerable.from(betopps)
                    //.where(s => s.opportunity_raise_idx == (raiseIndex - 1))
                    .groupBy(g => g.player)
                    .select(r => ({ player: r.first().player, opptys: r.count() }))
                    .toArray();

                var selbetsumry = Enumerable.from(selbetsdetail)
                    .groupBy(g => g.player)
                    .select(o => ({
                        player: o.first().player,
                        selectedbets: o.count(),
                        opptys: Enumerable.from(opptysum).where(a => a.player == o.first().player).select(x => x.opptys).defaultIfEmpty(0).first(),
                        dealt: Enumerable.from(totalhands).where(a => a.player == o.first().player).select(x => x.handsdealt).defaultIfEmpty(0).first()
                    }))
                    .select(r => ({
                        Player: r.player,
                        "Bets": r.selectedbets,
                        "Oppty's": r.opptys,
                        "Bet %": ((r.selectedbets / r.opptys) * 100.00).toFixed(2),
                        "Dealt": r.dealt
                    }))
                    .orderBy(o => o.Player.toLowerCase())
                    .toArray();

                // var threebsumry = Enumerable.from(threebdetail)
                //     .groupBy(p => p.Player)
                //     .select(s => ({ Player: s.first().Player, 
                //                     "3-Bets": s.sum(x => x["3-Bets"]), 
                //                     "Oppty's": s.sum(x => x["Oppty's"]), 
                //                     "3-Bet %" : ((s.sum(x => x["3-Bets"]) / s.sum(x => x["Oppty's"]))*100.00).toFixed(2)
                //                 }))
                //     .toArray();

                // var nemesis = Enumerable.from(allactions)
                //     .groupBy(g => g.player + g.opponent)
                //     .select(x => ({	Player: x.first().player,
                //                     Opponent: x.first().opponent,
                //                     Raised: x.count()
                //     }))
                //     .orderBy(o => o.Player)
                //     .thenByDescending(o => o.Raised)
                //     .toArray();

                // var betsbypos = Enumerable.from(allbets)
                //     .where(b => b.raise_idx == 0)
                //     .groupBy(g => g.player + g.position)
                //     .select(b => ({ Player: b.first().player,
                //                     Position: b.first().position,
                //                     Profit: b.sum(p => p.profit),
                //                     Count: b.count(),
                //                     TotalHands: Enumerable.from(handcounts)
                //                         .where(p => p.player == b.first().player)
                //                         .groupBy(g => g.player)
                //                         .select(r => r.sum(s => s.handsseen)).first()
                //                 }))
                //     .toArray();

                if(selbetsumry.length == 0){
                    selbetsumry.push({Results: "None."
                    // ,
                    //     "Bets": "",
                    //     "Oppty's": 0,
                    //     "Bet %": 0,
                    //     "Dealt": 0
                    });
                }
                const result = {Success: true,
                                selectedbetssummary: selbetsumry,
                                threebdetail: selbetsdetail};
                //status(false);
                resolve(result);
            } catch (error) {
                //status(false);
                reject({Success: false, Message: error.message});
            }
        })
    }

    // function calcStats(games) {
    //     let allbets = [];
    //     let handcounts = [];
    //     let threebdetail = [];
    //     //let allactions = [];
    //     //let allhndsmry = [];
    //     let thrbopps = [];

    //     games.forEach(h => {
    //         var position = Enumerable.from(h.hands)
    //             .selectMany(hid => Enumerable.from(hid.seats), (h, s) => ({ h, s }))
    //             .select((p) => ({ handID: p.h.handID, player: p.s.player, id: p.s.id, isbutton: p.s.isbutton }))
    //             .groupBy(x => x.handID)
    //             .selectMany((h, i) =>
    //                 h.select((x, j) => ({ handID: x.handID, player: x.player, id: x.id, isbutton: x.isbutton, position: j })))
    //             .toArray();

    //         let handcount = Enumerable.from(position)
    //             .groupBy(g => g.player)
    //             .select(p => ({player: p.first().player, handsseen: p.count()}))
    //             .toArray();

    //         let seats = labelSeats(position);

    //         let game = h.id;

    //         var actions = Enumerable.from(h.hands)
    //             .selectMany((hid) => Enumerable.from(hid.streets).where(s => s.name == street?.name), (h, s) => ({ h, s }))
    //             .where(x => !(x.s.actions == null))
    //             .selectMany(s => s.s.actions, (a, p) => ({ a, p }))
    //             .where(p => Enumerable.from(p.a.s.actions).any(x => x.player == p.p.player))
    //             .select(hs => ({ handID: hs.a.h.handID, street: hs.a.s.name, player: hs.p.player, actions: Enumerable.from(hs.a.s.actions).where(a => a.player == hs.p.player && a.action == hs.p.action && a.amount == hs.p.amount) }))
    //             .selectMany(hid => hid.actions, (h, s) => ({ h, s }))
    //             .select(hs => ({ handID: hs.h.handID, street: hs.h.street, player: hs.h.player, action: hs.s.action, amount: hs.s.amount }))
    //             .groupBy(x => x.handID)
    //             .selectMany((h, i) =>
    //                 h.select((x, j) => ({ game: game, handID: x.handID, player: x.player, action: x.action, amount: x.amount, action_idx: j })))
    //             .toArray();

    //         var hndsmry = Enumerable.from(h.hands)
    //             .selectMany(hid => hid.summary.playerinfo, (h, pi) => ({h, pi}))
    //             .select(r => ({handID: r.h.handID, player: r.pi.player, holecards: r.pi.holecards, profit: r.pi.profit}))
    //             .toArray();

    //         var bets0 = Enumerable.from(actions)
    //             .where(a => a.action == "bets" || a.action == "raises to")
    //             .groupBy(x => x.handID)
    //             .selectMany(h =>
    //                 h.select((x, j) => ({...x,
    //                                         position: Enumerable.from(seats)
    //                                             .where(a => a.handID == x.handID && a.player == x.player)
    //                                             .select(x => x.id).first(),
    //                                         nhanded: Enumerable.from(seats)
    //                                             .where(a => a.handID == x.handID && a.player == x.player)
    //                                             .select(x => x.nhanded).first(),
    //                                         raise_idx: j
    //                 })))
    //             .toArray();

    //         bets0 = Enumerable.from(bets0)
    //             .select(x => ({...x, ...{opponent: getOpponent(x.handID, x.action_idx, x.raise_idx-1, bets0)}}))
    //             .toArray();

    //         var bets = Enumerable.from(bets0)
    //             .join(Enumerable.from(hndsmry),
    //                 a => a.handID + a.player,
    //                 b => b.handID + b.player,
    //                 (a, b) => ({...a, ...b, ...{bettor_holecards: b.holecards} }))
    //             .toArray();

    //         var j = Enumerable.from(bets)
    //         .where(f => f.handID == "#2986-1" &&
    //             f.raise_idx == 0 && 
    //             5 > f.action_idx && 
    //             f.player == "twetherald")
    //         .toArray();

    //         var oppty = Enumerable.from(actions)
    //             .where(a =>
    //                 Enumerable.from(bets)
    //                     .where(w => w.handID == a.handID)
    //                     .any(f => {
    //                         let minid = Enumerable.from(bets)
    //                             .where(n => n.handID == f.handID && 
    //                                 n.raise_idx == 0)
    //                             .select(r => r.action_idx)
    //                             .defaultIfEmpty(0)
    //                             .toArray()[0];
    //                         let maxid = Enumerable.from(bets)
    //                             .where(n => n.handID == f.handID && 
    //                                 n.raise_idx == 1)
    //                             .select(r => r.action_idx)
    //                             .defaultIfEmpty(0)
    //                             .toArray()[0];

    //                         let p = a.player !== f.player;
    //                         let g = ((maxid == 0 || maxid >= a.action_idx) && a.action_idx > minid);
    //                         if(p && g){
    //                             return true;
    //                         }
    //                         return false;
    //                     }))
    //             .select(p => ({ game: game, 
    //                             player: p.player,
    //                             handID: p.handID,
    //                             action_idx: p.action_idx,
    //                             count: 1
    //             }))
    //             .toArray();

    //         var opptysum = Enumerable.from(oppty)
    //             .groupBy(g => g.player)
    //             .select(r => ({player: r.first().player, opptys: r.count()}))
    //             .toArray();

    //         var threebet = Enumerable.from(bets)
    //             .select(x => ({
    //                 game: game, 
    //                 handID: x.handID,
    //                 player: x.player,
    //                 action: x.action,
    //                 amount: x.amount,
    //                 action_idx: x.action_idx,
    //                 raise_idx: x.raise_idx,
    //                 profit: x.profit,
    //                 opponent: x.opponent,
    //                 bettor_holecards: x.bettor_holecards,
    //                 opponent_holecards: x.raise_idx>0?Enumerable.from(hndsmry).where(a => a.player == x.opponent && a.handID == x.handID).select(x => x.holecards).first():"",
    //                 position: x.position,
    //                 nhanded: x.nhanded
    //                 }))
    //             .where(f => f.raise_idx == 1)
    //             .toArray();

    //         handcounts.push(...handcount);
    //         allbets.push(...bets);
    //         //allactions.push(...threebet);
    //         threebdetail.push(...threebet);
    //         thrbopps.push(...oppty);
    //         //allhndsmry.push(...hndsmry);
    //     });

    //     var totalhands = Enumerable.from(handcounts)
    //         .groupBy(g => g.player)
    //         .select(p => ({player: p.first().player, handsdealt: p.sum(s => s.handsseen)}))
    //         .toArray();

    //     var opptysum = Enumerable.from(thrbopps)
    //         .groupBy(g => g.player)
    //         .select(r => ({player: r.first().player, opptys: r.count()}))
    //         .toArray();

    //     var threebsumry = Enumerable.from(threebdetail)
    //         .groupBy(g => g.player)
    //         .select(o => ({ player: o.first().player,
    //                         threebets: o.count(),
    //                         opptys: Enumerable.from(opptysum).where(a => a.player == o.first().player).select(x => x.opptys).first(),
    //                         dealt: Enumerable.from(totalhands).where(a => a.player == o.first().player).select(x => x.handsdealt).first() }))
    //         .select(r => ({ Player: r.player,
    //                         "3-Bets": r.threebets,
    //                         "Oppty's": r.opptys,
    //                         "3-Bet %": ((r.threebets/r.opptys)*100.00).toFixed(2),
    //                         "Dealt" : r.dealt}))
    //         .toArray();

    //     // var threebsumry = Enumerable.from(threebdetail)
    //     //     .groupBy(p => p.Player)
    //     //     .select(s => ({ Player: s.first().Player, 
    //     //                     "3-Bets": s.sum(x => x["3-Bets"]), 
    //     //                     "Oppty's": s.sum(x => x["Oppty's"]), 
    //     //                     "3-Bet %" : ((s.sum(x => x["3-Bets"]) / s.sum(x => x["Oppty's"]))*100.00).toFixed(2)
    //     //                 }))
    //     //     .toArray();

    //     // var nemesis = Enumerable.from(allactions)
    //     //     .groupBy(g => g.player + g.opponent)
    //     //     .select(x => ({	Player: x.first().player,
    //     //                     Opponent: x.first().opponent,
    //     //                     Raised: x.count()
    //     //     }))
    //     //     .orderBy(o => o.Player)
    //     //     .thenByDescending(o => o.Raised)
    //     //     .toArray();

    //     // var betsbypos = Enumerable.from(allbets)
    //     //     .where(b => b.raise_idx == 0)
    //     //     .groupBy(g => g.player + g.position)
    //     //     .select(b => ({ Player: b.first().player,
    //     //                     Position: b.first().position,
    //     //                     Profit: b.sum(p => p.profit),
    //     //                     Count: b.count(),
    //     //                     TotalHands: Enumerable.from(handcounts)
    //     //                         .where(p => p.player == b.first().player)
    //     //                         .groupBy(g => g.player)
    //     //                         .select(r => r.sum(s => s.handsseen)).first()
    //     //                 }))
    //     //     .toArray();

    //     return {threebetsummary: threebsumry,
    //             threebdetail: threebdetail,
    //             //summary: betssummary, 
    //             //details: betresults, 
    //             //allbets:allactions,
    //             //nemesis: nemesis,
    //             //position: betsbypos
    //         };
    // }

    // This is a custom aggregator that
    // takes in an array of leaf values and
    // returns the rounded median
    function roundedMedian(leafValues) {
        let min = leafValues[0] || 0
        let max = leafValues[0] || 0

        leafValues.forEach(value => {
            min = Math.min(min, value)
            max = Math.max(max, value)
        })

        return Math.round((min + max) / 2)
    }

    function isNullOrUndefined(value, replace){
        if(value == null || value == undefined || value == "")
            return replace;
        else
            return value;
    }

    // function isSubscribed(){
    //     let sum = 0;
    //     if(subCode){
    //         [...subCode].forEach(l => {
    //             sum += l.charCodeAt(0);
    //         })
    //     }
    //     return sum == 304;
    // }

    return (
        <div>
            <FunctionSubscription>
                <table className='pokertableboard'>
                    <tr>
                        <td>
                            {/* <button onClick={getSeasonGameData}>Get Standings</button>  */}
                            Click on player name for individual results.
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <select onChange={(e) => { setStreet(e.target.value) }}>
                                <option>Select a Street</option>
                                <option>PREFLOP</option>
                                <option>FLOP</option>
                                <option>TURN</option>
                                <option>RIVER</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <select onChange={(e) => { setSelbetType(e.target.value) }}>
                                <option>Select Bet Type</option>
                                {
                                    BETTYPE.map((m) => {
                                            return (<option value={m.Name}>{m.Name}</option>)
                                            })
                                }

                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {selbettype  &&
                                <table>
                                    <tr>
                                        <td>
                                            {thrbsumry &&
                                                <DataTable tbodyData={thrbsumry}
                                                    classes={["text", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]}
                                                    rowclasses={["datatablegrey", "datatablewhite"]}
                                                    functions={[setSelectedplayer, , , , , ,]}
                                                // columns = {["Player", "Pts", "Place", "Back", "Gold", "Silver", "Bronze"]}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align='top'>
                                            {selthrbdetails &&
                                                <GroupedTable columns={mycolumns1} data={selthrbdetails} />
                                            }
                                            {/* <ReactTable columns={mycolumns} data={selthrbdetails} /> */}
                                            {/* 
                                            <DataTable tbodyData={selthrbdetails}
                                                classes={["text", "text", "numeric", "numeric", "numeric", "numeric"]}
                                                rowclasses={["datatablegrey", "datatablewhite"]}
                                                //functions={[setSelectedgame, , , ,]}
                                            /> 
                                        */}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align='top'>
                                            {selnemesis &&
                                                <DataTable tbodyData={selnemesis}
                                                    classes={["text", "text", "numeric", "numeric", "numeric", "numeric"]}
                                                    rowclasses={["datatablegrey", "datatablewhite"]}
                                                    functions={[setSelectedgame, , , ,]}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            {selectedgamedetails &&
                                                <DataTable tbodyData={selectedgamedetails}
                                                    classes={["text", "numeric", "numeric", "numeric", "numeric"]}
                                                    rowclasses={["datatablegrey", "datatablewhite"]}
                                                    functions={[, , , ,]}
                                                />
                                            }
                                        </td>
                                    </tr>
                                </table>
                            }
                        </td>
                    </tr>
                </table>
            </FunctionSubscription>
            <p />
            {error &&
                <div>Error: {error}</div>
            }
        </div>
    );
}