import React, { Component } from "react";

import "./Popup-form.css";

export class PopupForm extends Component {

constructor(props) {
    super(props);
    this.state = {
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    //  alert('Your error was submitted: ' + this.state.value);
    console.log(this.props, this.state.value);
    event.preventDefault();
    this.setState({value: ''});
    this.close();
  }

  close()
  {
    let form = document.getElementById('formDiv');
    form.classList.remove('block');
  }

  render() {
    return (
      <div id='formDiv'>
        <a className="button" onClick={this.close}>x</a>
        <form id='popupForm' onSubmit={this.handleSubmit}>
          <h3>What's wrong with this square?</h3>
          <label>
            <input type="checkbox" name="clouds" value="clouds"/>
            This is a problem with clouds?
            <br/>
          </label>
          <label>
            <h4>Give a small description of the error</h4>
            <textarea value={this.state.value} onChange={this.handleChange} placeholder='A small description of the error.' maxLength='3000'/>
          </label><br/>
          <input type="submit" value="Submit" className="button"/>
        </form>
      </div>
    );
  }
}

export default PopupForm;
