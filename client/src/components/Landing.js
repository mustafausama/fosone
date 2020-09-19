import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import OrderBoard from "./OrderBoard";
import Welcome from "./Welcome";

@inject("authStore")
@observer
class Landing extends Component {
  render() {
    if (this.props.authStore.authorized("RES_FIND")) return <OrderBoard />;
    else if (!this.props.authStore.loggedIn) return <Welcome />;
  }
}

export default Landing;
