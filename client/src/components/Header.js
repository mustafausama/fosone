import React, { Component } from "react";

import {
  Navbar,
  Container,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  Button,
} from "reactstrap";

import { NavLink } from "react-router-dom";
import { inject, observer } from "mobx-react";

@inject("authStore", "boardStore")
@observer
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isNavOpen: false,
    };
  }

  toggleNav = () => {
    this.setState({ isNavOpen: !this.state.isNavOpen });
  };

  renderRoutes = (dashboards, url) =>
    Object.keys(dashboards).map((path) => {
      if (!path.startsWith("/")) return undefined;
      return [].concat(
        this.renderRoutes(dashboards[path], url.concat(path)),
        dashboards[path].label &&
          this.props.authStore.authorized(dashboards[path].permission) ? (
          <NavItem>
            <NavLink to={url} className="nav-link" activeClassName="active">
              {dashboards[path].label}
            </NavLink>
          </NavItem>
        ) : undefined
      );
    });

  render() {
    const { dashboards } = this.props.boardStore;
    return (
      <div>
        <Navbar color="light" light expand="md">
          <Container>
            <NavLink className="navbar-brand" to="/">
              FoSoNe
            </NavLink>
            <NavbarToggler onClick={this.toggleNav} />
            <Collapse isOpen={this.state.isNavOpen} navbar>
              <Nav className="mr-auto" navbar>
                {!this.props.authStore.loggedIn && (
                  <>
                    <NavItem>
                      <NavLink
                        to="/register"
                        className="nav-link"
                        activeClassName="active"
                      >
                        Register
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        to="/login"
                        className="nav-link"
                        activeClassName="active"
                      >
                        Login
                      </NavLink>
                    </NavItem>
                  </>
                )}
                {this.renderRoutes(dashboards, "")}
              </Nav>
              {this.props.authStore.loggedIn && (
                <Button
                  color="link"
                  onClick={() => this.props.authStore.logout()}
                >
                  Logout
                </Button>
              )}
            </Collapse>
          </Container>
        </Navbar>
      </div>
    );
  }
}

export default Header;
