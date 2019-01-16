import React, { PureComponent } from "react";
import Plot from "react-plotly.js";

export class Graph extends PureComponent {

  state = {
    data: []
  };

  constructor(props) {
    super(props);
    this.state.data = props.data;
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.state.data !== nextProps.data) {
      this.setState({ data: nextProps.data });
    }
  }

  render() {
    return (
      <Plot
        data={this.state.data}
        layout={{
          width: 500,
          height: 300,
          margin: { l: 45, t: 30, r: 30, b: 50 },
          showLegend: true
        }}
      />
    );
  }
}
