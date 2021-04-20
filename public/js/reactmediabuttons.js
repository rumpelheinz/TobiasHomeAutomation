'use strict';

// const { setConstantValue } = require("typescript");

// const e = React.createElement;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ConsoleLine = function (_React$Component) {
  _inherits(ConsoleLine, _React$Component);

  function ConsoleLine(props) {
    _classCallCheck(this, ConsoleLine);

    return _possibleConstructorReturn(this, (ConsoleLine.__proto__ || Object.getPrototypeOf(ConsoleLine)).call(this, props));
  }

  _createClass(ConsoleLine, [{
    key: "escapeCharacters",
    value: function escapeCharacters(inp) {
      return inp.replace("\r\n", "<a class='escapern'>↵</a>").replace("\r", "<a class='escaper'>↵</a>").replace("\n", "<a class='escaper'>↵</a>").replace("\0", "<a class='escapeo'>\0</a>");
    }
  }, {
    key: "render",
    value: function render() {
      return (
        // <div className="logentry">{this.escapeCharacters(this.props.mstring)}</div>
        React.createElement(
          "div",
          { className: "logentry" },
          window.HTMLReactParser(this.escapeCharacters(this.props.mstring))
        )
      );
    }
  }]);

  return ConsoleLine;
}(React.Component);

var TerminalInputLine = function (_React$Component2) {
  _inherits(TerminalInputLine, _React$Component2);

  function TerminalInputLine(props) {
    _classCallCheck(this, TerminalInputLine);

    var _this2 = _possibleConstructorReturn(this, (TerminalInputLine.__proto__ || Object.getPrototypeOf(TerminalInputLine)).call(this, props));

    _this2.state = { value: "" };
    _this2.handleInput = _this2.handleInput.bind(_this2);
    _this2.onChange = _this2.onChange.bind(_this2);
    return _this2;
  }

  _createClass(TerminalInputLine, [{
    key: "handleInput",
    value: function handleInput(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        this.props.terminalsocket.emit("send", this.state.value);
      }
    }
  }, {
    key: "onChange",
    value: function onChange(event) {
      this.setState({ value: this.escapeCharacters(event.target.value) });
    }
  }, {
    key: "escapeCharacters",
    value: function escapeCharacters(inp) {
      return inp.replace("\\r", "ρ").replace("\\n", "↵").replace("\0", "◊");
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { style: { display: "flex", color: "red" } },
        React.createElement("input", { placeholder: "Send to arduino", onKeyUp: this.handleInput, onChange: this.onChange, value: this.state.value, id: "textfield" }),
        React.createElement(
          "div",
          { id: "sendbutton", className: "valign-wrapper " },
          React.createElement(
            "i",
            { className: "material-icons" },
            "play_arrow"
          )
        )
      );
    }
  }]);

  return TerminalInputLine;
}(React.Component);

var Console = function (_React$Component3) {
  _inherits(Console, _React$Component3);

  function Console(props) {
    _classCallCheck(this, Console);

    var _this3 = _possibleConstructorReturn(this, (Console.__proto__ || Object.getPrototypeOf(Console)).call(this, props));

    _this3.count = 4;
    _this3.messagesEndRef = React.createRef();

    _this3.scrollToBottom = function () {
      _this3.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    var socket = void 0;
    if (props.terminalsocket) {
      socket = terminalsocket;
    } else {
      socket = io.connect('/terminal');
    }
    _this3.socket = socket;
    _this3.state = {
      list: [],
      name: "console",
      currentstring: ""
    };
    _this3.socket.on('received', function (e) {
      return _this3.add(e);
    });
    return _this3;
  }

  _createClass(Console, [{
    key: "add",
    value: function add(e) {
      var newcurrentstring = this.state.currentstring;
      var newList = this.state.list;
      for (var i in e) {
        newcurrentstring += e[i];
        if (e[i] === "\n") {
          newList = newList.concat({ name: React.createElement(ConsoleLine, { key: this.count++, mstring: newcurrentstring }) });
          newcurrentstring = "";
        }
      }
      if (newList.length > 30) {
        newList.shift();
      }
      this.setState({
        list: newList,
        currentstring: newcurrentstring
      });
      // document.getElementById("log").scrollTop = document.getElementById("log").scrollHeight;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.scrollToBottom();
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "row logcontainer" },
        React.createElement(
          "div",
          { className: "row mlogcontainer scrollbar" },
          React.createElement(
            "div",
            { className: "col s12 log", id: "log" },
            this.state.name,
            this.state.list.map(function (item) {
              return item.name;
            }),
            React.createElement(
              "div",
              { ref: this.messagesEndRef },
              this.state.currentstring
            )
          )
        ),
        React.createElement(TerminalInputLine, { terminalsocket: this.socket })
      );
    }
  }]);

  return Console;
}(React.Component);

// function sendinput() {
//   console.log(input.value);
//   terminalsocket.emit("send", input.value)
// }

// document.getElementById("sendbutton").onclick = sendinput;
// var input = document.getElementById("textfield");
// input.addEventListener("keyup", function (event) {
//   if (event.keyCode === 13) {
//     event.preventDefault();
//     sendinput();
//   }
// });


var consolecontainer = document.querySelector('#console_container');
ReactDOM.render(React.createElement(Console), consolecontainer);