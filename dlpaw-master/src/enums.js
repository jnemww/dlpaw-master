export const SCREEN = {
    Games: "Games",
    Frequency: "Frequency",
    Table: "Table",
    ProfitSummary: "Profit Summary",
    Standings: "Standings",
    HandQuery: "Query",
    GameScheduler: "Schedule",
    ChipCountChart: "Chipcount Chart"
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
        { value: SCREEN.ChipCountChart, label: 'Chipcount Chart', className: 'myOptionClassName', params: [PARAMETERS.SEASON, PARAMETERS.GAME]}
     ]},
    {
    type: 'group', name: 'More...', items: [
        { value: SCREEN.GameScheduler, label: 'Game Scheduling', className: 'myOptionClassName'},
        { value: SCREEN.Standings, label: 'League Standings', className: 'myOptionClassName', params: [PARAMETERS.SEASON]}
    ]}
  ];

export const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const UPDATE_TYPE = {Availability: "A", StartofWeek: "D", StartTime: "T"};