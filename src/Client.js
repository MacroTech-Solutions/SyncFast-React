import React from 'react';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css';
import './assets/css/clientStyles.css';
import Header from "./Header";
import Footer from "./Footer";
import $ from 'jquery';
import Websocket from 'react-websocket';
import RTCClientComponent from "./RTCClientComponent";


class Client extends React.Component {

    constructor(props) {
        super(props);
        let params = new URLSearchParams(document.location.search.substring(1));
        let myKey = params.get("accessKey");
        if(myKey){
            this.state = {
                accessKey: myKey,
                errorText: "",
                firebasePresentationKey: "",
                slideUrl: "",
                clientMic: ""
            }
            this.submitKey();
        } else{
            this.state = {
                accessKey: "",
                errorText: "",
                firebasePresentationKey: "",
                slideUrl: "",
                clientMic: ""
            }
        }
    }

    async submitKey(e) {
        try {
            e.preventDefault();
        } catch (e) {

        }
        let accessCode = this.state.accessKey;
        console.log(accessCode);
        let response = await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/clientJoin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accesscode': accessCode
            }
        })
            .catch(err => console.log(err))
        let result = await response.json();
        if (result.data === "Incorrect Access Code" || accessCode === "") {
            alert("Invalid Access Code");
        } else {
            this.setState({ errorText: "" });
            this.setState({ firebasePresentationKey: result.firebasepresentationkey });
            this.setState({ slideUrl: result.slideurl });
            if (result.lockstate === 'false') {
                this.unlockScreen();
            } else {
                this.lockScreen();
            }
            this.setState({ currentPresSlideNum: result.slidenum });
            this.setState({ maxSlideNum: result.slidenum });
            this.setState({ currentSlideNum: result.slidenum });
            this.setState({ presentationTitle: result.presentationtitle });
            $(document).ready(function () {
                $("#accessKeyInput").css("display", "none");
                $("#submit").css("display", "none");
                $("#accessKeyText").css("display", "none");
                $("#presImg").css("display", "block");
            });
        }
    }

    async previousSlide() {
        if (parseInt(this.state.currentSlideNum) > 0) {
            let response = await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/clientGetSlide', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accesscode': this.state.accessKey,
                    'slidenum': (parseInt(this.state.currentSlideNum) - 1).toString()
                }
            })
                .catch(err => console.log(err))
            let result = await response.json();
            this.setState({ currentSlideNum: (parseInt(this.state.currentSlideNum) - 1).toString() });
            this.setState({ slideUrl: result.slideurl });
        } else {
            alert("You are currently viewing the first slide.");
        }
    }

    async nextSlide() {
        if (parseInt(this.state.currentSlideNum) < parseInt(this.state.maxSlideNum)) {
            let response = await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/clientGetSlide', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accesscode': this.state.accessKey,
                    'slidenum': (parseInt(this.state.currentSlideNum) + 1).toString()
                }
            })
                .catch(err => console.log(err))
            let result = await response.json();
            this.setState({ currentSlideNum: (parseInt(this.state.currentSlideNum) + 1).toString() });
            this.setState({ slideUrl: result.slideurl });
        } else {
            alert("You are currently viewing the last available slide.");
        }
    }

    async updatePage() {
        let response = await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/clientJoin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accesscode': this.state.accessKey
            }
        })
            .catch(err => console.log(err))
        let result = await response.json();
        if (parseInt(result.slidenum) > parseInt(this.state.maxSlideNum)) {
            this.setState({ maxSlideNum: result.slidenum });
        }
        if (result.lockstate === 'false') {
            this.unlockScreen();
            if (this.state.currentPresSlideNum === this.state.currentSlideNum) {
                this.setState({ currentSlideNum: result.slidenum });
                this.setState({ slideUrl: result.slideurl });
                sessionStorage.setItem('imageUrl', result.imageurl);
            }
        } else {
            this.lockScreen();
            this.setState({ slideUrl: result.slideurl });
            this.setState({ currentSlideNum: result.slidenum });
            sessionStorage.setItem('imageUrl', result.imageurl);
        }
        this.setState({ currentPresSlideNum: result.slidenum });
    }

    changeKey(event) {
        this.setState({ accessKey: event.target.value });
    }

    lockScreen() {
        this.setState({'lockState': true});
        $(document).ready(function () {
            $("#prevSlide").css("display", "none");
            $("#nextSlide").css("display", "none");
        });
    }

    unlockScreen() {
        this.setState({'lockState': false});
        $(document).ready(function () {
            $("#prevSlide").css("display", "inline");
            $("#nextSlide").css("display", "inline");
        });
    }

    handleData(data) {
        if (data === this.state.firebasePresentationKey) {
            this.updatePage();
        }
    }

    render() {
        return (
            <div>
                <Websocket url='wss://syncfast.macrotechsolutions.us:4211'
                    onMessage={this.handleData.bind(this)} />
               <Header />
                <div className="clientContent">
                    <div id="error"></div>
                    <p id="accessKeyText">Enter Access Code:</p>
                    <form>
                        <input id="accessKeyInput" onChange={this.changeKey.bind(this)} placeholder="Access Code" />
                        <button id="submit" className="button" onClick={this.submitKey.bind(this)}>Submit</button>
                    </form>
                    <div className="img"> </div>
                    <div id="clientContent">
                    <img id="presImg" alt="Slide" src={this.state.slideUrl} title={this.state.presentationTitle} style={{ display: "none", width: "80vw", height: "auto" }}></img>
                    <div className="clientButtons">
                    {this.state.firebasePresentationKey !== "" ? <RTCClientComponent style={{ display: "none" }} className="button" roomID={this.state.firebasePresentationKey} accessCode={this.state.accessKey} firebasePresentationKey={this.state.firebasePresentationKey}/> : <div></div>}
                    <button id="nextSlide"  style={{ display: "none" }} className="button" onClick={this.nextSlide.bind(this)}>Next Slide</button>
                        <button id="prevSlide"  style={{ display: "none" }} className="button" onClick={this.previousSlide.bind(this)}>Previous Slide</button>
                        
                    </div>
                    </div>

                </div>
                <Footer />
            </div>
        );
    }

}

export default Client;
