import React, { Component } from "react";

import parse from 'html-react-parser';
import 'highlight.js/styles/monokai-sublime.css';

const hljs       = require('highlight.js');
const Remarkable = require('remarkable');

class Markdown extends Component
{
  md = new Remarkable('full', {
    highlight: (str, lang) =>
    {
      if (lang && hljs.getLanguage(lang))
      {
        try
        {
            return hljs.highlight(lang, str).value;
        }          
        catch (err) {

        }
      }

      try
      {
        return hljs.highlightAuto(str).value;
      }
      catch (err) {

      }

      return '';
    }
  });

  constructor(props){
    super(props);
    
    this.md.set({
      html        : true,
      xhtmlOut    : true,
      linkify     : true,
      typographer : true
    });

    this.state = {
      contentElements: null
    };
  }

  componentDidMount() {
    fetch(`${this.props.publicFilesUrl}markdown/${this.props.file}.md`, { method: 'GET' })
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        else {
          throw "Failed to retrieve documents.";
        }
      })
      .then(text => {
        let output = this.md.render(text);
        let contentElements = parse(output);

        this.setState({ contentElements: contentElements});
      })
      .catch(error => {
        debugger;
        alert(error);
      })
  }


  render()
  {
    return (
      <div>
        {this.state.contentElements}
      </div>
    )
  }
}

export default Markdown;