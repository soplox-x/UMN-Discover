import React, { useState, useCallback, useMemo } from "react";
import { Calendar, momentLocalizer, luxonLocalizer, Views } from 'react-big-calendar'
import { DateTime, Settings } from 'luxon'
import '../styles/Calendar.css'
import '../styles/react-big-calendar.css'


const defaultTZ = DateTime.local().setZone("America/Chicago")
const defaultTZStr = defaultTZ.zoneName
console.log(defaultTZ)
const defaultDateStr = '2025-08-06'

function getDate(str, DateTimeObj) {
  return DateTimeObj.fromISO(str).toJSDate()
}

const now = new Date();

const events = [
    {
        id: 0,
        title: "Today",
        start: new Date(new Date().setHours(new Date().getHours())),
        end: new Date(new Date().setHours(new Date().getHours() + 1))
    },
    {
        id: 1,
        title: "Point in Time Event",
        start: now,
        end: now
    }
];


function CalendarPage() {
    const [timezone, setTimezone] = useState(defaultTZStr)

    const { defaultDate, getNow, localizer, myEvents, scrollToTime } =
        useMemo(() => {
          Settings.defaultZone = timezone
          return {
            defaultDate: getDate(defaultDateStr, DateTime),
            getNow: () => DateTime.local().toJSDate(),
            localizer: luxonLocalizer(DateTime),
            myEvents: [...events],
            scrollToTime: DateTime.local().toJSDate(),
          }
        }, [timezone])

    const [date, setDate] = useState(getNow);
    const [view, setView] = useState(Views.MONTH);

    /// const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
    const onNavigate = (newDate) => setDate(newDate);

    const onView = (newView) => setView(newView);
    /// const onView = useCallback((newView) => setView(newView), [setView]);


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
                views={["day", "work_week", "agenda", "week", "month"]}
                view={view}
                date={date}
                onNavigate={onNavigate}
                onView={onView}
                selectable
                localizer={localizer}
                defaultDate={new Date()}
                defaultView="month"
                style={{ height: "80vh" }}
                events={eventsData}
                scrollToTime={scrollToTime}
                onSelectEvent={(event) => alert(event.title)}
                onSelectSlot={handleSelect}
            />
        </div>
    );
}

export default CalendarPage;