import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Navbar from './Componenets/Navbar/Navbar';
import Header from './Componenets/Header/Header';
import Accueil from './Componenets/Acceueil/Accueil';
import Register from './Componenets/LoginRegister/Register';
import Login from './Componenets/LoginRegister/Login';
// import EventList from './Componenets/Events/EventList';
import EventForm from './Componenets/Events/EventForm';
// import EventDetail from './Componenets/Events/EventDetail';
import axios from 'axios';
import Interests from './Componenets/Interests/Interests';
import SavedEvents from './Componenets/Saves/SavedEvents';
import Profile from './Componenets/Profile/Profile';
import EventDetails from './Componenets/Events/EventDetails';
import NotificationList from './Componenets/Notification/NotificationList';

function App() {
  const dispatch = useDispatch();
useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      // Optional: you can dispatch the user back to redux if needed
      // dispatch(restoreSession(parsed)); ← implement if needed
    }
  }, []);
 


  return (
    <Router>
      <div className='app'>
        <Navbar />
        <Routes>
          <Route
            path='/'
            element={
              <>
                <Header />
                <Accueil />
              </>
            }
          />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          {/* <Route path='/events' element={<EventList />} /> */}
          <Route path='/events/new' element={<EventForm />} />
                <Route path='/Interests' element={<Interests/>} />
                                <Route path='/SavedEvents' element={<SavedEvents/>} />
                                                                <Route path='/Profile' element={<Profile/>} />

        <Route path="/event/:id" element={<EventDetails />} />

        <Route path="/Notif" element={<NotificationList />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
