import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";

import FacebookLogin from "react-facebook-login";

import {
  Container,
  Row,
  Col,
  Form,
  Input,
  Button,
  FormGroup,
  FormFeedback,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  Media,
  ModalFooter,
  Alert,
} from "reactstrap";

import {
  isEmpty,
  isLength,
  isAlphanumeric,
  isNumeric,
  isEmail,
} from "validator";
import { inject } from "mobx-react";

@inject("authStore")
class Login extends Component {
  componentDidMount() {
    if (this.props.authStore.loggedIn) this.setState({ redirect: true });
  }
  state = {
    isModalOpen: false,
    redirect: false,
    usernameOrEmail: "",
    password: "",
    remember: undefined,
    fbUserID: "",
    fbAccessToken: "",
    fbPic: "",
    fbFirstName: "",
    fbLastName: "",
    fbEmail: "",
    valid: {},
    invalid: {},
    touched: {},
  };

  modalToggle() {
    this.setState({ isModalOpen: !this.state.isModalOpen });
  }

  validate = {
    usernameOrEmail: () => {
      const { usernameOrEmail } = this.state;
      if (
        !isEmail(usernameOrEmail, {
          allow_utf8_local_part: false,
          allow_ip_domain: true,
        }) &&
        (!isLength(usernameOrEmail, { min: 3, max: 20 }) ||
          !isAlphanumeric(usernameOrEmail) ||
          isNumeric(usernameOrEmail.charAt(0)))
      )
        this.setInvalid("usernameOrEmail", "Not a valid username nor email");
      else this.setValid("usernameOrEmail");
    },
    password: () => {
      var { password } = this.state;
      if (isEmpty((password = password.trim())))
        this.setInvalid("password", "Password is invalid");
      else this.setValid("password");
    },
  };

  setValid = (key) => {
    this.setState({
      invalid: { ...this.state.invalid, [key]: undefined },
      valid: { ...this.state.valid, [key]: true },
    });
  };

  setInvalid = (key, msg) => {
    this.setState({
      invalid: { ...this.state.invalid, [key]: msg },
      valid: { ...this.state.valid, [key]: false },
    });
  };

  responseFacebook = (response) => {
    this.setState({
      fbAccessToken: response.accessToken,
      fbUserID: response.userID,
      fbPic: response.picture.data.url,
      fbFirstName: response.first_name,
      fbLastName: response.last_name,
      fbEmail: response.email,
    });
    this.modalToggle();
  };

  cancelFacebook = () => {
    this.setState({
      fbAccessToken: "",
      fbUserID: "",
      fbFirstName: "",
      fbLastName: "",
      fbEmail: "",
      fbPic: "",
    });
    this.modalToggle();
  };

  login = async () => {
    if (this.state.isModalOpen) this.modalToggle();
    if (!this.state.fbUserID) {
      await this.validate.usernameOrEmail();
      await this.validate.password();
      if (!this.state.valid.usernameOrEmail || !this.state.valid.password)
        return;
    }
    const data = {};
    if (this.state.fbUserID) {
      data.fbUserID = this.state.fbUserID;
      data.fbAccessToken = this.state.fbAccessToken;
    } else {
      data.usernameOrEmail = this.state.usernameOrEmail;
      data.password = this.state.password;
    }
    const response = await axios({
      method: "POST",
      url: "http://localhost:5007/api/users/login",
      headers: { "Access-Control-Allow-Origin": "*" },
      data,
    }).catch((err) => {
      console.log("err", err);
      if (err.response && err.response.data) {
        Object.keys(err.response.data).forEach((key) => {
          this.setInvalid(key, err.response.data[key]);
        });
      }
    });
    console.log(response);
    if (!response) return;
    const bearerToken = response.data.token;
    this.props.authStore.login(bearerToken);
    this.setState({ redirect: true });
  };

  onBlur = (key) => {
    this.setState({
      touched: { ...this.state.touched, [key]: true },
    });
  };

  onChange = async (key, value) => {
    await this.setState({
      [key]: value,
    });
    this.validate[key](key);
  };

