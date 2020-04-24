import React from 'react';
import { Switch, Route } from "react-router-dom";
import Home from "./Home";
import Host from "./Host";
import Login from "./Login";
import SignUp from "./SignUp";
import Error from "./Error";
import Present from "./Present";
import Terms from "./Terms";
import Privacy from "./Privacy";
import Client from "./Client";


function App() {
  if(!(window.location.href).includes('syncfast.macrotechsolutions.us')){
    window.location.href = `https://syncfast.macrotechsolutions.us${window.location.pathname + window.location.search}`;
  }
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/host" component={Host} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={SignUp} />
        <Route exact path="/present" component={Present} />
        <Route exact path="/privacy" component={Privacy} />
        <Route exact path="/terms" component={Terms} />
        <Route exact path="/client" component={Client} />
        <Route component={Error} />
      </Switch>

    </div>
  );
}

export default App;
