import React, { Component } from "react";
import { action, observable } from "mobx";
import { inject, observer } from "mobx-react";
import axios from "axios";

import { isEmpty, isLength } from "validator";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  CardHeader,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  CustomInput,
  InputGroupButtonDropdown,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

class Store {
  googleAPIKey = "AIzaSyAyzbtDMm8MS1VLeeEeA_4MVpYAxr0l8Oc";
  @observable restaurants = [];
  @observable showCards = true;
  @observable showSearch = false;
  @observable restaurantsLoaded = false;

  @observable catSuggestions = [];
  @observable grpSuggestions = [];

  // inputs
  @observable findCatsInput = "";
  @observable findGrpsInput = "";

  // Search options
  @observable delivery = false;
  @observable takeaway = false;
  @observable onSite = false;
  @observable cats = [];
  @observable grps = [];
  @observable name = null;
  @observable latitude = null;
  @observable longitude = null;
  @observable distance = null;
  @observable minRating = null;
  @observable country = null;
  @observable state = null;
  @observable city = null;

  @action set = (key, value) => {
    this[key] = value;
  };
  @action getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
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
  @action findCategories = async (e) => {
    const value = e.target.value;
    this.findCatsInput = value;
    if (isEmpty(value) || !isLength(value, { min: 2, max: 100 })) return;
    let response = await await axios({
      method: "GET",
      url: "http://localhost:5007/api/suggestions/categories",
      headers: { "Access-Control-Allow-Origin": "*" },
      params: {
        value
      }
    }).catch((err) => {
      console.log(err);
    });
    if (!response) return;
    this.catSuggestions = response.data.map((cat) => ({
      id: cat.id,
      title: cat.title,
      checked: false
    }));
  };
  @action toggleCat = (index) => {
    const arr = this.catSuggestions;
    const oldCat = arr[index];
    var newCat = {
      title: oldCat.title,
      id: oldCat.id,
      checked: !oldCat.checked
    };
    arr[index] = newCat;
    if (newCat.checked) this.cats.push(newCat.id);
    else this.cats.splice(this.cats.indexOf(index), 1);
  };
  @action findGroups = async (e) => {
    const value = e.target.value;
    this.findGrpsInput = value;
    if (isEmpty(value) || !isLength(value, { min: 2, max: 100 })) return;
    let response = await await axios({
      method: "GET",
      url: "http://localhost:5007/api/suggestions/groups",
      headers: { "Access-Control-Allow-Origin": "*" },
      params: {
        value
      }
    }).catch((err) => {
      console.log(err);
    });
    if (!response) return;
    this.grpSuggestions = response.data.map((grp) => ({
      id: grp.id,
      title: grp.title,
      checked: false
    }));
  };
  @action toggleGrp = (index) => {
    const arr = this.grpSuggestions;
    const oldGrp = arr[index];
    var newGrp = {
      title: oldGrp.title,
      id: oldGrp.id,
      checked: !oldGrp.checked
    };
    arr[index] = newGrp;
    if (newGrp.checked) this.grps.push(newGrp.id);
    else this.grps.splice(this.grps.indexOf(index), 1);
  };
  @action findRestaurants = async (e) => {
    e.preventDefault();
    const data = {};
    if (this.name) data.name = this.name;
    if (this.delivery) data.hasDelivery = this.delivery;
    if (this.takeaway) data.hasTakeaway = this.delivery;
    if (this.onSite) data.hasOnSite = this.delivery;
    if (this.latitude && this.longitude && this.distance) {
      data.latitude = this.latitude;
      data.longitude = this.longitude;
      data.distance = this.distance * 1000;
    }
    if (this.cats.length > 0) data.cats = this.cats.join("|");
    if (this.grps.length > 0) data.grps = this.grps.join("|");
    const response = await axios({
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      url: "http://localhost:5007/api/restaurants/restaurant",
      params: data
    }).catch((err) => {
      console.log("caught:", err);
      console.log(err.response);
      if (err.response.status === 404) this.restaurants = null;
      else alert(err.response.data);
    });
    if (!response) return;
    this.restaurants = response.data;
    this.restaurantsLoaded = true;
  };
}

