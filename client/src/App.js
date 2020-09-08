import React from "react";
import "./App.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Register from "./components/Register";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/register" component={Register} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
