import React, { Component } from "react";
import FacebookLogin from "react-facebook-login";
import axios from "axios";
import fetch from "node-fetch";

class Register extends Component {
  state = {
    isLoggedIn: false,
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    password1: "",
    password2: "",
    birthdate: "",
    country: "",
    fbUserID: "",
    fbAccessToken: "",
  };
  responseFacebook = (response) => {
    console.log(response);
    this.setState({
      fbAccessToken: response.accessToken,
      fbUserID: response.userID,
      firstName: response.first_name,
      lastName: response.last_name,
      birthdate: response.birthday,
    });
  };
  register = () => {
    axios({
      methid: "POST",
      url: "http://localhost:5007/api/users/register",
      headers: { "Access-Control-Allow-Origin": "*" },
      data: {
        fbAccessToken: this.state.fbAccessToken,
        fbUserID: this.state.fbUserID,
      },
    }).then((res) => console.log(res));

    /*fetch("http://localhost:5007/api/users/register", {
      method: "post",
      body: JSON.stringify({
        fbAccessToken: this.state.fbAccessToken,
        fbUserID: this.state.fbUserID,
      }),
      headers: { "Content-Type": "application/json" },
    }).then((response) => console.log(response));*/
  };
  render() {
    return (
      <div>
        <input
          type="text"
          onChange={(e) => {
            this.setState({ firstName: e.value });
          }}
          value={this.state.firstName}
          placeholder="First Name"
        />
        <input
          type="text"
          onChange={(e) => {
            this.setState({ lastName: e.value });
          }}
          value={this.state.lastName}
          placeholder="Last Name"
        />
        <input
          type="email"
          onChange={(e) => {
            this.setState({ email: e.value });
          }}
          value={this.state.email}
          placeholder="Email"
        />
        <input
          type="username"
          onChange={(e) => {
            this.setState({ username: e.value });
          }}
          value={this.state.username}
          placeholder="Username"
        />
        <input
          type="tel"
          onChange={(e) => {
            this.setState({ phone: e.value });
          }}
          value={this.state.phone}
          placeholder="Phone Number"
        />
        <input
          type="password"
          onChange={(e) => {
            this.setState({ password1: e.value });
          }}
          value={this.state.password1}
          placeholder="Password"
        />
        <input
          type="password"
          onChange={(e) => {
            this.setState({ password2: e.value });
          }}
          value={this.state.password2}
          placeholder="Password again"
        />
        <input
          type="date"
          onChange={(val) => {
            this.setState({ birthdate: val.target.value });
          }}
          value={this.state.birthdate}
          placeholder="Date of birth"
        />
        <input
          type="text"
          onChange={(val) => {
            this.setState({ country: val.value });
          }}
          value={this.state.country}
          placeholder="Country"
        />
        <button onClick={this.register}>Submit</button>
        <FacebookLogin
          appId="1222306931451693"
          autoLoad={false}
          fields="first_name,last_name,email,birthday"
          callback={this.responseFacebook}
          icon="fa-facebook"
        />
      </div>
    );
  }
}

export default Register;
