import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ApolloProvider } from '@apollo/client/react';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import LoadingSpinner from './components/spinner';
import { Demarrage } from './components/hanldle-online-ops';
import { apolloClient } from './services/apollo-client';




const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingSpinner fullScreen/>}>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ApolloProvider client={apolloClient}>
          <Demarrage>
            <App />
          </Demarrage>
      </ApolloProvider>
      </BrowserRouter>
    </React.Suspense>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
