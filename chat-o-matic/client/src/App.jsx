import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import ChatWrapper from "./Chat";

function  App () {
    return (
         <ChatWrapper />
    );
}

ReactDOM.render(<App />, document.getElementById("app"));
