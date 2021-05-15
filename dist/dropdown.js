"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*!
 * IconicDropdown v0.1.0
 * Licence:  MIT
 * (c) 2021 Sidney Wimart.
 */

var arrowDown = "\n<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" fill=\"#656565\" viewBox=\"0 0 960 560\"  xml:space=\"preserve\">\n    <g id=\"arrowDown\">\n        <path d=\"M480,344.181L268.869,131.889c-15.756-15.859-41.3-15.859-57.054,0c-15.754,15.857-15.754,41.57,0,57.431l237.632,238.937   c8.395,8.451,19.562,12.254,30.553,11.698c10.993,0.556,22.159-3.247,30.555-11.698l237.631-238.937   c15.756-15.86,15.756-41.571,0-57.431s-41.299-15.859-57.051,0L480,344.181z\"/>\n    </g>\n<script xmlns=\"\"/></svg>\n";
var scrollIntoView = function scrollIntoView(parent, child) {
  var rectParent = parent.getBoundingClientRect();
  var rectChild = child.getBoundingClientRect(); 

  if (!(rectParent.top < rectChild.bottom - child.offsetHeight)) {
    parent.scrollTop = child.clientHeight + (child.offsetTop - child.offsetHeight);
  } 


  if (!(rectParent.bottom > rectChild.top + child.offsetHeight)) {
    parent.scrollTop = child.clientHeight + (child.offsetTop - child.offsetHeight) - (parent.offsetHeight - (child.offsetHeight + (child.offsetHeight - child.clientHeight)));
  }
};

