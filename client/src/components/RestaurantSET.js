import React, { Component } from "react";
import classnames from "classnames";

import { isEmpty, isLength, isMobilePhone } from "validator";

import ReactTags from "react-tag-autocomplete";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import "./styles/react-tags.css";
import {
  Container,
  Row,
  Form,
  Label,
  Input,
  Col,
  FormGroup,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Button,
  FormText,
  FormFeedback,
  CustomInput,
  UncontrolledAlert,
} from "reactstrap";
import Autosuggest from "react-autosuggest";
import axios from "axios";
import { Redirect } from "react-router-dom";
import { inject } from "mobx-react";

const countryList = require("country-list");

const countries = countryList.getData();

const isLatitude = (lat) => {
  return isFinite(lat) && Math.abs(lat) <= 90;
};

const isLongitude = (lng) => {
  return isFinite(lng) && Math.abs(lng) <= 180;
};

function TagComponent({ tag, removeButtonText, onDelete }) {
  return (
    <Button
      color="dark"
      className="mr-2 mb-1"
      title={removeButtonText}
      onClick={onDelete}
    >
      {tag.name}
    </Button>
  );
}

function SuggestionComponent({ item, query }) {
  return (
    <span id={item.id} className={item.name === query ? "match" : "no-match"}>
      {item.name}
    </span>
  );
}
@inject("authStore")
class RestaurantSET extends Component {
  async componentDidMount() {
    window.addEventListener("keydown", (e) => {
      if (e.keyCode === 13) e.preventDefault();
    });
    this.options("");
    const { resID } = this.props.match.params;
    if (!resID) return;
    this.setState({ resID });
    const response = await axios({
      method: "GET",
      headers: { "Access-Control-Allow-Origin": "*" },
      url: "http://localhost:5007/api/restaurants/restaurant/" + resID,
    }).catch((err) => {
      console.log(err);
    });
    if (!response) return;
    console.log(response.data);
    const {
      name,
      description,
      phonenumbers,
      delivery,
      takeaway,
      onSite,
      deliveryWorking,
      takeawayWorking,
      onSiteWorking,
      address,
      geolocation,
      admins,
      categories,
      group,
    } = response.data;
    const { country, state, city, street, building, storeNumber } = address;
    const [latitude, longitude] = geolocation.coordinates;
    this.setState({
      name,
      description,
      phonenumbers,
      delivery: delivery ? true : false,
      takeaway: takeaway ? true : false,
      onSite: onSite ? true : false,
      admins: admins.map((admin) => admin.username),
      categories: categories.map((cat) => cat.uName),
      group: group ? group : this.state.group,
      deliveryWorking: deliveryWorking
        ? deliveryWorking.days
        : this.state.deliveryWorking,
      takeawayWorking: takeawayWorking
        ? takeawayWorking.days
        : this.state.takeawayWorking,
      onSiteWorking: onSiteWorking
        ? onSiteWorking.days
        : this.state.onSiteWorking,
      loclat: latitude,
      loclon: longitude,
      country,
      countryValue: countryList.getName(country),
      state,
      city,
      street,
      building,
      storeNumber,
    });
  }
  state = {
    googleAPIKey: "AIzaSyAyzbtDMm8MS1VLeeEeA_4MVpYAxr0l8Oc",
    redirect: false,
    activeTab: "1",

    name: "",
    description: "",

    delivery: false,
    takeaway: false,
    onSite: false,

    phonenumbers: [""],
    admins: [],
    categories: [],
    group: "",

    building: "",
    street: "",
    country: "",
    countryValue: "",
    state: "",
    city: "",
    storeNumber: "",
    loclat: "",
    loclon: "",

    weekDays: [
      "Sunday",
      "Monday",
      "Teusday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    deliveryWorking: [],
    takeawayWorking: [],
    onSiteWorking: [],

    countries: countryList.getData(),

    countrySuggestions: [],
    adminSuggestions: [],
    categorySuggestions: [],
    groupSuggestions: [],

    valid: {},
    invalid: {},

    formDisabled: [false, false, false, false],
  };

  reactTags = React.createRef();

  validate = {
    name: () => {
      const { name } = this.state;
      if (!isLength(name, { min: 2, max: 50 }))
        this.setInvalid(
          "name",
          "Restaurant name must be 2 to 50 characters long"
        );
      else this.setValid("name");
    },
    description: () => {
      const { description } = this.state;
      if (!isLength(description, { min: 2, max: 500 }))
        this.setInvalid(
          "description",
          "Restaurant name must be 2 to 500 characters long"
        );
      else this.setValid("description");
    },
    phonenumber: (key, value) => {
      if (!isMobilePhone(value, "any", { strictMode: true }))
        this.setInvalid(key, `Invalid phone number`);
      else this.setValid(key);
    },
    services: async () => {
      const {
        delivery,
        takeaway,
        onSite,
        deliveryWorking,
        takeawayWorking,
        onSiteWorking,
      } = this.state;
      if (!delivery && !takeaway && !onSite) {
        await this.setInvalid(
          "delivery",
          "At least one service should be provided"
        );
        await this.setInvalid(
          "takeaway",
          "At least one service should be provided"
        );
        await this.setInvalid(
          "onSite",
          "At least one service should be provided"
        );
      }
      if (deliveryWorking.length > 7 || deliveryWorking.length < 0)
        await this.setInvalid(
          "delivery",
          "Only 0 to 7 days per week are allowed"
        );
      if (takeawayWorking.length > 7 || takeawayWorking.length < 0)
        await this.setInvalid(
          "takeaway",
          "Only 0 to 7 days per week are allowed"
        );
      if (onSiteWorking.length > 7 || onSiteWorking.length < 0)
        await this.setInvalid(
          "onSite",
          "Only 0 to 7 days per week are allowed"
        );
      deliveryWorking.forEach(async (working, index) => {
        if (working.dayOfWeek > 6 || working.dayOfWeek < 0)
          await this.setInvalid(
            "delivery",
            `Select a valid day in day ${index + 1}`
          );
        if (working.openHour > 24 || working.openHour < 0)
          await this.setInvalid(
            "delivery",
            `Select a valid opening hour in day ${index + 1}`
          );
        if (working.closeHour > 24 || working.closeHour < 0)
          await this.setInvalid(
            "delivery",
            `Select a valid closing hour in day ${index + 1}`
          );
      });
      takeawayWorking.forEach(async (working, index) => {
        if (working.dayOfWeek > 6 || working.dayOfWeek < 0)
          await this.setInvalid(
            "takeaway",
            `Select a valid day in day ${index + 1}`
          );
        if (working.openHour > 24 || working.openHour < 0)
          this.setInvalid(
            "takeaway",
            `Select a valid opening hour in day ${index + 1}`
          );
        if (working.closeHour > 24 || working.closeHour < 0)
          await this.setInvalid(
            "takeaway",
            `Select a valid closing hour in day ${index + 1}`
          );
      });
      onSiteWorking.forEach(async (working, index) => {
        if (working.dayOfWeek > 6 || working.dayOfWeek < 0)
          await this.setInvalid(
            "onSite",
            `Select a valid day in day ${index + 1}`
          );
        if (working.openHour > 24 || working.openHour < 0)
          await this.setInvalid(
            "onSite",
            `Select a valid opening hour in day ${index + 1}`
          );
        if (working.closeHour > 24 || working.closeHour < 0)
          await this.setInvalid(
            "onSite",
            `Select a valid closing hour in day ${index + 1}`
          );
      });
      if (!this.state.invalid.delivery) await this.setValid("delivery");
      if (!this.state.invalid.takeaway) await this.setValid("takeaway");
      if (!this.state.invalid.onSite) await this.setValid("onSite");
    },
    building: () => {
      const { building } = this.state;
      if (!isLength(building, { min: 1, max: 50 }))
        this.setInvalid("building", "Invalid building");
      else this.setValid("building");
    },
    street: () => {
      const { street } = this.state;
      if (!isLength(street, { min: 2, max: 200 }))
        this.setInvalid("street", "Invalid street");
      else this.setValid("street");
    },
    storeNumber: () => {
      const { storeNumber } = this.state;
      if (storeNumber && !isLength(storeNumber, { min: 1, max: 50 }))
        this.setInvalid("storeNumber", "Invalid store number");
      else this.setValid("storeNumber");
    },
    country: () => {
      const { country } = this.state;
      if (
        !isLength(country, { min: 2, max: 2 }) ||
        !countryList.getCodes().includes(country)
      )
        this.setInvalid("country", "Invalid country");
      else this.setValid("country");
    },
    state: () => {
      const { state } = this.state;
      if (state && !isLength(state, { min: 2, max: 100 }))
        this.setInvalid("state", "Invalid state");
      else this.setValid("state");
    },
    city: () => {
      const { city } = this.state;
      if (!isLength(city, { min: 2, max: 100 }))
        this.setInvalid("city", "Invalid city");
      else this.setValid("city");
    },
    geolocation: () => {
      const { loclat: latitude, loclon: longitude } = this.state;
      if (
        !latitude ||
        !longitude ||
        !isLatitude(latitude) ||
        !isLongitude(longitude)
      )
        this.setInvalid("geolocation", "Invalid geolocation");
      else this.setValid("geolocation");
    },
    categories: () => {
      const { categories } = this.state;
      if (categories.length === 0)
        this.setInvalid(
          "categories",
          "Categories should include at least one entry"
        );
      else this.setValid("categories");
    },
    group: () => {
      const { group } = this.state;
      if (isEmpty(group) || !isLength(group, { min: 3, max: 50 }))
        this.setInvalid(
          "group",
          "Invalid group. Group should be selected correctly"
        );
      else this.setValid("group");
    },
  };
  setValid = (key) => {
    if (this.state.valid[key]) return;
    this.setState({
      invalid: { ...this.state.invalid, [key]: undefined },
      valid: { ...this.state.valid, [key]: true },
    });
  };
  setInvalid = (key, msg) => {
    if (this.state.invalid[key]) return;
    this.setState({
      invalid: { ...this.state.invalid, [key]: msg },
      valid: { ...this.state.valid, [key]: false },
    });
  };

  getSuggestions = (from) => async (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    if (inputLength === 0) return [];
    if (Array.isArray(from)) {
      return from.filter(
        (country) =>
          country.name.toLowerCase().slice(0, inputLength) === inputValue
      );
    }
    if (inputLength < 2 || inputLength > 100) return [];
    let response = await axios({
      method: "GET",
      headers: { "Access-Control-Allow-Origin": "*" },
      url: from,
      params: {
        value: inputValue,
      },
    }).catch((err) => {
      console.log(err);
    });
    if (!response) return null;
    console.log(response.data);
    return response.data;
  };

  getSuggestionValue = (stateKey, apply) => (suggestion) => {
    console.log(suggestion);
    this.setState({ [stateKey]: apply.apply(this, [suggestion.name]) });
    return suggestion.name;
  };

  countryOnChange = (event, { newValue }) => {
    this.setState({
      countryValue: newValue,
    });
  };

  groupOnChange = (event, { newValue }) => {
    this.setState({
      group: newValue,
    });
  };

  onSuggestionsFetchRequested = (from, stateKey) => async ({ value }) => {
    console.log(stateKey, this.state[stateKey], value);
    this.setState({
      [stateKey]: await this.getSuggestions(from)(value),
    });
  };

  onSuggestionsClearRequested = (stateKey) => () => {
    this.setState({
      [stateKey]: [],
    });
  };

  promiseOptions = (inputValue) =>
    new Promise(async (resolve, reject) => {
      if (!isLength(inputValue, { min: 0, max: 100 })) return [];
      let response = await axios({
        method: "GET",
        headers: { "Access-Control-Allow-Origin": "*" },
        url:
          inputValue !== ""
            ? "http://localhost:5007/api/suggestions/categories"
            : "http://localhost:5007/api/restaurants/category",
        params: {
          value: inputValue,
        },
      }).catch((err) => {
        console.log(err);
      });
      if (!response) return reject(new Error("Error"));
      console.log(response.data);
      resolve(
        response.data.map((cat) => ({ value: cat.uName, label: cat.title }))
      );
    });

  options = async (inputValue) => {
    if (!isLength(inputValue, { min: 0, max: 100 })) return;
    let response = await axios({
      method: "GET",
      headers: { "Access-Control-Allow-Origin": "*" },
      url:
        inputValue !== ""
          ? "http://localhost:5007/api/suggestions/categories"
          : "http://localhost:5007/api/restaurants/category",
      params: {
        value: inputValue,
      },
    }).catch((err) => {
      console.log(err);
    });
    if (!response) throw new Error("Error");
    console.log(response.data);
    this.setState({
      categorySuggestions: response.data.map((cat) => ({
        value: cat.uName,
        label: cat.title,
      })),
    });
  };

  onDelete = (stateKey) => (i) => {
    const tags = this.state[stateKey].slice(0);
    tags.splice(parseInt(i), 1);
    this.setState({ [stateKey]: tags });
  };

  onAddition = (stateKey) => async (tag) => {
    const tags = this.state[stateKey];
    var flag = true;
    await tags.forEach((tg) => {
      if (tg.id === tag.id) flag = false;
    });
    if (flag) this.setState({ [stateKey]: tags.concat(tag) });
  };

  onInput = (stateKey, filter, from) => async (query) => {
    if (query.length < 2 || query.length > 100) return;
    let response = await axios({
      method: "GET",
      url: from,
      headers: { "Access-Control-Allow-Origin": "*" },
      params: {
        value: query,
      },
    }).catch((err) => {
      console.log(err);
    });
    if (!response) return;
    console.log(response);
    const array = await response.data.filter(
      (element) =>
        this.state[filter].filter((elem) => elem.id === element.id).length === 0
    );
    this.setState({ [stateKey]: array });
  };

  toggleTab = (tab) => {
    if (this.activeTab !== tab) this.setState({ activeTab: tab });
  };

  onChange = async (key, value) => {
    await this.setState({
      [key]: value,
    });
    if (key.startsWith("phonenumber")) this.validate.phonenumber(key, value);
    else if (this.validate[key]) this.validate[key].call();
  };

  getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            loclat: position.coords.latitude,
            loclon: position.coords.longitude,
          });
        },
        function () {
          alert("Error while getting the coordinates");
        }
      );
    } else {
      alert(
        "It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it."
      );
    }
  };

  onSubmit1 = async (e) => {
    e.preventDefault();
    this.state.invalid = {};
    await this.validate.name();
    if (!isEmpty(this.state.description)) await this.validate.description();
    for (var i = 0; i < this.state.phonenumbers.length; i++) {
      await this.validate.phonenumber(
        "phonenumbers" + i,
        this.state.phonenumbers[i]
      );
      if (!this.state.valid["phonenumbers" + i]) return;
    }
    if (
      !this.state.valid.name ||
      (!isEmpty(this.state.description) && !this.state.valid.description)
    )
      return;
    this.toggleTab("2");
    this.setState({ formDisabled: [true, false, true, true] });
  };

  onSubmit2 = async (e) => {
    e.preventDefault();
    this.state.invalid = {};
    await this.validate.services();
    console.log(this.state.invalid, this.state.valid);
    if (
      !this.state.valid.delivery ||
      !this.state.valid.takeaway ||
      !this.state.valid.onSite
    )
      return;
    this.toggleTab("3");
    this.setState({ formDisabled: [false, false, true, false] });
  };

  onSubmit3 = async (e) => {
    e.preventDefault();

    this.state.invalid = {};
    await this.validate.building();
    await this.validate.street();
    await this.validate.storeNumber();
    await this.validate.country();
    await this.validate.state();
    await this.validate.city();
    await this.validate.geolocation();

    if (
      !this.state.valid.building ||
      !this.state.valid.street ||
      !this.state.valid.storeNumber ||
      !this.state.valid.country ||
      !this.state.valid.state ||
      !this.state.valid.city ||
      !this.state.valid.geolocation
    )
      return;

    this.toggleTab("4");
    this.setState({ formDisabled: [false, false, false, true] });
  };

  onSubmit4 = async (e) => {
    e.preventDefault();
    await this.validate.categories();
    await this.validate.group();
    if (!this.state.valid.categories || !this.state.valid.group) return;
    const {
      name,
      description,
      phonenumbers,
      delivery,
      takeaway,
      onSite,
      deliveryWorking,
      takeawayWorking,
      onSiteWorking,
      country,
      state,
      city,
      building,
      street,
      storeNumber,
      loclat: latitude,
      loclon: longitude,
      admins,
      categories,
      group,
    } = this.state;
    const data = {
      name,
      description,
      phonenumbers,
      country,
      state,
      city,
      building,
      street,
      storeNumber,
      latitude,
      longitude,
      admins,
      categories,
      group,
    };

    data.admins = data.admins.map((cat) => cat.id);
    data.categories = data.categories.map((cat) => cat.id);
    data.latitude = data.latitude.toString();
    data.longitude = data.longitude.toString();
    if (delivery) {
      data.delivery = "YES";
      data.delivery_working = deliveryWorking;
    }
    if (takeaway) {
      data.takeaway = "YES";
      data.takeaway_working = takeawayWorking;
    }
    if (onSite) {
      data.onSite = "YES";
      data.onSite_working = onSiteWorking;
    }

    const response = await axios({
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      url: "http://localhost:5007/api/restaurants/restaurant",
      data: data,
    }).catch((err) => {
      console.log(err);
    });

    if (response) this.setState({ redirect: true });
  };

  renderCountrySuggestion = (suggestion) => <div>{suggestion.name}</div>;
  renderGroupSuggestion = (suggestion) => <div>{suggestion.name}</div>;
  render() {
    if (this.state.redirect) return <Redirect to="/" />;
    return (
      <>
        <Container>
          <Nav tabs className="mt-3">
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === "1" })}
                onClick={() => this.toggleTab("1")}
                href="#"
                disabled={this.state.formDisabled[0]}
              >
                Info
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === "2" })}
                onClick={() => this.toggleTab("2")}
                href="#"
                disabled={this.state.formDisabled[1]}
              >
                Services
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === "3" })}
                onClick={() => this.toggleTab("3")}
                href="#"
                disabled={this.state.formDisabled[2]}
              >
                Location
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === "4" })}
                onClick={() => this.toggleTab("4")}
                href="#"
                disabled={this.state.formDisabled[3]}
              >
                Correspondence
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent
            activeTab={this.state.activeTab}
            className="border-right border-bottom border-left pt-3 pb-3 pr-4 pl-4"
          >
            <TabPane tabId="1">
              <Form onSubmit={this.onSubmit1} className="">
                <FormGroup row>
                  <Label xs={12} for="name">
                    Restaurant name
                  </Label>
                  <Col xs={12}>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      valid={this.state.valid.name}
                      invalid={this.state.invalid.name ? true : false}
                      onChange={(e) =>
                        this.onChange(e.target.name, e.target.value)
                      }
                      value={this.state.name}
                    />
                    {this.state.invalid.name && (
                      <FormFeedback>{this.state.invalid.name}</FormFeedback>
                    )}
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label xs={12} for="description">
                    Restaurant description <small>(optional)</small>
                  </Label>
                  <Col xs={12}>
                    <Input
                      type="textarea"
                      id="description"
                      name="description"
                      valid={this.state.valid.description}
                      invalid={this.state.invalid.description}
                      onChange={(e) =>
                        this.onChange(e.target.name, e.target.value)
                      }
                      value={this.state.description}
                    />
                    {this.state.invalid.description && (
                      <FormFeedback>
                        {this.state.invalid.description}
                      </FormFeedback>
                    )}
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col xs={12} md={2}>
                    <Row>
                      <Label xs={12} for="phonenumbers0">
                        Phonenumbers
                      </Label>
                      <Col xs={12}>
                        <FormText>
                          Please include [+] sign and country code
                        </FormText>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={12} md={10}>
                    <Row>
                      {this.state.phonenumbers.map((phonenumber, index) => (
                        <Col key={index} className="mb-2" xs={12} md={4}>
                          <Input
                            type="tel"
                            name={"phonenumbers" + index}
                            id={"phonenumbers" + index}
                            placeholder={"Phonenumber " + (index + 1)}
                            value={phonenumber}
                            onChange={(e) => {
                              this.setState({
                                phonenumbers: this.state.phonenumbers.map(
                                  (v, i) => (i === index ? e.target.value : v)
                                ),
                              });
                              this.onChange(e.target.name, e.target.value);
                            }}
                            valid={this.state.valid["phonenumbers" + index]}
                            invalid={this.state.invalid["phonenumbers" + index]}
                          />
                          {this.state.invalid["phonenumbers" + index] && (
                            <FormFeedback>
                              {this.state.invalid["phonenumbers" + index]}
                            </FormFeedback>
                          )}
                        </Col>
                      ))}
                    </Row>
                    <Button
                      outline
                      color="primary"
                      onClick={() =>
                        this.setState({
                          phonenumbers: [...this.state.phonenumbers, ""],
                        })
                      }
                    >
                      <i className="fa fa-plus" />
                    </Button>{" "}
                    <Button
                      outline
                      color="danger"
                      onClick={() =>
                        this.setState({
                          phonenumbers:
                            this.state.phonenumbers.length === 1
                              ? this.state.phonenumbers
                              : this.state.phonenumbers.slice(
                                  0,
                                  this.state.phonenumbers.length - 1
                                ),
                        })
                      }
                    >
                      <i className="fa fa-minus" />
                    </Button>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col>
                    <Button
                      className="pull-right btn-lg"
                      type="submit"
                      color="primary"
                      outline
                    >
                      Next
                    </Button>
                  </Col>
                </FormGroup>
              </Form>
            </TabPane>
            <TabPane tabId="2">
              <Form onSubmit={this.onSubmit2}>
                <Row>
                  <Col xs={12} md={4}>
                    <Row>
                      <Col xs={12}>
                        <FormGroup row>
                          <Col xs={8}>
                            <CustomInput
                              type="switch"
                              id="delivery"
                              name="delivery"
                              onChange={(e) => {
                                this.setState({
                                  delivery: !this.state.delivery,
                                  deliveryWorking:
                                    !this.state.delivery &&
                                    this.state.deliveryWorking.length === 0
                                      ? [
                                          {
                                            dayOfWeek: 0,
                                            openHour: 0,
                                            closeHour: 24,
                                          },
                                        ]
                                      : this.state.deliveryWorking,
                                });
                              }}
                              label="Delivery"
                            />
                            {this.state.invalid.delivery && (
                              <UncontrolledAlert color="danger " fade={true}>
                                {this.state.invalid.delivery}
                              </UncontrolledAlert>
                            )}
                          </Col>
                          {!this.state.delivery ? null : (
                            <Col xs={4}>
                              <Button
                                outline
                                color="primary"
                                onClick={() =>
                                  this.state.deliveryWorking.length < 7
                                    ? this.setState({
                                        deliveryWorking: [
                                          ...this.state.deliveryWorking,
                                          {
                                            dayOfWeek: 0,
                                            openHour: 0,
                                            closeHour: 24,
                                          },
                                        ],
                                      })
                                    : null
                                }
                              >
                                <i className="fa fa-plus" />
                              </Button>{" "}
                              <Button
                                outline
                                color="danger"
                                onClick={() =>
                                  this.setState({
                                    deliveryWorking:
                                      this.state.deliveryWorking.length === 1
                                        ? this.state.deliveryWorking
                                        : this.state.deliveryWorking.slice(
                                            0,
                                            this.state.deliveryWorking.length -
                                              1
                                          ),
                                  })
                                }
                              >
                                <i className="fa fa-minus" />
                              </Button>
                            </Col>
                          )}
                        </FormGroup>
                      </Col>
                      {!this.state.delivery ? null : (
                        <Col xs={12}>
                          {this.state.deliveryWorking.map((working, index) => (
                            <FormGroup row>
                              <Label xs={12} for={"deliveryDay" + index}>
                                Day {index + 1}
                              </Label>
                              <Col xs={12}>
                                <Input
                                  id={"deliveryDay" + index}
                                  name={"deliveryDay" + index}
                                  type="select"
                                  value={working.dayOfWeek}
                                  onChange={(e) => {
                                    this.setState({
                                      deliveryWorking: this.state.deliveryWorking.map(
                                        (v, i) => {
                                          if (i !== index) return v;
                                          v.dayOfWeek = e.target.value;
                                          return v;
                                        }
                                      ),
                                    });
                                  }}
                                >
                                  {this.state.weekDays.map((day, index) => (
                                    <option value={index}>{day}</option>
                                  ))}
                                </Input>
                                <Input
                                  type="number"
                                  max="24"
                                  min="0"
                                  placeholder="Open time (24 format). Default: 0"
                                  onChange={(e) => {
                                    this.setState({
                                      deliveryWorking: this.state.deliveryWorking.map(
                                        (v, i) => {
                                          if (i !== index) return v;
                                          v.openHour = e.target.value;
                                          return v;
                                        }
                                      ),
                                    });
                                  }}
                                />
                                <Input
                                  type="number"
                                  max="24"
                                  min="0"
                                  placeholder="Closing hour (24 format). Default: 24"
                                  onChange={(e) => {
                                    this.setState({
                                      deliveryWorking: this.state.deliveryWorking.map(
                                        (v, i) => {
                                          if (i !== index) return v;
                                          v.closeHour = e.target.value;
                                          return v;
                                        }
                                      ),
                                    });
                                  }}
                                />
                              </Col>
                            </FormGroup>
                          ))}
                        </Col>
                      )}
                    </Row>
                  </Col>
                  <Col xs={12} md={4}>
                    <Row>
                      <Col xs={12}>
                        <FormGroup row>
                          <Col xs={8}>
                            <CustomInput
                              type="switch"
                              id="takeaway"
                              name="takeaway"
                              onChange={(e) =>
                                this.setState({
                                  takeaway: !this.state.takeaway,
                                  takeawayWorking:
                                    !this.state.takeaway &&
                                    this.state.takeawayWorking.length === 0
                                      ? [
                                          {
                                            dayOfWeek: 0,
                                            openHour: 0,
                                            closeHour: 24,
                                          },
                                        ]
                                      : this.state.takeawayWorking,
                                })
                              }
                              label="Takeaway"
                            />
                            {this.state.invalid.takeaway && (
                              <UncontrolledAlert color="danger " fade={true}>
                                {this.state.invalid.takeaway}
                              </UncontrolledAlert>
                            )}
                          </Col>
                          {!this.state.takeaway ? null : (
                            <Col xs={4}>
                              <Button
                                outline
                                color="primary"
                                onClick={() =>
                                  this.state.takeawayWorking.length < 7
                                    ? this.setState({
                                        takeawayWorking: [
                                          ...this.state.takeawayWorking,
                                          {
                                            dayOfWeek: 0,
                                            openHour: 0,
                                            closeHour: 12,
                                          },
                                        ],
                                      })
                                    : null
                                }
                              >
                                <i className="fa fa-plus" />
                              </Button>{" "}
                              <Button
                                outline
                                color="danger"
                                onClick={() =>
                                  this.setState({
                                    takeawayWorking:
                                      this.state.takeawayWorking.length === 1
                                        ? this.state.takeawayWorking
                                        : this.state.takeawayWorking.slice(
                                            0,
                                            this.state.takeawayWorking.length -
                                              1
                                          ),
                                  })
                                }
                              >
                                <i className="fa fa-minus" />
                              </Button>
                            </Col>
                          )}
                        </FormGroup>
                      </Col>
                      {!this.state.takeaway ? null : (
                        <Col xs={12}>
                          {this.state.takeawayWorking.map((working, index) => (
                            <FormGroup row>
                              <Label xs={12} for={"takeawayDay" + index}>
                                Day {index + 1}
                              </Label>
                              <Col xs={12}>
                                <Input
                                  id={"takeawayDay" + index}
                                  name={"takeawayDay" + index}
                                  type="select"
                                  value={working.dayOfWeek}
                                  onChange={(e) => {
                                    this.setState({
                                      takeawayWorking: this.state.takeawayWorking.map(
                                        (v, i) => {
                                          if (i !== index) return v;
                                          v.dayOfWeek = e.target.value;
                                          return v;
                                        }
                                      ),
                                    });
                                  }}
                                >
                                  {this.state.weekDays.map((day, index) => (
                                    <option value={index}>{day}</option>
                                  ))}
                                </Input>
                                <Input
                                  type="number"
                                  max="24"
                                  min="0"
                                  placeholder="Open time (24 format). Default: 0"
                                  onChange={(e) => {
                                    this.setState({
                                      takeawayWorking: this.state.takeawayWorking.map(
                                        (v, i) => {
                                          if (i !== index) return v;
                                          v.openHour = e.target.value;
                                          return v;
                                        }
                                      ),
                                    });
                                  }}
                                />
                                <Input
                                  type="number"
                                  max="24"
                                  min="0"
                                  placeholder="Closing hour (24 format). Default: 24"
                                  onChange={(e) => {
                                    this.setState({
                                      takeawayWorking: this.state.takeawayWorking.map(
                                        (v, i) => {
                                          if (i !== index) return v;
                                          v.closeHour = e.target.value;
                                          return v;
                                        }
                                      ),
                                    });
                                  }}
                                />
                              </Col>
                            </FormGroup>
                          ))}
                        </Col>
                      )}
                    </Row>
                  </Col>
                  <Col xs={12} md={4}>
                    <Row>
                      <Col xs={12}>
                        <FormGroup row>
                          <Col xs={8}>
                            <CustomInput
                              type="switch"
                              id="onSite"
                              name="onSite"
                              onChange={(e) =>
                                this.setState({
                                  onSite: !this.state.onSite,
                                  onSiteWorking:
                                    !this.state.onSite &&
                                    this.state.onSiteWorking.length === 0
                                      ? [
                                          {
                                            dayOfWeek: 0,
                                            openHour: 0,
                                            closeHour: 24,
                                          },
                                        ]
                                      : this.state.onSiteWorking,
                                })
                              }
                              label="On-site"
                            />
                            {this.state.invalid.onSite && (
                              <UncontrolledAlert color="danger " fade={true}>
                                {this.state.invalid.onSite}
                              </UncontrolledAlert>
                            )}
                          </Col>
                          {!this.state.onSite ? null : (
                            <Col xs={4}>
                              <Button
                                outline
                                color="primary"
                                onClick={() =>
                                  this.state.onSiteWorking.length < 7
                                    ? this.setState({
                                        onSiteWorking: [
                                          ...this.state.onSiteWorking,
                                          {
                                            dayOfWeek: 0,
                                            openHour: 0,
                                            closeHour: 12,
                                          },
                                        ],
                                      })
                                    : null
                                }
                              >
                                <i className="fa fa-plus" />
                              </Button>{" "}
                              <Button
                                outline
                                color="danger"
                                onClick={() =>
                                  this.setState({
                                    onSiteWorking:
                                      this.state.onSiteWorking.length === 1
                                        ? this.state.onSiteWorking
                                        : this.state.onSiteWorking.slice(
                                            0,
                                            this.state.onSiteWorking.length - 1
                                          ),
                                  })
                                }
                              >
                                <i className="fa fa-minus" />
                              </Button>
                            </Col>
                          )}
                        </FormGroup>
                      </Col>
                      {!this.state.onSite ? null : (
                        <Col xs={12}>
                          {this.state.onSiteWorking.map((working, index) => (
                            <FormGroup row>
                              <Label xs={12} for={"onSiteDay" + index}>
                                Day {index + 1}
                              </Label>
                              <Col xs={12}>
                                <Input
                                  id={"onSiteyDay" + index}
                                  name={"onSiteDay" + index}
                                  type="select"
                                  value={working.dayOfWeek}
                                  onChange={(e) => {
                                    this.setState({
                                      onSiteWorking: this.state.onSiteWorking.map(
                                        (v, i) => {
                                          if (i !== index) return v;
                                          v.dayOfWeek = e.target.value;
                                          return v;
                                        }
                                      ),
                                    });
                                  }}
                                >
                                  {this.state.weekDays.map((day, index) => (
                                    <option key={index} value={index}>
                                      {day}
                                    </option>
                                  ))}
                                </Input>
                                <Input
                                  type="number"
                                  max="24"
                                  min="0"
                                  placeholder="Open time (24 format). Default: 0"
                                  onChange={(e) => {
                                    this.setState({
                                      onSiteWorking: this.state.onSiteWorking.map(
                                        (v, i) => {
                                          if (i !== index) return v;
                                          v.openHour = e.target.value;
                                          return v;
                                        }
                                      ),
                                    });
                                  }}
                                />
                                <Input
                                  type="number"
                                  max="24"
                                  min="0"
                                  placeholder="Closing hour (24 format). Default: 24"
                                  onChange={(e) => {
                                    this.setState({
                                      onSiteWorking: this.state.onSiteWorking.map(
                                        (v, i) => {
                                          if (i !== index) return v;
                                          v.closeHour = e.target.value;
                                          return v;
                                        }
                                      ),
                                    });
                                  }}
                                />
                              </Col>
                            </FormGroup>
                          ))}
                        </Col>
                      )}
                    </Row>
                  </Col>
                  <Col>
                    <Button
                      className="pull-right btn-lg"
                      type="submit"
                      color="primary"
                      outline
                    >
                      Next
                    </Button>
                  </Col>
                </Row>
              </Form>
            </TabPane>
            <TabPane tabId="3">
              <Form onSubmit={this.onSubmit3}>
                <Row form>
                  <Col md={2}>
                    <FormGroup>
                      <Label for="building">Building #</Label>
                      <Input
                        valid={this.state.valid.building}
                        invalid={this.state.invalid.building}
                        type="text"
                        name="building"
                        id="building"
                        placeholder="Building number"
                        value={this.state.building}
                        onChange={(e) => {
                          this.onChange(e.target.name, e.target.value);
                        }}
                      />
                      {this.state.invalid.building && (
                        <FormFeedback>
                          {this.state.invalid.building}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={8}>
                    <FormGroup>
                      <Label for="street">Street address</Label>
                      <Input
                        valid={this.state.valid.street}
                        invalid={this.state.invalid.street}
                        type="text"
                        name="street"
                        id="street"
                        placeholder="Street address"
                        value={this.state.street}
                        onChange={(e) => {
                          this.onChange(e.target.name, e.target.value);
                        }}
                      />
                      {this.state.invalid.street && (
                        <FormFeedback>{this.state.invalid.street}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={2}>
                    <FormGroup>
                      <Label for="storeNumber">
                        Store <small>(optional)</small>
                      </Label>
                      <Input
                        valid={this.state.valid.storeNumber}
                        invalid={this.state.invalid.storeNumber}
                        type="text"
                        name="storeNumber"
                        id="storeNumber"
                        placeholder="Store number"
                        value={this.state.storeNumber}
                        onChange={(e) => {
                          this.onChange(e.target.name, e.target.value);
                        }}
                      />
                      {this.state.invalid.storeNumber && (
                        <FormFeedback>
                          {this.state.invalid.storeNumber}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="country">Country</Label>
                      <Autosuggest
                        theme={{
                          container: "input-group mb-3",
                          input: "form-control",
                          suggestionsContainer: "container dropdown",
                          suggestionsList: "dropdown-menu show",
                          suggestion: "dropdown-item btn",
                          suggestionHighlighted: "active",
                        }}
                        suggestions={this.state.countrySuggestions}
                        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested(
                          countries,
                          "countrySuggestions"
                        )}
                        onSuggestionsClearRequested={this.onSuggestionsClearRequested(
                          "countrySuggestions"
                        )}
                        getSuggestionValue={this.getSuggestionValue(
                          "country",
                          countryList.getCode
                        )}
                        renderSuggestion={this.renderCountrySuggestion}
                        inputProps={{
                          placeholder: "Type in your country name",
                          value: this.state.countryValue,
                          onChange: this.countryOnChange,
                        }}
                        id="country"
                      />
                      {this.state.invalid.country && (
                        <UncontrolledAlert color="danger " fade={true}>
                          {this.state.invalid.country}
                        </UncontrolledAlert>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="state">
                        State <small>(optional)</small>
                      </Label>
                      <Input
                        valid={this.state.valid.state}
                        invalid={this.state.invalid.state}
                        type="text"
                        name="state"
                        id="state"
                        placeholder="State"
                        value={this.state.state}
                        onChange={(e) => {
                          this.onChange(e.target.name, e.target.value);
                        }}
                      />
                      {this.state.invalid.state && (
                        <FormFeedback>{this.state.invalid.state}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="city">City</Label>
                      <Input
                        valid={this.state.valid.city}
                        invalid={this.state.invalid.city}
                        type="text"
                        name="city"
                        id="city"
                        placeholder="City"
                        value={this.state.city}
                        onChange={(e) => {
                          this.onChange(e.target.name, e.target.value);
                        }}
                      />
                      {this.state.invalid.city && (
                        <FormFeedback>{this.state.invalid.city}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <Button
                      color="primary"
                      type="button"
                      onClick={this.getLocation}
                    >
                      Get Geolocation
                    </Button>
                    {this.state.invalid.geolocation && (
                      <UncontrolledAlert color="danger " fade={true}>
                        {this.state.invalid.geolocation}
                      </UncontrolledAlert>
                    )}
                  </Col>
                  {this.state.loclat && this.state.loclon ? (
                    <Col xs={12}>
                      <iframe
                        title="Geolocation"
                        className="mt-2"
                        src={`https://www.google.com/maps/embed/v1/view?key=${
                          this.state.googleAPIKey
                        }&center=${parseFloat(
                          this.state.loclat.toFixed(4)
                        )},${parseFloat(
                          this.state.loclon.toFixed(4)
                        )}&zoom=18&maptype=satellite`}
                        frameBorder="0"
                        width="100%"
                        height="300px"
                      ></iframe>
                    </Col>
                  ) : null}
                </Row>
                <FormGroup row>
                  <Col>
                    <Button
                      className="pull-right btn-lg"
                      type="submit"
                      color="primary"
                      outline
                    >
                      Next
                    </Button>
                  </Col>
                </FormGroup>
              </Form>
            </TabPane>
            <TabPane tabId="4">
              <Form onSubmit={this.onSubmit4}>
                <FormGroup row>
                  <Label xs={12}>
                    Admins <small>(optional)</small>
                  </Label>
                  <Col xs={12}>
                    <ReactTags
                      placeholder="Add admins"
                      noSuggestionsText="No users"
                      ref={this.reactTags}
                      tags={this.state.admins}
                      suggestions={this.state.adminSuggestions}
                      onDelete={this.onDelete("admins")}
                      onAddition={this.onAddition("admins")}
                      onInput={this.onInput(
                        "adminSuggestions",
                        "admins",
                        "http://localhost:5007/api/suggestions/users"
                      )}
                      maxSuggestionsLength={20}
                      tagComponent={TagComponent}
                      SuggestionComponent={SuggestionComponent}
                      inputAttributes={{
                        style: null,
                      }}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label xs={12}>Categories</Label>
                  <Col xs={12}>
                    <AsyncSelect
                      backspaceRemovesValue
                      defaultOptions
                      loadOptions={this.promiseOptions}
                      isMulti
                      cacheOptions
                    />
                    <Select
                      backspaceRemovesValue
                      options={this.state.categorySuggestions}
                      isMulti
                    />
                    {/*<ReactTags
                      placeholder="Add categories"
                      noSuggestionsText="No categories"
                      ref={this.reactTags}
                      tags={this.state.categories}
                      suggestions={this.state.categorySuggestions}
                      onDelete={this.onDelete("categories")}
                      onAddition={this.onAddition("categories")}
                      onInput={this.onInput(
                        "categorySuggestions",
                        "categories",
                        "http://localhost:5007/api/suggestions/categories"
                      )}
                      maxSuggestionsLength={20}
                      tagComponent={TagComponent}
                      SuggestionComponent={SuggestionComponent}
                      inputAttributes={{
                        style: null,
                      }}
                    />*/}
                    {this.state.invalid.categories && (
                      <UncontrolledAlert color="danger" fade={true}>
                        {this.state.invalid.categories}
                      </UncontrolledAlert>
                    )}
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label xs={12}>Group</Label>
                  <Col xs={12} md={6}>
                    <Autosuggest
                      theme={{
                        container: "input-group mb-3",
                        input: "form-control",
                        suggestionsContainer: "container dropdown",
                        suggestionsList: "dropdown-menu show",
                        suggestion: "dropdown-item btn",
                        suggestionHighlighted: "active",
                      }}
                      suggestions={this.state.groupSuggestions}
                      onSuggestionsFetchRequested={this.onSuggestionsFetchRequested(
                        "http://localhost:5007/api/suggestions/groups",
                        "groupSuggestions"
                      )}
                      onSuggestionsClearRequested={this.onSuggestionsClearRequested(
                        "groupSuggestions"
                      )}
                      getSuggestionValue={this.getSuggestionValue(
                        "group",
                        (group) => group
                      )}
                      renderSuggestion={this.renderCountrySuggestion}
                      inputProps={{
                        placeholder: "Type in your group unique name",
                        value: this.state.group,
                        onChange: this.groupOnChange,
                      }}
                    />
                    {this.state.invalid.group && (
                      <UncontrolledAlert color="danger" fade={true}>
                        {this.state.invalid.group}
                      </UncontrolledAlert>
                    )}
                  </Col>
                  <Col xs={12} md={6}>
                    <Button
                      className="pull-right btn-lg"
                      type="submit"
                      color="primary"
                      outline
                    >
                      Submit
                    </Button>
                  </Col>
                </FormGroup>
              </Form>
            </TabPane>
          </TabContent>
        </Container>
      </>
    );
  }
}

export default RestaurantSET;
