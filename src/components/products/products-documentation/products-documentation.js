import React, { Component } from "react";
// import { NavLink } from "react-router-dom";

import "./products-documentation.css";

export class ProductsDocumentation extends Component {
    render() {
        return (
            <div>     
                <div className="main-block">
                    <div className="main-block-header">
                        Documentation
                    </div>
                    <div className="main-block-content main-block-content-left">
                        <h1>Contents</h1>
                        <nav>
                            <ul>
                                <li><a href='#login'>Login request</a></li>
                                <li><a href='#metadata'>Metadata request</a></li>
                                <li><a href='#classes_custom'>Classes custom polygon request</a></li>
                                <li><a href='#classes_predefined'>Classes predefined polygons request</a></li>
                                <li><a href='#indices_custom'>Indices custom polygons request</a></li>
                                <li><a href='#indices_predefined'>Indices predefined polygons request</a></li>
                                <li><a href='#wms'>WebMapService request</a></li>
                            </ul>
                        </nav>
                        <div className="code-documentation-block">
                            <h2 tabIndex="0" id='login'>Login Request</h2>
                                <h3>Post login</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/account/login'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            username: Your username <br/>
                                            password: Your password
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A JSON with token
                                        </p>
                            <h2 tabIndex="0" id='metadata'>Metadata request</h2>
                                <h3>Post publicMaps</h3>
                                    <p className="code-block">
                                       url = 'https://api.ellipsis-earth.com/public_maps'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            None
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: map_id, name, personal
                                        </p>
                                <h3>Post myMaps</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/queries/my_maps'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            None
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: map_id, name, personal
                                        </p>
                                <h3>Post timestamps_map</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/queries/timestamps_map'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: timestamp, date_from, date_to
                                        </p>
                                <h3>Post labels_map</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/queries/labels_map'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: timestamp, version, class, color
                                        </p>
                                <h3>Post indices_map</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/queries/indices_map'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: timestamp, version, index, color
                                        </p>
                                <h3>Post layers_map</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/queries/layers_map'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: timestamp, type, name
                                        </p>
                            <h2 tabIndex="0" id='classes_custom'>Classes custom polygon request</h2>
                                <h3>Post classes_timestamps_customPolygon</h3>
                                    <p className="code-block">
                                       url = 'https://api.ellipsis-earth.com/queries/classes_timestamps_customPolygon'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map <br/>
                                            coords: A list of coordinates describing the polygon
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: timestamp, [classes columns], total_area
                                        </p>
                                <h3>Post classes_tiles_timestamp_customPolygon</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/queries/classes_tiles_timestamp_customPolygon'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map <br/>
                                            coords: A list of coordinates describing the polygon<br/>
                                            timestamp; An integer describing the timestamp number
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: tile_x, tile_y, tile_zoom, xmin, xmax, ymin, ymax, [classes columns], total_area
                                        </p>
                            <h2 tabIndex="0" id='classes_predefined'>Classes custom polygon request</h2>
                                <h3>Post classes_polygons_timestamp</h3>
                                    <p className="code-block">
                                       url = 'https://api.ellipsis-earth.com/queries/classes_polygons_timestamp'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map <br/>
                                            timestamp; An integer describing the timestamp number
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: polygon, [classes columns], total_area
                                        </p>
                                <h3>Post classes_timestamps_polygon</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/queries/classes_timestamps_polygon'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map <br/>
                                            polygon: An integer describing the polygon number
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: timestamp, [classes columns], total_area
                                        </p>
                                <h3>Post classes_tiles_timestamp_polygon</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/queries/classes_tiles_timestamp_polygon'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map <br/>
                                            polygon: An integer identifying the polygon <br/>
                                            timestamp: An integer identifying the timestamp
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: tile_x, tile_y, tile_zoom, xmin, xmax, ymin, ymax, [classes columns], total_area
                                        </p>
                            <h2 tabIndex="0" id='indices_custom'>Indices custom polygons request</h2>
                                <h3>Post indices_timestamps_customPolygon</h3>
                                    <p className="code-block">
                                       url = 'https://api.ellipsis-earth.com/queries/indices_timestamps_customPolygon'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map <br/>
                                            coords: array of tuples with coordinates describing the polygon
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: timestamp, [indices columns], total_area
                                        </p>
                                <h3>Post indices_tiles_timestamp_customPolygon</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/queries/indices_tiles_timestamp_customPolygon'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map <br/>
                                            coords: array of tuples with coordinates describing the polygon <br/>
                                            timestamp: Integer identifying the timestamp
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: tile_x, tile_y, tile_zoom, xmin, xmax, ymin, ymax, [classes columns], total_area
                                        </p>
                            <h2 tabIndex="0" id='indices_predefined'>Indices predefined polygons request</h2>
                                <h3>Post indices_polygons_timestamp_class</h3>
                                    <p className="code-block">
                                       url = 'https://api.ellipsis-earth.com/queries/indices_polygons_timestamp_class'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map <br/>
                                            coords: Array of tuples with coordinates describing the polygon <br/>
                                            timestamp: Integer identifying the timestamp <br/>
                                            class: Name a class
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: polygon, [indices columns], total_area
                                        </p>
                                <h3>Post indices_timestamps_polygon_class</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/queries/indices_timestamps_polygon_class'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map <br/>
                                            coords: Array of tuples with coordinates describing the polygon <br/>
                                            polygon: Integer identifying the timestamp <br/>
                                            class: Name a class
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: timestamp, [indices columns], total_area
                                        </p>
                                <h3>Post indices_tiles_polygon_timestamp_class</h3>
                                    <p className="code-block">
                                        url = 'https://api.ellipsis-earth.com/queries/indices_tiles_polygon_timestamp_class'
                                    </p>
                                    <h4>Parameters</h4>
                                        <p>
                                            map_id: The uuid of the particular map <br/>
                                            coords: Array of tuples with coordinates describing the polygon <br/>
                                            polygon: Integer identifying the polygon <br/>
                                            timestamp: Integer identifying the timestamp <br/>
                                            class: Name a class
                                        </p>
                                    <h4>Returns</h4>
                                        <p>
                                            A CSV: tile_x, tile_y, tile_zoom, xmin, xmax, ymin, ymax, [classes columns], total_area
                                        </p>
                            <h2 tabIndex="0" id='wms'>WebMapService request</h2>
                                <h3>Get tile</h3>
                                    <p className="code-block">
                                       url = 'https://api.ellipsis-earth.com/wms/[map_name]/[timestamp]/[layer_type]/[layer_name/[tile_zoom]/[tile_x]/[tile_y]'
                                    </p>
                        </div>
                    </div>                        
                </div>     
            </div>
        )
    }
}

export default ProductsDocumentation;
