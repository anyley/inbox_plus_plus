var React = require('react');
var ReactDOM = require('react-dom');

var userlist = {};
var copyButtonTag;



var UserRow = React.createClass({
  getInitialState: function() {
    return {
      check: true
    };
  },

  click: function() {
    if (this.state.check) {    
      delete userlist[this.props.username];
      forTabsWithUrl("leprosorium.ru/comments/",
        function(tab) {
          messageToTab(tab.id, {cmd:'deleted', username:this.props.username});
        }.bind(this)
      );
    } else {
      userlist[this.props.username] = {name:this.props.username, sex:this.props.sex};
      forTabsWithUrl("leprosorium.ru/comments/",
        function(tab) {
          messageToTab(tab.id, {cmd:'added', username:this.props.username});
        }.bind(this)
      );
    }


    userlistArchive = JSON.stringify(userlist);
    localStorage['userlist'] = userlistArchive; 

    this.setState({check: !this.state.check});
    if (copyButtonTag)
      copyButtonTag.setState({});
  },

  render: function() {
    return (
      <div className="user" key={this.props.username}
      style={{
        color:(this.props.sex)?'darkblue':'red',
        textDecoration: this.state.check ? 'none' : 'line-through'
      }}
      onClick={this.click}>
      {this.props.number}. {this.props.username}
      </div>
      );
  }
});





var KeywordButton = React.createClass({
  getInitialState: function() {
    return {
      disabled: 'disabled'
    };
  },

  click: function() {
    var keywords = JSON.parse(localStorage['masklist']);
    messageToTab(this.state.tabId, {cmd:'get_by_keywords', keywords:keywords}, function(response) {
      if (response && response.status=='OK') {
        mergeUserList(response);
        this.props.main.setState({});
        refreshAllTabs();
      }
    }.bind(this));
  },

  componentDidMount: function() {
    getCurrentTabUrl(function(url, tabId) {
      if (url.match("leprosorium.ru/comments/")) {
        this.setState({disabled:''});
        this.setState({tabId: tabId});
      }
    }.bind(this));
  },

  render: function() {
    return (
      <button className="menu" onClick={this.click} disabled={this.state.disabled}>
        + "инбокс"
      </button>
    );
  }
});


function mergeUserList(response) {
  userlist = localStorage['userlist'];

  if (userlist) {
    userlist = JSON.parse(userlist);
  }
  _.assign(userlist, response.userlist);
  userlistArchive = JSON.stringify(userlist);
  localStorage['userlist'] = userlistArchive;
}


function refreshAllTabs() {
    // Обновить все активные страницы
  forTabsWithUrl("leprosorium.ru/comments/",
  function(tab) {
    messageToTab(tab.id, {cmd:'refresh'});
  }.bind(this)
  );
}

var AllButton = React.createClass({
  getInitialState: function() {
    return {
      disabled: 'disabled'
    };
  },

  click: function() {
    messageToTab(this.state.tabId, {cmd:'get_user_list'}, function(response) {
      if (response && response.status=='OK') {
        mergeUserList(response);
        this.props.main.setState({});
        
        // Обновить все активные страницы
        refreshAllTabs();
      }
    }.bind(this));
  },

  componentDidMount: function() {
    getCurrentTabUrl(function(url, tabId) {
      if (url.match("leprosorium.ru/comments/")) {
        this.setState({disabled:''});
        this.setState({tabId: tabId});
      }
    }.bind(this));
  },

  render: function() {
    return (
      <button className="menu" onClick={this.click} disabled={this.state.disabled}>
        + Всех
      </button>
    );
  }
});



var ClearButton = React.createClass({
  click: function() {
    // console.log('reset');
    userlist = {};
    userlistArchive = JSON.stringify(userlist);
    localStorage['userlist'] = userlistArchive;
    this.props.main.setState({});
    forTabsWithUrl("leprosorium.ru/comments/",
      function(tab) {
        messageToTab(tab.id, {cmd:'clear'});
      }.bind(this)
    );
  },

  render: function() {
    return (
      <button className="menu" onClick={this.click}>
        Очистить
      </button>
    );
  }
});



// Удаляет из списка вычеркнутых
var RefreshButton = React.createClass({
  click: function() {
    // console.log(this.props.main);
    this.props.main.setState({});
  },

  render: function() {
    return (
      <button className="menu" onClick={this.click}>
        Обновить
      </button>
    );
  }
});

// Копировать в буфер
var CopyButton = React.createClass({
  click: function() {
    // console.log(this.props.main);
    this.props.main.setState({});
    chrome.runtime.sendMessage({ cmd: 'copy' });
  },
  
  componentDidMount: function() {
    copyButtonTag = this;
  },

  render: function() {
    var userArray = _.sortBy(userlist, ['sex', 'name']);
    return (
      <button className="menu" onClick={this.click} disabled={userArray.length==0 ? 'disabled' : ''}>
        В буфер: <b>{userArray.length}</b>
      </button>
    );
  }
});




var CommentList = React.createClass({
  getInitialState: function() {
    return {
      male: 0,
      female: 0
    };
  },


  render: function() {
    var copyButton = <CopyButton main={this}/>;
    userlist = localStorage['userlist'];

    if (userlist) {
      userlist = JSON.parse(userlist);
      // console.log(userlist);
    }
    userArray = _.sortBy(userlist, ['sex', 'name']);
    var male=0, female=0;
    var commentMaleNodes = [];
    var commentFemaleNodes = [];
    _.forEach(userArray, function(info) {
      if (info.sex) {
        male++;
        commentMaleNodes.push(
          <UserRow key={info.name} username={info.name} sex={info.sex} number={male}/>
        );
      } else {
        female++;
        commentFemaleNodes.push(
          <UserRow key={info.name} username={info.name} sex={info.sex} number={female}/>
        );
      }
    });
    this.state.male = male;
    this.state.female = female;

    return (
      <div>
      <h4>Список для инбокса -> {copyButton}</h4>
      <AllButton main={this}/>
      <KeywordButton main={this}/>
      <RefreshButton main={this}/>
      <ClearButton main={this}/>
      <div >
        <table className='header'>
          <tr>
            <td className='malebox'><img src="img/male.png" className='seximg'/> {this.state.male}</td>
            <td className='femalebox'><img src="img/female.png" className='seximg'/> {this.state.female}</td>
          </tr>
        </table>

      <div style={{overflow: 'scroll', overflowX:'hidden', maxHeight:'400px'}}>
      <table className="userlist" >
        <tbody>
        <tr style={{verticalAlign: 'top'}}>
          <td className="column">
          {commentMaleNodes}</td>
          <td className="column">
          {commentFemaleNodes}</td>
        </tr>
        </tbody>
      </table>
      </div>
      </div>
      </div>
    );
  }
});


$(function(){
      ReactDOM.render(
        <CommentList />,
        document.getElementById('status')
      );
});