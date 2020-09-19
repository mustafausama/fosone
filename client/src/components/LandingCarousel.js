import React, { Component } from "react";
import {
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption,
} from "reactstrap";

const items = [
  {
    src: "./images/delivery.jpg",
    altText: "Delivery image",
    header: "Delivery",
    caption: "Excellent delivery services",
  },
  {
    src: "./images/takeaway.jpg",
    altText: "Takeaway image",
    header: "Takeaway",
    caption: "Order food to pick it up on the go",
  },
  {
    src: "./images/on-site.jpg",
    altText: "On-site image",
    header: "On-site order",
    caption: "Use your phone to order food on-site",
  },
];

class LandingCarousel extends Component {
  state = {
    activeIndex: 0,
    animating: false,
  };

  setActiveIndex = (index) => {
    this.setState({ activeIndex: index });
  };

  setAnimating = (val) => {
    this.setState({ animating: val });
  };

  next = () => {
    if (this.state.animating) return;
    const nextIndex =
      this.state.activeIndex === items.length - 1
        ? 0
        : this.state.activeIndex + 1;
    this.setActiveIndex(nextIndex);
  };

  previous = () => {
    if (this.state.animating) return;
    const nextIndex =
      this.state.activeIndex === 0
        ? items.length - 1
        : this.state.activeIndex - 1;
    this.setActiveIndex(nextIndex);
  };

  goToIndex = (newIndex) => {
    if (this.state.animating) return;
    this.setActiveIndex(newIndex);
  };

  render() {
    const slides = items.map((item, id) => {
      return (
        <CarouselItem
          className="custom-tag"
          tag="div"
          key={id}
          onExiting={() => this.setAnimating(true)}
          onExited={() => this.setAnimating(false)}
        >
          <img
            src={item.src}
            alt={item.altText}
            className="d-block w-100"
            style={{
              filter: "blur(1px)",
              opacity: 0.5,
            }}
          />
          <CarouselCaption
            className="text-white"
            captionText={item.caption}
            captionHeader={item.header}
          />
        </CarouselItem>
      );
    });
    return (
      <div>
        <style>
          {`.custom-tag {
              max-width: 100%;
              height: 500px;
              background: black;
            }`}
        </style>
        <Carousel
          activeIndex={this.state.activeIndex}
          next={this.next}
          previous={this.previous}
        >
          <CarouselIndicators
            items={items}
            activeIndex={this.state.activeIndex}
            onClickHandler={this.goToIndex}
          />
          {slides}
          <CarouselControl
            direction="prev"
            directionText="Previous"
            onClickHandler={this.previous}
          />
          <CarouselControl
            direction="next"
            directionText="Next"
            onClickHandler={this.next}
          />
        </Carousel>
      </div>
    );
  }
}

export default LandingCarousel;
