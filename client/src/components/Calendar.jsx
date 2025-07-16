import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import '../styles/Calendar.css'
import '../styles/react-big-calendar.css'

moment.locale("en-GB");
const localizer = momentLocalizer(moment)

const now = new Date();

const events = [
    {
        id: 0,
        title: "Today",
        start: new Date(new Date().setHours(new Date().getHours() - 3)),
        end: new Date(new Date().setHours(new Date().getHours() + 3))
    },
    {
        id: 1,
        title: "Point in Time Event",
        start: now,
        end: now
    }
];


function CalendarPage() {

    const [date, setDate] = useState(now);
    const [view, setView] = useState(Views.MONTH);

    // const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
    const onNavigate = (newDate) => setDate(newDate);

    const onView = (newView) => setView(newView);
    // const onView = useCallback((newView) => setView(newView), [setView]);


    const [eventsData, setEventsData] = useState(events);


    const handleSelect = ({ start, end }) => {
        console.log(start);
        console.log(end);
        const title = window.prompt("New Event name");
        if (title)
          setEventsData([
            ...eventsData,
            {
              start,
              end,
              title
            }
          ]);
    };
    
    return (
        <div className='calendar'>
            <Calendar 
                views={["day", "work_week", "month"]}
                view={view}
                date={date}
                onNavigate={onNavigate}
                onView={onView}
                //selectable
                localizer={localizer}
                defaultDate={new Date()}
                defaultView="month"
                style={{ height: "80vh" }}
                //events={eventsData}
            />
        </div>
    );
}

export default CalendarPage;