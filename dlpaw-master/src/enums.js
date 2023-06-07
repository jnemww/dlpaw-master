export const SCREEN = {
    Games: "Games",
    Frequency: "Frequency",
    Table: "Table",
    ProfitSummary: "Profit Summary",
    Standings: "Standings",
    HandQuery: "Query",
    GameScheduler: "Schedule",
    ChipCountChart: "Chipcount Chart",
    SMSOptions: "SMS Messaging",
    OddsCalculator: "Odds Calculator",
    BettingStats: "Betting Statstics",
    SeriesOdds: "Series Odds"
};

export const defaultschedule = {
    "League": "Donk League",
    "Player": null,
    "StartofWeek": null,
    "Days": [ {"Day": "Sunday", "Play": 0, "StartTime": 0},
              {"Day": "Monday", "Play": 0, "StartTime": 0},
              {"Day": "Tuesday", "Play": 0, "StartTime": 0},
              {"Day": "Wednesday", "Play": 0, "StartTime": 0},
              {"Day": "Thursday", "Play": 0, "StartTime": 0},
              {"Day": "Friday", "Play": 0, "StartTime": 0},
              {"Day": "Saturday", "Play": 0, "StartTime": 0}
        ]
}

export const PARAMETERS = {
  SEASON : "SEASON",
  GAME : "GAME",
  HAND : "HAND"
};

export const menu = [
    { label: 'Donk League' },
    {
     type: 'group', name: 'Play Review', items: [
       { value: SCREEN.Table, label: 'By Game', className: 'myOptionClassName', params: [PARAMETERS.SEASON, PARAMETERS.GAME, PARAMETERS.HAND]},
       { value: SCREEN.HandQuery, label: 'Hand Search', className: 'myOptionClassName', params: [PARAMETERS.SEASON, PARAMETERS.GAME]}
     ]},
    {
     type: 'group', name: 'Analysis', items: [
        { value: SCREEN.ProfitSummary, label: 'Profit Summary', className: 'myOptionClassName', params: [PARAMETERS.SEASON, PARAMETERS.GAME]},
        { value: SCREEN.Frequency, label: 'Play Frequencies', className: 'myOptionClassName', params: [PARAMETERS.SEASON, PARAMETERS.GAME]},
        { value: SCREEN.ChipCountChart, label: 'Chipcount Chart', className: 'myOptionClassName', params: [PARAMETERS.SEASON, PARAMETERS.GAME]},
        { value: SCREEN.BettingStats, label: 'Betting Statistics', className: 'myOptionClassName', params: [PARAMETERS.SEASON]},
        { value: SCREEN.SeriesOdds, label: 'Series Completion Odds', className: 'myOptionClassName', params: [PARAMETERS.SEASON]}
     ]},
    {
    type: 'group', name: 'More...', items: [
        { value: SCREEN.GameScheduler, label: 'Game Scheduling', className: 'myOptionClassName'},
        { value: SCREEN.Standings, label: 'League Standings', className: 'myOptionClassName', params: [PARAMETERS.SEASON]},
        { value: SCREEN.OddsCalculator, label: 'Odds Calculator', className: 'myOptionClassName'},
        { value: SCREEN.SMSOptions, label: 'SMS Messaging', className: 'myOptionClassName'}
    ]}
  ];

export const SEATS = {
  ids: [{id: "D", index: 0, position: "Late"},
        {id: "SB", index: 1, position: "Early"},
        {id: "BB", index: 2, position: "Early"},
        {id: "UTG", index: 3, position: "Early"},
        {id: "UTG1", index: 4, position: "Mid"},
        {id: "UTG2", index: 5, position: "Mid"},
        {id: "UTG3", index: 6, position: "Mid"},
        {id: "LJ", index: 7, position: "Mid"},
        {id: "HJ", index: 8, position: "Late"},
        {id: "CO", index: 9, position: "Late"}],
  configs: [{players: 2, ids: [0,2]},
            {players: 3, ids: [0,1,2]},
            {players: 4, ids: [0,1,2,3]},
            {players: 5, ids: [0,1,2,3,9]},
            {players: 6, ids: [0,1,2,3,4,9]},
            {players: 7, ids: [0,1,2,3,4,8,9]},
            {players: 8, ids: [0,1,2,3,4,5,8,9]},
            {players: 9, ids: [0,1,2,3,4,5,7,8,9]},
            {players: 10, ids: [0,1,2,3,4,5,6,7,8,9]},
          ]
};

export const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const UPDATE_TYPE = {Availability: "A", StartofWeek: "D", StartTime: "T"};

export const COLORS = ["red", "blue", "green", "purple", "black", "aqua", "pink", "fuchsia", "gold", "greenyellow"];