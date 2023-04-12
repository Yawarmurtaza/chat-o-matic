import React from "react";
import ReactDOM from "react-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css";

import "./index.css";
import ChatWrapper from "./Chat";

function  App () {
    return (
         <ChatWrapper />
    );
}

ReactDOM.render(<App />, document.getElementById("app"));
