import React, { useState } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import '../styles/Calendar.css'
import '../styles/react-big-calendar.css'

moment.locale("en-GB");
const localizer = momentLocalizer(moment)

function CalendarPage() {
    // state = {
    //     events: [
    //       {
    //         start: moment().toDate(),
    //         end: moment().add(1, "days").toDate()
    //       }
    //     ]
    // };
    
    return (
        <div className='calendar'>
            <Calendar 
                views={["day", "agenda", "work_week", "month"]}
                localizer={localizer}
                defaultDate={new Date()}
                defaultView="month"
                style={{ height: "90vh" }}
            />
        </div>
    );
}

export default CalendarPage;