var IconicDropdown = function () {
  function IconicDropdown(_ref) {
    var customCss = _ref.customCss,
        data = _ref.data,
        noData = _ref.noData,
        noResults = _ref.noResults,
        placeholder = _ref.placeholder,
        select = _ref.select,
        textField = _ref.textField,
        valueField = _ref.valueField;

    _classCallCheck(this, IconicDropdown);

    _defineProperty(this, "customCss", void 0);

    _defineProperty(this, "data", void 0);

    _defineProperty(this, "domElements", void 0);

    _defineProperty(this, "event", function () {});

    _defineProperty(this, "noResults", void 0);

    _defineProperty(this, "options", void 0);

    _defineProperty(this, "placeholder", void 0);

    _defineProperty(this, "prefix", "iconic" + Math.floor(1000 + Math.random() * 9000) + "-");

    _defineProperty(this, "selectContainer", void 0);

    _defineProperty(this, "selected", void 0);

    _defineProperty(this, "textField", void 0);

    _defineProperty(this, "valueField", void 0);

    this.customCss = customCss;
    this.data = data !== null && data !== void 0 ? data : [];
    this.noData = noData !== null && noData !== void 0 ? noData : "No data.";
    this.noResults = noResults !== null && noResults !== void 0 ? noResults : "No results found.";
    this.placeholder = placeholder !== null && placeholder !== void 0 ? placeholder : "Select...";
    this.selectContainer = document.querySelector(select);
    this.textField = textField !== null && textField !== void 0 ? textField : null;
    this.valueField = valueField !== null && valueField !== void 0 ? valueField : null;
  }
  _createClass(IconicDropdown, [{
    key: "init",
    value: function init() {
      if (this.selectContainer && this.selectContainer.nodeName === "SELECT") {
        this.options = this._getDataFromSettings() || this._getDataFromSelectTag();

        this._injectCss();

        this._renderDropdown();

        this._renderOptionsList();

        this.domElements = {
          arrow: document.querySelector(".".concat(this.prefix, "dropdown__arrow")),
          options: document.querySelectorAll("li[data-value]"),
          optionsContainer: document.querySelector(".".concat(this.prefix, "dropdown__options")),
          optionsList: document.querySelector(".".concat(this.prefix, "dropdown__options ul")),
          input: document.querySelector(".".concat(this.prefix, "dropdown__input")),
          text: document.querySelector(".".concat(this.prefix, "dropdown__text"))
        };

        this._enableEventListenners();
      }
    }
  }, {
    key: "subscribe",
    value: function subscribe(callback) {
      if (typeof callback === "function") {
        this.event = callback;
      } else {
        throw new Error("parameter in the subscribe method is not a function");
      }
    }
  }, {
    key: "_closeOptionsList",
    value: function _closeOptionsList() {
      document.activeElement.blur();

      this._removeAllArrowSelected();

      this.domElements.arrow.classList.remove("open");
      if (this.selected) this.domElements.input.placeholder = "";
      this.domElements.input.value = "";
      this.domElements.optionsContainer.classList.remove("visible");
      this.domElements.text.style.visibility = "visible";
    }
  }, {
    key: "_dispatchEvent",
    value: function _dispatchEvent(event) {
      this.event(event);
    }
  }, {
    key: "_enableEventListenners",
    value: function _enableEventListenners() {
      var _this = this;

      document.addEventListener("mouseup", function (_ref2) {
        var target = _ref2.target;
        var container = document.getElementById("iconic7878-dropdown");

        if (!container.contains(target)) {
          _this._filterOptions("");

          _this._closeOptionsList();
        }
      });

      for (var i = 0; i < this.domElements.options.length; i++) {
        var option = this.domElements.options[i];
        option.addEventListener("click", function (_ref3) {
          var target = _ref3.target;

          _this._handleOption(target);

          _this._filterOptions("");

          _this._closeOptionsList();
        });
      }

      this.domElements.arrow.addEventListener("click", function () {
        _this._toggleArrowDirection();

        _this._toggleOptionsList();
      });
      this.domElements.input.addEventListener("input", function (_ref4) {
        var value = _ref4.target.value;

        if (value.length > 0) {
          _this.domElements.text.style.visibility = "hidden";
        } else {
          _this.domElements.text.style.visibility = "visible";
        }

        _this._filterOptions(value);
      });
      this.domElements.input.addEventListener("focus", function () {
        _this.domElements.input.placeholder = "";
        _this.domElements.text.style.opacity = "0.6";

        _this.domElements.arrow.classList.add("open");

        _this.domElements.optionsContainer.classList.add("visible");
      });
      this.domElements.input.addEventListener("focusout", function () {
        _this.domElements.text.style.opacity = "1";

        if (!_this.selected) {
          _this.domElements.input.placeholder = _this.placeholder;
        }
      });
      this.domElements.input.addEventListener("keydown", function (e) {
        _this._handleArrows(e);

        _this._handleEnter(e);
      });
    }
  }, {
    key: "_filterOptions",
    value: function _filterOptions(value) {
      var isOpen = this.domElements.optionsContainer.classList.contains("visible");
      var valueLowerCase = value.toLowerCase();
      var hasResults = false;

      if (!isOpen && value.length > 0) {
        this.domElements.optionsContainer.classList.add("visible");
        this.domElements.arrow.classList.add("open");
      }

      if (this.domElements.options.length > 0) {
        for (var i = 0; i < this.domElements.options.length; i++) {
          var el = this.domElements.options[i];

          if (el.textContent.toLowerCase().substring(0, valueLowerCase.length) === valueLowerCase) {
            this.domElements.optionsList.appendChild(el);
          } else {
            el.parentNode && el.parentNode.removeChild(el);
          }
        }

        for (var _i = 0; _i < this.domElements.options.length; _i++) {
          var _el = this.domElements.options[_i];

          if (_el.textContent.toLowerCase().substring(0, valueLowerCase.length) === valueLowerCase) {
            hasResults = true;
            break;
          }
        }

        this._showNoResults(!hasResults);
      }
    }
  }, {
    key: "_getDataFromSelectTag",
    value: function _getDataFromSelectTag() {
      var arr = [];
      var options = this.selectContainer.options;

      for (var i = 0; i < options.length; i++) {
        arr.push({
          text: options[i].text,
          value: options[i].value
        });
      }

      return arr;
    }
  }, {
    key: "_getDataFromSettings",
    value: function _getDataFromSettings() {
      if (this.data.length > 0 && this.valueField && this.textField) {
        var isValueFieldValid = typeof this.valueField === "string";
        var isTextFieldValid = typeof this.textField === "string";
        var arr = [];

        if (!isValueFieldValid || !isTextFieldValid) {
          throw new Error("textField and valueField must be of type string");
        }

        for (var i = 0; i < this.data.length; i++) {
          var item = this.data[i];
          arr.push({
            value: item[this.valueField],
            text: item[this.textField]
          });
        }

        return arr;
      } else {
        return null;
      }
    }
  }, {
    key: "_handleArrows",
    value: function _handleArrows(event) {
      if (event.keyCode === 40 || event.keyCode === 38) {
        var isOpen = this.domElements.optionsContainer.classList.contains("visible"); 

        var optionsList = document.querySelector(".".concat(this.prefix + "dropdown__options > ul"));

        if (!isOpen) {
          this.domElements.optionsContainer.classList.add("visible");
          this.domElements.arrow.classList.add("open");
          optionsList.firstElementChild.classList.add("arrow-selected");
          optionsList.firstElementChild.scrollIntoView();
        } else {
          var selected = document.querySelector(".".concat(this.prefix, "dropdown__options ul li.arrow-selected"));
          var action = {
            ArrowUp: "previous",
            Up: "previous",
            ArrowDown: "next",
            Down: "next"
          };

          if (!selected) {
            optionsList.firstElementChild.classList.add("arrow-selected");
            optionsList.firstElementChild.scrollIntoView();
            return;
          }

          selected.classList.remove("arrow-selected");
          selected = selected[action[event.key] + "ElementSibling"]; 

          if (!selected) {
            selected = optionsList.children[action[event.key] === "next" ? 0 : optionsList.children.length - 1];
            selected.classList.add("arrow-selected");
            scrollIntoView(optionsList, selected);
            return;
          }

          selected.classList.add("arrow-selected");
          scrollIntoView(optionsList, selected);
        }
      }
    }
  }, {
    key: "_handleEnter",
    value: function _handleEnter(event) {
      if (event.keyCode === 13) {
        var selected = document.querySelector(".".concat(this.prefix, "dropdown__options ul li.arrow-selected"));

        if (selected) {
          this._handleOption(selected);

          this._closeOptionsList();

          this._filterOptions("");
        }
      }
    }
  }, {
    key: "_handleOption",
    value: function _handleOption(target) {
      for (var i = 0; i < this.domElements.options.length; i++) {
        var option = this.domElements.options[i];

        if (option === target) {
          option.classList.add("selected");
          this.selected = option;
          this.domElements.text.innerHTML = option.textContent;

          this._dispatchEvent({
            value: option.dataset.value,
            text: option.textContent
          });
        } else {
          option.classList.remove("selected");
        }
      }
    }
  }, {
    key: "_removeAllArrowSelected",
    value: function _removeAllArrowSelected() {
      var className = "arrow-selected";

      for (var i = 0; i < this.domElements.options.length; i++) {
        var el = this.domElements.options[i];

        if (el.classList.contains(className)) {
          el.classList.remove(className);
        }
      }
    }
  }, {
    key: "_renderDropdown",
    value: function _renderDropdown() {
      this.selectContainer.style.display = "none";
      var html = "\n    <div id=\"iconic7878-dropdown\" class=\"".concat(this.prefix + "dropdown__container", "\">\n      <input class=\"").concat(this.prefix + "dropdown__input", "\" placeholder=\"").concat(this.placeholder, "\" />\n      <span class=\"").concat(this.prefix + "dropdown__text", "\"></span>\n      <span class=\"").concat(this.prefix + "dropdown__arrow", "\">").concat(arrowDown, "</span>\n    </div>\n  ");
      this.selectContainer.insertAdjacentHTML("afterend", html);
    }
  }, {
    key: "_renderOptionsList",
    value: function _renderOptionsList() {
      var html = "\n        <div class=\"".concat(this.prefix, "dropdown__options\">\n            <ul>\n            ").concat(this.options.length > 0 ? this.options.map(function (option) {
        return "\n                <li data-value=\"".concat(option.value, "\">").concat(option.text, "</li>\n            ");
      }).join("") : "", "\n            ").concat(this._showNoData(this.options.length === 0), "\n            </ul>\n        </div>\n    ");
      document.querySelector(".".concat(this.prefix + "dropdown__container")).insertAdjacentHTML("beforeend", html);
    }
  }, {
    key: "_showNoData",
    value: function _showNoData(condition) {
      return condition ? "<li class=\"".concat(this.prefix, "dropdown__no-data\">").concat(this.noData, "</li>") : "";
    }
  }, {
    key: "_showNoResults",
    value: function _showNoResults(condition) {
      var dom = document.querySelector(".".concat(this.prefix, "dropdown__filter-no-results"));

      if (condition) {
        var html = "<li class=\"".concat(this.prefix, "dropdown__filter-no-results\">").concat(this.noResults, "</span>");
        !dom && this.domElements.optionsList.insertAdjacentHTML("beforeend", html);
      } else {
        dom && dom.parentNode && dom.parentNode.removeChild(dom);
      }
    }
  }, {
    key: "_toggleArrowDirection",
    value: function _toggleArrowDirection() {
      this.domElements.arrow.classList.toggle("open");
    }
  }, {
    key: "_toggleOptionsList",
    value: function _toggleOptionsList() {
      this.domElements.optionsContainer.classList.toggle("visible");
    }
  }, {
    key: "_injectCss",
    value: function _injectCss() {
      var css = "\n    <style>\n    .".concat(this.prefix, "dropdown__container {\n      -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n      background-color: #fff;\n      border-radius: 2px;\n      -webkit-box-shadow: 0 1px 3px 0 #d1d1d2, 0 0 0 1px #d1d1d2;\n              box-shadow: 0 1px 3px 0 #d1d1d2, 0 0 0 1px #d1d1d2;\n      -webkit-box-sizing: border-box;\n              box-sizing: border-box;\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      font-family: Arial,Helvetica,sans-serif;\n      height: 36px;\n      padding: 0 12px;\n      position: relative;\n      width: 354px;\n    }\n\n    .").concat(this.prefix, "dropdown__container:after {\n      content:'';\n      min-height:inherit;\n      font-size:0;\n    }\n\n    .").concat(this.prefix, "dropdown__container > * {\n      color: #656565;\n      font-size: 14px;\n    }\n\n    .").concat(this.prefix, "dropdown__arrow {\n      cursor: pointer;\n      margin-left: auto;\n      display: flex;\n      z-index: 2;\n      transition: transform 0.2s;\n    }\n\n    .").concat(this.prefix, "dropdown__arrow.open {\n      transform: rotate(-180deg);\n    }\n\n    .").concat(this.prefix, "dropdown__arrow > svg {\n      width: 24px;\n      height: 100%;\n    }\n\n    .").concat(this.prefix, "dropdown__input {\n      height: 100%;\n      width: 100%;\n      padding: 0;\n      border: none;\n      outline: none;\n      background: transparent;\n      z-index: 2;\n    }\n\n    .").concat(this.prefix, "dropdown__text {\n      height: 100%;\n      width: 100%;\n      display: flex;\n      align-items: center;\n      position: absolute;\n      transform: translateY(-50%);\n      padding: 0 12px;\n      left: 0;\n      top: 50%;\n      z-index: 1;\n    }\n\n    .").concat(this.prefix, "dropdown__options {\n      background-color: #f6f6f6;\n      border-radius: 2px;\n      left: 0;\n      max-height: 0;\n      overflow: hidden;\n      position: absolute;\n      top: calc(100% + 3px);\n      width: 100%;\n      opacity: 0;\n      transition: max-height 0.1s ease;\n    }\n\n    .").concat(this.prefix, "dropdown__options.visible {\n      max-height: 128px;\n      -webkit-box-shadow: 0 1px 3px 0 #d1d1d2, 0 0 0 1px #d1d1d2;\n      box-shadow: 0 1px 3px 0 #d1d1d2, 0 0 0 1px #d1d1d2;\n      opacity: 1;\n      transition: max-height 0.2s ease;\n    }\n\n    .").concat(this.prefix, "dropdown__options ul {\n      list-style: none;\n      margin: 0;\n      padding: 2px 0;\n      max-height: 120px;\n      overflow: auto;\n    }\n\n    .").concat(this.prefix, "dropdown__options ul li {\n      cursor: pointer;\n      padding: 4px 8px;\n    }\n\n    .").concat(this.prefix, "dropdown__options ul li:hover {\n      background-color: #dedede;\n    }\n\n    .").concat(this.prefix, "dropdown__options ul li.").concat(this.prefix, "dropdown__no-data, \n    .").concat(this.prefix, "dropdown__options ul li.").concat(this.prefix, "dropdown__filter-no-results {\n      cursor: default;\n      margin: 0;\n      padding: 8px;\n      text-align: center;\n    }\n\n    .").concat(this.prefix, "dropdown__options ul li.arrow-selected {\n      border: 2px solid rgba(101, 101, 101, 0.5);\n    }\n\n    .").concat(this.prefix, "dropdown__options ul li.selected {\n      background-color: #ff6358;\n      color: #fff;\n    }\n\n    .").concat(this.prefix, "dropdown__options ul li.selected:hover {\n      background-color: #eb5b51;\n    }\n\n    .").concat(this.prefix, "dropdown__options ul li.").concat(this.prefix, "dropdown__no-data:hover, \n    .").concat(this.prefix, "dropdown__options ul li.").concat(this.prefix, "dropdown__filter-no-results:hover {\n      background-color: inherit;\n    }\n    ");
      if (!this.customCss) document.querySelector("head").insertAdjacentHTML("beforeend", css);
      if (this.customCss) this.prefix = "";
    }
  }]);

  return IconicDropdown;
}();