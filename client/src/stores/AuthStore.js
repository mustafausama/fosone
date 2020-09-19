import axios from "axios";
import { action, observable } from "mobx";
import jwt from "jsonwebtoken";

class AuthStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @observable loggedIn = false;
  @observable permissions = null;
  @observable name = null;
  expires = null;

  // User logging
  @action setLoggedIn(loggedIn) {
    this.loggedIn = loggedIn;
    if (loggedIn) {
      this.parseToken();
      if (!this.tokenValid()) this.logout();
    } else this.name = this.permissions = this.expires = null;
  }

  login = (bearerToken = null) => {
    if (localStorage.getItem("token")) {
      this.parseToken();
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
      return this.setLoggedIn(true);
    }
    if (!bearerToken)
      return (axios.defaults.headers.common["Authorization"] = null);
    localStorage.setItem("token", bearerToken.split(" ")[1]);
    axios.defaults.headers.common["Authorization"] = bearerToken;
    this.setLoggedIn(true);
  };

  logout() {
    localStorage.removeItem("token");
    axios.defaults.headers.common["Authorization"] = null;
    this.setLoggedIn(false);
  }

  // User permissions
  @action parseToken() {
    const token = localStorage.getItem("token");
    if (!token) return;
    const payload = jwt.decode(token);
    this.name = payload.name;
    this.permissions = payload.role.permissions;
    this.expires = new Date(payload.exp);
  }

  authorized(permission) {
    return this.loggedIn && this.permissions.includes(permission);
  }

  tokenValid() {
    if (!this.expires) return;
    return this.expires <= Date.now();
  }
}

export default AuthStore;
