import React, { PureComponent } from "react";
import "./map-selector.css";

export class MapSelector extends PureComponent {
  

  constructor(props) {
    super(props);
    this.state = {
      apiUrl: props.apiUrl,
      maps: []
    };
  }

  componentDidMount = () => {
    this.fetchAllowedMaps().then(result => {
      this.setState({
        maps: result 
      });
    });
  }

  async login() {
    const login = {
      username: "demo_user",
      password: "demo_user"
    };

    const request = new Request(`${this.state.apiUrl}login`);

    // const formBody = Object.keys(login)
    //   .map(
    //     key => encodeURIComponent(key) + "=" + encodeURIComponent(login[key])
    //   )
    //   .join("&");
    const formBody = JSON.stringify(login);
    const response = await fetch(request, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      body: formBody,
      credentials: "include"
    });

    return response;
  }

  async fetchAllowedMaps() {
    const response = await this.login();
    if (response.ok) {
      const allowedMaps = await fetch(
        `${this.state.apiUrl}getallowedmaps`,
        {
          credentials: "include"
        }
      );
      var maps = await allowedMaps.json();
      for (let i = 0; i < maps.length; i++) {
        await this.getMapClassesAndIndices(maps[i]);
      }

      return maps;
    } 
    else {
      return null;
    }
  }

  async getMapClassesAndIndices(map) {
    const response = await fetch(
      `${this.state.apiUrl}getmapclassesandindices?mapUuid=${map.uuid}`,
      {
        credentials: "include"
      }
    );

    var classesAndIndices = await response.json();

    map.classes = classesAndIndices.classes;
    map.spectralIndices = classesAndIndices.spectralIndices;
  }

  selectMap = $event => {
    if (!$event.target.value) {
      this.props.onSelect();
    } else {
      var map = JSON.parse($event.target.value);
      map.timestamps.sort((a, b) => { 
        if (a.date > b.date) {
          return 1;
        }
        else if (a.date < b.date) {
          return -1;
        }
        else {
          return 0;
        }
      });
      this.props.onSelect(map);
    }
  };

  renderMapOptions = () => {
    if (this.state.maps && this.state.maps.length > 0) {
      return this.state.maps.map(map => (
        <option key={map.uuid} value={JSON.stringify(map)}>
          {map.name}
        </option>
      ))}
    else {
      return [];
    }
  }

    render() {
        return (
            <select className="map-selector" onChange={this.selectMap}>
                <option value="">Select a map</option>
                {this.renderMapOptions()}
            </select>
        );
    }
}
