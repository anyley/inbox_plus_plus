var userlist = get_userlist();

function get_userlist() {
    var userlist = localStorage['userlist'];
    if (!userlist || userlist=='') {
        userlist = {};
        localStorage['userlist'] = JSON.stringify(userlist);
    } else {
        userlist = JSON.parse(userlist);
    }
    return userlist;
}

var masklist = get_masklist();

function get_masklist() {
    var masklist = localStorage['masklist']
    if (!masklist || masklist=='' || masklist=='[]') {
        masklist = ['inbox', 'инбокс', 'запиши', 'впиши'];
        localStorage['masklist'] = JSON.stringify(masklist);
    } else {
        masklist = JSON.parse(masklist);
    }
    return masklist;
}

var comments = get_comments();

function get_comments() {
    var comments = localStorage['comments'];
    if (!comments || comments=='') {
        comments = {};
        localStorage['comments'] = JSON.stringify(comments);
    } else {
        comments = JSON.parse(comments);
    }
    return comments;
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

    // console.log(request);
    if (request && request.cmd) {
        switch(request.cmd) {
        case 'get_user_list':
            userlist = get_userlist();
            sendResponse({status:'OK', userlist});
            break;

        case 'click':
            var username = request.username;
            var sex = request.sex;
            userlist = get_userlist();

            if (!userlist[username]) {
                userlist[username] = {name:username, sex:sex};
                // sendResponse({status:'added'});
                forTabsWithUrl("leprosorium.ru/comments/",
                    function(tab) {
                        messageToTab(tab.id, {cmd:'added', username:username});
                    }.bind(this)
                );
            } else {
                delete userlist[username];
                // sendResponse({status:'deleted'});
                forTabsWithUrl("leprosorium.ru/comments/",
                    function(tab) {
                        messageToTab(tab.id, {cmd:'deleted', username:username});
                    }.bind(this)
                );
            }

            userlist = JSON.stringify(userlist);
            localStorage['userlist'] = userlist;            
            
            break;

        case 'copy':
            userlist = get_userlist();
            //var userArray = _.sortBy(userlist, ['sex', 'name']);
            var userArray = _.keys(userlist).join(', ');
            var input = document.createElement('textarea');
            document.body.appendChild(input);
            input.value = userArray;
            input.focus();
            input.select();
            document.execCommand('Copy');
            input.remove();

            break;

        case 'get_comments_stat':
            var comments = get_comments();
            sendResponse({status:'OK', comments:comments});
            comments = JSON.stringify(request.comments);
            localStorage['comments'] = comments;
            break;

        }

    }

});


