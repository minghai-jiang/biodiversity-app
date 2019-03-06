import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import { Footer } from "../footer/footer";

import "./home.css";

export class Home extends Component {
    render() {
        return (
            <div>
                <div className="main-content">
                    <div id="banner">
                        <img id="banner-logo" src="/images/logo-white-subtitle.png" alt="Ellipsis Earth Intelligence"/>                    
                    </div>

                    <div className="main-block main-block-first">
                        <div className="main-block-content">
                            <p className="main-center-paragraph">
                                We share the planet with an increasing number of people. 
                                Consequently, pressure on land grows and every square kilometer needs to 
                                become more productive and more sustainably managed.
                            </p>
                            <p className="main-center-paragraph">
                                At Ellipsis we believe that actionable information on landscape dynamics 
                                helps you make more effective use of available resources. 
                                By focusing efforts on high risk and high opportunity developments in the landscape, 
                                we can help you achieve more productive, compliant, and sustainable land use.
                            </p>
                        </div>                        
                    </div>

                    <div className="main-block main-block-accented">
                        <div className="main-block-header">
                            Our Solution
                        </div>
                        <div className="main-block-content">
                            <p className="main-center-paragraph">
                                Ellipsis Earth Intelligence provides a subscription based information service on landscape dynamics. 
                                Our monitoring and notification service alerts you to landscape conditions that require human attention.
                                This information is tailored to user specifications and extracted from satellite data. 
                                We can automatically monitor landscape based KPIs, land use requirements, and red flags on all scales
                                and at any time. From your backyard, to your entire continent. From once a year, to every day.
                            </p>
                        </div>                        
                    </div>

                    <div className="main-block">
                        <div className="main-block-header">
                            Explore
                        </div>
                        <div className="main-block-content">
                            <p style={{marginBottom: "3 em"}} className="main-center-paragraph">
                                View our public maps to get a sense of what information we can extract to help you increase positive 
                                impact through more effective use of time and resources. Or start experimenting with our API 
                                to see how you could integrate this information into your own systems.
                            </p>
                            <NavLink to="/products/documentation" className="button-a">
                                <div className="button main-block-single-button">
                                    API documentation                                                
                                </div>
                            </NavLink>
                            <br/>
                            <NavLink to="/viewer" className="button-a">
                                <div className="button main-block-single-button">
                                    Viewer                                                
                                </div>
                            </NavLink>
                        </div>                       
                    </div>
                
                    <div className="main-block">
                        <div className="main-block-header">
                            Getting Started
                        </div>
                        <div className="main-block-content">
                            <p className="main-center-paragraph">
                                Get your monitoring system online in 5 steps:
                            </p>
                            <ol className="main-block-content-list">
                                <li className="main-block-content-list-item">
                                    Together we explore your monitoring challenge and pinpoint which landscape based KPIs, requirement,
                                    and/or restrictions need to be monitored.
                                </li>
                                <li className="main-block-content-list-item">
                                    Together we establish meaningful aggregation levels and geometries.
                                </li>
                                <li className="main-block-content-list-item">
                                    We build and assemble the needed (AI) models to automatically conduct the required analysis.
                                </li>
                                <li className="main-block-content-list-item">
                                    We launch the models in our cloud and start to automatically construct and save the requested information on a running basis.
                                </li>
                                <li className="main-block-content-list-item">
                                    Your system connects with this new data source and gets notified on the relevant developments of your choosing (in step 1)
                                </li>
                            </ol>
                        </div>                        
                    </div>
                
                    <div className="main-block">
                        <div className="main-block-header">
                            Our Monitoring System
                        </div>
                        <div className="main-block-content">
                            <p className="main-center-paragraph">
                                Ellipsis Earth is connected to a large variety of Earth observation satellite imagery 
                                sources. With our unique cluster we can request, analyse, and store this data in a 
                                fully scalable and automated fashion. This way you can get affordable, quick, and easy
                                access to the information you need.
                            </p>
                            <p className="main-center-paragraph">
                                We believe in both automatisation as well as the human touch. 
                                That is why we deliver both an intuitive&nbsp;
                                <NavLink to="/viewer" target='_blank'>
                                    viewer
                                </NavLink>&nbsp;for engagement as well as&nbsp;
                                <NavLink to="/products/documentation">
                                    a modern API
                                </NavLink>&nbsp;for system integration.
                            </p>
                            <p className="main-center-paragraph">
                                For a detailed description of our product please visit our products page.
                            </p>
                            <NavLink to="/products" className="button-a">
                                <div className="button main-block-single-button">
                                    Products                                                
                                </div>
                            </NavLink>
                        </div>                        
                    </div>
                
                    <div className="main-block">
                        <div className="main-block-header">
                            Featured
                        </div>
                        <div className="main-block-content featured-content">
                            <div className="featured-container">
                                <div className="featured-div" title="Wageningen University & Research">
                                    <span className="helper"></span>
                                    <img style={{width: "60%"}} src="/images/wur.png" alt="Wageningen University & Research"/>
                                </div>
                                <div className="featured-div" title="International Union for Convervation of Nature">
                                    <span className="helper"></span>
                                    <img style={{width: "92%"}} src="/images/iucn.jpg" alt="International Union for Convervation of Nature"/>                            
                                </div>
                                <div className="featured-div" title="Dutch Ministry of Agriculture, Nature and Food Quality">
                                    <span className="helper"></span>
                                    <img style={{width: "100%"}} src="/images/lnv.png" alt="Dutch Ministry of Agriculture, Nature and Food Quality"/>                            
                                </div>
                            </div>
                            
                            {/* <table className="featured-table">
                                <tbody>
                                    <tr>
                                        <td className="featured-table-cell" title="Wageningen University & Research">
                                            <img style={{width: "60%"}} src="/images/wur.png" alt="Wageningen University & Research"/>
                                        </td>
                                        <td className="featured-table-cell" title="International Union for Convervation of Nature">
                                            <img style={{width: "50%"}} src="/images/iucn.png" alt="International Union for Convervation of Nature"/>                                       
                                        </td>
                                        <td className="featured-table-cell" title="Dutch Ministry of Agriculture, Nature and Food Quality">
                                            <img style={{width: "100%"}} src="/images/lnv.png" alt="Dutch Ministry of Agriculture, Nature and Food Quality"/>
                                        </td>
                                    </tr>
                                </tbody>                                
                            </table> */}
                        </div>                        
                    </div>
                </div>
 
                <Footer></Footer>
            </div>
        )
    }
}

export default Home;
