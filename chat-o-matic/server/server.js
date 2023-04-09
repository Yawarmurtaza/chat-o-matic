//import { GraphQLServer, PubSub } from 'graphql-yoga';

const { GraphQLServer, PubSub } = require('graphql-yoga');


const chatMessagesArray = [{messageId: 1, user: "John", messageContent: "Hello World"}, {messageId: 2, user: "Jane", messageContent: "Hello World"}];

// every graphql server needs types, its called schema.  The schema or a type is the blueprint for the data that will be returned from the server.
const chatMessageTypeDefs = `

  ############################################################################################
  # GraphQL - Schema
  # This is the schema for the chat messages.  The chat messages will be an array of objects, each object will have an id, user, and messageContent. 
  ############################################################################################
  
  type ChatMessage {
    messageId: ID! #### ID is a type in graphql, it is a string, but it is unique.  It is a unique identifier for the object.
      user: String!
      messageContent: String!
  }

  
  ############################################################################################
  # GraphQL - QUERY
  # How do we get above messages, we use query type. 'chatMessages' is the name of the query, and the value is the type of data that will be returned.  In this case, an array of ChatMessage objects.
  # 'Query' is a reserved word in graphql.
  ############################################################################################
  
  type Query {
    chatMessages: [ChatMessage!]! # key is the name of the query?, value is the array of ChatMessage objects
  }

  
  ############################################################################################
  # GraphQL - MUTATION
  # Mutation is used to create, update, or delete data.  In this case, we are creating a new chat message.  The mutation will return the new chat message.
  # its like POST in REST API :)
  ############################################################################################
  
  type Mutation {
    postChatMessage (userWhoSentTheMessage: String!, messageText: String!) : ID! # POST message signature - like an interface and implementation is in resolver.
  }

  `;

/** ************************************************************************
 * resolver is a function that returns the data that is requested by the client. 
 * In this case, the client is requesting the chatMessages array.
 * The resolver function returns the 'chatMessagesArray'. 
 * *************************************************************************/
const chatMessageResolvers = {
   /************************************************************************
    * RESOLVER Query 
    *************************************************************************/
    Query:{
        chatMessages: () => chatMessagesArray,
    },

    /************************************************************************
    * RESOLVER Muration 
    *************************************************************************/
  // remember, a mutation is like a HTTP POST request. The client is sending data to the server.  The server will then create a new chat message and return the new chat message.
    Mutation: {
      postChatMessage: (parent, {userWhoSentTheMessage, messageText}) => {
        const newMessageId = chatMessagesArray.length;
        chatMessagesArray.push({
          messageId: newMessageId,
          user : userWhoSentTheMessage,
          messageContent: messageText
        });
        return newMessageId;
      }
    }
};


const server = new GraphQLServer({ typeDefs: chatMessageTypeDefs, resolvers: chatMessageResolvers });
 server.start(({port}) => console.log(`Server is running on localhost:${port}`));