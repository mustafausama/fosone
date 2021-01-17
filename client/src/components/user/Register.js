import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";

import FacebookLogin from "react-facebook-login";
import Autosuggest from "react-autosuggest";

import {
  Form,
  FormGroup,
  Label,
  Input,
  Container,
  Col,
  Row,
  FormText,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Media,
  FormFeedback,
  UncontrolledAlert,
} from "reactstrap";

import {
  isLength,
  isAlphanumeric,
  isNumeric,
  isMobilePhone,
  isEmail,
  isDate,
  isAfter,
  equals,
} from "validator";
import { inject } from "mobx-react";

const passwordValidator = require("password-validator");

const countryList = require("country-list");

const countries = countryList.getData();
@inject("authStore")
class Register extends Component {
  componentDidMount() {
    if (this.props.authStore.loggedIn) this.setState({ redirect: true });
  }
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
    fbPic: "",
    suggestions: [],
    countryValue: "",
    isModalOpen: false,
    redirect: false,
    valid: {},
    invalid: {},
  };

  validate = {
    firstName: () => {
      const { firstName } = this.state;
      if (!isLength(firstName, { min: 2, max: 26 }))
        this.setInvalid(
          "firstName",
          "First name should be 2 to 26 characters long"
        );
      else this.setValid("firstName");
    },
    lastName: () => {
      const { lastName } = this.state;
      if (!isLength(lastName, { min: 2, max: 26 }))
        this.setInvalid(
          "lastName",
          "Last name should be 2 to 26 characters long"
        );
      else this.setValid("lastName");
    },
    email: () => {
      const { email } = this.state;
      if (
        !isEmail(email, {
          allow_utf8_local_part: false,
          allow_ip_domain: true,
        })
      )
        this.setInvalid("email", "Invalid Email");
      else this.setValid("email");
    },
    username: (key) => {
      const { username } = this.state;
      if (
        !isLength(username, { min: 2, max: 20 }) ||
        !isAlphanumeric(username) ||
        isNumeric(username.charAt(0))
      )
        this.setInvalid(
          "username",
          "Username should be 2 to 20 characters long, contain only aphanumeric chacaters, have an alphabet character as the first character"
        );
      else this.setValid("username");
    },
    phone: () => {
      const { phone } = this.state;
      if (!isMobilePhone(phone, "any", { strictMode: true }))
        this.setInvalid(
          "phone",
          "Phone number is incorrect. You should enter + sign and country code"
        );
      else this.setValid("phone");
    },
    password1: () => {
      const { password1 } = this.state;
      const schema = new passwordValidator();
      schema
        .is()
        .min(8)
        .is()
        .max(100)
        .has()
        .uppercase()
        .has()
        .lowercase()
        .has()
        .digits()
        .has()
        .symbols()
        .has()
        .not()
        .spaces();
      if (!schema.validate(password1))
        this.setInvalid(
          "password1",
          "Password should be 8 to 100 characters. It should contain at least one lowercase character, one uppercase character, one digit, and one symbol. It should not contain spaces."
        );
      else this.setValid("password1");
    },
    password2: () => {
      const { password1, password2 } = this.state;
      if (!password2 || !equals(password1, password2))
        this.setInvalid("password2", "Passwords should match");
      else {
        this.setValid("password2");
      }
    },
    birthdate: () => {
      const { birthdate } = this.state;
      const ageLimit = 12;
      const dateLimit = new Date();
      dateLimit.setFullYear(dateLimit.getFullYear() - ageLimit);
      if (!isDate(birthdate) || isAfter(birthdate, dateLimit.toDateString()))
        this.setInvalid(
          "birthdate",
          "Invalid date of birth. You should be 12 years or older"
        );
      else this.setValid("birthdate");
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

  getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : countries.filter(
          (country) =>
            country.name.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  getSuggestionValue = (suggestion) => {
    this.setState({ country: countryList.getCode(suggestion.name) });
    return suggestion.name;
  };

  countryOnChange = (event, { newValue }) => {
    this.setState({
      countryValue: newValue,
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  modalToggle = () => {
    this.setState({ isModalOpen: !this.state.isModalOpen });
  };

  responseFacebook = (response) => {
    const birthday = response.birthday.split("/");
    this.setState({
      fbAccessToken: response.accessToken,
      fbUserID: response.userID,
      firstName: response.first_name,
      lastName: response.last_name,
      email: response.email,
      fbPic: response.picture.data.url,
      birthdate:
        birthday.length >= 3
          ? `${birthday[2]}-${birthday[0]}-${birthday[1]}`
          : "",
    });
    this.modalToggle();
  };

  cancelFacebook = () => {
    this.setState({
      fbAccessToken: "",
      fbUserID: "",
      firstName: "",
      lastName: "",
      email: "",
      fbPic: "",
    });
    this.modalToggle();
  };

  onChange = async (key, value) => {
    await this.setState({
      [key]: value,
    });
    this.validate[key].call();
  };

  onSubmit = async (e) => {
    e.preventDefault();
    await this.validate.firstName();
    await this.validate.lastName();
    await this.validate.username();
    if (!this.state.fbUserID) {
      await this.validate.password1();
      await this.validate.password2();
    }
    if (
      !this.state.fbUserID &&
      !this.state.valid.email &&
      !this.state.valid.phone
    ) {
      await this.validate.email();
      await this.validate.phone();
    }
    if (
      !this.state.valid.firstName ||
      !this.state.valid.lastName ||
      !this.state.valid.username ||
      (!this.state.fbUserID &&
        !this.state.valid.email &&
        !this.state.valid.phone) ||
      (!this.state.fbUserID &&
        (!this.state.valid.password1 || !this.state.valid.password2))
    )
      return;
    const response = await axios({
      method: "POST",
      url: "http://localhost:5007/api/users/register",
      headers: { "Access-Control-Allow-Origin": "*" },
      data: {
        fbAccessToken: this.state.fbAccessToken,
        fbUserID: this.state.fbUserID,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email,
        username: this.state.username,
        phone: this.state.phone,
        password1: this.state.password1,
        password2: this.state.password2,
        birthdate: this.state.birthdate,
        country: this.state.country,
      },
    }).catch((err) => {
      console.log(err);
      if (err.response && err.response.data)
        Object.keys(err.response.data).forEach((key) => {
          this.setInvalid(key, err.response.data[key]);
        });
    });
    if (!response) return;
    this.setState({ redirect: true });
  };

  render() {
    if (this.state.redirect) return <Redirect to="/" />;

    const renderSuggestion = (suggestion) => <div>{suggestion.name}</div>;
    return (
      <>
        <Modal isOpen={this.state.isModalOpen} toggle={this.modalToggle}>
          <ModalHeader toggle={this.modalToggle}>
            Sign Up with Facebook
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
                {this.state.firstName + " " + this.state.lastName}
              </h3>
              <h2 className="text-center">{this.state.email}</h2>
              <p>
                Click Continue if you want to sign up using these facebook data.
                You will be able to login to your FoSoNe account using this
                Facebook account, and you can enter a password and still be able
                to login using the provided cridentials alongside Facebook.
              </p>
              <p>
                You still have to provide the required data in order to sign up
                for a FoSoNe account
              </p>
            </Media>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.modalToggle}>
              Continue
            </Button>{" "}
            <Button color="danger" onClick={this.cancelFacebook}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
        <Container>
          <Form onSubmit={this.onSubmit} className="mt-4">
            {/* mt-4 To be removed */}
            <Row>
              <Col xs={12} md={6}>
                <FormGroup row>
                  <Label xs={12} for="firstName">
                    First Name
                  </Label>
                  <Col xs={12}>
                    <Input
                      valid={this.state.valid.firstName}
                      invalid={this.state.invalid.firstName}
                      type="text"
                      name="firstName"
                      id="firstName"
                      placeholder="Enter your first name"
                      value={this.state.firstName}
                      onChange={(e) => {
                        this.onChange(e.target.name, e.target.value);
                      }}
                    />
                    {this.state.invalid.firstName && (
                      <FormFeedback>
                        {this.state.invalid.firstName}
                      </FormFeedback>
                    )}
                  </Col>
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
                <FormGroup row>
                  <Label xs={12} for="lastName">
                    Last Name
                  </Label>
                  <Col xs={12}>
                    <Input
                      valid={this.state.valid.lastName}
                      invalid={this.state.invalid.lastName}
                      type="text"
                      name="lastName"
                      id="lastName"
                      placeholder="Enter your last name"
                      value={this.state.lastName}
                      onChange={(e) => {
                        this.onChange(e.target.name, e.target.value);
                      }}
                    />
                    {this.state.invalid.lastName && (
                      <FormFeedback>{this.state.invalid.lastName}</FormFeedback>
                    )}
                  </Col>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col xs={12} md={4}>
                <FormGroup row>
                  <Label xs={12} for="username">
                    Username
                  </Label>
                  <Col xs={12}>
                    <Input
                      valid={this.state.valid.username}
                      invalid={this.state.invalid.username}
                      type="text"
                      name="username"
                      id="username"
                      placeholder="Enter your username"
                      value={this.state.username}
                      onChange={(e) => {
                        this.onChange(e.target.name, e.target.value);
                      }}
                    />
                    {this.state.invalid.username && (
                      <FormFeedback>{this.state.invalid.username}</FormFeedback>
                    )}
                  </Col>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup row>
                  <Label xs={12} for="email">
                    Email address
                  </Label>
                  <Col xs={12}>
                    <Input
                      valid={this.state.valid.email}
                      invalid={this.state.invalid.email}
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Enter your email address"
                      value={this.state.email}
                      onChange={(e) => {
                        this.onChange(e.target.name, e.target.value);
                      }}
                    />
                    {this.state.invalid.email && (
                      <FormFeedback>{this.state.invalid.email}</FormFeedback>
                    )}
                    <FormText>
                      Either an email or a phone number is required
                    </FormText>
                  </Col>
                </FormGroup>
              </Col>
              <Col key="birthdate" xs={12} md={4}>
                <FormGroup row>
                  <Label xs={12} for="birthdate">
                    Date of birth
                  </Label>
                  <Col xs={12}>
                    <Input
                      valid={this.state.valid.birthdate}
                      invalid={this.state.invalid.birthdate}
                      type="date"
                      name="birthdate"
                      id="birthdate"
                      value={this.state.birthdate}
                      onChange={(e) => {
                        this.onChange(e.target.name, e.target.value);
                      }}
                    />
                    {this.state.invalid.birthdate && (
                      <FormFeedback>
                        {this.state.invalid.birthdate}
                      </FormFeedback>
                    )}
                    <FormText>
                      You should be 12 years or older as of today
                    </FormText>
                  </Col>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                <FormGroup row>
                  <Label xs={12} for="password1">
                    Password
                  </Label>
                  <Col xs={12}>
                    <Input
                      valid={this.state.valid.password1}
                      invalid={this.state.invalid.password1}
                      type="password"
                      name="password1"
                      id="password1"
                      placeholder="Enter a password"
                      value={this.state.password1}
                      onChange={(e) => {
                        this.onChange(e.target.name, e.target.value);
                      }}
                    />
                    {this.state.invalid.password1 && (
                      <FormFeedback>
                        {this.state.invalid.password1}
                      </FormFeedback>
                    )}
                    <FormText>
                      Please enter a strong password that contains: lowercase
                      characters [a b c], uppercase characters [A B C], digits
                      [1 2 3], and symbols [@ # $]. Password should not contain
                      spaces at the beginning or at the end
                    </FormText>
                  </Col>
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
                <FormGroup row>
                  <Label xs={12} for="password2">
                    Repeat password
                  </Label>
                  <Col xs={12}>
                    <Input
                      valid={this.state.valid.password2}
                      invalid={this.state.invalid.password2}
                      type="password"
                      name="password2"
                      id="password2"
                      placeholder="Enter your password again"
                      value={this.state.password2}
                      onChange={(e) => {
                        this.onChange(e.target.name, e.target.value);
                      }}
                    />
                    {this.state.invalid.password2 && (
                      <FormFeedback>
                        {this.state.invalid.password2}
                      </FormFeedback>
                    )}
                  </Col>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                <FormGroup row>
                  <Label xs={12} for="country">
                    Country
                  </Label>
                  <Col xs={12}>
                    <Autosuggest
                      theme={{
                        container: "input-group mb-3",
                        input: "form-control",
                        suggestionsContainer: "container dropdown",
                        suggestionsList: "dropdown-menu show",
                        suggestion: "dropdown-item btn",
                        suggestionHighlighted: "active",
                      }}
                      suggestions={this.state.suggestions}
                      onSuggestionsFetchRequested={
                        this.onSuggestionsFetchRequested
                      }
                      onSuggestionsClearRequested={
                        this.onSuggestionsClearRequested
                      }
                      getSuggestionValue={this.getSuggestionValue}
                      renderSuggestion={renderSuggestion}
                      inputProps={{
                        placeholder: "Type in your country name",
                        value: this.state.countryValue,
                        onChange: this.countryOnChange,
                      }}
                    />
                    {this.state.invalid.country && (
                      <UncontrolledAlert color="danger " fade={true}>
                        {this.state.invalid.country}
                      </UncontrolledAlert>
                    )}
                  </Col>
                </FormGroup>
              </Col>
              <Col xs={12} md={6}>
                <FormGroup row>
                  <Label xs={12} for="phone">
                    Phone number
                  </Label>
                  <Col xs={12}>
                    <Input
                      valid={this.state.valid.phone}
                      invalid={this.state.invalid.phone}
                      type="tel"
                      name="phone"
                      id="phone"
                      placeholder="Enter your phone number"
                      value={this.state.phone}
                      onChange={(e) => {
                        this.onChange(e.target.name, e.target.value);
                      }}
                    />
                    {this.state.invalid.phone && (
                      <FormFeedback>{this.state.invalid.phone}</FormFeedback>
                    )}
                    <FormText>
                      Either an email or a phone number is required.
                      <br />
                      Please include + sign and country code.
                    </FormText>
                  </Col>
                </FormGroup>
              </Col>
            </Row>
            <FormGroup row>
              <Col xs={8}>
                <FacebookLogin
                  appId="1222306931451693"
                  autoLoad={false}
                  fields="id,email,first_name,last_name,birthday,picture.width(100).height(100) "
                  callback={this.responseFacebook}
                  icon="fa-facebook"
                  textButton="Sign up with facebook"
                />
                {this.state.fbUserID && (
                  <FormText>
                    You FoSoNe account will be linked to your Facebook account
                  </FormText>
                )}
              </Col>
              <Col xs={4}>
                <Button
                  color="secondary"
                  className="btn-lg pull-right mt-1"
                  type="submit"
                >
                  Sign Up
                </Button>
              </Col>
            </FormGroup>
          </Form>
        </Container>
      </>
    );
  }
}

export default Register;
