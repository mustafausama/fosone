import { inject } from "mobx-react";
import React, { Component } from "react";

import { Route, Switch } from "react-router-dom";

@inject("boardStore")
class Dashboard extends Component {
  renderRoutes = (dashboards, url) =>
    Object.keys(dashboards).map((path) => {
      if (!path.startsWith("/")) return undefined;
      return [].concat(
        this.renderRoutes(dashboards[path], url.concat(path)),
        dashboards[path].component &&
          this.props.authStore.authorized(dashboards[path].permission) ? (
          <Route
            exact
            key={url}
            path={url}
            component={dashboards[path].component}
          />
        ) : undefined
      );
    });
  render() {
    const { dashboards } = this.props.boardStore;
    return (
      <>
        <Switch>{this.renderRoutes(dashboards, "")}</Switch>
      </>
    );
  }
}

export default Dashboard;
