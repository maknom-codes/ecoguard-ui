import React from 'react';
import './App.css';
import IndexRoute from './routes/all-route';
import { ToastContainer } from './components/toast';

function App() {
  return (
    <React.Fragment>
        <IndexRoute/>
        <ToastContainer/>
    </React.Fragment>
  );
}

export default App;
