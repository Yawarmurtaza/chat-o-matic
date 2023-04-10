import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

const client = new ApolloClient({
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache(),  
  });


  const GET_MESSAGES = gql`
  query {
    chatMessagesKey{
    messageId
    user
    messageContent
  }
}
  `;

function Messages ({user}) {
    const {data} = useQuery(GET_MESSAGES);
    if(data === undefined || data === null){
        return null;
    }

    const messages = data.chatMessagesKey;
    console.log(messages);

    return (
        <>
        {
            data.chatMessages.map(({ messageId, user: messageUser, messageContent}) => {
                <div style={{
                    display: 'flex', 
                    justifyContent: user === messageUser ? 'flex-end' : 'flex-start', 
                    padding: "1em" 
                    }}>
                    <div style={{
                        background: user === messageUser ? "#e58bf56" : "#e5e6ea",
                        color: user === messageUser ? "white" : "black",
                        padding: "1em",
                        borderRadius: "1em",
                        maxWidth: "60%"
                    }}>
                        {messageContent}
                    </div>

            
                </div>
                                
            })
        }
        </>
    );
}

function Chat() {
return (
    <div>
        <Messages user="Yawar"/>
    </div>
    );};

export default function ChatWrapper() {
    return (
     <ApolloProvider client={client}>
         <Chat />
     </ApolloProvider>
 )};
