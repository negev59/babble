window.Babble = {
    currentMessage: '',
    userInfo: {
        name: '',
        email: ''
    },
    register: function(userInfo) {
        console.log('register: '+JSON.stringify(userInfo));
        Babble.userInfo = userInfo;
        localStorage.setItem('babble',JSON.stringify({
            currentMessage: '',
            userInfo: userInfo
        }));
        Babble.login();
    },
    login: function() {
        window.addEventListener("beforeunload" , function(e) {
            e.preventDefault();
            logout();
        });
        request({
            method: 'GET',
            action: 'http://localhost:9000/login',
            callback: return_from_login
        });
        Babble.getMessages(0, return_from_getMessages);
        Babble.getStats(return_from_getStats);
    },
    logout: function() {
        request({
            method: 'POST',
            action: 'http://localhost:9000/logout'
        });
    },
    getStats: function(callback) {
        request({
            method: 'GET',
            action: 'http://localhost:9000/stats',
            callback: callback
        });
    },
    postMessage: function(message,callback) {
        request({
            method: 'POST',
            action: 'http://localhost:9000/messages',
            data: JSON.stringify(message),
            callback: callback
        });
    },
    getMessages: function(counter ,callback) {
        console.log('get messsages with counter: ' + counter);
        request({
            method: 'GET',
            action: 'http://localhost:9000/messages?counter=' + counter,
            callback: callback
        });
    },
    deleteMessage: function(id, callback) {
        request({
            method: 'DELETE',
            action: 'http://localhost:9000/messages/' + id,
            callback: callback
        });
    },
    test: function(method, action, data) {
        request({
            method: method,
            action: 'http://localhost:9000' + action,
            data: data,
            callback: print
        });
    }
}

/* check if babble is already exist */
if (localStorage.getItem('babble')) {
    var babble = JSON.parse(localStorage.getItem('babble'));
    Babble.userInfo = babble.userInfo;
} else {
    var babble = {
        currentMessage: '',
        userInfo: Babble.userInfo
    };
    localStorage.setItem('babble',JSON.stringify(babble));
}
if (!IsAnonymous()) {
    HideSectionLogin();
    Babble.login();
}
/* Event Listener on login form */
var form = document.querySelector('.login form');
if (form) {
    form.addEventListener('submit',function(e) {
        e.preventDefault();
    });
}
PostMessages();
function PostMessages() {
    var form = document.querySelector('footer form');
    if (form) {
        form.addEventListener('submit',function(e) {
            e.preventDefault();
            var text = form.elements[0].value;
            var message = {
                name: Babble.userInfo.name,
                email: Babble.userInfo.email,
                message: text,
                timestamp: Date.now()
            };
            Babble.postMessage(message,after_post_message);
        });
    }
}

function after_post_message(e) {
    console.log('after_post_message: '+JSON.stringify(e));
}

/* register regular and anonymous */
function register() {
    var form = document.querySelector('.login form');
    if (!form) { return; }
    var userInfo = GetFormContent(form);
    HideSectionLogin();
    Babble.register(userInfo);
}

function register_anonymous() {
    HideSectionLogin();
    Babble.register({
        name: '',
        email: ''
    });
}

/* print for test */
function print(e) {
    console.log('return grom test: '+ JSON.stringify(e));
}

function HideSectionLogin() {
    var section = document.querySelector('.login');
    if (section) {
        section.style.display = 'none';
    }
}

function IsAnonymous() {
    return (Babble.userInfo.name === '' && Babble.userInfo.email === '');
}

function GetFormContent(form) {
    var res = {};
    for (var i = 0; i < form.elements.length; i++) {
        var element = form.elements[i];
        if (element.name) {
            res[element.name] = element.value;
        }
    }
    return res;
}

