import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box } from '@mui/material';
import { useZoom } from './ZoomContext';
import '../CSS/ClassCalendar.css';

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
  const [events, setEvents] = useState([]);
  const { user, appointments } = useZoom();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('https://hello-belly-flask-1.onrender.com/api/classes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched classes:', data); // Debugging line

        const classEvents = data.flatMap(cls => {
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
              },
              color: 'blue', // Set color for classes
            };
            eventsArray.push(event);
            nextDate.setDate(nextDate.getDate() + 7); // Increment by 7 days for weekly recurrence
          }

          return eventsArray;
        });
        console.log('Processed class events:', classEvents); // Debugging line
        setEvents(prevEvents => [...prevEvents, ...classEvents]);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (user && appointments) {
      const appointmentEvents = appointments.map(appt => ({
        id: appt.id,
        title: appt.purpose,
        start: new Date(appt.date),
        end: new Date(appt.date),
        extendedProps: {
          link: appt.link,
        },
        color: 'purple', // Set color for appointments
      }));
      setEvents(prevEvents => [...prevEvents, ...appointmentEvents]);
    }
  }, [user, appointments]);

  return (
    <Box className="class-calendar" sx={{ display: 'flex', flexDirection: 'column' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={events}
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
      <Box className="calendar-legend" sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <span style={{ color: 'blue', marginRight: '10px' }}>■ Group Classes</span>
        <span style={{ color: 'purple' }}>■ Appointments</span>
      </Box>
    </Box>
  );
};

export default ClassCalendar;