'use strict';

const Cookies = {
  setCookie: function (cname, cvalue, exdays) {
      let d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  ,
  getCookie: function (cname) {
      let name = cname + "=";
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(';');
      for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return "";
  },
  clearCookies: function () {
      setCookie("username", "", -1);
      setCookie("password", "", -1);
      location.reload();
  }
  
}

// const { setConstantValue } = require("typescript");

// const e = React.createElement;

class ConsoleLine extends React.Component {
  constructor(props) {
    super(props);
  }

  escapeCharacters(inp) {
    return inp.replace("\r\n", "<a class='escapern'>↵</a>")
      .replace("\r", "<a class='escaper'>↵</a>")
      .replace("\n", "<a class='escaper'>↵</a>")
      .replace("\0", "<a class='escapeo'>\0</a>")
  }


  render() {
    return (
      // <div className="logentry">{this.escapeCharacters(this.props.mstring)}</div>
      <div className="logentry">
        {window.HTMLReactParser(this.escapeCharacters(this.props.mstring))}
      </div>
    );
  }
}

class TerminalInputLine extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };
    this.handleInput = this.handleInput.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  handleInput(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.props.terminalsocket.emit("send", this.state.value)
    }
  }

  onChange(event) {
    this.setState({ value: this.escapeCharacters(event.target.value) });
  }

  escapeCharacters(inp) {
    return inp.replace("\\r", "ρ")
      .replace("\\n", "↵")
      .replace("\0", "◊")
  }
  render() {
    return (
      <div style={{ display: "flex", color: "red" }} >
        <input placeholder="Send to arduino" onKeyUp={this.handleInput} onChange={this.onChange} value={this.state.value} id="textfield" />
        <div id="sendbutton" className="valign-wrapper ">
          <i className="material-icons" >play_arrow</i>
        </div>
      </div>
    )
  }
}

class Console extends React.Component {
  count = 4;
  messagesEndRef = React.createRef()

  constructor(props) {
    super(props);
    let socket;
    if (props.terminalsocket) {
      socket = terminalsocket;
    }
    else {
      socket =io("/terminal", {
        auth: {
          token: "test",
          password: Cookies.getCookie("password"),
          username: Cookies.getCookie("username")
        }
      })
    }
    this.socket = socket;
    this.state = {
      list: [],
      name: "console",
      currentstring: ""
    };
    this.socket.on('received', (e) => this.add(e))
  }
  add(e) {
    let newcurrentstring = this.state.currentstring;
    let newList = this.state.list
    for (let i in e) {
      newcurrentstring += e[i];
      if (e[i] === "\n") {
        newList = newList.concat({ name: <ConsoleLine key={this.count++} mstring={newcurrentstring} /> })
        newcurrentstring = ""
      }
    }
    if (newList.length > 30) {
      newList.shift();
    }
    this.setState({
      list: newList,
      currentstring: newcurrentstring
    })
    // document.getElementById("log").scrollTop = document.getElementById("log").scrollHeight;

  }
  scrollToBottom = () => {
    this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }
  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div className="row logcontainer">
        <div className="row mlogcontainer scrollbar" >
          <div className="col s12 log" id='log'>
            {this.state.name}
            {this.state.list.map((item) => (
              item.name
            ))}
            <div ref={this.messagesEndRef}>{this.state.currentstring}</div>
              
          </div>
        </div>
        <TerminalInputLine terminalsocket={this.socket} />
      </div>

    )
  }
}

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



const consolecontainer = document.querySelector('#console_container');
ReactDOM.render(React.createElement(Console), consolecontainer);





