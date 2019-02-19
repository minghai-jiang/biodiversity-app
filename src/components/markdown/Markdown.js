import React, { Component } from "react";

import parse from 'html-react-parser';
import 'highlight.js/styles/monokai-sublime.css';

const hljs       = require('highlight.js');
const Remarkable = require('remarkable');

class Markdown extends Component
{
    constructor(props){
        super(props);
        this.state = {
            posts:[]
        };
    }

    componentDidMount()
    {
        var self = this;

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200)
            {  
                self.setState({posts: this.responseText});
            }
        };

        xhttp.open("GET", "https://i306476.hera.fhict.nl/" + self.props.file + ".php", true);

        xhttp.send();
    }

    render()
    {
        var md = new Remarkable('full', {
            highlight: function (str, lang)
            {
                if (lang && hljs.getLanguage(lang))
                {
                    try
                    {
                        return hljs.highlight(lang, str).value;
                    }
                    
                    catch (err) {}
                }

                try
                {
                    return hljs.highlightAuto(str).value;
                }

                catch (err) {}

                return '';
            }
        });

        md.set({
            html        : true,
            xhtmlOut    : true,
            linkify     : true,
            typographer : true
        });

        if (typeof(this.state.posts) === 'string')
        {
            var output = md.render(this.state.posts);
        }

        if(typeof(output) === 'string')
        {
            return <div>{parse(output)}</div>
        }
        else
        {
            return <div></div>
        }
    }
}

export default Markdown;