import AuthStore from "./AuthStore";

class Stores {
  constructor() {
    this.authStore = new AuthStore(this);
  }
}

export default Stores;
