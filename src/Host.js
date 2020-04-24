import React from 'react';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css';
import Header from "./Header";
import Footer from "./Footer";
import GooglePicker from 'react-google-picker';
import $ from 'jquery';


class Host extends React.Component {

    constructor(props) {
        super(props);
        if (sessionStorage.getItem('gUser') === 'true') {
            this.state = {
                authImmediate: true
            }
        } else {
            this.state = {
                authImmediate: false
            }
        }
    }

    renderButton() {
        $(document).ready(function () {
            $(".driveButton").click();
        });
    }

    async pickerCallback(data) {
        let fileId = data.docs[0].id;
        let userID = sessionStorage.getItem('userKey');
        let accessToken = localStorage.getItem('access_token');
        let response = await fetch('https://syncfast.macrotechsolutions.us:9146/http://localhost/host', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'fileid': fileId,
                'userkey': userID,
                'accesstoken': accessToken
            }
        })
            .catch(err => console.log(err))
        let json = await response.json();
        sessionStorage.setItem('presentationID', fileId)
        sessionStorage.setItem('accessKey', json.accesskey);
        sessionStorage.setItem('currentSlide', "0")
        window.location.href = 'https://syncfast.macrotechsolutions.us/present'
    }

    render() {
        return (
            <div>
                <Header />
                <section className="features-icons bg-light text-center" style={{ paddingTop: '0px' }}>
                    <p style={{ fontSize: '24px', marginRight: '50px', marginLeft: '50px', paddingTop: '50px' }}><br /><br /></p>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-16  offset-lg-4 offset-xl-4">
                                <div className="mx-auto features-icons-item">
                                    <div className="features-icons-icon"><GooglePicker className="m-auto" clientId={"510632149212-b3nju2fd9omib1l67qal0ot1214rr75s.apps.googleusercontent.com"}
                                        developerKey={'AIzaSyDhkJ2yT06tRwXIMEUp9xaj2-LxOnKyvGY'}
                                        scope={['https://www.googleapis.com/auth/drive.file']}
                                        onChange={data => {
                                            if (data.action === "picked") {
                                                this.pickerCallback(data);
                                            }
                                        }}
                                        onAuthFailed={(google, oauthToken) => {
                                            this.setState({ authImmediate: false });
                                            this.renderButton();
                                        }}
                                        multiselect={false}
                                        navHidden={true}
                                        authImmediate={this.state.authImmediate}
                                        viewId={'PRESENTATIONS'}>
                                        <div className="d-flex features-icons-icon"><i className="driveButton fab fa-google-drive m-auto text-primary" style={{ cursor: 'pointer' }}></i></div>
                                    </GooglePicker>
                                    </div>
                                    <h3>Google Drive</h3>
                                    <p className="lead mb-0">Upload your presentation from your Google Drive.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        );
    }

}

export default Host;
