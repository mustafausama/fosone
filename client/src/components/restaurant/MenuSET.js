import React, { Component } from "react";
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Container,
  Button,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";

Array.prototype.pushRet = function (x) {
  this.push(x);
  return this;
};

Array.prototype.spliceRet = function (i, c) {
  this.splice(i, c);
  return this;
};

Array.prototype.setRet = function (i, elem) {
  return this.slice(0, i)
    .concat([elem])
    .concat(this.slice(i + 1));
};

const item = {
  name: "",
  description: "",
  price: null,
};

const category = {
  categoryName: "",
  categoryDescription: "",
};

class MenuSET extends Component {
  state = {
    menuName: "",
    categories: [category],
    items: [[item]],
  };

  renderItems = (catIndex) => {
    const items = this.state.items[catIndex];
    return (
      <Col xs="12">
        <FormGroup row>
          <h5 className="d-inline-block col">
            {this.state.categories[catIndex].categoryName} Items
          </h5>
          <Col xs={12}>
            <Button
              className="col"
              color="primary"
              outline
              onClick={() => {
                this.setState({
                  items: this.state.items.setRet(catIndex, items.pushRet(item)),
                });
              }}
            >
              <span className="fa fa-plus"></span>
            </Button>
          </Col>
        </FormGroup>
        <ListGroup>
          {items.map((item, itemIndex) => (
            <ListGroupItem>
              <InputGroup className="mb-2">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>Name</InputGroupText>
                </InputGroupAddon>
                <Input
                  value={item.name}
                  onChange={(e) =>
                    this.setState({
                      items: this.state.items.setRet(
                        catIndex,
                        items.setRet(itemIndex, {
                          ...item,
                          name: e.target.value,
                        })
                      ),
                    })
                  }
                />
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>Description</InputGroupText>
                </InputGroupAddon>
                <Input
                  value={item.description}
                  onChange={(e) =>
                    this.setState({
                      items: this.state.items.setRet(
                        catIndex,
                        items.setRet(itemIndex, {
                          ...item,
                          description: e.target.value,
                        })
                      ),
                    })
                  }
                />
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>Price</InputGroupText>
                </InputGroupAddon>
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    this.setState({
                      items: this.state.items.setRet(
                        catIndex,
                        items.setRet(itemIndex, {
                          ...item,
                          price: e.target.value,
                        })
                      ),
                    })
                  }
                />
                <InputGroupAddon addonType="append">
                  <Button
                    color="danger"
                    onClick={() =>
                      this.setState({
                        items:
                          this.state.items.length === 1
                            ? this.state.items
                            : this.state.items.setRet(
                                catIndex,
                                items.spliceRet(itemIndex, 1)
                              ),
                      })
                    }
                  >
                    <span className="fa fa-minus"></span>
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </ListGroupItem>
          ))}
        </ListGroup>
      </Col>
    );
  };

  renderCategories = () => {
    const { categories } = this.state;
    return categories.map((category, catIndex) => (
      <ListGroupItem>
        <Row>
          <Col>
            <ListGroupItemHeading>
              Category #{catIndex + 1}{" "}
              <Button
                size="sm"
                color="danger"
                outline
                onClick={() =>
                  this.setState({
                    categories:
                      categories.length === 1
                        ? categories
                        : categories.spliceRet(catIndex, 1),

                    items:
                      this.state.items.length === 1
                        ? this.state.items
                        : this.state.items.spliceRet(catIndex, 1),
                  })
                }
              >
                <span className="fa fa-minus"></span>
              </Button>
            </ListGroupItemHeading>
            <ListGroupItemText>
              <FormGroup>
                <Label>Category Name</Label>
                <Input
                  value={category.categoryName}
                  onChange={(e) =>
                    this.setState({
                      categories: categories.map((cat, id) =>
                        id !== catIndex
                          ? cat
                          : { ...cat, categoryName: e.target.value }
                      ),
                    })
                  }
                />
              </FormGroup>
              <FormGroup>
                <Label>Category Name</Label>
                <Input
                  type="textarea"
                  value={category.categoryDescription}
                  onChange={(e) =>
                    this.setState({
                      categories: categories.map((cat, id) =>
                        id !== catIndex
                          ? cat
                          : { ...cat, categoryDescription: e.target.value }
                      ),
                    })
                  }
                />
              </FormGroup>
              <Row>{this.renderItems(catIndex)}</Row>
            </ListGroupItemText>
          </Col>
        </Row>
      </ListGroupItem>
    ));
  };

  render() {
    return (
      <Container>
        <Form>
          <FormGroup>
            <Label>Menu name</Label>
            <Input
              type="text"
              value={this.state.menuName}
              onChange={(e) =>
                this.setState({
                  menuName: e.target.value,
                })
              }
            />
          </FormGroup>
          <FormGroup row>
            <Col>
              <Button
                className="col-12"
                onClick={() =>
                  this.setState({
                    categories: this.state.categories.concat(category),
                    items: this.state.items.concat([[item]]),
                  })
                }
                outline
                color="primary"
              >
                <span className="fa fa-plus"></span>
              </Button>
            </Col>
          </FormGroup>
          <ListGroup>{this.renderCategories()}</ListGroup>
        </Form>
      </Container>
    );
  }
}

export default MenuSET;
