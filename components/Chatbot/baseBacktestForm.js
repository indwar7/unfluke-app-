const baseBacktestForm = {
    "name": "strategy_name",
    "strategyType": "strategy_one",
    "status": "active",
    "isEditing": false,
    "editStrategyId": "",
    "strategySettings": {
        "underlying": "spot",
        "tradeType": "intraday",
        "duration": "STBT_BTST",
        "weekDays": [
            "monday",
            "wednesday",
            "friday"
        ],
        "startTime": {
            "hour": 9,
            "minute": 20,
            "second": 0
        },
        "endTime": {
            "hour": 15,
            "minute": 15,
            "second": 0
        },
        "nextDayEndTime": {
            "hour": 9,
            "minute": 15,
            "second": 0
        },
        "checkConditionNextDayAfter": {
            "hour": 9,
            "minute": 15,
            "second": 0
        },
        "daysBeforeExpiry": 4
    },
    "positions": {
        "legs": [
            {
                "id": "add4de9d-336e-4506-91eb-24d63ddd7cee",
                "instrument": {
                    "option": "NIFTY",
                    "multiple": 50
                },
                "segment": "options",
                "options": "CE",
                "buysell": "buy",
                "strike": "based_on_atm",
                "strikeDetails": "ATM_0",
                "quantity": 1,
                "tradeType": "MIS",
                "target": {
                    "type": "None",
                    "value": 0
                },
                "stopLoss": {
                    "type": "None",
                    "value": 0
                },
                "trailingStopLoss": {
                    "type": "None",
                    "value": {
                        "x": 0,
                        "y": 0
                    }
                },
                "waitTime": {
                    "type": "immediate",
                    "value": 0
                },
                "reEntryCondition": {
                    "target": false,
                    "targetType": "asap",
                    "targetReentries": 0,
                    "sl": false,
                    "slType": "asap",
                    "slReentries": 0
                }
            }
        ],
        "legOptions": {
            "waitAndTrade": false,
            "moveSlToCost": false,
            "squareOff": "partial"
        },
        "reEntry": 1,
        "noReentryAfter": {
            "isEnabled": false,
            "value": ""
        }
    },
    "MTMTarget": {
        "type": "None",
        "value": 0
    },
    "MTMStopLoss": {
        "fixedStopLoss": "None",
        "value": 0
    },
    "MTMTrailing": {
        "value": "None",
        "type": "points",
        "values": {
            "x": 0,
            "y": 0
        }
    }
}

export default baseBacktestForm