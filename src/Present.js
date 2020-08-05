import React from "react";
import "./assets/fonts/fontawesome5-overrides.min.css";
import "./assets/css/styles.min.css";
import Logo from "./assets/img/syncfastlogo.png";
import FullScreen from "./assets/full-screen-white.png";
import Utility from "./assets/utility.png";
import Loading from "./assets/loading.gif";
import Sketch from "react-p5";
import PreviousSlide from "./assets/previousSlide.png";
import NextSlide from "./assets/nextSlide.png";
import { Link } from "react-router-dom";
import { gapi } from "gapi-script";
import "./assets/css/slidesPresentStyles.css";
import Websocket from "react-websocket";
import Footer from "./Footer";
import RTCHostComponent from "./RTCHostComponent";

class Present extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      myVal: "",
      length: "",
      slideUrl: "",
      imageElement: "",
      imageElement2: "",
      newCode: "",
      presentation: "",
      screenState: "standard",
      lockState: true,
      notes: "No notes available.",
      notesState: "none",
      voiceState: false,
      openURL: "",
      openQR: "",
      connected: false,
      accessKey: "",
      loading: "inline",
      slideDisplay: "none",
      dropdownDisplay: "none",
      changeAccess: false,
      rtcComponent: null,
    };

    this.updateSigninStatus = this.updateSigninStatus.bind(this);
    this.handleClientLoad = this.handleClientLoad.bind(this);
    this.initClient = this.initClient.bind(this);
  }

  componentDidMount() {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    document.body.appendChild(script);
    this.handleClientLoad();
  }

  handleClientLoad() {
    gapi.load("client:auth2", this.initClient);
  }

  initClient() {
    gapi.client
      .init({
        apiKey: "AIzaSyDhkJ2yT06tRwXIMEUp9xaj2-LxOnKyvGY",
        clientId:
          "510632149212-b3nju2fd9omib1l67qal0ot1214rr75s.apps.googleusercontent.com",
        discoveryDocs: [
          "https://slides.googleapis.com/$discovery/rest?version=v1",
        ],
        scope: "https://www.googleapis.com/auth/drive.file",
      })
      .then(
        () => {
          // Listen for sign-in state changes.
          gapi.auth2
            .getAuthInstance()
            .isSignedIn.listen(this.updateSigninStatus);

          // Handle the initial sign-in state.
          this.updateSigninStatus(
            gapi.auth2.getAuthInstance().isSignedIn.get()
          );
        },
        function (error) {
          console.log(JSON.stringify(error, null, 2));
        }
      );
  }

  updateSigninStatus = (isSignedIn) => {
    if (isSignedIn) {
      this.listSlides();
    } else {
      this.handleAuthClick();
    }
  };

  handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  async listSlides() {
    gapi.client.slides.presentations
      .get({
        presentationId: sessionStorage.getItem("presentationID"),
      })
      .then(
        async (response) => {
          await this.firebaseCommands();
          this.setState({ presentation: response.result });
          this.setState({ length: this.state.presentation.slides.length });
          await gapi.client.slides.presentations.pages
            .get({
              presentationId: sessionStorage.getItem("presentationID"),
              pageObjectId: this.state.presentation.slides[
                sessionStorage.getItem("currentSlide")
              ].objectId,
            })
            .then(async (response) => {
              const res = JSON.parse(response.body);
              try {
                this.setState({
                  notes: "",
                });
                let notesElements = await res.slideProperties.notesPage
                  .pageElements[1].shape.text.textElements;
                await notesElements.forEach((i) => {
                  if (i.textRun && i.textRun.content) {
                    this.setState({
                      notes: this.state.notes + i.textRun.content,
                    });
                  }
                });
              } catch (e) {
                console.log(e);
                this.setState({ notes: "No notes available." });
              }
            });
          gapi.client.slides.presentations.pages
            .getThumbnail({
              presentationId: sessionStorage.getItem("presentationID"),
              pageObjectId: this.state.presentation.slides[
                sessionStorage.getItem("currentSlide")
              ].objectId,
            })
            .then(
              async (response) => {
                const res = JSON.parse(response.body);
                this.setState({ slideUrl: res.contentUrl });
                await fetch(
                  "https://syncfast.macrotechsolutions.us:9146/http://localhost/slideUrl",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      firebasepresentationkey: sessionStorage.getItem(
                        "firebasePresentationKey"
                      ),
                      slideurl: this.state.slideUrl,
                      slidenum: sessionStorage.getItem("currentSlide"),
                    },
                    body: JSON.stringify({ notes: this.state.notes }),
                  }
                );
                await fetch(
                  "https://syncfast.macrotechsolutions.us:9146/http://localhost/presentationTitle",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      firebasepresentationkey: sessionStorage.getItem(
                        "firebasePresentationKey"
                      ),
                      presentationtitle: this.state.presentation.title,
                    },
                  }
                );
                await fetch(
                  "https://syncfast.macrotechsolutions.us:9146/http://localhost/presentationLength",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      firebasepresentationkey: sessionStorage.getItem(
                        "firebasePresentationKey"
                      ),
                      length: this.state.length,
                      presentationtitle: this.state.presentation.title,
                    },
                  }
                );
                await fetch(
                  "https://syncfast.macrotechsolutions.us:9146/http://localhost/clientMic",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      firebasepresentationkey: sessionStorage.getItem(
                        "firebasePresentationKey"
                      ),
                      clientmic: "false"
                    },
                  }
                );
                this.setState({
                  loading: "none",
                });
                this.setState({
                  slideDisplay: "inline",
                });
                // imageElement = document.createElement("img");
                // imageElement.id = "presImg";
                // imageElement.title = presentation.title;
                // imageElement.src = slideUrl;
                // imageElement2 = document.createElement("img");
                // imageElement2.id = "presImg2";
                // imageElement2.title = presentation.title;
                // imageElement2.src = slideUrl;
                // document.querySelector(".img").appendChild(imageElement);
                // document.querySelector(".img2").appendChild(imageElement2);
                this.setState({
                  accessKey: sessionStorage.getItem("accessKey"),
                });
                // document.querySelector(".center").prepend(p);
                if(sessionStorage.getItem("reload") != "done"){
                  sessionStorage.setItem("reload", "done");
                  window.location.reload();
                } else{
                  sessionStorage.removeItem("reload");
                }
              },
              function (response) {
                console.log("Error: " + response.result.error.message);
              }
            );
        },
        function (response) {
          console.log("Error: " + response.result.error.message);
        }
      );
  }

  openQRCodePres() {
    window.open(
      "https://api.qrserver.com/v1/create-qr-code/?data=https://syncfast.macrotechsolutions.us/client.html?accessKey=" +
        sessionStorage.getItem("accessKey") +
        "&size=600x600",
      "QR Code",
      "height=600,width=600"
    );
  }

  async firebaseCommands() {
    let response = await fetch(
      "https://syncfast.macrotechsolutions.us:9146/http://localhost/hostCommands",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accesskey: sessionStorage.getItem("accessKey"),
        },
      }
    ).catch((err) => console.log(err));
    let json = await response.json();
    sessionStorage.setItem(
      "firebasePresentationKey",
      json.firebasepresentationkey
    );
    if (!this.state.connected) {
      this.establishConnection();
      this.setState({ connected: true });
    }
    sessionStorage.setItem("currentSlide", json.currentslidenum);
  }

  async previousSlide() {
    if (sessionStorage.getItem("currentSlide") > 0) {
      this.setState({
        slideNum: (
          parseInt(sessionStorage.getItem("currentSlide")) - 1
        ).toString(),
      });
      sessionStorage.setItem(
        "currentSlide",
        (parseInt(sessionStorage.getItem("currentSlide")) - 1).toString()
      );
    } else {
      alert("You are currently viewing the first slide.");
    }
    this.updatePage();
  }

  async nextSlide() {
    if (sessionStorage.getItem("currentSlide") < this.state.length - 1) {
      this.setState({
        slideNum: (
          parseInt(sessionStorage.getItem("currentSlide")) + 1
        ).toString(),
      });
      await sessionStorage.setItem(
        "currentSlide",
        (parseInt(sessionStorage.getItem("currentSlide")) + 1).toString()
      );
    } else {
      alert("You are currently viewing the last slide.");
    }
    this.updatePage();
  }

  async establishConnection() {
    await fetch(
      "https://syncfast.macrotechsolutions.us:9146/http://localhost/createListener",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          firebasepresentationkey: sessionStorage.getItem(
            "firebasePresentationKey"
          ),
        },
      }
    );
  }

  async updatePage() {
    await gapi.client.slides.presentations.pages
      .get({
        presentationId: sessionStorage.getItem("presentationID"),
        pageObjectId: this.state.presentation.slides[
          sessionStorage.getItem("currentSlide")
        ].objectId,
      })
      .then(async (response) => {
        const res = JSON.parse(response.body);
        try {
          this.setState({ notes: "" });
          let notesElements = await res.slideProperties.notesPage
            .pageElements[1].shape.text.textElements;
          await notesElements.forEach((i) => {
            if (i.textRun && i.textRun.content) {
              this.setState({
                notes: this.state.notes + i.textRun.content,
              });
            }
          });
          // this.notesSection.innerText = this.notes;
        } catch (e) {
          console.log(e);
          this.setState({ notes: "No notes available." });
          // this.notesSection.innerText = this.notes;
        }
      });
    gapi.client.slides.presentations.pages
      .getThumbnail({
        presentationId: sessionStorage.getItem("presentationID"),
        pageObjectId: this.state.presentation.slides[
          sessionStorage.getItem("currentSlide")
        ].objectId,
      })
      .then(
        async (response) => {
          const res = JSON.parse(response.body);
          this.setState({ slideUrl: res.contentUrl });
          // this.findImage(this.slideUrl);
          // this.findQR(this.slideUrl);
          // this.imageElement.src = this.slideUrl;
          // this.imageElement2.src = this.slideUrl;
          await fetch(
            "https://syncfast.macrotechsolutions.us:9146/http://localhost/updatePage",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                firebasepresentationkey: sessionStorage.getItem(
                  "firebasePresentationKey"
                ),
                slidenum: sessionStorage.getItem("currentSlide"),
                slideurl: this.state.slideUrl,
              },
              body: JSON.stringify({ notes: this.state.notes }),
            }
          );
        },
        function (response) {
          console.log("Error: " + response.result.error.message);
        }
      );
  }

  signOut() {
    sessionStorage.setItem("presentationID", null);
    sessionStorage.setItem("currentSlide", null);
    sessionStorage.setItem("firebasePresentationKey", null);
    sessionStorage.setItem("accessKey", null);
    sessionStorage.setItem("userKey", null);
    sessionStorage.setItem("profilePic", null);
    localStorage.setItem("access_token", null);
    localStorage.setItem("userKey", null);
    window.location = "./";
  }

  newPres() {
    window.location = "host";
  }

  async lockAccess() {
    if (!this.state.lockState) {
      await fetch(
        "https://syncfast.macrotechsolutions.us:9146/http://localhost/lockPresentation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            firebasepresentationkey: sessionStorage.getItem(
              "firebasePresentationKey"
            ),
            lockstate: "true",
          },
        }
      );
    } else {
      await fetch(
        "https://syncfast.macrotechsolutions.us:9146/http://localhost/lockPresentation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            firebasepresentationkey: sessionStorage.getItem(
              "firebasePresentationKey"
            ),
            lockstate: "false",
          },
        }
      );
    }
    this.setState({ lockState: !this.state.lockState });
  }

  toggleNotes() {
    if (this.state.notesState === "none") {
      this.setState({ notesState: "block" });
    } else {
      this.setState({ notesState: "none" });
    }
  }

  toggleVoice() {
    if (this.state.voiceState === false) {
      this.setState({ voiceState: true });
    } else {
      this.setState({ voiceState: false });
    }
  }

  changeAccess() {
    this.setState({ changeAccess: true });
  }

  changeAccessKey(event) {
    this.setState({ newCode: event.target.value });
  }

  async accessKeySubmitted(event) {
    event.preventDefault();
    this.setState({ changeAccess: false });
    let response = await fetch(
      "https://syncfast.macrotechsolutions.us:9146/http://localhost/changeAccessKey",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          firebasepresentationkey: sessionStorage.getItem(
            "firebasePresentationKey"
          ),
          newcode: this.state.newCode,
        },
      }
    ).catch((err) => console.log(err));
    let json = await response.json();
    if (json.data === "Success") {
      await sessionStorage.setItem("accessKey", this.state.newCode);
      this.setState({
        accessKey: this.state.newCode,
      });
    } else {
      alert("This key has already been reserved.");
    }
  }

  fullScreen() {
    this.setState({ screenState: "full" });
    if (document.getElementById("fullView").requestFullscreen)
      document.getElementById("fullView").requestFullscreen();
    else if (document.getElementById("fullView").mozRequestFullScreen)
      document.getElementById("fullView").mozRequestFullScreen();
    else if (document.getElementById("fullView").webkitRequestFullscreen)
      document.getElementById("fullView").webkitRequestFullscreen();
    else if (document.getElementById("fullView").msRequestFullscreen)
      document.getElementById("fullView").msRequestFullscreen();
  }

  standardScreen() {
    this.setState({ screenState: "standard" });
    console.log(document);
    try {
      if (document && document.exitFullscreen) document.exitFullscreen();
      else if (document && document.mozCancelFullScreen)
        document.mozCancelFullScreen();
      else if (document && document.webkitExitFullscreen)
        document.webkitExitFullscreen();
      else if (document && document.msExitFullscreen)
        document.msExitFullscreen();
    } catch (error) {}
  }

  showDropdown() {
    if (this.state.dropdownDisplay === "block") {
      this.setState({
        dropdownDisplay: "none",
      });
    } else {
      this.setState({
        dropdownDisplay: "block",
      });
    }
  }

  hideDropdown() {
    if (this.state.dropdownDisplay === "block") {
      this.setState({
        dropdownDisplay: "none",
      });
    }
  }

  copyLink() {
    navigator.clipboard
      .writeText(
        "https://syncfast.macrotechsolutions.us/client?accessKey=" +
          sessionStorage.getItem("accessKey")
      )
      .then(
        function () {},
        function () {
          alert("Error copying to clipboard.");
        }
      );
  }

  handleData(data) {
    if (data === `next${sessionStorage.getItem("firebasePresentationKey")}`) {
      this.nextSlide();
    } else if (
      data === `previous${sessionStorage.getItem("firebasePresentationKey")}`
    ) {
      this.previousSlide();
    } else if (
      data === `hostLock${sessionStorage.getItem("firebasePresentationKey")}`
    ) {
      this.lockAccess();
    }
  }

  render() {
    return (
      
      <div>
        
        <div onClick={this.hideDropdown.bind(this)}>
          <Websocket
            url="wss://syncfast.macrotechsolutions.us:4211"
            onMessage={this.handleData.bind(this)}
          />
          <div
            id="standardView"
            style={{
              display: `${
                this.state.screenState === "standard" ? "inline" : "none"
              }`,
            }}
          >
            <div className="nav" style={{ justifyContent: "space-between" }}>
              <div className="left">
                <Link to={"./"}>
                  <img alt="SyncFast Logo" id="logo" style={{ height: "100px" }} src={Logo} />
                </Link>
                <div className="dropdown">
                  <button
                    onClick={this.showDropdown.bind(this)}
                    className="dropbtn"
                  >
                    <img alt="Tools" src={Utility} height={40} width={40} />
                  </button>
                  <div
                    id="myDropdown"
                    className="dropdown-content"
                    style={{ display: `${this.state.dropdownDisplay}` }}
                  >
                    <button
                      id="copyLink"
                      className="toolsButton"
                      onClick={this.copyLink.bind(this)}
                    >
                      Copy Link
                    </button>
                    <button
                      id="qrCodeBtn"
                      className="toolsButton"
                      onClick={this.openQRCodePres.bind(this)}
                    >
                      Show QR
                    </button>
                    <button
                      id="notesButton"
                      className="toolsButton"
                      onClick={this.toggleNotes.bind(this)}
                    >
                      {this.state.notesState === "none"
                        ? "Show Speaker Notes"
                        : "Hide Speaker Notes"}
                    </button>
                    <button
                      id="newPres"
                      className="toolsButton"
                      onClick={this.newPres.bind(this)}
                    >
                      New Presentation
                    </button>
                    <button
                      id="lock"
                      className="toolsButton"
                      onClick={this.lockAccess.bind(this)}
                    >
                      {this.state.lockState
                        ? "Unlock Presentation"
                        : "Lock Presentation"}
                    </button>
                  </div>
                </div>
                <RTCHostComponent
                      roomID={sessionStorage.getItem("firebasePresentationKey")} audio={true} video={false}
                    />
                
              </div>
              <div className="center">
                <p id="access">
                  Access Code:{" "}
                  {!this.state.changeAccess ? this.state.accessKey : ""}
                </p>
                <button
                  id="change"
                  onClick={this.changeAccess.bind(this)}
                  style={{
                    display: `${!this.state.changeAccess ? "inline" : "none"}`,
                  }}
                >
                  Change
                </button>
                <form
                  id="changeKey"
                  style={{
                    display: `${this.state.changeAccess ? "inline" : "none"}`,
                  }}
                >
                  <input
                    onChange={this.changeAccessKey.bind(this)}
                    placeholder="New Access Code"
                  ></input>
                  <button onClick={this.accessKeySubmitted.bind(this)}>
                    Submit
                  </button>
                </form>
              </div>
              <div className="right">
              <button
                  id="fullScreen"
                  className="button3"
                  onClick={this.fullScreen.bind(this)}
                >
                  <img alt="Full Screen" src={FullScreen} height={40} width={40} />
                </button>
                <button id="signOut" onClick={this.signOut.bind(this)}>
                  Sign Out
                </button>
                <div className="userPicture">
                  <img alt="Profile"
                    id="userPic"
                    src={sessionStorage.getItem("profilePic")}
                  />
                </div>
              </div>
            </div>
            <div className="break"> </div>
            <div className="content">
              <div className="img">
                <img alt="Loading"
                  id="loading"
                  src={Loading}
                  style={{ display: `${this.state.loading}` }}
                />
                <img alt="Slide"
                  id="presImg"
                  src={this.state.slideUrl}
                  style={{
                    display: `${this.state.slideDisplay}`,
                    width: "60vw",
                    height: "auto",
                  }}
                />
              </div>
              <div
                className="notes"
                style={{
                  paddingLeft: "10vw",
                  paddingRight: "10vw",
                  display: `${this.state.notesState}`,
                }}
              >
                <pre>{this.state.notes}</pre>
              </div>
              <div className="buttons">
                <button
                  id="prevSlide"
                  className="arrow"
                  onClick={this.previousSlide.bind(this)}
                >
                  <img src={PreviousSlide} height={40} width={40} />
                </button>
                <button
                  id="nextSlide"
                  className="arrow"
                  onClick={this.nextSlide.bind(this)}
                >
                  <img src={NextSlide} height={40} width="40/" />
                </button>
              </div>
            </div>
          </div>
          <div
            id="fullView"
            style={{
              display: `${
                this.state.screenState == "full" ? "inline" : "none"
              }`,
            }}
          >
            <div className="content">
              <div className="img2">
                <img
                  id="loading"
                  src={Loading}
                  style={{ display: `${this.state.loading}` }}
                />
                <img
                  id="presImg"
                  src={this.state.slideUrl}
                  style={{
                    display: `${this.state.slideDisplay}`,
                    width: "100vw",
                    height: "auto",
                  }}
                />
              </div>
            </div>
            <div className="buttons">
              <button
                id="prevSlide"
                className="button2"
                className="arrow"
                onClick={this.previousSlide.bind(this)}
              >
                <img src={PreviousSlide} height={40} width={40} />
              </button>
              <button
                id="nextSlide"
                className="button2"
                className="arrow"
                onClick={this.nextSlide.bind(this)}
              >
                <img src={NextSlide} height={40} width="40/" />
              </button>
              <button
                id="fullScreen"
                className="button3"
                onClick={this.standardScreen.bind(this)}
              >
                <img src={FullScreen} height={40} width={40} />
              </button>
            </div>
          </div>
          <Sketch
            setup={(p5, parent) => {p5.createCanvas(0,0);}}
            draw={(p5) => {}}
            keyPressed={(p5) => {
              if (p5.keyCode === p5.LEFT_ARROW) {
                this.previousSlide();
              } else if (p5.keyCode === p5.RIGHT_ARROW) {
                this.nextSlide();
              } else if (p5.keyCode === p5.ESCAPE) {
                if(this.state.screenState == "full"){
                  this.standardScreen();
                }
              }
            }}
          />
        </div>
        <Footer />
      </div>
    );
  }
}

export default Present;
