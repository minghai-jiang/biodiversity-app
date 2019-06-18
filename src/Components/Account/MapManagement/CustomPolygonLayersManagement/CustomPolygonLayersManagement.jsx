import React, { PureComponent } from 'react';

import ReactTable from 'react-table';
import 'react-table/react-table.css';
import cloneDeep from 'lodash.clonedeep';

import ApiManager from '../../../../ApiManager';

class CustomPolygonLayersManagement extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      customPolygonLayers: null,
      customPolygonLayersData: null
    };
  }

  componentDidMount() {
    this.update();
  }

  update = () => {
    if (!this.props.user) {
      return;
    }

    this.getCustomPolygonLayers();
  }

  componentWillUnmount() {
    this.setState({ customPolygonLayers: null });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.map !== this.props.map) {
      this.setState({
        customPolygonLayers: null,
        customPolygonLayersData: null
      },
      () => { this.update(); }
      );
    }
  }

  getCustomPolygonLayers = (e) => {
    ApiManager.fetch('POST', '/geoMessage/customPolygon/layers', { mapId: this.props.map.id }, this.props.user)
      .then(result => {
        result.forEach(customPolygonLayer => {
          customPolygonLayer.properties = customPolygonLayer.properties.join(',');
        })

        let customPolygonLayersdata = cloneDeep(result);

        customPolygonLayersdata.unshift({
          id: 0,
          name: this.props.localization["new layer"],
          color: 'ff0000ff',
          properties: this.props.localization["property1,property2"]
        });

        this.setState({ customPolygonLayers: result, customPolygonLayersData: customPolygonLayersdata });
      })
      .catch(err => {
        this.props.showError(err);
      });
  }

  createCustomPolygonLayer = (cellInfo) => {
    let editedRow = cellInfo.original;

    if (!testHex(editedRow.color)) {
      alert('Invalid color. Must be in rgba hexadecimal (example ff0000ff).');
    }

    let properties = editedRow.properties.split(',');
    properties.forEach(function(part, index, theArray) {
      theArray[index] = part.trim();
    });

    let body = {
      mapId: this.props.map.id,
      layerName: editedRow.name,
      color: editedRow.color,
      properties: properties
    };

    ApiManager.fetch('POST', '/geoMessage/customPolygon/addLayer', body, this.props.user)
      .then(() => {
        let newLayer = {
          id: this.state.customPolygonLayers.length + 1,
          name: editedRow.name,
          color: editedRow.color,
          properties: editedRow.properties
        };

        let newGroupClone = cloneDeep(newLayer);

        this.state.customPolygonLayers.push(newLayer);
        this.state.customPolygonLayersData.push(newGroupClone);

        let newLayerData = this.state.customPolygonLayersData.find(layer => layer.id === 0);
        newLayerData.name = 'new layer';
        newLayerData.color = 'ff0000ff';
        newLayerData.properties = 'property1,property2';

        let customPolygonLayersData = [...this.state.customPolygonLayersData];

        this.setState({ customPolygonLayersData: customPolygonLayersData });
      })
      .catch(err => {
        this.props.showError(err);
      });
  }

  saveCustomPolygonsLayer = (cellInfo) => {
    let editedRow = cellInfo.original;
    let originalRow = this.state.customPolygonLayers.find(layer => layer.id === editedRow.id);

    if (!originalRow) {
      console.warn('Attempted to save a row that does not exist in the original data.');
      return;
    }

    editedRow.color = editedRow.color.toLowerCase();

    if (originalRow.name !== editedRow.name || originalRow.color !== editedRow.color ||
      originalRow.properties !== editedRow.properties
      ) {

      if (!testHex(editedRow.color)) {
        alert('Invalid color. Must be in rgba hexadecimal (example ff0000ff).');
        return;
      }

      let body = {
        mapId: this.props.map.id,
        layerName: originalRow.name
      };

      if (originalRow.name !== editedRow.name) {
        body.newLayerName = editedRow.name
      }
      if (originalRow.color !== editedRow.color) {
        body.newColor = editedRow.color;
      }
      if (originalRow.properties !== editedRow.properties) {
        let properties = editedRow.properties.split(',');
        properties.forEach(function(part, index, theArray) {
          theArray[index] = part.trim();
        });

        body.newProperties = properties;
      }

      ApiManager.fetch('POST', '/geoMessage/customPolygon/alterLayer', body, this.props.user)
        .then(() => {
          originalRow.name = editedRow.name;
          originalRow.color = editedRow.color;
          originalRow.properties = editedRow.properties;
        })
        .catch(err => {
          this.props.showError(err);
        });
    }
  }

  deleteCustomPolygonsLayer = (cellInfo) => {
    let editedRow = cellInfo.original;
    let originalRow = this.state.customPolygonLayers.find(layer => layer.id === editedRow.id);

    let confirmDelete = window.confirm(`Are you sure you want to delete the layer: ${originalRow.name}?`);

    if (confirmDelete) {
      let body = {
        mapId: this.props.map.id,
        layerName: originalRow.name
      };

      ApiManager.fetch('POST', '/geoMessage/customPolygon/deleteLayer', body, this.props.user)
        .then(() => {
          let newCustomPolygonLayers = this.state.customPolygonLayers.filter(layer => {
            return layer.id !== originalRow.id;
          });

          let newCustomPolygonLayersData = this.state.customPolygonLayersData.filter(layer => {
            return layer.id !== originalRow.id;
          });

          this.setState({ customPolygonLayers: newCustomPolygonLayers, customPolygonLayersData: newCustomPolygonLayersData });
        })
        .catch(err => {
          this.props.showError(err);
        });
    }
  }

  renderEditable = (cellInfo) => {
    return (
      <div style={{ backgroundColor: "#fafafa" }}>
        <input
          type='text'
          defaultValue={this.state.customPolygonLayersData[cellInfo.index][cellInfo.column.id]}
          onBlur={e => {
            this.state.customPolygonLayersData[cellInfo.index][cellInfo.column.id] = e.target.value;
          }}
        />
      </div>
    );
  }

  renderColorDropdown = (cellInfo) => {
    let element = <div> </div>
      element = (   <div style={{ backgroundColor: "#fafafa" }}>
          <select value = {this.state.customPolygonLayersData[cellInfo.index][cellInfo.column.id]}
           name="Type"
           onChange = {e => {
             let x = Object.assign({}, this.state.customPolygonLayersData);
             x[cellInfo.index][cellInfo.column.id] = e.target.value;
             this.setState({x})
            }}>
            <option  value="ff0000ff">{this.props.localization["red"]}</option>
            <option value="00ff00ff">{this.props.localization["green"]}</option>
            <option value="0000ffff">{this.props.localization["blue"]}</option>
            <option value="ffff00ff">{this.props.localization["yellow"]}</option>
          </select>
          </div>
        );
    return (element)
  }

  renderActionButtons = (cellInfo) => {
    if (cellInfo.index === 0) {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
          <button onClick={() => this.createCustomPolygonLayer(cellInfo)}>{this.props.localization["Create"]}</button>
        </div>
      );
    }
    else {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
          <button onClick={() => this.saveCustomPolygonsLayer(cellInfo)}>{this.props.localization["Save"]}</button>
          <button onClick={() => this.deleteCustomPolygonsLayer(cellInfo)}>{this.props.localization["Delete"]}</button>
        </div>
      );
    }

  }

  render() {
    if (this.state.customPolygonLayers) {
      return (
        <div>
          <ReactTable
            key={Math.random()}
            data={this.state.customPolygonLayersData}
            columns={[
              {
                Header: this.props.localization["Layer name"],
                accessor: 'name',
                Cell: this.renderEditable
              },
              {
                Header: this.props.localization["Color"],
                accessor: 'color',
                Cell: this.renderColorDropdown
              },
              {
                Header: this.props.localization["Properties"],
                accessor: 'properties',
                Cell: this.renderEditable
              },
              {
                Header: this.props.localization["Actions"],
                accessor: 'actions',
                Cell: this.renderActionButtons
              }
            ]}
            sortable={false}
            defaultPageSize={1000}
            showPagination={false}
            minRows={0}
            className="-striped -highlight"
          />
        </div>
      );
    }
    else {
      return (<div></div>)
    }
  }
}

function testHex(hex) {
  let valid = /^([A-Fa-f0-9]{4}){1,2}$/.test(hex);

  return valid;
}

export default CustomPolygonLayersManagement;
