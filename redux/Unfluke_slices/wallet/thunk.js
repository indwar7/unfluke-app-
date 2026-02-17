import {setHistory,setMyEarnings,setStrategyEarnings } from "./reducer";
import { getWalletHistory } from "../../../Unfluke_helpers/backend_helper";

function formatDateTimeToIST(originalDate) {
    const dateObj = new Date(originalDate);

    // Format date to "19 Mar, 2024"
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    const formattedDate = dateFormatter.format(dateObj);

    // Format time to IST with AM/PM
    const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // This ensures the time is in 12-hour format with AM/PM
    };
    const timeFormatter = new Intl.DateTimeFormat('en-GB', options);
    const timeParts = timeFormatter.formatToParts(dateObj);
    
    // Extracting formatted time components and concatenating AM/PM
    const formattedTime = timeParts
        .filter(part => part.type !== 'literal') // Filter out unnecessary literals like commas
        .map(part => part.value)
        .join(' '); // Join with space to ensure proper spacing

    return {
        date: formattedDate,
        time: formattedTime
    };
}
// // Usage
// const formatted = formatDateTimeToIST("2024-03-19T05:07:08.563Z");
// console.log("Formatted Date:", formatted.date); // "19 Mar, 2024"
// console.log("Formatted Time (IST):", formatted.time); // "10:37"


export const WalletHistory = (id)=>async(dispatch)=>{
    try {
        const Status = {
            "success":"Success",
            "failed":"Failed",
            "pending":"Processing",
        }
        let history = await getWalletHistory({user:id})
       history = history.map(item=>{
            return  {
                icon: item.transactionsName.includes("Funds_Deposit") ? "ri-arrow-right-down-fill" : "ri-arrow-right-up-fill",
                iconClass: item.transactionsName.includes("Funds_Deposit") ? "success" : "danger",
                date: formatDateTimeToIST(item.createdAt).date,
                time: formatDateTimeToIST(item.createdAt).time,
                type: item.transactionsName,
                amount: item.amount,
                status: Status[item.status],
            }

        })
        dispatch(setHistory(history))
    } catch (error) {
        dispatch(setHistory([]))
    }
}

export const SetMyEarnings = (points) => (dispatch)=>{
    try {
        dispatch(setMyEarnings(points))
    } catch (error) {
        dispatch(setMyEarnings(0))
    }
}

export const SetStrategyEarnings = (points) => (dispatch)=>{
    try {
        dispatch(setStrategyEarnings(points))
    } catch (error) {
        dispatch(setStrategyEarnings(0))
    }
}
