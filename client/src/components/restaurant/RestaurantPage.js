import axios from "axios";
import React, { Component } from "react";
import {
  Badge,
  Col,
  Container,
  Jumbotron,
  ListGroup,
  ListGroupItem,
  Media,
  Row,
  Spinner,
} from "reactstrap";

import { getName } from "country-list";

class RestaurantPage extends Component {
  state = {
    restaurant: null,
    googleAPIKey: "AIzaSyAyzbtDMm8MS1VLeeEeA_4MVpYAxr0l8Oc",
  };
  async componentDidMount() {
    const { resID } = this.props.match.params;
    const restaurant = await axios({
      method: "GET",
      url: "http://localhost:5007/api/restaurants/restaurant/" + resID,
    }).catch((err) => {
      console.log(err);
    });
    if (!restaurant) return;
    this.setState({ restaurant: restaurant.data });
  }
  render() {
    const { restaurant: res } = this.state;
    return (
      <>
        <Jumbotron>
          <Container>
            {!res && (
              <div class="d-flex justify-content-center">
                <Spinner
                  className="text-center align-items-center justify-content-center"
                  color="primary"
                />
              </div>
            )}
            {res && (
              <Row>
                <Col xs={12} md={9}>
                  <Row>
                    <Media>
                      <Media left className="mr-3">
                        <Media object src="https://picsum.photos/200" />
                      </Media>
                      <Media body>
                        <Media heading>
                          <h4>{res.name}</h4>{" "}
                          <Badge className="ml-auto">Open</Badge>
                        </Media>
                        {res.description}
                        <h4 className="mt-3">Phone numbers</h4>
                        {res.phonenumbers.map((phone) => (
                          <ListGroup>
                            <ListGroupItem>
                              <a href={"tel:" + phone}>{phone}</a>
                            </ListGroupItem>
                          </ListGroup>
                        ))}
                      </Media>
                    </Media>
                  </Row>
                </Col>
                <Col xs={12} md={3}>
                  <h4>Services</h4>
                  <div>
                    <Badge color={res.delivery ? "success" : "danger"}>
                      Delivery
                    </Badge>{" "}
                    {res.delivery &&
                      ((res.deliveryWorking.days.filter(
                        (wor) =>
                          wor.dayOfWeek === new Date().getDay() &&
                          wor.openHour <= new Date().getHours() &&
                          wor.closeHour >= new Date().getHours()
                      ).length > 0 && (
                        <Badge color={"success"}>Open</Badge>
                      )) || <Badge color={"danger"}>Closed</Badge>)}
                  </div>
                  <div>
                    <Badge color={res.takeaway ? "success" : "danger"}>
                      Takeaway
                    </Badge>{" "}
                    {res.takeaway &&
                      ((res.takeawayWorking.days.filter(
                        (wor) =>
                          wor.dayOfWeek === new Date().getDay() &&
                          wor.openHour <= new Date().getHours() &&
                          wor.closeHour >= new Date().getHours()
                      ).length > 0 && (
                        <Badge color={"success"}>Open</Badge>
                      )) || <Badge color={"danger"}>Closed</Badge>)}
                  </div>
                  <div>
                    <Badge color={res.onSite ? "success" : "danger"}>
                      On-site
                    </Badge>{" "}
                    {res.onSite &&
                      ((res.onSiteWorking.days.filter(
                        (wor) =>
                          wor.dayOfWeek === new Date().getDay() &&
                          wor.openHour <= new Date().getHours() &&
                          wor.closeHour >= new Date().getHours()
                      ).length > 0 && (
                        <Badge color={"success"}>Open</Badge>
                      )) || <Badge color={"danger"}>Closed</Badge>)}
                  </div>
                  <h4 className="mt-4">Address</h4>
                  <p>{`${res.address.building} ${res.address.street}, ${res.address.city}`}</p>
                  <p>{`${res.address.state}, ${getName(
                    res.address.country
                  )}.`}</p>
                  <p>
                    {res.address.storeNumber &&
                      `Store #: ${res.address.storeNumber}}.`}
                  </p>
                  <h4 className="mt-4">Maps</h4>
                  <Row>
                    <Col xs={12}>
                      <iframe
                        title="Geolocation"
                        className="mt-2"
                        src={`https://www.google.com/maps/embed/v1/place?key=${
                          this.state.googleAPIKey
                        }&q=${parseFloat(
                          res.geolocation.coordinates[1].toFixed(4)
                        )},${parseFloat(
                          res.geolocation.coordinates[0].toFixed(4)
                        )}&zoom=18&maptype=satellite`}
                        frameBorder="0"
                        width="100%"
                        height="100%"
                      ></iframe>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}
          </Container>
        </Jumbotron>
      </>
    );
  }
}

export default RestaurantPage;
