import React, { Component } from "react";
import parse from 'html-react-parser';

class IamA extends Component
{
  constructor(props){
    super(props);
    this.state = {
      contentElements: null
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.type && nextProps.type != this.props.type) {
      fetch(`${this.props.publicFilesUrl}iama/${nextProps.type}.html`)
        .then(response => {
          if (response.ok) {
            return response.text();
          }
          else {
            throw "Failed to retrieve documents.";
          }
        })
        .then(text => {
          let contentElements = parse(text);
          this.setState({ contentElements: contentElements});
        })
        .catch(error => {
          alert(error);
        }); 
    }
  }

  render()
  {
    return (
      <div className="IamA_content">
        {this.state.contentElements}
      </div>
    )
  }
}

export default IamA;