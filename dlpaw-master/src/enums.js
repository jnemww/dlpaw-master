export const SCREEN = {
    Games: "Games",
    Frequency: "Frequency",
    Table: "Table",
    ProfitSummary: "Profit Summary",
    Standings: "Standings",
    HandQuery: "Query",
    GameScheduler: "Schedule"
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

export const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const UPDATE_TYPE = {Availability: "A", StartofWeek: "D", StartTime: "T"};