  onSubmit = (e) => {
    e.preventDefault();
    this.login();
  };

  render() {
    if (this.state.redirect) return <Redirect to="/" />;
    return (
      <>
        <Modal isOpen={this.state.isModalOpen} toggle={this.modalToggle}>
          <ModalHeader toggle={this.modalToggle}>
            Login with Facebook
          </ModalHeader>
          <ModalBody>
            <Media body>
              <Media heading className="text-center">
                <Media
                  object
                  src={this.state.fbPic}
                  alt="Facebook profile picture"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                  }}
                />
              </Media>
              <h3 className="text-center">
                {this.state.fbFirstName + " " + this.state.fbLastName}
              </h3>
              <h3 className="text-center">{this.state.fbEmail}</h3>
              <p>
                Click Continue if you want to login using this facebook account.
              </p>
            </Media>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.login}>
              Continue
            </Button>
            <Button color="danger" onClick={this.cancelFacebook}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
        <Container>
          <Form onSubmit={this.onSubmit}>
            <Row>
              <Col xs={12} md={6}>
                <FormGroup row>
                  <Label xs={12} for="usernameOrEmail">
                    Username or Email
                  </Label>
                  <Col xs={12}>
                    <Input
                      valid={
                        this.state.touched.usernameOrEmail &&
                        !this.state.invalid.usernameOrEmail &&
                        this.state.valid.usernameOrEmail
                      }
                      invalid={
                        this.state.invalid.usernameOrEmail &&
                        !this.state.valid.usernameOrEmail
                      }
                      type="text"
                      name="usernameOrEmail"
                      id="usernameOrEmail"
                      placeholder="Enter your username or email"
                      value={this.state.usernameOrEmail}
                      onChange={(e) => {
                        this.onChange(e.target.name, e.target.value);
                      }}
                      onBlur={(e) => {
                        this.onBlur(e.target.name);
                      }}
                    />
                    {this.state.invalid.usernameOrEmail && (
                      <FormFeedback>
                        {this.state.invalid.usernameOrEmail}
                      </FormFeedback>
                    )}
                  </Col>
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
                <FormGroup row>
                  <Label xs={12} for="password">
                    Password
                  </Label>
                  <Col xs={12}>
                    <Input
                      valid={
                        this.state.touched.password &&
                        !this.state.invalid.password &&
                        this.state.valid.password
                      }
                      invalid={
                        this.state.invalid.password &&
                        !this.state.valid.password
                      }
                      type="password"
                      name="password"
                      id="password"
                      placeholder="Enter your password"
                      value={this.state.password}
                      onChange={(e) => {
                        this.onChange(e.target.name, e.target.value);
                      }}
                      onBlur={(e) => {
                        this.onBlur(e.target.name);
                      }}
                    />
                    {this.state.invalid.password && (
                      <FormFeedback>{this.state.invalid.password}</FormFeedback>
                    )}
                  </Col>
                </FormGroup>
              </Col>
            </Row>
            <FormGroup row>
              <Col xs={10}>
                <FacebookLogin
                  appId="1222306931451693"
                  autoLoad={false}
                  fields="id,first_name,last_name,email,picture.width(100).height(100) "
                  callback={this.responseFacebook}
                  icon="fa-facebook"
                  textButton="Login with facebook"
                />
                {/*this.state.invalid.fbuser && (
                  <FormFeedback>{this.state.invalid.fbuser}</FormFeedback>
                )*/}
                {
                  <Alert
                    color="info"
                    isOpen={this.state.invalid.fbuser ? true : false}
                    toggle={() =>
                      this.setState({
                        invalid: { ...this.state.invalid, fbuser: undefined },
                      })
                    }
                  >
                    {this.state.invalid.fbuser}
                  </Alert>
                }
              </Col>
              <Col xs={2}>
                <Button
                  color="secondary"
                  className="btn-lg pull-right mt-1"
                  type="submit"
                >
                  Login
                </Button>
              </Col>
            </FormGroup>
          </Form>
        </Container>
      </>
    );
  }
}

export default Login;
