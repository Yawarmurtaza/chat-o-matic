//import { GraphQLServer, PubSub } from 'graphql-yoga';

const { GraphQLServer, PubSub } = require('graphql-yoga');


const chatMessagesArray = [
  {messageId: 0, user: "John", messageContent: "Hello World from John"}, 
  {messageId: 1, user: "Yawar", messageContent: "Hello World from Yawar"}, 
  {messageId: 2, user: "Jane", messageContent: "Hello World from Jane"}
];

const anotherEventMessagesArray = [
  {messageId: 0, user: "John", messageContent: "Hello World from John_anotherEventMessagesArray"}, 
  {messageId: 1, user: "Yawar", messageContent: "Hello World from Yawar_anotherEventMessagesArray"}, 
  {messageId: 2, user: "Jane", messageContent: "Hello World from Jane_anotherEventMessagesArray"}
];

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
    getChatMessagesKey: [ChatMessage!]!, # key is the name of the query?, value is the array of ChatMessage objects
    anotherEvent: [ChatMessage!]!,
  }

  
  ############################################################################################
  # GraphQL - MUTATION
  # Mutation is used to create, update, or delete data.  In this case, we are creating a new chat message.  The mutation will return the new chat message.
  # its like POST in REST API :)
  ############################################################################################
  
  type Mutation {
    postChatMessage (userWhoSentTheMessage: String!, messageText: String!) : ID!, # POST message signature - like an interface and implementation is in resolver.
    postChatMessage_anotherEvent(userWhoSentTheMessage: String!, messageText: String!) : ID! # POST message signature - like an interface and implementation is in resolver.
  }

  ############################################################################################
  # GraphQL - SUBSCRIPTION
  # Subscription is yet another type in GraphQL like Mutation.  Its  a special type that allows us to subscribe to events.  In this case, we are subscribing to new chat messages.
  ############################################################################################
  
  type Subscription {
    chatMessagesKey: [ChatMessage!]!, # type = ChatMessages - GraphQL schema defined above.
    
    # anotherEvent is the name of subscription in this GraphQL schema/ typedef
    anotherEvent: [ChatMessage!]
  }
    `;


const subscribersArray = [];

// add new subscriber to the list of existing subscriversArray
function onMessageUpdate (subscriberCallback) {
  subscribersArray.push(subscriberCallback);
}


/** ************************************************************************
 * Resolver is a function that returns the data that is requested by the client. 
 * In this case, the client is requesting the chatMessages array.
 * The resolver function returns the 'chatMessagesArray'. 
 * *************************************************************************/
const chatMessageResolvers = {
   /************************************************************************
    * RESOLVER Query 
    *************************************************************************/
    Query:{
      getChatMessagesKey: () => chatMessagesArray,
      anotherEvent: () => anotherEventMessagesArray,
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
        subscribersArray.forEach( (subscriberCallback) => subscriberCallback());
        return newMessageId;
      },
      postChatMessage_anotherEvent: (parent, {userWhoSentTheMessage, messageText}) => {
        const newMessageId = anotherEventMessagesArray.length;
        anotherEventMessagesArray.push({
          messageId: newMessageId,
          user : userWhoSentTheMessage,
          messageContent: messageText
        });
        subscribersArray.forEach( (subscriberCallback) => subscriberCallback());
        return newMessageId;
      }
    },

     /************************************************************************
    * RESOLVER Subscription 
    *************************************************************************/
   Subscription: {
    chatMessagesKey: {
      subscribe: (parent, args, {pubsub}) => {
        const channel = Math.random().toString(36).slice(2,15);
        onMessageUpdate(() => pubsub.publish(channel, {chatMessagesKey: chatMessagesArray}));
        console.log(` Channel: ${channel}`);
        setTimeout( ()=> pubsub.publish(channel, {chatMessagesKey: chatMessagesArray}), 0);
        return pubsub.asyncIterator(channel);
      }
    },
    // anotherEvent is the name of subscription in this resolver.
    // this name has to match with the one in GrpahQL schema above, else we will get "Subscription.anotherEvent2 defined in resolvers, but not in schema]" error.
    anotherEvent: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random().toString(36).slice(2,15);
        onMessageUpdate(() => pubsub.publish(channel, {anotherEvent: anotherEventMessagesArray}));
        console.log(` Channel: ${channel}`);
        setTimeout( ()=> pubsub.publish(channel, {anotherEvent: anotherEventMessagesArray}), 0);
        return pubsub.asyncIterator(channel);
      }
    } 
   }
};

// we need this pubsub object to be able to subscribe to events.
const pubsub = new PubSub();

const server = new GraphQLServer({ typeDefs: chatMessageTypeDefs, resolvers: chatMessageResolvers, context: {pubsub} });
 server.start(({port}) => console.log(`Server is running on localhost:${port}`));