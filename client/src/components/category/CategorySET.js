import axios from "axios";
import React, { Component } from "react";
import ImageUploader from "react-images-upload";
import { Redirect, withRouter } from "react-router-dom";
import {
  Button,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  UncontrolledAlert,
} from "reactstrap";
const { isLength } = require("validator");

class CategorySET extends Component {
  state = {
    uName: "",
    title: "",
    picture: [],
    catID: null,
    valid: {},
    invalid: {},

    message: false,
    redirect: false,
    redirectMessage: "",
  };
  validate = {
    uName: () => {
      const { uName } = this.state;
      if (!isLength(uName, { min: 3, max: 50 }))
        this.setInvalid(
          "uName",
          "Category unique name has to be 3 to 50 characters long"
        );
      else this.setValid("uName");
    },
    title: () => {
      const { title } = this.state;
      if (!isLength(title, { min: 2, max: 100 }))
        this.setInvalid(
          "title",
          "Category title has to be 2 to 100 characters long"
        );
      else this.setValid("title");
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
  onChange = async (key, value) => {
    await this.setState({
      [key]: value,
    });
    this.validate[key]();
  };
  onSubmit = async (e) => {
    e.preventDefault();
    await this.validate.uName();
    await this.validate.title();
    console.log("hhhh");
    if (!this.state.valid.uName || !this.state.valid.title) return;
    const { uName, title, catID } = this.state;
    this.setState({ message: false });
    if (catID) {
      const response = await axios({
        method: "PUT",
        headers: { "Access-Control-Allow-Origin": "*" },
        url: "http://localhost:5007/api/restaurants/category/" + catID,
        data: {
          uName,
          title,
        },
      }).catch((err) => {
        console.log(err);
      });
      if (!response) return;
      this.setState({
        message: "Category updated successfully",
      });
    } else {
      const response = await axios({
        method: "POST",
        headers: { "Access-Control-Allow-Origin": "*" },
        url: "http://localhost:5007/api/restaurants/category/",
        data: {
          uName,
          title,
        },
      }).catch((err) => {
        console.log(err);
      });
      if (!response) return;
      this.setState({
        redirect: true,
        redirectMessage: "Category created successfully",
        catID: response.data._id,
      });
    }
  };
  async componentDidMount() {
    const { catID } = this.props.match.params;
    if (!catID) return;
    this.setState({ catID });
    const response = await axios({
      method: "GET",
      headers: { "Access-Control-Allow-Origin": "*" },
      url: "http://localhost:5007/api/restaurants/category/" + catID,
    }).catch((err) => {
      console.log(err);
    });
    if (!response) return;
    const { uName, title } = response.data;
    console.log(uName, title, response.data);
    this.setState({ uName, title });
  }
  render() {
    if (this.state.redirect)
      return (
        <Redirect
          to={{
            pathname: this.props.location.pathname + "/" + this.state.catID,
            state: { message: this.state.redirectMessage },
          }}
        />
      );
    return (
      <Container>
        {this.state.message && (
          <UncontrolledAlert color="success">
            {this.state.message}
          </UncontrolledAlert>
        )}
        {this.props.location.state && this.props.location.state.message && (
          <UncontrolledAlert color="success">
            {this.props.location.state.message}
          </UncontrolledAlert>
        )}
        <Form onSubmit={this.onSubmit}>
          <FormGroup row>
            <Label xs={12} for="uName">
              Unique name
            </Label>
            <Col xs={12}>
              <Input
                type="text"
                id="uName"
                name="uName"
                valid={this.state.valid.uName}
                invalid={this.state.invalid.uName ? true : false}
                onChange={(e) => this.onChange(e.target.name, e.target.value)}
                value={this.state.uName}
              />
              {this.state.invalid.uName && (
                <FormFeedback>{this.state.invalid.uName}</FormFeedback>
              )}
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label xs={12} for="title">
              Category title
            </Label>
            <Col xs={12}>
              <Input
                type="text"
                id="title"
                name="title"
                valid={this.state.valid.title}
                invalid={this.state.invalid.title ? true : false}
                onChange={(e) => this.onChange(e.target.name, e.target.value)}
                value={this.state.title}
              />
              {this.state.invalid.title && (
                <FormFeedback>{this.state.invalid.title}</FormFeedback>
              )}
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label xs={12} for="picture" className="text-center">
              Category picture
            </Label>
            <Col xs={12}>
              <ImageUploader
                withIcon={true}
                buttonText="Choose images"
                onChange={(pic) => this.setState({ picture: pic })}
                imgExtension={[".jpg", ".jpeg", ".png", ".gif"]}
                maxFileSize={5242880}
                withPreview
                name="picture"
                label="Max file size: 5mb, accepted: jpg|jpeg|png|gif"
              />
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
                {this.state.catID ? "Update" : "Submit"}
              </Button>
            </Col>
          </FormGroup>
        </Form>
      </Container>
    );
  }
}

export default withRouter(CategorySET);
