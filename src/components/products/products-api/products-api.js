import React, { Component } from "react";
// import { NavLink } from "react-router-dom";

import "./products-api.css";

export class ProductsApi extends Component {
    render() {
        return (
            <div>     
                <div className="main-block">
                    <div className="main-block-header">
                        API User Guide
                    </div>
                    <div className="main-block-content main-block-content-left">
                        <p>
                            All API calls should be in the following format:
                        </p>
                        <p className="code-block">
                            https://api.ellipsis-earth.com/api/{"{method_name}"}
                        </p>
                        <p>
                            Where {"{method_name}"} should be substituted with the name of the API you want to call. 
                            For example, if you want to call the login function, you would make a POST request to:
                        </p>
                        <p className="code-block">
                            https://api.ellipsis-earth.com/api/login
                        </p>

                        <div className="code-documentation-block">
                            <h4>
                                POST login
                            </h4>
                            <h5>
                                Description
                            </h5>
                            <p> 
                                Creates a new session with the given credentials and returns a cookie that can sent
                                with other requests to get access to private methods
                            </p>

                            <h5>
                                Parameters
                            </h5>
                            <p>
                                JSON
                            </p>
                            <p>
                                username: The username of the user to login with.
                                <br></br>
                                password: The password of the given user.
                            </p>
                            <h5>
                                Returns
                            </h5>
                            <p>
                                Cookie with the session id.
                            </p>

                            <h4>
                                GET getPublicMaps
                            </h4>
                            <h5>
                                Description
                            </h5>
                            <p> 
                                Returns all public maps with the available timestamps.
                            </p>
                            <h5>
                                Parameters
                            </h5>
                            <p>
                                None
                            </p>
                            <h5>
                                Returns
                            </h5>
                            <p>
                                JSON with the available public maps and their timestamps.
                            </p>

                            <h4>
                                GET getAllowedMaps
                            </h4>
                            <h5>
                                Description
                            </h5>
                            <p> 
                                Requires login.
                                <br></br>
                                Returns all maps the account has access to with the available timestamps.
                            </p>
                            <h5>
                                Parameters
                            </h5>
                            <p>
                                None
                            </p>
                            <h5>
                                Returns
                            </h5>
                            <p>
                                JSON with the available maps and their timestamps.
                            </p>

                            <h4>
                                GET getMapClassesAndIndices
                            </h4>
                            <h5>
                                Description
                            </h5>
                            <p> 
                                Returns the relevant classes and spectral indices for the given map.
                            </p>
                            <h5>
                                Parameters
                            </h5>
                            <p>
                                Parameters in URL.
                            </p>
                            <ul>
                                <li>
                                    mapUuid: Uuid of the map you want to get the information from.
                                </li>
                            </ul>
                            <h5>
                                Returns
                            </h5>
                            <p>
                                List of classes and spectral indices for the given map.
                                The suggested color for each is in hexadecimal RGBA.
                            </p>

                            <h4>
                                POST getTileData
                            </h4>
                            <h5>
                                Description
                            </h5>
                            <p> 
                                Returns the aggregated data of the OSM tiles for the given timestamp. 
                                Optionally, a shape can be given and the search will restrict itself within all tiles
                                that intersect with the given shape. Note that this is likely larger than the shape itself
                            </p>
                            <h5>
                                Parameters
                            </h5>
                            <p>
                                JSON
                            </p>
                            <ul>
                                <li>
                                    timestampUuids: Array of uuids of the timestamps of a certain map to retrieve data from.
                                </li>
                                <li>
                                    shape (optional): Ordered list of geographic coordinates where x is longitude and y and latitude.
                                </li>
                            </ul>
                            <h5>
                                Returns
                            </h5>
                            <p>
                                Returns the value of each class or spectral index within the given area. For classes, 
                                this number is the total number of square kilometers for each class.
                            </p>
                            <p>
                                For spectral indices, this is the value for each index within the area ranging from -1 to 1.
                            </p>

                            <h4>
                                POST getFieldData
                            </h4>
                            <h5>
                                Description
                            </h5>
                            <p> 
                                Returns the aggregated data of the given field number.
                            </p>
                            <h5>
                                Parameters
                            </h5>
                            <p>
                                JSON
                            </p>
                            <ul>
                                <li>
                                    timestampUuid: The uuid of a timestamp of a certain map to retrieve data from.
                                </li>
                                <li>
                                    fieldNumber: The field number to retrieve data for. Valid field numbers can be obtained
                                    from the custom polygons file of the map.
                                </li>
                            </ul>
                            <h5>
                                Returns
                            </h5>
                            <p>
                                Same as getTileData.
                            </p>
                        </div>
 
                    </div>                        
                </div>     
            </div>
        )
    }
}

export default ProductsApi;
