import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box } from '@mui/material';

// Helper function to get the next date for a given day of the week
const getNextDateForDay = (dayOfWeek, time) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay = daysOfWeek.indexOf(dayOfWeek);
  const now = new Date();
  const currentDay = now.getDay();
  const diff = (targetDay - currentDay + 7) % 7;

  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + diff);
  const [hours, minutes, seconds] = time.split(':').map(Number);
  nextDate.setHours(hours, minutes, seconds);

  return nextDate;
};

const ClassCalendar = () => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('https://hello-belly-flask-1.onrender.com/api/classes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched classes:', data); // Debugging line

        const events = data.flatMap(cls => {
          const nextDate = getNextDateForDay(cls.day_of_week, cls.time);
          const eventsArray = [];

          // Generate recurring weekly events
          for (let i = 0; i < 52; i++) {
            const event = {
              id: `${cls.id}-${i}`,
              title: cls.name,
              start: new Date(nextDate),
              end: new Date(nextDate),
              extendedProps: {
                link: cls.link,
              }
            };
            eventsArray.push(event);
            nextDate.setDate(nextDate.getDate() + 7); // Increment by 7 days for weekly recurrence
          }

          return eventsArray;
        });
        console.log('Processed events:', events); // Debugging line
        setClasses(events);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  return (
    <Box className="class-calendar" sx={{ display: 'flex', flexDirection: 'column' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={classes}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        eventClick={(info) => {
          window.open(info.event.extendedProps.link, '_blank');
        }}
        style={{ flexGrow: 1, width: '100%' }}
      />
    </Box>
  );
};
  export default ClassCalendar;