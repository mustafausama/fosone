import React from "react";
import "./App.css";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Header from "./components/Header";
import Landing from "./components/Landing";
import Register from "./components/Register";
import Login from "./components/Login";
import NewRestaurant from "./components/NewRestaurant";
import { inject } from "mobx-react";

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
            <Route exact path="/home" component={Landing} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/new-restaurant" component={NewRestaurant} />
            <Route path="/">
              <Redirect to="/home" />
            </Route>
          </Switch>
        </BrowserRouter>
      </>
    );
  }
}

export default App;
