import React from 'react'
import ReactHtmlParser from 'react-html-parser';

const HtmlReader = ({htmlString}) => {
    return <div>{ ReactHtmlParser(htmlString) }</div>;
}

export default HtmlReader