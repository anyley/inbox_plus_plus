// Отрабатывать скрипт только на странице с комментариями
if (document.location.href.match("leprosorium.ru/comments/")) {

console.log('Найден пост с комментариями леперов');
refreshAllUsers();

// Запрашиваем список людей из имеющегося списка
function refreshAllUsers() {
	chrome.runtime.sendMessage({
		cmd: 'get_user_list'
	}, function(response) {
		if (response && response.status=="OK") {
			// Подсвечиваем М и Ж из полученного списка
			_.forIn(response.userlist, function(value, key) {
				setUserStatus(key, true);
			});
		}
	});
}

// Ищем всех юзеннэймов на странице, оставивших комментарии
findUserComments('*', function(comment, username) {
	var sex = $(comment).text()=='Написал';

	// Вешаем обработку клика на "Написал"/"Написала" для всех людей на странице
	$(comment).on('click', function(e) {
		chrome.runtime.sendMessage({
				cmd: 'click',
				username: username,
				sex: sex
			}
		);
	});
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	// console.log(request);
    if (request && request.cmd) {
        switch(request.cmd) {
        case 'get_by_keywords':
        	var userlist = {};
        	var comments = $('.c_body');
        	var i=0;
        	var keywords = '(' + _.filter(request.keywords, function(item) {return item!=''} ).join('|') + ')';
        	// console.log(keywords);
        	var re = new RegExp(keywords,'i');
        	// console.log(re);
        	$(comments).each(function(idx) {
        		var text = this.innerText;
        		i++;
        		// console.log(text.match(re));
        		if (text.match(re)) {
        			// console.log(text);
        			// console.log(i + ': ' + $(this).text());
        			var tmp = $(this.nextSibling).find('.c_wrote')[0];
        			// console.log($(tmp));
         			var sex = $(tmp).text()=='Написал';
         			var j=0;
					while(tmp.className!='c_user' && j<4) {
						tmp = tmp.nextSibling;
						j++;
					}
						// console.log(tmp.innerText);
					if (tmp.className=='c_user') {
						userlist[tmp.innerText] = {name:tmp.innerText, sex:sex};
						// console.log(tmp.innerText);
					}

        		}

        	});
        	sendResponse({status:'OK', userlist:userlist});
        	break;

        case 'refresh':
        	refreshAllUsers()
        	break;

        case 'get_user_list':
        	var userlist = {};
        	findUserComments('*', function(comment, username) {
				var sex = $(comment).text()=='Написал';
				userlist[username] = {sex: sex, name: username};
			});

        	sendResponse({
        		status:'OK', userlist: userlist
        	});
        	break;

        case 'deleted':
        	setUserStatus(request.username, false);
        	break;

        case 'added':
        	setUserStatus(request.username, true);
        	break;

        case 'clear':
        	$(".c_wrote").css('background','');
        	$(".c_wrote").css('color','darkblue');
			$(".c_wrote").each( function(idx) {
				if ($(this).text()=="Написала") {
					$(this).css('color','red');
				}
			});
        	break;
    	}
	}
});
}

// Ищет все комментарии пользователя с именем username
// если username == '*' возвращает все коментарии всех пользователей
function findUserComments(username, callback) {
	$(".c_wrote").each(function(item) {
		var i=0;
		var tmp = this.nextSibling;
		var sex = $(this).text()=='Написал';

		while(tmp.className!='c_user' && i<3) {
			tmp = tmp.nextSibling;
			i++;
		}
		if (tmp.className=='c_user' && (tmp.innerText==username || username=='*')) {
			callback(this, tmp.innerText, sex);
		}
	});
}


// Инвертирует подсветку надписи Написал(а) в зависимости от статуса
function setUserStatus(username, status) {
	if (status) {	
		findUserComments(username, function(object, name, sex) {
			$(object).css('background', sex ? 'darkblue' : 'red');
			$(object).css('color', 'white');
		});
	} else {
		findUserComments(username, function(object, name, sex) {
			$(object).css('background', '');
			$(object).css('color', sex ? 'darkblue' : 'red');
		});
	}
}


if (document.location.href.match(/^https:\/\/leprosorium.ru\/users\/.+\/comments$/)) {
var usernameTag = $('.b-header_tagline > a');
var usernameTag2 = $('.b-user_name-link');
// console.log($(usernameTag).text());
// console.log($(usernameTag2).text());
if ($(usernameTag).text() == $(usernameTag2).text()) {
console.log('Найден список комментариев: ' + $(usernameTag).text());
$('.vote_result').css('width','70px');
var statTags = $('.vote_result');
var i=0;
var comments = {};
statTags.each(function () {
	var commentId = $(this).attr('onclick').match(/\d+/);
	comments[parseInt(commentId)] = parseInt($(this).text());
	// console.log(++i + '. ' + commentId + ': ' + $(this).text());
});

chrome.runtime.sendMessage({
		cmd: 'get_comments_stat',
		comments: comments
	}, function(response) {
		// console.log(response);
		if (response && response.status=='OK') {
			// _.forIn(response.userlist, function(value, key) {
			// 	// setUserStatus(key, true);
			// });
			var color;
			statTags.each(function () {
				var commentId = $(this).attr('onclick').match(/\d+/);
				// comments[parseInt(commentId)] = parseInt($(this).text());
				if (response.comments[commentId]!=undefined && parseInt(response.comments[commentId])!=NaN) {
					var delta = comments[commentId] - parseInt(response.comments[commentId]);
					// console.log(delta);
					//$(this).insertBefore(delta);

					if (delta!=NaN && delta!=0) {
						color = (delta>0) ? 'darkgreen' : 'red';
						$(this).html( 
							$(this).text() + ' [<span style="color:'+color+'">' + ((delta>0)?'+':'') + delta + '</span>]'
						);
					}
					
				}
				// console.log(++i + '. ' + commentId + ': ' + $(this).text());
			});
		}
	}.bind(this));
}
}


