import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';
import App from './App';
import axios from 'axios';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { secureMode } from './defaults';

// get params
const getParam = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[[]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// get the token and set the app name
const token = getParam('access_token');
const app = 'onbtool';

// force login if we're in secure mode
const forceLogin = () => {
  if (!secureMode) return;
  let authURL = `https://localhost:9443/auth/?app=${app}`;
  window.location.href = authURL;
};
window.forceLogin = forceLogin;

// if in secureMode force login based on the token existing or not
if (secureMode) {
  if (token === null) {
    window.forceLogin();
  } else {
    window.token = token;
    axios.defaults.headers.common['Authorization'] = `bearer ${token}`;
  }
}

// load the app
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
