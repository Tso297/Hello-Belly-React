import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, Providers } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export const ZoomContext = createContext();

export const ZoomProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [zoomAccessToken, setZoomAccessToken] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [isDoctor, setIsDoctor] = useState(false);
    const [doctorId, setDoctorId] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log('Auth state changed. Current user:', currentUser);
            setUser(currentUser);
            if (currentUser) {
                try {
                    const response = await fetch('http://localhost:5000/get_zoom_token', { method: 'POST' });
                    const data = await response.json();
                    setZoomAccessToken(data.access_token);
                    fetchAppointments(currentUser.email);
                    checkIfDoctor(currentUser.email);
                } catch (error) {
                    console.error('Error fetching Zoom token:', error);
                }
            } else {
                setAppointments([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchAppointments = async (email) => {
        console.log('Fetching appointments for email:', email);
        try {
            const response = await fetch(`http://localhost:5000/api/appointments?email=${email}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setAppointments(data.appointments);
            console.log('Fetched appointments:', data.appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const checkIfDoctor = async (email) => {
        console.log('Checking if user is a doctor for email:', email);
        try {
            const response = await fetch(`http://localhost:5000/api/is_doctor?email=${email}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setIsDoctor(data.is_doctor);
            console.log('Is doctor:', data.is_doctor);
            if (data.is_doctor) {
                const doctorResponse = await fetch(`http://localhost:5000/api/doctor_by_email?email=${email}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const doctorData = await doctorResponse.json();
                setDoctorId(doctorData.id);
                console.log('Fetched doctor ID:', doctorData.id);
            }
        } catch (error) {
            console.error('Error checking if user is a doctor:', error);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, Providers.google);
            const token = await result.user.getIdToken();
            setZoomAccessToken(token);
            fetchAppointments(result.user.email);
            checkIfDoctor(result.user.email);
        } catch (error) {
            console.error('Error during Google sign-in:', error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setZoomAccessToken('');
            setAppointments([]);
            setIsDoctor(false);
            setDoctorId(null);
            localStorage.removeItem('zoomAccessToken');
        } catch (error) {
            console.error('Error during sign-out:', error);
        }
    };

    return (
        <ZoomContext.Provider value={{ user, zoomAccessToken, appointments, setAppointments, handleGoogleSignIn, handleSignOut, isDoctor, doctorId }}>
            {children}
        </ZoomContext.Provider>
    );
};

export const useZoom = () => useContext(ZoomContext);