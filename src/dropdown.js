/*!
 * IconicDropdown v0.1.0
 * Licence:  MIT
 * (c) 2021 Sidney Wimart.
 */

/**
 * @version IconicDropdown v0.1.0
 * @licence  MIT
 */

const arrowDown = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#656565" viewBox="0 0 960 560"  xml:space="preserve">
    <g id="arrowDown">
        <path d="M480,344.181L268.869,131.889c-15.756-15.859-41.3-15.859-57.054,0c-15.754,15.857-15.754,41.57,0,57.431l237.632,238.937   c8.395,8.451,19.562,12.254,30.553,11.698c10.993,0.556,22.159-3.247,30.555-11.698l237.631-238.937   c15.756-15.86,15.756-41.571,0-57.431s-41.299-15.859-57.051,0L480,344.181z"/>
    </g>
<script xmlns=""/></svg>
`;

/**
 * ScrollIntoView - This small utility reproduces the behavior of .scrollIntoView({ block: "nearest", inline: "nearest" })
 * This is for IE compatibility without a need of a polyfill
 * (c) 2021 Sidney Wimart.
 */
const scrollIntoView = (parent, child) => {
  const rectParent = parent.getBoundingClientRect();
  const rectChild = child.getBoundingClientRect();

  // Detect if not visible at top and then scroll to the top
  if (!(rectParent.top < rectChild.bottom - child.offsetHeight)) {
    parent.scrollTop = child.clientHeight + (child.offsetTop - child.offsetHeight);
  }

  // Detect if not visible at bottom and then scroll to the bottom
  if (!(rectParent.bottom > rectChild.top + child.offsetHeight)) {
    parent.scrollTop =
      child.clientHeight +
      (child.offsetTop - child.offsetHeight) -
      (parent.offsetHeight - (child.offsetHeight + (child.offsetHeight - child.clientHeight)));
  }
};

class IconicDropdown {
  customCss;
  data;
  domElements;
  event;
  noResults;
  options;
  placeholder;
  prefix = "iconic" + Math.floor(1000 + Math.random() * 9000) + "-";
  selectContainer;
  selected;
  textField;
  valueField;

  constructor({ customCss, data, noData, noResults, placeholder, select, textField, valueField }) {
    this.customCss = customCss;
    this.data = data ?? [];
    this.noData = noData ?? "No data.";
    this.noResults = noResults ?? "No results found.";
    this.placeholder = placeholder ?? "Select...";
    this.selectContainer = document.querySelector(select);
    this.textField = textField ?? null;
    this.valueField = valueField ?? null;
  }

  /**
   * Initialize the dropdown component.
   * @public
   */
  init() {
    if (this.selectContainer && this.selectContainer.nodeName === "SELECT") {
      this.options = this._getDataFromSettings() || this._getDataFromSelectTag();

      this._injectCss();
      this._renderDropdown();
      this._renderOptionsList();

      this.domElements = {
        arrow: document.querySelector(`.${this.prefix}dropdown__arrow`),
        options: document.querySelectorAll(`li[data-value]`),
        optionsContainer: document.querySelector(`.${this.prefix}dropdown__options`),
        optionsList: document.querySelector(`.${this.prefix}dropdown__options ul`),
        input: document.querySelector(`.${this.prefix}dropdown__input`),
        text: document.querySelector(`.${this.prefix}dropdown__text`),
      };

      this._enableEventListenners();
    }
  }

  /**
   * Subscribes to the emitted events.
   * @param { Function } callback - Callback function which emits a custom event object.
   * @public
   */
  subscribe(callback) {
    if (typeof callback === "function") {
      this.event = callback;
    } else {
      throw new Error(`parameter in the subscribe method is not a function`);
    }
  }

  /**
   * Close the popup list.
   * @private
   */
  _closeOptionsList() {
    document.activeElement.blur();
    this._removeAllArrowSelected();
    this.domElements.arrow.classList.remove("open");
    if (this.selected) this.domElements.input.placeholder = "";
    this.domElements.input.value = "";
    this.domElements.optionsContainer.classList.remove("visible");
    this.domElements.text.style.visibility = "visible";
  }

  /**
   * Dispatches new events.
   * @param { object : { action: string; selection: { option: string; text: string; }[]; value?: string; } } event
   * @private
   */
  _dispatchEvent(event) {
    this.event(event);
  }

  /**
   * Enables all main event listenners.
   * @private
   */
  _enableEventListenners() {
    document.addEventListener("mouseup", ({ target }) => {
      const container = document.getElementById("iconic7878-dropdown");
      if (!container.contains(target)) {
        this._filterOptions("");
        this._closeOptionsList();
      }
    });

    for (let i = 0; i < this.domElements.options.length; i++) {
      const option = this.domElements.options[i];
      option.addEventListener("click", ({ target }) => {
        this._handleOption(target);
        this._filterOptions("");
        this._closeOptionsList();
      });
    }

    this.domElements.arrow.addEventListener("click", () => {
      this._toggleArrowDirection();
      this._toggleOptionsList();
    });

    this.domElements.input.addEventListener("input", ({ target: { value } }) => {
      if (value.length > 0) {
        this.domElements.text.style.visibility = "hidden";
      } else {
        this.domElements.text.style.visibility = "visible";
      }

      this._filterOptions(value);
    });

    this.domElements.input.addEventListener("focus", () => {
      this.domElements.input.placeholder = "";
      this.domElements.text.style.opacity = "0.6";
      this.domElements.arrow.classList.add("open");
      this.domElements.optionsContainer.classList.add("visible");
    });

    this.domElements.input.addEventListener("focusout", () => {
      this.domElements.text.style.opacity = "1";

      if (!this.selected) {
        this.domElements.input.placeholder = this.placeholder;
      }
    });

    this.domElements.input.addEventListener("keydown", (e) => {
      this._handleArrows(e);
      this._handleEnter(e);
    });
  }

  /**
   * Filters user input.
   * @param { string } value
   * @private
   */
  _filterOptions(value) {
    const isOpen = this.domElements.optionsContainer.classList.contains("visible");
    const valueLowerCase = value.toLowerCase();
    let hasResults = false;

    if (!isOpen && value.length > 0) {
      this.domElements.optionsContainer.classList.add("visible");
      this.domElements.arrow.classList.add("open");
    }

    if (this.domElements.options.length > 0) {
      for (let i = 0; i < this.domElements.options.length; i++) {
        const el = this.domElements.options[i];
        if (el.textContent.toLowerCase().substring(0, valueLowerCase.length) === valueLowerCase) {
          this.domElements.optionsList.appendChild(el);
        } else {
          el.parentNode && el.parentNode.removeChild(el);
        }
      }

      for (let i = 0; i < this.domElements.options.length; i++) {
        const el = this.domElements.options[i];
        if (el.textContent.toLowerCase().substring(0, valueLowerCase.length) === valueLowerCase) {
          hasResults = true;
          break;
        }
      }

      this._showNoResults(!hasResults);
    }
  }

  /**
   * Gets data from select tag.
   * @private
   */
  _getDataFromSelectTag() {
    const arr = [];
    const { options } = this.selectContainer;
    for (let i = 0; i < options.length; i++) {
      arr.push({
        text: options[i].text,
        value: options[i].value,
      });
    }
    return arr;
  }

  /**
   * Gets data from settings.
   * @private
   */
  _getDataFromSettings() {
    if (this.data.length > 0 && this.valueField && this.textField) {
      const isValueFieldValid = typeof this.valueField === "string";
      const isTextFieldValid = typeof this.textField === "string";
      const arr = [];

      if (!isValueFieldValid || !isTextFieldValid) {
        throw new Error("textField and valueField must be of type string");
      }

      for (let i = 0; i < this.data.length; i++) {
        const item = this.data[i];
        arr.push({
          value: item[this.valueField],
          text: item[this.textField],
        });
      }
      return arr;
    } else {
      return null;
    }
  }

  /**
   * Handles Arrow up & Down. Selection of an option is also possible with these keys.
   * @param { Event } event
   * @private
   */
  _handleArrows(event) {
    if (event.keyCode === 40 || event.keyCode === 38) {
      const isOpen = this.domElements.optionsContainer.classList.contains("visible");
      // An updated view of the container is needed because of the filtering option
      const optionsList = document.querySelector(`.${this.prefix + "dropdown__options > ul"}`);

      if (!isOpen) {
        this.domElements.optionsContainer.classList.add("visible");
        this.domElements.arrow.classList.add("open");
        optionsList.firstElementChild.classList.add("arrow-selected");
        optionsList.firstElementChild.scrollIntoView();
      } else {
        let selected = document.querySelector(`.${this.prefix}dropdown__options ul li.arrow-selected`);
        const action = { ArrowUp: "previous", Up: "previous", ArrowDown: "next", Down: "next" };

        if (!selected) {
          optionsList.firstElementChild.classList.add("arrow-selected");
          optionsList.firstElementChild.scrollIntoView();
          return;
        }

        selected.classList.remove("arrow-selected");

        selected = selected[action[event.key] + "ElementSibling"];

        // Go to start or end of the popup list
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

  /**
   * Handles the enter key event.
   * @param { Event } event
   * @private
   */
  _handleEnter(event) {
    if (event.keyCode === 13) {
      const selected = document.querySelector(`.${this.prefix}dropdown__options ul li.arrow-selected`);
      if (selected) {
        this._handleOption(selected);
        this._closeOptionsList();
        this._filterOptions("");
      }
    }
  }

  _handleOption(target) {
    for (let i = 0; i < this.domElements.options.length; i++) {
      const option = this.domElements.options[i];
      if (option === target) {
        option.classList.add("selected");
        this.selected = option;
        this.domElements.text.innerHTML = option.textContent;
        this._dispatchEvent({
          value: option.dataset.value,
          text: option.textContent,
        });
      } else {
        option.classList.remove("selected");
      }
    }
  }

  /**
   * Removes arrow-selected class from options.
   * @param { Event } event
   * @private
   */
  _removeAllArrowSelected() {
    const className = "arrow-selected";
    for (let i = 0; i < this.domElements.options.length; i++) {
      const el = this.domElements.options[i];
      if (el.classList.contains(className)) {
        el.classList.remove(className);
      }
    }
  }

  /**
   * Renders the dropdown component.
   * @private
   */
  _renderDropdown() {
    this.selectContainer.style.display = "none";
    const html = `
    <div id="iconic7878-dropdown" class="${this.prefix + "dropdown__container"}">
      <input class="${this.prefix + "dropdown__input"}" placeholder="${this.placeholder}" />
      <span class="${this.prefix + "dropdown__text"}"></span>
      <span class="${this.prefix + "dropdown__arrow"}">${arrowDown}</span>
    </div>
  `;
    this.selectContainer.insertAdjacentHTML("afterend", html);
  }

  /**
   * Renders the dropdown options list view.
   * @private
   */
  _renderOptionsList() {
    const html = `
        <div class="${this.prefix}dropdown__options">
            <ul>
            ${
              this.options.length > 0
                ? this.options
                    .map((option) => {
                      return `
                <li data-value="${option.value}">${option.text}</li>
            `;
                    })
                    .join("")
                : ""
            }
            ${this._showNoData(this.options.length === 0)}
            </ul>
        </div>
    `;
    document.querySelector(`.${this.prefix + "dropdown__container"}`).insertAdjacentHTML("beforeend", html);
  }

  /**
   * Shows a no data message.
   * @param { boolean } condition
   * @private
   */
  _showNoData(condition) {
    return condition ? `<li class="${this.prefix}dropdown__no-data">${this.noData}</li>` : "";
  }

  /**
   * Shows a no results message.
   * @param { boolean } condition
   * @private
   */
  _showNoResults(condition) {
    const dom = document.querySelector(`.${this.prefix}dropdown__filter-no-results`);
    if (condition) {
      const html = `<li class="${this.prefix}dropdown__filter-no-results">${this.noResults}</span>`;
      !dom && this.domElements.optionsList.insertAdjacentHTML("beforeend", html);
    } else {
      dom && dom.parentNode && dom.parentNode.removeChild(dom);
    }
  }

  _toggleArrowDirection() {
    this.domElements.arrow.classList.toggle("open");
  }

  _toggleOptionsList() {
    this.domElements.optionsContainer.classList.toggle("visible");
  }

  _injectCss() {
    const css = `
    <style>
    .${this.prefix}dropdown__container {
      -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
      background-color: #fff;
      border-radius: 2px;
      -webkit-box-shadow: 0 1px 3px 0 #d1d1d2, 0 0 0 1px #d1d1d2;
              box-shadow: 0 1px 3px 0 #d1d1d2, 0 0 0 1px #d1d1d2;
      -webkit-box-sizing: border-box;
              box-sizing: border-box;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      font-family: Arial,Helvetica,sans-serif;
      height: 36px;
      padding: 0 12px;
      position: relative;
      width: 354px;
    }

    .${this.prefix}dropdown__container:after {
      content:'';
      min-height:inherit;
      font-size:0;
    }

    .${this.prefix}dropdown__container > * {
      color: #656565;
      font-size: 14px;
    }

    .${this.prefix}dropdown__arrow {
      cursor: pointer;
      margin-left: auto;
      display: flex;
      z-index: 2;
      transition: transform 0.2s;
    }

    .${this.prefix}dropdown__arrow.open {
      transform: rotate(-180deg);
    }

    .${this.prefix}dropdown__arrow > svg {
      width: 24px;
      height: 100%;
    }

    .${this.prefix}dropdown__input {
      height: 100%;
      width: 100%;
      padding: 0;
      border: none;
      outline: none;
      background: transparent;
      z-index: 2;
    }

    .${this.prefix}dropdown__text {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      position: absolute;
      transform: translateY(-50%);
      padding: 0 12px;
      left: 0;
      top: 50%;
      z-index: 1;
    }

    .${this.prefix}dropdown__options {
      background-color: #f6f6f6;
      border-radius: 2px;
      left: 0;
      max-height: 0;
      overflow: hidden;
      position: absolute;
      top: calc(100% + 3px);
      width: 100%;
      opacity: 0;
      transition: max-height 0.1s ease;
    }

    .${this.prefix}dropdown__options.visible {
      max-height: 128px;
      -webkit-box-shadow: 0 1px 3px 0 #d1d1d2, 0 0 0 1px #d1d1d2;
      box-shadow: 0 1px 3px 0 #d1d1d2, 0 0 0 1px #d1d1d2;
      opacity: 1;
      transition: max-height 0.2s ease;
    }

    .${this.prefix}dropdown__options ul {
      list-style: none;
      margin: 0;
      padding: 2px 0;
      max-height: 120px;
      overflow: auto;
    }

    .${this.prefix}dropdown__options ul li {
      cursor: pointer;
      padding: 4px 8px;
    }

    .${this.prefix}dropdown__options ul li:hover {
      background-color: #dedede;
    }

    .${this.prefix}dropdown__options ul li.${this.prefix}dropdown__no-data, 
    .${this.prefix}dropdown__options ul li.${this.prefix}dropdown__filter-no-results {
      cursor: default;
      margin: 0;
      padding: 8px;
      text-align: center;
    }

    .${this.prefix}dropdown__options ul li.arrow-selected {
      border: 2px solid rgba(101, 101, 101, 0.5);
    }

    .${this.prefix}dropdown__options ul li.selected {
      background-color: #ff6358;
      color: #fff;
    }

    .${this.prefix}dropdown__options ul li.selected:hover {
      background-color: #eb5b51;
    }

    .${this.prefix}dropdown__options ul li.${this.prefix}dropdown__no-data:hover, 
    .${this.prefix}dropdown__options ul li.${this.prefix}dropdown__filter-no-results:hover {
      background-color: inherit;
    }
    `;

    if (!this.customCss) document.querySelector("head").insertAdjacentHTML("beforeend", css);
    if (this.customCss) this.prefix = "";
  }
}
