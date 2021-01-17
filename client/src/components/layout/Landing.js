import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import Dashboard from "../Dashboard";
import Welcome from "../Welcome";

@inject("authStore")
@observer
class Landing extends Component {
  render() {
    if (!this.props.authStore.loggedIn) return <Welcome />;
    else return <Dashboard {...this.props} />;
  }
}

export default Landing;
