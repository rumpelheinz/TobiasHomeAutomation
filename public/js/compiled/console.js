'use strict';

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Cookies = {
  setCookie: function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  },
  getCookie: function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];

      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }

      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }

    return "";
  },
  clearCookies: function clearCookies() {
    setCookie("username", "", -1);
    setCookie("password", "", -1);
    location.reload();
  }
}; // const { setConstantValue } = require("typescript");
// const e = React.createElement;

var ConsoleLine = /*#__PURE__*/function (_React$Component) {
  _inherits(ConsoleLine, _React$Component);

  var _super = _createSuper(ConsoleLine);

  function ConsoleLine(props) {
    _classCallCheck(this, ConsoleLine);

    return _super.call(this, props);
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
        /*#__PURE__*/
        // <div className="logentry">{this.escapeCharacters(this.props.mstring)}</div>
        React.createElement("div", {
          className: "logentry"
        }, window.HTMLReactParser(this.escapeCharacters(this.props.mstring)))
      );
    }
  }]);

  return ConsoleLine;
}(React.Component);

var TerminalInputLine = /*#__PURE__*/function (_React$Component2) {
  _inherits(TerminalInputLine, _React$Component2);

  var _super2 = _createSuper(TerminalInputLine);

  function TerminalInputLine(props) {
    var _this;

    _classCallCheck(this, TerminalInputLine);

    _this = _super2.call(this, props);
    _this.state = {
      value: ""
    };
    _this.handleInput = _this.handleInput.bind(_assertThisInitialized(_this));
    _this.onChange = _this.onChange.bind(_assertThisInitialized(_this));
    return _this;
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
      this.setState({
        value: this.escapeCharacters(event.target.value)
      });
    }
  }, {
    key: "escapeCharacters",
    value: function escapeCharacters(inp) {
      return inp.replace("\\r", "ρ").replace("\\n", "↵").replace("\0", "◊");
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          color: "red"
        }
      }, /*#__PURE__*/React.createElement("input", {
        placeholder: "Send to arduino",
        onKeyUp: this.handleInput,
        onChange: this.onChange,
        value: this.state.value,
        id: "textfield"
      }), /*#__PURE__*/React.createElement("div", {
        id: "sendbutton",
        className: "valign-wrapper "
      }, /*#__PURE__*/React.createElement("i", {
        className: "material-icons"
      }, "play_arrow")));
    }
  }]);

  return TerminalInputLine;
}(React.Component);

var Console = /*#__PURE__*/function (_React$Component3) {
  _inherits(Console, _React$Component3);

  var _super3 = _createSuper(Console);

  function Console(props) {
    var _this2;

    _classCallCheck(this, Console);

    _this2 = _super3.call(this, props);

    _defineProperty(_assertThisInitialized(_this2), "count", 4);

    _defineProperty(_assertThisInitialized(_this2), "messagesEndRef", React.createRef());

    _defineProperty(_assertThisInitialized(_this2), "scrollToBottom", function () {
      _this2.messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    });

    var socket;

    if (props.terminalsocket) {
      socket = terminalsocket;
    } else {
      socket = io("/terminal", {
        auth: {
          token: "test",
          password: Cookies.getCookie("password"),
          username: Cookies.getCookie("username")
        }
      });
    }

    _this2.socket = socket;
    _this2.state = {
      list: [],
      name: "console",
      currentstring: ""
    };

    _this2.socket.on('received', function (e) {
      return _this2.add(e);
    });

    return _this2;
  }

  _createClass(Console, [{
    key: "add",
    value: function add(e) {
      var newcurrentstring = this.state.currentstring;
      var newList = this.state.list;

      for (var i in e) {
        newcurrentstring += e[i];

        if (e[i] === "\n") {
          newList = newList.concat({
            name: /*#__PURE__*/React.createElement(ConsoleLine, {
              key: this.count++,
              mstring: newcurrentstring
            })
          });
          newcurrentstring = "";
        }
      }

      if (newList.length > 30) {
        newList.shift();
      }

      this.setState({
        list: newList,
        currentstring: newcurrentstring
      }); // document.getElementById("log").scrollTop = document.getElementById("log").scrollHeight;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.scrollToBottom();
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/React.createElement("div", {
        className: "row logcontainer"
      }, /*#__PURE__*/React.createElement("div", {
        className: "row mlogcontainer scrollbar"
      }, /*#__PURE__*/React.createElement("div", {
        className: "col s12 log",
        id: "log"
      }, this.state.name, this.state.list.map(function (item) {
        return item.name;
      }), /*#__PURE__*/React.createElement("div", {
        ref: this.messagesEndRef
      }, this.state.currentstring))), /*#__PURE__*/React.createElement(TerminalInputLine, {
        terminalsocket: this.socket
      }));
    }
  }]);

  return Console;
}(React.Component); // function sendinput() {
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