import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,  
  gql,
  useMutation,
  useSubscription
} from "@apollo/client";

import {WebSocketLink } from '@apollo/client/link/ws';
import { Container, Row, Col, FormInput, Button } from "shards-react";
 
import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css"

const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/`,
  options: {
    reconnect: true
  }
});

const client = new ApolloClient({
    link: wsLink,
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache(),  
  });


const GET_MESSAGES = gql`
  query {
    getChatMessagesKey{
    messageId
    user
    messageContent
  }
}`;

const GET_MESSAGES_VIA_SUBSCRIPTION = gql`
  subscription {
    chatMessagesKey{
    messageId
    user
    messageContent
  }
}`;

const POST_CHAT_MESSAGE_MUTATION = gql`
mutation SendChatMessage($messageSender: String!, $messageContent: String!){
  postChatMessage(userWhoSentTheMessage: $messageSender, messageText: $messageContent)
}
`;


function PrintMessages ({currentUser}) {
    // const {data} = useQuery(GET_MESSAGES, {pollInterval: 500});

    const {data} = useSubscription(GET_MESSAGES_VIA_SUBSCRIPTION);

    if(data === undefined || data === null){        
      console.log("data is null")  ;
      return null;
    }
    else{
    const messages = data.chatMessagesKey;
    return (
        <>
        {messages.map(({ id, user, messageContent }) => (
          // chat item div
          <div key={id} 
            style={{
              display: "flex",
              justifyContent: currentUser === user ? "flex-end" : "flex-start", // align right or left baesd upon the user who sent this message
              paddingBottom: "1em",
            }}            
          >
            {/* User icon div */}
            {currentUser !== user && (
              <div
                style={{
                  height: 50,
                  width: 50,
                  marginRight: "0.5em",
                  border: "2px solid #e5e6ea",
                  borderRadius: 25,
                  textAlign: "center",
                  fontSize: "18pt",
                  paddingTop: 5,
                }}               
              >
                {user.slice(0, 2).toUpperCase()}
              </div>
            )}
            {/* Message content div */}
            <div
              style={{
                background: currentUser === user ? "blue" : "#e5e6ea",
                color: currentUser === user ? "white" : "black", //font colour
                padding: "1em",
                borderRadius: "1em",
                maxWidth: "60%",
              }}              
            >
              {messageContent}
            </div>
          </div>
        ))}
      </>
    )
    }
}

function Chat() {
    const [userMessageState, setUserMessageState] = React.useState({ user: "Yawar", content: "" });
    const [postChatMessage] = useMutation(POST_CHAT_MESSAGE_MUTATION);

    function sendButtonClicked() {
      if(userMessageState.content.length > 0 || userMessageState.content.trim() !== ""){
        postChatMessage({
          variables: {
            messageSender: userMessageState.user,
            messageContent: userMessageState.content
          }
        }
        )

    }
    setUserMessageState({...userMessageState, content: ''})
  }

return (
    <Container>
        <PrintMessages currentUser={userMessageState.user}/>
        <Row>
            <Col xs={2} style={{padding: 0}}>
                <FormInput
                    lable="User"
                    value={userMessageState.user}
                    onChange={ (event) => setUserMessageState({...userMessageState, user: event.target.value})}
                ></FormInput>

            </Col>
            <Col xs={8}>
                <FormInput
                    lable="Content"
                    value={userMessageState.content}
                    onChange={ (event) => setUserMessageState({...userMessageState, content: event.target.value})}
                    onKeyUp={(event) => {if (event.keyCode === 13) sendButtonClicked();}}
                ></FormInput>
            </Col>
            <Col xs={2} style={{ padding: 0}}>
                <Button onClick= {() => sendButtonClicked()}>Send</Button>
            </Col>
        </Row>
    </Container>
    );};

export default function ChatWrapper() {
    return (
     <ApolloProvider client={client}>
         <Chat />
     </ApolloProvider>
 )};
