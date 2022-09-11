import React from 'react';
import ChartContainer from './Components/Chart/ChartContainer';
import Error from './Components/Error/Error';
import './App.css';
import { Switch, Route } from 'react-router';

const App: React.FC = function () {
  return (
    <Switch>
      <Route path="/chartera" component={ChartContainer} exact />
      <Route path="/error" component={Error} />
    </Switch>
  );
};

export default App;
