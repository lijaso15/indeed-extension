/*global chrome*/

import React from "react";
import "./App.css";

Object.prototype.renameProperty = function(oldName, newName) {
  // Do nothing if the names are the same
  if (oldName == newName) {
    return this;
  }
  // Check for the old property name to avoid a ReferenceError in strict mode.
  if (this.hasOwnProperty(oldName)) {
    this[newName] = this[oldName];
    delete this[oldName];
  }
  return this;
};

class Box extends React.Component {
  constructor(props) {
    super(props);
    this.getSelection = this.getSelection.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.clearData = this.clearData.bind(this);
  }

  componentDidMount() {
    chrome.storage.local.get([this.props.name], data => {
      this.data = document.querySelector("#" + this.props.name);
      this.data.value += data[this.props.name] ? data[this.props.name] : "";
    });
  }

  getSelection() {
    chrome.storage.local.get("selection", data => {
      console.log(this.data.value);
      console.log(data.selection);

      if (this.data.value) {
        this.data.value += "\n" + data.selection;
      } else {
        this.data.value += data.selection;
      }
    });
  }

  setSelection() {
    const a = {
      a: this.data.value
    };
    a.renameProperty("a", this.props.name);
    chrome.storage.local.set(a, () => {});
  }

  clearData() {
    this.data.value = "";
    const a = { a: "" };

    a.renameProperty("a", this.props.name);

    chrome.storage.local.set(a, function() {});
  }

  render() {
    return (
      <div style={{ width: "260px" }}>
        <button onClick={this.getSelection}> get {this.props.name} </button>
        <button onClick={this.setSelection}> set {this.props.name} </button>
        <button id="clear" onClick={this.clearData}>
          {" "}
          clear{" "}
        </button>
        <textarea
          style={{ width: "260px" }}
          id={this.props.name}
          rows={this.props.name === "Requirements" ? "10" : "1"}
        />
      </div>
    );
  }
}

class Inject extends React.Component {
  constructor(props) {
    super(props);
    this.runScripts = this.runScripts.bind(this);
  }

  runScripts() {
    const position = document.querySelector("#Position").value;
    const company = document.querySelector("#Company").value;
    const requirements = document
      .querySelector("#Requirements")
      .value.replace(/\n/g, "$");

    chrome.tabs.query({ url: "https://docs.google.com/*/edit" }, function(
      tabs
    ) {
      tabs.forEach(function(tab) {
        chrome.tabs.executeScript(tab.id, {
          code:
            "const pos = document.evaluate(\"//span[contains(.,'[POSITION]')]\", document, null, XPathResult.ANY_TYPE, null ).iterateNext(); \
              pos.innerText = pos.innerText.replace('[POSITION]', '" +
            position +
            "');  \
              const com = document.evaluate(\"//span[contains(.,'[COMPANY1]')]\", document, null, XPathResult.ANY_TYPE, null ).iterateNext(); \
              com.innerText = com.innerText.replace('[COMPANY1]', '" +
            company +
            "'); \
            const co = document.evaluate(\"//span[contains(.,'[COMPANY2]')]\", document, null, XPathResult.ANY_TYPE, null ).iterateNext(); \
            co.innerText = co.innerText.replace('[COMPANY2]', '" +
            company +
            "'); \
              const req = document.evaluate(\"//span[contains(.,'[REQUIREMENTS]')]\", document, null, XPathResult.ANY_TYPE, null ).iterateNext(); \
              req.innerText = req.innerText.replace('[REQUIREMENTS]', '" +
            requirements +
            "'.replace(/" +
            "\\" +
            "$/g, '\\" +
            "n● '));"
        });
      });
    });
  }

  render() {
    return (
      <button onClick={this.runScripts}>
        Inject to Resume and Cover Letter
      </button>
    );
  }
}

function App() {
  return (
    <div>
      <Box name="Position" />
      <Box name="Company" />
      <Box name="Requirements" />
      <Inject> </Inject>
    </div>
  );
}

export default App;
