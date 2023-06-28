import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Params from './components/Params';
//import FunctionSubscription, {MyValue} from './components/FunctionSubscription'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Params/>
    {/* <FunctionSubscription></FunctionSubscription> */}
  </React.StrictMode>
);