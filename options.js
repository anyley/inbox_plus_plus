var React = require('react');
var ReactDOM = require('react-dom');

var maskList;

var Mask = React.createClass({


  change: function() {
  	console.log(this.refs.userInput.value);
  	maskList[this.props.idx-1] = this.refs.userInput.value;
  	var maskArray = JSON.stringify(maskList);
  	localStorage['masklist'] = maskArray;
  },

  render: function() {
    return (
      <p>
      	Строка #{this.props.idx}: 
      	<input ref="userInput" type="text" size="50" defaultValue={this.props.text} onChange={this.change}/>
      </p>
    );
  }
});


var Options = React.createClass({
  render: function() {
  	maskList = localStorage['masklist'];
  	if (maskList) maskList = JSON.parse(maskList);
  	if (!maskList) maskList = ['inbox','инбокс','запиши','',''];
  	var maskTagList = [];
  	for(i=0; i<5; i++) {
  		maskTagList.push( <Mask text={maskList[i]} key={i} idx={i+1}/> );
  	}

    return (
      <div>
        {maskTagList}
      </div>
    );
  }
});


$(function(){
      ReactDOM.render(
        <Options />,
        document.getElementById('options')
      );
});
