// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// create the bot and listen for the new messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

//listen to the following api end point
server.post('/api/messages', connector.listen());

// store all the users in the folowing array
var userStore = [];
var bot = new builder.UniversalBot(connector, function (session) {

    // whenever there's a new cconnection store that address
    var address = session.message.address;
    userStore.push(address);

    // end current dialog
    session.endDialog('You\'ll Now be redirected to the Premium Chat Room....');
});

// Every 5 seconds, check for new registered users and start a new dialog
setInterval(function () {
    var newAddresses = userStore.splice(0);
    newAddresses.forEach(function (address) {

        console.log('Starting survey for address:', address);

        // new conversation address, copy without conversationId
        var newConversationAddress = Object.assign({}, address);
        delete newConversationAddress.conversation;

        // start survey dialog
        bot.beginDialog(newConversationAddress, 'survey', null, function (err) {
            if (err) {
                // error ocurred while starting new conversation. Channel not supported?
                bot.send(new builder.Message()
                    .text('This channel does not support this operation: ' + err.message)
                    .address(address));
            }
        });

    });
}, 5000);

bot.dialog('survey', [
    function (session) {
        builder.Prompts.text(session, 'Hey There! What is your name?');
    },
    function (session, results) {
        // get the name of the user and save i
        var name = results.response;
        session.userData.name = results.response;
        builder.Prompts.number(session, 'Hi ' + name + ', How many years have you been coding?');
    },
    function (session, results) {
        session.userData.coding = results.response;
        builder.Prompts.choice(session, 'What language do you code Node using? ', ['Java', 'Python', 'JavaScript']);
    },
    function (session, results) {
        session.userData.language = results.response.entity;
        session.endDialog('I Got it... ' + session.userData.name +
            ' You have been programming for ' + session.userData.coding +
            ' years and use ' + session.userData.language + ' as the main programming language.');
    }
]);