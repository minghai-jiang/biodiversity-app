import React, { Component } from "react";

export class LegendRow extends Component {

constructor(props) {
    super(props);
    this.state = {
      
    };
}

  render() {
      let style = {background: '#' + this.props.color};
      let count = '';

      if(typeof(this.props.max) === 'number' && this.props.count)
      {
        if (this.props.max < this.props.count)
        {
          let redCount = <span className='redCount' key={this.props.name + 'redCount'}>{this.props.count}</span>
          count = <span key={this.props.name + '.count'} className='count'>on screen: {redCount}</span>;
        }
        else
        {
          count = <span key={this.props.name + '.count'} className='count'>on screen: {this.props.count}</span>;
        }
      }

      let block = <i key={this.props.name + '.block'} style={style}></i>;
      let name = this.props.name;
    return (
      <p key={name}>{block}{name}<br/>{count}</p>
    );
  }
}

export default LegendRow;
