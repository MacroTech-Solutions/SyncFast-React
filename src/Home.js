import React from 'react';
import './assets/bootstrap/css/bootstrap.min.css?h=f5a1d9969d3ca654f018a59129eb51d7';
import './assets/css/fontawesome.css';
import './assets/css/material-icons.min.css';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css?h=3d9cd1f3d1dcb3b47af13da2a2ba5246';
import { Link } from "react-router-dom";
import AppStore from './assets/img/Download_on_the_App_Store_Badge.svg';
import Header from "./Header";
import Footer from "./Footer";

function Home() {
  return (
    <div className="App">
      <div>
        <Header />
        <section className="features-icons bg-light text-center" style={{ paddingTop: '0px', paddingBottom: '10px' }}>
          <p style={{ fontSize: '24px', marginRight: '50px', marginLeft: '50px', paddingTop: '50px' }}><br />SyncFast is an integrated, cloud-based platform to create, share, and access presentations using low bandwith data communication. A powerful web interface allows users to display their presentations from Google Drive. Viewers can follow along
            in real-time on any device using the randomly-generated access code for the presentation.<br /></p>
          <div className="container">
            <div className="row">
              <div className="col-lg-4 offset-lg-2 offset-xl-2">
                <div className="mx-auto features-icons-item mb-5 mb-lg-0 mb-lg-3">
                  <div className="d-flex features-icons-icon"><Link className="m-auto" to={'./login'}><i className="material-icons m-auto text-primary" style={{ cursor: 'pointer' }}>cast_connected</i></Link></div>
                  <h3>Host</h3>
                  <p className="lead mb-0">Host your existing presentation to allow authorized users to access it over the cloud.</p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="mx-auto features-icons-item mb-5 mb-lg-0 mb-lg-3">
                  <div className="d-flex features-icons-icon"><Link className="m-auto" to={'./client'}><i className="fas fa-tv m-auto text-primary" style={{ cursor: 'pointer' }}></i></Link></div>
                  <h3>View</h3>
                  <p className="lead mb-0">Connect to someone else's presentation using industry-low bandwidth.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section style={{backgroundColor: 'rgb(248,249,250)'}}>
          <div className="container">
            <div className="row"  style={{display: 'flex', justifyContent: 'center', alignItems: 'stretch'}}>
              <div className="col-lg-4 d-flex justify-content-center align-items-center"><a href="https://apps.apple.com/us/app/syncfast/id1509737904"><img src={AppStore} style={{ width: '239px' }}></img></a></div>
              <div className="col-lg-4"><a className="d-flex justify-content-center align-items-center" href="https://play.google.com/store/apps/details?id=us.macrotechsolutions.syncfast&amp;pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"><img className="d-flex justify-content-center align-items-center" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" style={{ width: '298px' }}></img></a></div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}

export default Home;
