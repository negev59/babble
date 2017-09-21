var messages = [];
var counter = 42;


function addMessage(message) {
    console.log(' addMessage - messages');
    //console.log(JSON.stringify(message));
    messages.push(message);
    return {id: message.id};
}
function getCounter() {
    return counter++;
}
function getMessagesLength() {
    return messages.length;
}
function getMessages(counter) {
    function getContent(message) {
        return {message: message.message};
    }
    var res = messages.slice(counter);
    return res.map(getContent);
}

function myGetMessages(counter) {
    return messages.slice(counter);
}

function deleteMessage(id) {
    messages = messages.filter(x => x.id != parseInt(id));
    console.log('---messages:--- ' + JSON.stringify(messages));
}

function IDisExist(id) {
    return messages.filter(x => x.id == parseInt(id)).length > 0;
}

module.exports = {addMessage, getMessages, deleteMessage, getCounter, counter, messages, getMessagesLength, myGetMessages, IDisExist};