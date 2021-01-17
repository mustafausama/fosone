import React from "react";
import { Col, Container, Jumbotron, Row } from "reactstrap";
import Login from "./user/Login";
import Register from "./user/Register";

const Welcome = () => {
  return (
    <Jumbotron>
      <Container>
        <Row>
          <Col xs={12}>
            <h2 className="text-primary text-center">Login</h2>
          </Col>
          <Login />
        </Row>
        <hr />
        <Row>
          <Col xs={12}>
            <h2 className="text-primary text-center">Register</h2>
          </Col>
          <Register />
        </Row>
      </Container>
    </Jumbotron>
  );
};

export default Welcome;