@inject("authStore")
@observer
class OrderBoard extends Component {
  componentDidMount() {
    if (!this.props.authStore.authorized("RES_FIND"))
      this.setState({ redirect: true });
  }
  state = {
    dropdownOpen1: false,
    dropdownOpen2: false,
    dropdownOpen3: false
  };
  toggleDropToggle1 = () => {
    this.setState({ dropdownOpen1: !this.state.dropdownOpen1 });
  };
  toggleDropToggle2 = () => {
    this.setState({ dropdownOpen2: !this.state.dropdownOpen2 });
  };
  toggleDropToggle3 = () => {
    this.setState({ dropdownOpen3: !this.state.dropdownOpen3 });
  };
  store = new Store();
  centerMoved(mapProps, map) {
    console.log(mapProps, map);
  }
  render() {
    return (
      <>
        <Container>
          <h1 className="display-3">Wanna order food?</h1>
          <p className="lead">
            Just choose whatever suits you right now. In each option there are
            plenty of options to choose from. Just tell us what is more
            convenient for you
          </p>
          <Row className="mt-4">
            {this.store.showCards && (
              <>
                <Col xs={12} md={6} lg={4}>
                  <Card className="border-0 mb-4">
                    <CardHeader className="border-0 text-center">
                      <CardTitle>At home?</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <CardText className="text-justify">
                        Order food to be delivered to your door
                      </CardText>
                    </CardBody>
                    <Button
                      color="secondary"
                      onClick={() => this.store.set("delivery", true)}
                    >
                      Delivery
                    </Button>
                  </Card>
                </Col>
                <Col xs={12} md={6} lg={4}>
                  <Card className="border-0 mb-4">
                    <CardHeader className="border-0 text-center">
                      <CardTitle>Outside?</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <CardText className="text-justify">
                        Order food and pick it up on the go
                      </CardText>
                    </CardBody>
                    <Button
                      color="success"
                      onClick={() => this.store.set("takeaway", true)}
                    >
                      Takeaway
                    </Button>
                  </Card>
                </Col>
                <Col xs={12} md={6} lg={4}>
                  <Card className="border-0 mb-4">
                    <CardHeader className="border-0 text-center">
                      <CardTitle>In a restaurant?</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <CardText>Order food contact-less while on-site</CardText>
                    </CardBody>
                    <Button
                      color="primary"
                      onClick={() => this.store.set("onSite", true)}
                    >
                      On-site
                    </Button>
                  </Card>
                </Col>
              </>
            )}

            <Col xs={12} md={6} lg={4}>
              <Card className="border-0 mb-4">
                <CardHeader className="border-0 text-center">
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardBody>
                  <CardText>Choose a category of food</CardText>
                </CardBody>
                <Dropdown
                  isOpen={this.state.dropdownOpen1}
                  toggle={(e) => {
                    if (e.target.tagName === "BUTTON") this.toggleDropToggle1();
                  }}
                  direction="up"
                >
                  <DropdownToggle
                    style={{ width: "100%", marginTop: "0" }}
                    caret
                    color="info"
                  >
                    Select categories
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem header>Search categories</DropdownItem>
                    <DropdownItem>
                      <Input
                        name="searchCats"
                        value={this.store.findCatsInput}
                        onChange={this.store.findCategories}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </DropdownItem>
                    <DropdownItem divider />
                    {this.store.catSuggestions.map((cat, id) => (
                      <DropdownItem onClick={(e) => this.store.toggleCat(id)}>
                        <CustomInput
                          type="checkbox"
                          label={cat.title}
                          checked={cat.checked}
                        />
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={4}>
              <Card className="border-0 mb-4">
                <CardHeader className="border-0 text-center">
                  <CardTitle>KFC or McDonald's?</CardTitle>
                </CardHeader>
                <CardBody>
                  <CardText>Choose a restaurant group/chain</CardText>
                </CardBody>
                <Dropdown
                  isOpen={this.state.dropdownOpen2}
                  toggle={(e) => {
                    if (e.target.tagName === "BUTTON") this.toggleDropToggle2();
                  }}
                  direction="up"
                >
                  <DropdownToggle
                    style={{ width: "100%", marginTop: "0" }}
                    caret
                    color="warning"
                  >
                    Select groups
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem header>Search groups</DropdownItem>
                    <DropdownItem>
                      <Input
                        name="searchGrps"
                        value={this.store.findGrpsInput}
                        onChange={this.store.findGroups}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </DropdownItem>
                    <DropdownItem divider />
                    {this.store.grpSuggestions.map((grp, id) => (
                      <DropdownItem onClick={(e) => this.store.toggleGrp(id)}>
                        <CustomInput
                          type="checkbox"
                          label={grp.title}
                          checked={grp.checked}
                        />
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={4}>
              <Card className="border-0 mb-4">
                <CardHeader className="border-0 text-center">
                  <CardTitle>Near</CardTitle>
                </CardHeader>
                <CardBody>
                  <CardText>Choose a restaurant near you</CardText>
                </CardBody>
                <Button color="danger" onClick={this.store.getLocation}>
                  Get location
                </Button>
              </Card>
            </Col>
          </Row>
          <Row>
            {(this.store.cats.length ||
              this.store.grps.length ||
              this.store.delivery ||
              this.store.takeaway ||
              this.store.onSite ||
              this.store.showSearch ||
              (this.store.latitude && this.store.longitude)) &&
              (this.store.set("showCards", false) || true) &&
              (this.store.set("showSearch", true) || true) && (
                <Col xs={12}>
                  <Form className="mb-4" onSubmit={this.store.findRestaurants}>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <CustomInput
                            type="checkbox"
                            id="delivery-filter"
                            label="Delivery"
                            checked={this.store.delivery}
                            onClick={() =>
                              this.store.set("delivery", !this.store.delivery)
                            }
                          />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <CustomInput
                            type="checkbox"
                            id="takeaway-filter"
                            label="Takeaway"
                            checked={this.store.takeaway}
                            onClick={() =>
                              this.store.set("takeaway", !this.store.takeaway)
                            }
                          />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <CustomInput
                            type="checkbox"
                            id="on-site-filter"
                            label="On-site"
                            checked={this.store.onSite}
                            onClick={() =>
                              this.store.set("onSite", !this.store.onSite)
                            }
                          />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Search name..."
                        style={{ minWidth: "150px" }}
                        value={this.store.name}
                        onChange={(e) => this.store.set("name", e.target.value)}
                      />
                      {this.store.latitude && this.store.longitude && (
                        <Input
                          name="distance"
                          type="text"
                          style={{ minWidth: "150px", maxWidth: "150px" }}
                          placeholder="Distance (km: 2.2)"
                          value={this.store.distance}
                          required
                          onChange={(e) =>
                            this.store.set(
                              "distance",
                              !isNaN(parseFloat(e.target.value)) ||
                                !e.target.value
                                ? e.target.value
                                : this.store.distance
                            )
                          }
                        />
                      )}
                      <InputGroupAddon addonType="append">
                        <InputGroupText>
                          <CustomInput
                            type="checkbox"
                            id="location-filter"
                            label="Location"
                            checked={
                              this.store.latitude && this.store.longitude
                            }
                            onClick={() => {
                              if (this.store.latitude && this.store.longitude) {
                                this.store.set("latitude", null);
                                this.store.set("longitude", null);
                              } else this.store.getLocation();
                            }}
                          />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupButtonDropdown
                        addonType="append"
                        isOpen={this.state.dropdownOpen3}
                        toggle={this.toggleDropToggle3}
                      >
                        <DropdownToggle caret>
                          {this.store.minRating || "Rating"}
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem
                            onClick={() => this.store.set("minRating", 4)}
                          >
                            {"> 4"}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => this.store.set("minRating", 3)}
                          >
                            {"> 3"}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => this.store.set("minRating", 2)}
                          >
                            {"> 2"}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => this.store.set("minRating", 1)}
                          >
                            {"> 1"}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => this.store.set("minRating", null)}
                          >
                            All
                          </DropdownItem>
                        </DropdownMenu>
                      </InputGroupButtonDropdown>
                      <InputGroupAddon addonType="append">
                        <Button color="secondary" outline type="submit">
                          Search
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </Form>
                </Col>
              )}
          </Row>

          {this.store.restaurantsLoaded && (
            <Row>
              {!this.store.restaurants && (
                <h3 className="text-center">Cannot find restaurants</h3>
              )}
              {this.store.restaurants &&
                this.store.restaurants.map((res) => (
                  <Col xs={12} md={6} lg={4}>
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle>{res.name}</CardTitle>
                      </CardHeader>
                      <CardBody>{res.description}</CardBody>
                    </Card>
                  </Col>
                ))}
            </Row>
          )}
        </Container>
      </>
    );
  }
}

export default OrderBoard;