/* login */
function return_from_login(e) {
    console.log('login');
    var data = e;
    console.log('messages: ' + data.messages + ' , users: ' + data.users);
    document.getElementById('num-of-messages').innerHTML = data.messages;
    document.getElementById('num-of-users').innerHTML = data.users;
}

/* logout */
function logout() {
    Babble.logout();
}

/* get messages */
function return_from_getMessages(e) {
    var data = e;
    var i = 0;

    if(e.function === 'no change') {
        console.log('No Change');
        var counter = getCounter();
        Babble.getMessages(counter, return_from_getMessages);
        return;
    }
    else if(e.function === 'delete') {
        console.log('Delete');
        if(document.querySelector('ol')) {
            document.querySelector('ol').innerHTML = '';
        }
        if(e.messages){
            var messages = e.messages;
            while(i < messages.length) {
                add_message(messages[i]);
                i++;
            }
        }
    }
    else {
        console.log('Add Message');
        var messages = e.messages;
        i = 0;
        while(i < messages.length) {
                add_message(messages[i]);
            i++;
        }
    }
    delete_function();
    var counter = getCounter();
    Babble.getMessages(counter, return_from_getMessages);
}

function getCounter() {
    if(document.querySelectorAll('li') !== undefined) {
        console.log('the counter is: ' + document.querySelectorAll('li').length);
        return document.querySelectorAll('li').length;
    }
    return 0;
}

function isDelete(data) {
    console.log('Delete');
    return data.length < getCounter() ;
}

/* get Stats */
function return_from_getStats(e) {
    var data = e;
    console.log('messages: ' + data.messages + ' , users: ' + data.users);
    document.getElementById('num-of-messages').innerHTML = data.messages;
    document.getElementById('num-of-users').innerHTML = data.users;
    Babble.getStats(return_from_getStats);
}

/* delete */
var return_from_delete_message = function(e) {
    console.log('delete message');
}

var delete_function = function() {
    var lis = document.querySelectorAll('li');
    for(var i= 0; i<lis.length; i++) {
        button = lis[i].querySelector('button');
        if(button) {
            var id = lis[i].querySelector('span').innerHTML;
            button.addEventListener("click",delete_by_ID(id, i));
        }
    }
}

function delete_by_ID(id, index) {
    return function() {
        console.log('delete('+id+') in index ' + index);
        Babble.deleteMessage(id, return_from_delete_message);
    }
}


/* add message */
function add_message(message) {
    var m =
     '<li>'
     +  '<span>' + message.id + '</span>'
     +   '<img class="meesage-img" src="';
     m += message.image + '" alt="">'
     +   '<section tabindex="2" class="message">'
     +       '<cite class="name">';
     if (message.email != '') {
        m += message.name;
     }
     else {
         m += 'Anonymous';
     }
     m += '</cite><time class="message-time">'+message.timestamp+'</time>';
    if((message.email == Babble.userInfo.email)) {
            m += '<button tabindex="2" class="delete-message u-visuallyHidden u-focusable"></button>';
    }
    m +=     '<p>'
     +           message.message
     +       '</p>'
     +   '</section>'
    +'</li> ';
    if(document.querySelector('ol')) {
        document.querySelector('ol').innerHTML += m;
    }
}

/* request body */
function request(props) {
    var xhr = new XMLHttpRequest();
    xhr.open(props.method, props.action);
    if (props.method === 'post') {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    xhr.addEventListener('load', function(e) {
        if(props.callback) {
            console.log(props.action + ' and the data is: ' + (e.target.responseText));
            if(e.target.responseText) {
                props.callback(JSON.parse(e.target.responseText));
            }
        }
    });
    xhr.send(props.data);
}

// Based on: https://alistapart.com/article/expanding-text-areas-made-elegant

makeGrowable(document.querySelector('.js-growable'));


function makeGrowable(container) {
	var area = container.querySelector('textarea');
	var clone = container.querySelector('span');
	area.addEventListener('input', function(e) {
		clone.textContent = area.value;
	});
}