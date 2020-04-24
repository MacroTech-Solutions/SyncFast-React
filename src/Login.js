import React from 'react';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css';
import './assets/css/fontawesome.css';
import './assets/css/material-icons.min.css';
import './assets/css/loginStyles.css';
import Header from "./Header";
import Footer from "./Footer";
import GoogleLogin from 'react-google-login';
import {Link} from "react-router-dom";


class Login extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            email: "",
            password: "",
            errorText: ""
        }
    }

    async onSuccess(googleUser) {
        let profile = googleUser.getBasicProfile();
        for (var key in googleUser) {
            if (googleUser[key].access_token !== undefined) {
                localStorage.setItem('access_token', googleUser[key].access_token);
            }
        }
        console.log(profile.getName());
        let response = await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/googleSignIn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'email': profile.getEmail(),
                'name': profile.getName(),
                'imageurl': profile.getImageUrl()
            }
        })
            .catch(err => console.log(err))
        let json = await response.json();
        sessionStorage.setItem('gUser', 'true');
        sessionStorage.setItem('userKey', json.userkey);
        sessionStorage.setItem('profilePic', profile.getImageUrl());
        window.location = 'host';
    }

    onFailure(error) {
        console.log(error);
    }

    // let notSameError = document.getElementById('error');
    notSame(p) {
        this.setState({errorText: p});
    }

    async signInEmail(e) {
        e.preventDefault();
        let email = this.state.email
        let inputPassword = this.state.password;
        let response = await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/signIn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'email': email,
                'password': inputPassword
            }
        })
            .catch(err => console.log(err))
        let json = await response.json();
        if (json.data === "Incorrect Password") {
            this.notSame("Incorrect Password");
        } else if (json.data === "Incorrect email address.") {
            this.notSame("Incorrect email address.");
        } else {
            sessionStorage.setItem('userKey', json.data);
            sessionStorage.setItem('gUser', 'false');
            sessionStorage.setItem('profilePic', json.imageurl);
            window.location = 'host';
        }
    }

    changeEmail(event){
        this.setState({email: event.target.value});
    }

    changePassword(event){
        this.setState({password: event.target.value});
    }

    render() {
        return (
            <div>
                <Header />
                <div className="page">
                    <div className="box">
                        <div id="error">
                        </div>
                        <div className="title">
                            <h1 id="title" style={{ color: 'white' }}>Login</h1>
                        </div>
                        <p id="error" style={{ color: 'white' }}>{this.state.errorText}</p>
                        <form>
                            <div className="email">
                                <input id="emailInput" onChange={this.changeEmail.bind(this)} placeholder="Email Address" />
                            </div>
                            <div className="break" />
                            <div className="password">
                                <input type="password" id="passwordInput" onChange={this.changePassword.bind(this)} placeholder="Password" />
                            </div>
                            <div className="break" />
                            <div className="submit">
                                <button id="submit_button" onClick={this.signInEmail.bind(this)}>Submit</button>
                            </div>
                        </form>
                        <div className="or">
                            <h1 id="or" style={{ color: 'white' }}>OR</h1>
                        </div>
                        <GoogleLogin
                            clientId="510632149212-b3nju2fd9omib1l67qal0ot1214rr75s.apps.googleusercontent.com"
                            buttonText="Sign in to SyncFast"
                            onSuccess={this.onSuccess}
                            onFailure={this.onFailure}
                            cookiePolicy={'single_host_origin'}
                        />
                        <div className="break" />
                        <div className="signUp">
                            <Link to={"./signup"} style={{ color: 'white' }}><u>Sign Up Here</u></Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }
}



export default Login;
