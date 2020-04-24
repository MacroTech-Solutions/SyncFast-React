import React from 'react';
import './assets/bootstrap/css/bootstrap.min.css?h=f5a1d9969d3ca654f018a59129eb51d7';
import './assets/css/fontawesome.css';
import './assets/css/material-icons.min.css';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css?h=3d9cd1f3d1dcb3b47af13da2a2ba5246';
import {Link} from "react-router-dom";
import Logo from './assets/img/syncfastlogo.png';
import Logo2 from './assets/img/macrotechlogo.svg';

function Header(){
    return(
        <nav className="navbar navbar-light navbar-expand bg-dark navigation-clean">
          <div className="container"><Link className="navbar-brand d-xl-flex justify-content-xl-center align-items-xl-center" to={"./"} style={{ color: 'rgba(255,255,255,0.9)', fontSize: '52px', fontFamily: 'Lato, sans-serif' }}><img alt="SyncFast" src={Logo} style={{ width: '66px' }} /><span>&nbsp; &nbsp;</span>SyncFast</Link>
            <div className="container text-right d-xl-flex justify-content-xl-end" style={{ marginTop: '15px', width: '476px', marginRight: '-26px' }}>
              <h3 className="text-right d-xl-flex flex-row justify-content-xl-end align-items-xl-center" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 'normal', color: 'rgba(255,255,255,0.9)', margin: '0px', width: '355px' }}>Powered by&nbsp;<a href="https://www.macrotechsolutions.us"><img alt="MacroTech" className="d-xl-flex align-items-xl-center" src={Logo2} height={50} /></a></h3>
            </div><button className="navbar-toggler" data-toggle="collapse" /></div>
        </nav>
    );
}

export default Header;