import React, { useState, useEffect } from 'react';

const AddClassForm = () => {
  const [name, setName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [time, setTime] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/classes');
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = selectedClass ? `http://127.0.0.1:5000/api/update_class/${selectedClass.id}` : 'http://127.0.0.1:5000/api/add_class';
    const method = selectedClass ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, day_of_week: dayOfWeek, time }),
      });
      const data = await response.json();
      if (selectedClass) {
        setClasses(classes.map(cls => (cls.id === data.id ? data : cls)));
      } else {
        setClasses([...classes, data]);
      }
      setName('');
      setDayOfWeek('');
      setTime('');
      setSelectedClass(null);
    } catch (error) {
      console.error('Error adding/updating class:', error);
    }
  };

  const handleDelete = async (classId) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/delete_class/${classId}`, {
        method: 'DELETE',
      });
      setClasses(classes.filter(cls => cls.id !== classId));
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const handleEdit = (classToEdit) => {
    setSelectedClass(classToEdit);
    setName(classToEdit.name);
    setDayOfWeek(classToEdit.day_of_week);
    setTime(classToEdit.time);
  };

  const formatTime = (time24) => {
    const [hour, minute] = time24.split(':');
    const hour24 = parseInt(hour, 10);
    const minuteInt = parseInt(minute, 10);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12}:${minuteInt < 10 ? '0' : ''}${minuteInt} ${period}`;
  };

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourStr = hour < 10 ? `0${hour}` : hour;
      const minuteStr = minute < 10 ? `0${minute}` : minute;
      timeOptions.push(`${hourStr}:${minuteStr}`);
    }
  }

  return (
    <div>
      <h2>{selectedClass ? 'Update Class' : 'Add Class'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Class Name"
          required
        />
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
          required
        >
          <option value="">Select Day of the Week</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        >
          <option value="">Select Time</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {formatTime(time)}
            </option>
          ))}
        </select>
        <button type="submit">{selectedClass ? 'Update' : 'Add'}</button>
        {selectedClass && <button onClick={() => {
          setSelectedClass(null);
          setName('');
          setDayOfWeek('');
          setTime('');
        }}>Cancel</button>}
      </form>

      <h2>Existing Classes</h2>
      <ul>
        {classes.map((classItem) => (
          <li key={classItem.id}>
            <h3>{classItem.name}</h3>
            <p>Day: {classItem.day_of_week}</p>
            <p>Time: {formatTime(classItem.time)}</p>
            <p>Link: <a href={classItem.link} target="_blank" rel="noopener noreferrer">Join Class</a></p>
            <button onClick={() => handleEdit(classItem)}>Edit</button>
            <button onClick={() => handleDelete(classItem.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddClassForm;