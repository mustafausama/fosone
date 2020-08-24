import React, { Component } from "react";
import FacebookLogin from "react-facebook-login";

export default class Facebook extends Component {
  state = {
    isLoggedIn: false,
    userID: "",
    name: "",
    email: "",
    picture: "",
  };

  responseFacebook = (response) => {
    console.log(response);

    /*this.setState({
      isLoggedIn: true,
      userID: response.userID,
      name: response.name,
      email: response.email,
      picture: response.picture.data.url,
    });*/
  };

  componentClicked = () => console.log("clicked");

  render() {
    let fbContent;

    if (this.state.isLoggedIn) {
      fbContent = (
        <div
          style={{
            width: "400px",
            margin: "auto",
            background: "#000000",
            padding: "20px",
          }}
        >
          <img src={this.state.picture} alt={this.state.name} />
          <h2>Welcome {this.state.name}</h2>
          Email: {this.state.email}
        </div>
      );
    } else {
      fbContent = (
        <FacebookLogin
          appId="1222306931451693"
          autoLoad={false}
          fields="name,email,picture,birthday,hometown,address,age_range,favorite_athletes,favorite_teams,first_name,gender,is_guest_user,languages,last_name,link,location,meeting_for,middle_name,name_format,quotes,relationship_status,religion,sports,video_upload_limits,website,work"
          scope="email,user_birthday,user_age_range,user_photos,user_friends,user_gender,user_hometown,user_likes,user_link,user_location,user_photos,user_posts,user_videos"
          onClick={this.componentClicked}
          callback={this.responseFacebook}
        />
      );
    }

    return <div>{fbContent}</div>;
  }
}
