import axios from "axios";
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import {
  Alert,
  Container,
  ListGroup,
  ListGroupItem,
  Media,
  Spinner,
} from "reactstrap";

class RestaurantList extends Component {
  state = {
    restaurants: null,
  };
  async componentDidMount() {
    const restaurants = await axios({
      method: "GET",
      url: "http://localhost:5007/api/restaurants/restaurant/all",
    }).catch((err) => {
      console.log(err);
    });
    if (!restaurants) return;
    this.setState({ restaurants: restaurants.data });
  }
  render() {
    return (
      <>
        <Container>
          {!this.state.restaurants && (
            <div class="d-flex justify-content-center mt-5">
              <Spinner
                className="text-center align-items-center justify-content-center"
                color="primary"
              />
            </div>
          )}
          {this.state.restaurants && this.state.restaurants.length > 0 && (
            <ListGroup className="mt-5">
              {this.state.restaurants.map((res) => (
                <ListGroupItem>
                  <Media href={this.props.location.pathname + "/" + res._id}>
                    {
                      /*res.picture*/ true && (
                        <Media left className="mr-2">
                          <Media
                            src={"https://picsum.photos/50"}
                            alt={res.name}
                          />
                        </Media>
                      )
                    }
                    <Media body>
                      <Media heading>{res.name}</Media>
                      {res.description}
                    </Media>
                  </Media>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
          {this.state.restaurants && this.state.restaurants.length === 0 && (
            <Alert color="secondary" className="text-center">
              No restaurants
            </Alert>
          )}
        </Container>
      </>
    );
  }
}

export default withRouter(RestaurantList);
