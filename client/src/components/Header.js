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

@inject("authStore")
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

  render() {
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
                {this.props.authStore.authorized("RES_NEW") && (
                  <NavItem>
                    <NavLink
                      to="/new-restaurant"
                      className="nav-link"
                      activeClassName="active"
                    >
                      New Restaurant
                    </NavLink>
                  </NavItem>
                )}
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
