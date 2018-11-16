import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './index.css';
import App from './App';
import AvtoComponent from './components/avto/avto';

ReactDOM.render(
    <div id="root">
        <AvtoComponent />
        <Router>
            <Switch>
                <Route exact path="/car/:avto_id" component={App}/>
                <Route path="/car/:avto_id/:group_id" component={App}/>
            </Switch>
        </Router>
    </div>, document.getElementById('car')
);