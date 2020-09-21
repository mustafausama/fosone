import React from "react";
import "./App.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Header from "./components/Header";
import Landing from "./components/Landing";
import Register from "./components/Register";
import Login from "./components/Login";
import { inject } from "mobx-react";
import AddToHomeScreen from "@ideasio/add-to-homescreen-react";

@inject("authStore")
class App extends React.Component {
  constructor(props) {
    super(props);
    this.props.authStore.login();
  }
  render() {
    return (
      <>
        <BrowserRouter>
          <Header />
          <Switch>
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route path="/" component={Landing} />
          </Switch>
          <AddToHomeScreen />
        </BrowserRouter>
      </>
    );
  }
}

export default App;
