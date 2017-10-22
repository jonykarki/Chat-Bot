// This loads the environment variables from the .env file
require('dotenv-extended').load();

const builder = require('botbuilder');
const restify = require('restify');

// we need the connector for our bot
const connector = new builder.ChatConnector({
    appId = process.env.MICROSOFT_APP_ID,
    appPassword = process.env.MICROSOFT_APP_PASSWORD
});
const bot = new builder.UniversalBot(connector,
    [
        //ask the user for their name and greet them with that
        (session) => {
            builder.Prompts.text(session, "Hello There! What is your name?");
        },
        (session, results) => {
            var name = results.response;
            console.log(name);
            session.endDialog('Hello, ' + name + ' how are you?');
        }
    ]
);

// start the server
const server = restify.createServer();

// we want to get the messaages in /api/messages and get the connector to listen
server.post('/api/messages', connector.listen());

// let's get the server to listen to a port
server.listen(
    process.env.PORT || 3978,
    () => console.log("Server is running *:.."));