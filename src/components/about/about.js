import React, { Component } from "react";

import { Footer } from "../footer/footer";

import "./about.css";

export class About extends Component {
    render() {
        return (
            <div>
                <div className="main-content">
                    <div className="main-block">
                        <div className="main-block-header">
                            About Us
                        </div>
                        <div className="main-block-content">
                            <p className="main-center-paragraph">
                                With over 600 earth observation satellites in orbit, every square meter on Earth is 
                                photographed on a daily basis. At Ellipsis Earth Intelligence we believe that 
                                automatically and continuously processing this data into an actionable information 
                                source helps organisations and businesses to manage our most precious resources more 
                                productively and sustainably. We aim to lower the threshold and empower people to 
                                use good information for good things.
                            </p>
                        </div>                        
                    </div>

                    <div className="main-block main-block-accented">
                        <div className="main-block-content">
                            <p className="main-center-paragraph">
                                Feel free to contact us for any questions or inquiries at:
                                <br></br>
                                <span style={{fontWeight: "bold"}}>info@ellipsis-earth.com</span>
                                <br></br> 
                                We are always happy to help.
                            </p>
                        </div>
                    </div>

                    <div className="main-block">
                        <div className="main-block-content">                            
                            <table className="team-table">
                                <tbody>
                                    <tr>
                                        <td className="profile">
                                            <div>
                                                <img className="profile-photo" src="/images/rosalie.jpg"/>
                                            </div>
                                            <div className="profile-name">
                                                Rosalie
                                            </div>
                                            <div className="profile-title">
                                                CEO
                                            </div>
                                            {/* <div className="profile-text">
                                                Hi there! I am driven to connect more people to better information, 
                                                because good things happen when we understand the dynamics of our environment.
                                            </div> */}
                                        </td>
                                        <td className="profile">
                                            <div>
                                                <img className="profile-photo" src="/images/daniel.jpg"/>                                       
                                            </div>
                                            <div className="profile-name">
                                                Daniel
                                            </div>
                                            <div className="profile-title">
                                                CTO
                                            </div>
                                            {/* <div className="profile-text">
                                                I always strive for elegant and scalable solutions. 
                                                At the intersection of AI and Earth Observation many great things are yet to be achieved.
                                            </div> */}
                                        </td>
                                        <td className="profile">
                                            <div>
                                                <img className="profile-photo" src="/images/minghai.jpg"/>
                                            </div>
                                            <div className="profile-name">
                                                Minghai
                                            </div>
                                            <div className="profile-title">
                                                CIO
                                            </div>
                                            {/* <div className="profile-text">
                                                Taking on new challenges is the only way to get things done in data management & IT. 
                                                The world changes too quickly to stick to old tricks.
                                            </div> */}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="profile">
                                            <div>
                                                <img className="profile-photo" src="/images/laura.jpg"/>
                                            </div>
                                            <div className="profile-name">
                                                Laura
                                            </div>
                                            <div className="profile-title">
                                                Remote sensing expert
                                            </div>
                                            {/* <div className="profile-text">
                                                Taking the leap from data to information is the central issue in our day and age.
                                            </div> */}
                                        </td>
                                        <td className="profile">
                                            <div>
                                                <img className="profile-photo" src="/images/patrick.jpg"/>                                       
                                            </div>
                                            <div className="profile-name">
                                                Patrick
                                            </div>
                                            <div className="profile-title">
                                                Machine learning expert
                                            </div>
                                            {/* <div className="profile-text">
                                                Having computers do what computers do best, is great. Pushing the frontier of what this includes, is even better.
                                            </div> */}
                                        </td>
                                        <td className="profile">
                                            <div>
                                                <img className="profile-photo" src="/images/florian.jpg"/>
                                            </div>
                                            <div className="profile-name">
                                                Florian
                                            </div>
                                            <div className="profile-title">
                                                Front-end developer
                                            </div>
                                            {/* <div className="profile-text">
                                                For me, design and functionality are two sides of the same coin. 
                                                I make it my business to develop intuitive applications that lower thresholds.
                                            </div> */}
                                        </td>
                                    </tr>
                                </tbody> 
                            </table>
                        </div>
                    </div>
                </div>                
                <Footer></Footer>
            </div>
        )
    }
}

export default About;
