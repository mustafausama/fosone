import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import FacebookLogin from "react-facebook-login";
import axios from "axios";
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
} from "reactstrap";

import {
  isEmpty,
  isLength,
  isAlphanumeric,
  isNumeric,
  isMobilePhone,
  isEmail,
  isDate,
  isAfter,
  equals,
} from "validator";

const passwordValidator = require("password-validator");

const countryList = require("country-list");

const countries = countryList.getData();

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
    fbPic: "",
    suggestions: [],
    countryValue: "",
    isModalOpen: false,
    redirect: false,
  };

  validate = {
    firstName: (key) => {
      const { firstName } = this.state;
      if (!isLength(firstName, { min: 2, max: 26 }))
        this.setInvalid(key, "First name should be 2 to 26 characters long");
      else this.setValid(key);
    },
    lastName: (key) => {
      const { lastName } = this.state;
      if (!isLength(lastName, { min: 2, max: 26 }))
        this.setInvalid(key, "Last name should be 2 to 26 characters long");
      else this.setValid(key);
    },
    email: (key) => {
      const { email } = this.state;
      if (
        !isEmail(email, {
          allow_utf8_local_part: false,
          allow_ip_domain: true,
        })
      )
        this.setInvalid(key, "Invalid Email");
      else this.setValid(key);
    },
    username: (key) => {
      const { username } = this.state;
      if (
        !isLength(username, { min: 2, max: 20 }) ||
        !isAlphanumeric(username) ||
        isNumeric(username.charAt(0))
      )
        this.setInvalid(
          key,
          "Username should be 2 to 20 characters long, contain only aphanumeric chacaters, have an alphabet character as the first character"
        );
      else this.setValid(key);
    },
    phone: (key) => {
      const { phone } = this.state;
      if (!isEmpty(phone) && !isMobilePhone(phone, "any", { strictMode: true }))
        this.setInvalid(
          key,
          "Phone number is incorrect. You should enter + sign and country code"
        );
      else this.setValid(key);
    },
    password1: (key) => {
      const {
        password1,
        firstName,
        lastName,
        username,
        birthdate,
      } = this.state;
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
        .spaces()
        .is()
        .not()
        .oneOf([firstName, lastName, username, birthdate]);
      if (!schema.validate(password1))
        this.setInvalid(
          key,
          "Password is invalid. Password should be 8 to 100 characters. It should contain at least one lowercase character, one uppercase character, one digit, and one symbol. It should not contain spaces, your first name, your last name, your username, or your date of birth"
        );
      else this.setValid(key);
    },
    password2: (key) => {
      const { password1, password2 } = this.state;
      console.log(password1, " ", password2);
      if (!equals(password1, password2))
        this.setInvalid(key, "Passwords should match");
      else this.setValid(key);
    },
    birthdate: (key) => {
      const { birthdate } = this.state;
      const ageLimit = 12;
      const dateLimit = new Date();
      dateLimit.setFullYear(dateLimit.getFullYear - ageLimit);
      if (!isDate(birthdate) || isAfter(birthdate, dateLimit.toDateString()))
        this.setInvalid(
          key,
          "Invalid date of birth. You should be 12 years or older"
        );
    },
  };

  setValid = (key) => {
    this.setState({
      ["invalid" + key]: undefined,
      ["valid" + key]: true,
    });
  };
  setInvalid = (key, msg) => {
    this.setState({
      ["invalid" + key]: msg,
      ["valid" + key]: undefined,
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

  onBlur = (key) => {
    this.setState({
      ["touched" + key]: true,
    });
  };

  onChange = async (key, value) => {
    await this.setState({
      [key]: value,
    });
    this.validate[key](key);
  };

  onSubmit = async (e) => {
    e.preventDefault();
    if (
      !this.state.validfirstName ||
      !this.state.validlastName ||
      !this.state.validusername ||
      (!this.state.fbUserID &&
        !this.state.validemail &&
        !this.state.validphone) ||
      (!this.state.fbUserID &&
        (!this.state.validpassword1 || !this.state.validpassword2))
    )
      return console.log("Haha");
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
      Object.keys(err.response.data).forEach((key) => {
        this.setInvalid(key, err.response.data[key]);
      });
    });
    if (!response) return;
    this.redirect();
  };

  redirect = () => {
    this.setState({ redirect: true });
  };

  render() {
    if (this.state.redirect) return <Redirect to="/" push="/hello/" />;

    const Field = ({ label, n, name, placeholder, text, type }) => (
      <Col key={name} xs={12} md={12 / n}>
        <FormGroup row>
          <Label xs={12} for={name}>
            {label}
          </Label>
          <Col xs={12}>
            <Input
              valid={
                this.state["touched" + name] &&
                !this.state["invalid" + name] &&
                this.state["valid" + name]
              }
              invalid={
                this.state["invalid" + name] && !this.state["valid" + name]
              }
              type={type}
              name={name}
              id={name}
              placeholder={placeholder}
              value={this.state[name]}
              onChange={(e) => {
                this.onChange(e.target.name, e.target.value);
              }}
              onBlur={(e) => {
                this.onBlur(e.target.name);
              }}
            />
            {this.state["invalid" + name] && (
              <FormFeedback>{this.state["invalid" + name]}</FormFeedback>
            )}
            {text && <FormText>{text}</FormText>}
          </Col>
        </FormGroup>
      </Col>
    );

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
              {Field({
                label: "First Name",
                n: 2,
                name: "firstName",
                placeholder: "Enter your first name",
                type: "text",
              })}
              {Field({
                label: "Last Name",
                n: 2,
                name: "lastName",
                placeholder: "Enter your last name",
                type: "text",
              })}
            </Row>

            <Row>
              {Field({
                label: "Username",
                n: 3,
                name: "username",
                placeholder: "Enter your username",
                type: "text",
              })}
              {Field({
                label: "Email",
                n: 3,
                name: "email",
                placeholder: "Enter your email",
                text: "Either an email or a phone number is required",
                type: "email",
              })}
              {Field({
                label: "Date of birth",
                n: 3,
                name: "birthdate",
                text: "You should be 12 years or older as of today",
                type: "date",
              })}
            </Row>
            <Row>
              {Field({
                label: "Password",
                n: 2,
                name: "password1",
                placeholder: "Enter a password",
                text:
                  "Please enter a strong password that contains: lowercase characters [a b c], uppercase characters [A B C], digits [1 2 3], and symbols [@ # $]. Password should not contain spaces at the beginning or at the end",
                type: "password",
              })}
              {Field({
                label: "Repeat password",
                n: 2,
                name: "password2",
                placeholder: "Enter the password again",
                type: "password",
              })}
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
                        inputFocused: "react-autosuggest__input--focused",
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
                    {this.state.invalidcountry && (
                      <FormText>{this.state.invalidcountry}</FormText>
                    )}
                    {this.state.touchedcountry && this.state.validcountry && (
                      <FormText valid>{this.state.validcountry}</FormText>
                    )}
                  </Col>
                </FormGroup>
              </Col>
              {Field({
                label: "Phone number",
                n: 2,
                name: "phone",
                placeholder: "Enter your phone number",
                text: "Either an email or a phone number is required",
                type: "tel",
              })}
            </Row>
            <FormGroup
              row
              style={{
                alignItems: "center",
              }}
            >
              <Col xs={6}>
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
                    You account will be linked to your Facebook account
                  </FormText>
                )}
              </Col>
              <Col xs={6}>
                <Button
                  color="secondary"
                  className="btn-lg pull-right "
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
