import React from 'react';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css';
import './assets/css/slidesPresentStyles.css';
import Logo from './assets/img/syncfastlogo.png';
import Sketch from "react-p5";
import { Link } from "react-router-dom";
import { gapi } from 'gapi-script';


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
            notesState: false,
            openURL: "",
            openQR: "",
            connected: false,
        }
    }

    handleClientLoad() {
        gapi.load('client:auth2', this.initClient);
    }

    initClient() {
        gapi.client.init({
            apiKey: 'AIzaSyDhkJ2yT06tRwXIMEUp9xaj2-LxOnKyvGY',
            clientId: "510632149212-b3nju2fd9omib1l67qal0ot1214rr75s.apps.googleusercontent.com",
            discoveryDocs: ["https://slides.googleapis.com/$discovery/rest?version=v1"],
            scope: 'https://www.googleapis.com/auth/drive.file'
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

            // Handle the initial sign-in state.
            this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        }, function (error) {
            console.log(JSON.stringify(error, null, 2));
        });
    }

    updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            this.listSlides();
        } else {
            this.handleAuthClick();
        }
    }

    handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    async listSlides() {
        gapi.client.slides.presentations.get({
            presentationId: sessionStorage.getItem('presentationID')
        }).then(async function (response) {
            await this.firebaseCommands();
            this.presentation = response.result;
            this.length = this.state.presentation.slides.length;
            await gapi.client.slides.presentations.pages.get({
                presentationId: sessionStorage.getItem('presentationID'),
                pageObjectId: this.state.presentation.slides[sessionStorage.getItem('currentSlide')].objectId,
            }).then(async function (response) {
                const res = JSON.parse(response.body);
                try {
                    this.setState({ notes: await res.slideProperties.notesPage.pageElements[1].shape.text.textElements.pop().textRun.content });
                    // this.notesSection.innerText = this.notes;
                } catch (e) {
                    console.log(e);
                    this.setState({ notes: "No notes available."});
                    // this.notesSection.innerText = this.notes;
                }
            });
            gapi.client.slides.presentations.pages.getThumbnail({
                presentationId: sessionStorage.getItem('presentationID'),
                pageObjectId: this.state.presentation.slides[sessionStorage.getItem('currentSlide')].objectId,
            }).then(async function (response) {
                const res = JSON.parse(response.body);
                this.setState({slideUrl: res.contentUrl});
                await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/slideUrl', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                        'slideurl': this.state.slideUrl,
                        'slidenum': sessionStorage.getItem('currentSlide'),
                        'notes': this.state.notes
                    }
                });
                await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/presentationTitle', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                        'presentationtitle': this.state.presentation.title
                    }
                });
                await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/presentationLength', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                        'length': this.state.length,
                        'presentationtitle': this.state.presentation.title
                    }
                });
                // loadingElement.style.display = "none";
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
                // p.innerText = `Access Code: ${sessionStorage.getItem('accessKey')}`;
                // document.querySelector(".center").prepend(p);
            }, function (response) {
                console.log('Error: ' + response.result.error.message);
            });
        }, function (response) {
            console.log('Error: ' + response.result.error.message);
        });
    }

    openQRCodePres() {
        window.open('https://api.qrserver.com/v1/create-qr-code/?data=https://syncfast.macrotechsolutions.us/client.html?accessKey=' + sessionStorage.getItem('accessKey') + '&size=600x600', 'QR Code', "height=600,width=600");
    }

    async firebaseCommands() {
        let response = await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/hostCommands', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accesskey': sessionStorage.getItem('accessKey')
            }
        })
            .catch(err => console.log(err))
        let json = await response.json();
        sessionStorage.setItem('firebasePresentationKey', json.firebasepresentationkey);
        if (!this.state.connected) {
            this.establishConnection();
            this.setState({connected: true});
        }
        sessionStorage.setItem('currentSlide', json.currentslidenum);
    }

    async previousSlide() {
        if (sessionStorage.getItem('currentSlide') > 0) {
            this.setState({slideNum: (parseInt(sessionStorage.getItem('currentSlide')) - 1).toString()});
            sessionStorage.setItem('currentSlide', ((parseInt(sessionStorage.getItem('currentSlide')) - 1).toString()));
        } else {
            alert("You are currently viewing the first slide.");
        }
        this.updatePage();
    }

    async nextSlide() {
        if (sessionStorage.getItem('currentSlide') < this.length - 1) {
            this.setState({slideNum: (parseInt(sessionStorage.getItem('currentSlide')) + 1).toString()});
            await sessionStorage.setItem('currentSlide', ((parseInt(sessionStorage.getItem('currentSlide')) + 1).toString()));
        } else {
            alert("You are currently viewing the last slide.");
        }
        this.updatePage();
    }

    async establishConnection() {
        await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/createListener', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey')
            }
        });
    }

    async updatePage() {
        await gapi.client.slides.presentations.pages.get({
            presentationId: sessionStorage.getItem('presentationID'),
            pageObjectId: this.state.presentation.slides[sessionStorage.getItem('currentSlide')].objectId,
        }).then(async function (response) {
            const res = JSON.parse(response.body);
            try {
                this.setState({ notes: await res.slideProperties.notesPage.pageElements[1].shape.text.textElements.pop().textRun.content });
                // this.notesSection.innerText = this.notes;
            } catch (e) {
                console.log(e);
                this.setState({ notes: "No notes available."});
                // this.notesSection.innerText = this.notes;
            }
        });
        gapi.client.slides.presentations.pages.getThumbnail({
            presentationId: sessionStorage.getItem('presentationID'),
            pageObjectId: this.state.presentation.slides[sessionStorage.getItem('currentSlide')].objectId,
        }).then(async function (response) {
            const res = JSON.parse(response.body);
            this.setState({slideUrl:res.contentUrl});
            this.findImage(this.slideUrl);
            this.findQR(this.slideUrl);
            // this.imageElement.src = this.slideUrl;
            // this.imageElement2.src = this.slideUrl;
            await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/updatePage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                    'slidenum': sessionStorage.getItem('currentSlide'),
                    'slideurl': this.state.slideUrl,
                    'notes': this.state.notes
                }
            });
        }, function (response) {
            console.log('Error: ' + response.result.error.message);
        });
    }

    async findImage(imageUrl) {
        let response = await fetch(`https://api.ocr.space/parse/imageurl?apikey=9fccee195588957&url=${imageUrl}`, {
            method: 'GET'
        })
            .catch(err => console.log(err))
        let json = await response.json();
        var splitArray = json.data.ParsedResults[0].ParsedText.split("\n");
        var url = "";
        for (var x = 0; x < splitArray.length; x++) {
            let testString = splitArray[x].replace(" ", "");
            if ((/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/).test(testString)) {
                url = testString;
                break;
            }
        }

        this.setState({openURL: url});
        if (this.state.screenState = "standard" && url != "") {
            document.getElementById("linkBtn").style.display = "inline";
        } else if (url == "") {
            document.getElementById("linkBtn").style.display = "none";
        }
    }

    async findQR(imageUrl) {
        let response = await fetch({
            method: 'GET',
            url: 'https://api.qrserver.com/v1/read-qr-code/?fileurl=' + imageUrl,
        })
            .catch(err => console.log(err))
        let json = await response.json();
        var url = "";
        if ((/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/).test(json.data[0].symbol[0].data)) {
            url = json.data[0].symbol[0].data;
        }

        this.setState({openQR: url});
        if (this.state.screenState = "standard" && url != "") {
            document.getElementById("qrBtn").style.display = "inline";
        } else if (url == "") {
            document.getElementById("qrBtn").style.display = "none";
        }
    }

    openLink() {
        window.open(this.state.openURL);
    }

    openQRCode() {
        window.open(this.state.openQR);
    }

    signOut() {
        gapi.auth2.getAuthInstance().signOut();
        sessionStorage.setItem('presentationID', null);
        sessionStorage.setItem('currentSlide', null);
        sessionStorage.setItem('firebasePresentationKey', null);
        sessionStorage.setItem('accessKey', null);
        sessionStorage.setItem('userKey', null);
        sessionStorage.setItem('profilePic', null);
        localStorage.setItem('access_token', null);
        localStorage.setItem('userKey', null);
        window.location = "./";
    }

    newPres() {
        window.location = "host";
    }

    async lockAccess() {
        this.setState({lockState: !this.state.lockState});
        if (this.state.lockState) {
            await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/lockPresentation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                    'lockstate': 'true'
                }
            })
            this.state.lock.innerText = "Unlock Presentation";
        } else {
            await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/lockPresentation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                    'lockstate': 'false'
                }
            })
            this.state.lock.innerText = "Lock Presentation";
        }
    }

    toggleNotes() {
        if (this.state.notesState) {
            // this.notesSection.style.display = "none";
            // this.notesButton.innerText = "Show Speaker Notes";
        } else {
            // this.notesSection.style.display = "";
            // this.notesButton.innerText = "Hide Speaker Notes";
        }
        this.setState({notesState: !this.state.notesState});
    }

    async accessKeySubmitted() {
        // event.preventDefault();
        // this.newCode = this.changeInput.value;
        let result = "";
        let response = await fetch({
            method: 'POST',
            url: 'https://syncfast.macrotechsolutions.us:9146/http://localhost/changeAccessKey',
            headers: {
                'Content-Type': 'application/json',
                'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                'newcode': this.state.newCode
            }
        })
            .catch(err => console.log(err))
        let json = response.json();
        if (json.data == "Success") {
            await sessionStorage.setItem('accessKey', this.newCode);
        } else {
            alert("This key has already been reserved.");
        }
        // this.submit.style.display = "none";
        // this.changeInput.style.display = "none";
        // this.change.style.display = "inline";
        // this.p.innerText = `Access Code: ${sessionStorage.getItem('accessKey')}`;
    }

    fullScreen() {
        this.setState({screenState: "full"});
        // document.getElementById("standardView").style.display = "none";
        // document.getElementById("fullView").style.display = "block";
        // if (document.getElementById("fullView").requestFullscreen)
        //     document.getElementById("fullView").requestFullscreen();
        // else if (document.getElementById("fullView").mozRequestFullScreen)
        //     document.getElementById("fullView").mozRequestFullScreen();
        // else if (document.getElementById("fullView").webkitRequestFullscreen)
        //     document.getElementById("fullView").webkitRequestFullscreen();
        // else if (document.getElementById("fullView").msRequestFullscreen)
        //     document.getElementById("fullView").msRequestFullscreen();
    }

    standardScreen() {
        this.setState({screenState: "standard"});
        // document.getElementById("standardView").style.display = "block";
        // document.getElementById("fullView").style.display = "none";
        // if (document.exitFullscreen)
        //     document.exitFullscreen();
        // else if (document.mozCancelFullScreen)
        //     document.mozCancelFullScreen();
        // else if (document.webkitExitFullscreen)
        //     document.webkitExitFullscreen();
        // else if (document.msExitFullscreen)
        //     document.msExitFullscreen();
    }

    showDropdown() {
        // document.getElementById("myDropdown").classList.toggle("show");
    }

    render() {
        return (
            <div>
                <div id="standardView">
                    <div className="nav">
                        <div className="left">
                            <Link to={"./"}><img id="logo" src={Logo} /></Link>
                            <div className="dropdown">
                                <button onClick={this.showDropdown.bind(this)} className="dropbtn">Tools</button>
                                <div id="myDropdown" className="dropdown-content">
                                    <button id="qrCodeBtn" className="button" onClick={this.openQRCodePres.bind(this)}> Show QR </button>
                                    <button id="notesButton" className="button" onClick={this.toggleNotes.bind(this)}> Show Speaker Notes </button>
                                    <button id="newPres" className="button" onClick={this.newPres.bind(this)}> New Presentation </button>
                                    <button id="lock" className="button">Unlock Presentation</button>
                                </div>
                            </div>
                            <button id="fullScreen" className="button3" onClick={this.fullScreen.bind(this)}><img src="assets/full-screen-white.png" height={40} width={40} /></button>
                        </div>
                        <div className="center">
                            <button id="change">Change</button>
                            <form id="changeKey" />
                        </div>
                        <div className="right">
                            <button id="signOut" onClick={this.signOut.bind(this)}>Sign Out</button>
                            <div className="userPicture">
                                <img id="userPic" src={sessionStorage.getItem("profilePic")} />
                            </div>
                        </div>
                    </div>
                    <div className="break"> </div>
                    <div className="content">
                        <div className="img">
                            <img id="loading" src="assets/loading.gif" />
                        </div>
                        <div className="notes">
                        </div>
                        <div className="buttons">
                            <button id="prevSlide" className="arrow" onClick={this.previousSlide.bind(this)}> <img src="assets/leftArrow.png" height={40} width={40} /></button>
                            <button id="nextSlide" className="arrow" onClick={this.nextSlide.bind(this)}> <img src="assets/rightArrow.png" height={40} width="40/" /></button>
                            <button id="linkBtn" className="button2" style={{ display: 'none' }}>Open URL</button>
                            <button id="qrBtn" className="button2" style={{ display: 'none' }}>Open QR</button>
                        </div>
                    </div>
                </div>
                <div id="fullView" style={{ display: 'none' }}>
                    <div className="content">
                        <div className="img2">
                        </div>
                    </div>
                    <div>
                        <button id="prevSlide" className="arrow" onClick={this.previousSlide.bind(this)}> <img src="assets/leftArrow.png" height={40} width={40} /></button>
                        <button id="nextSlide" className="arrow" onClick={this.nextSlide.bind(this)}> <img src="assets/rightArrow.png" height={40} width="40/" /></button>
                        <button id="fullScreen" className="button3" onClick={this.fullScreen.bind(this)}><img src="assets/full-screen-white.png" height={40} width={40} /></button>
                    </div>
                </div>
                <Sketch
                    setup={(p5, parent) => { }}
                    draw={p5 => { }}
                    keyPressed={p5 => {
                        if (p5.keyCode === p5.LEFT_ARROW) {
                            this.previousSlide();
                        } else if (p5.keyCode === p5.RIGHT_ARROW) {
                            this.nextSlide();
                        }
                    }} />
            </div>
        );
    }

}

export default Present;
