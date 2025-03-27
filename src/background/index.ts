import * as mathjs from "mathjs";
import { getSettings } from "../util/utils";

function getLatex() {
  let element = document.querySelector("math-edit-container");
  if (!element) {
    document.execCommand("copy");
    return navigator.clipboard.readText();
  }
  let bounding = element.getBoundingClientRect();

  let e = new MouseEvent("contextmenu", {
    screenX: bounding.x,
    screenY: bounding.y,
    clientX: bounding.x,
    clientY: bounding.y,
    bubbles: true,
    cancelable: true,
    view: element.ownerDocument.defaultView,
    detail: 1,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 2,
    relatedTarget: null,
  });
  element.dispatchEvent(e);

  element = document.querySelector(".copy-latex-ignore-space");
  if (!element) return navigator.clipboard.readText();
  e = new MouseEvent("click", {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    bubbles: true,
    cancelable: true,
    view: element.ownerDocument.defaultView,
    detail: 1,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 2,
    relatedTarget: null,
  });
  element.dispatchEvent(e);

  return navigator.clipboard.readText();
}

function importLatex(value: string) {
  let element = document.querySelector("math-edit-container");
  if (!element) {
    return;
  }
  let bounding = element.getBoundingClientRect();

  let e = new MouseEvent("contextmenu", {
    screenX: bounding.x,
    screenY: bounding.y,
    clientX: bounding.x,
    clientY: bounding.y,
    bubbles: true,
    cancelable: true,
    view: element.ownerDocument.defaultView,
    detail: 1,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 2,
    relatedTarget: null,
  });
  element.dispatchEvent(e);

  element = document.querySelector("ct-item:last-child");
  if (!element) {
    alert("could not find from latex button");
    return;
  }
  e = new MouseEvent("mousedown", {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    bubbles: true,
    cancelable: true,
    view: element.ownerDocument.defaultView,
    detail: 1,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 2,
    relatedTarget: null,
  });
  element.dispatchEvent(e);

  element = document.querySelector("textarea.latex");
  if (!element) return;
  if (value) {
    element.innerHTML = value;
    element = document.querySelector(".ok,.btn-normal:has(> modal-footer)");
    if (!element) return;
    e = new MouseEvent("click", {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      bubbles: true,
      cancelable: true,
      view: element.ownerDocument.defaultView,
      detail: 1,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      button: 2,
      relatedTarget: null,
    });
    element.dispatchEvent(e);
  } else {
    navigator.clipboard.readText().then((w) => {
      (<HTMLInputElement>element).value = w;
      let d = new Event("change", { bubbles: true });
      element.dispatchEvent(d);

      element = document.querySelector(".ok,.btn-normal:has(> modal-footer)");
      if (!element) return;
      bounding = element.getBoundingClientRect();
      e = new MouseEvent("click", {
        screenX: bounding.x,
        screenY: bounding.y,
        clientX: bounding.x,
        clientY: bounding.y,
        bubbles: true,
        cancelable: true,
        view: element.ownerDocument.defaultView,
        detail: 1,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 1,
        relatedTarget: null,
      });
      element.dispatchEvent(e);
    });
  }
}

type element = {
  name: string;
  groups: ("[" | "{")[];
  output: string;
};

const elements: element[] = [
  { name: "frac", groups: ["{", "{"], output: "(($0)/($1))" },
  { name: "\\^", groups: ["{"], output: "^($0)" },
  { name: "_", groups: ["{"], output: "_$0" },
  { name: "sqrt", groups: ["[", "{"], output: "($1)^(1/$0)" },
  { name: "sqrt", groups: ["{"], output: "sqrt($0)" },
  { name: "sin", groups: [], output: "sin" },
  { name: "cos", groups: [], output: "cos" },
  { name: "tan", groups: [], output: "tan" },
  { name: "csc", groups: [], output: "csc" },
  { name: "sec", groups: [], output: "sec" },
  { name: "cot", groups: [], output: "cot" },
  { name: "times", groups: [], output: "*" },
  { name: " ", groups: [], output: " " },
  { name: "div", groups: [], output: "/" },
  { name: "pi", groups: [], output: "pi" },
  { name: "left\\(", groups: [], output: "(" },
  { name: "right\\)", groups: [], output: ")" },
  { name: "mathcal", groups: ["{"], output: "$0" },
  { name: "mathbb", groups: ["{"], output: "$0" },
  { name: "begin{array}", groups: ["{"], output: "" },
  { name: "end{array}", groups: [], output: "" },
  { name: "binom", groups: ["{", "{"], output: "combinations($0,$1)" },
];

function doReplace(element: element, match: RegExpMatchArray): null | string {
  const len = match[0].length;
  const startIndex = match.index;
  let currentIndex = match.index + len;
  const string = match.input;
  let replaceString = element.output;
  for (let i = 0; i < element.groups.length; i++) {
    let currentString = "";
    const o = element.groups[i];
    const c = o === "[" ? "]" : "}";
    console.log(string[currentIndex]);
    if (string[currentIndex] !== o) {
      return string;
    }
    currentIndex++;
    let num = 1;
    for (; currentIndex < string.length; currentIndex++) {
      if (string[currentIndex] === o) {
        num++;
      }
      if (string[currentIndex] === c) {
        num--;
      }
      if (num === 0) {
        break;
      }
      currentString += string[currentIndex];
    }
    currentIndex++;
    if (num !== 0) {
      return null;
    }
    replaceString = replaceString.replace("$" + i, currentString);
  }

  return (
    string.substring(0, startIndex) +
    replaceString +
    string.substring(currentIndex)
  );
}
type matrix = {
  type: string;
  wrapper: string;
};
const matrixes: matrix[] = [
  {
    type: "matrix",
    wrapper: "matrix($0)",
  },
  {
    type: "bmatrix",
    wrapper: "matrix($0)",
  },
  {
    type: "Bmatrix",
    wrapper: "matrix($0)",
  },
  {
    type: "pmatrix",
    wrapper: "matrix($0)",
  },
  {
    type: "vmatrix",
    wrapper: "det(matrix($0))",
  },
  {
    type: "Vmatrix",
    wrapper: "det(matrix($0))",
  },
];

function matrixStuff(string: string): string {
  for (const i of matrixes) {
    const reg = RegExp("\\\\begin{" + i.type + "}", "m");
    let match = string.match(reg);
    const regEnd = RegExp("\\\\end{" + i.type + "}", "m");
    let matchEnd = string.match(regEnd);
    console.log(match);
    let failsafe = 0;
    while (match !== null && failsafe !== 100) {
      failsafe++;
      let matrix: unknown[][] = [];
      let currentA: unknown[] = [];
      let currentN = "";
      let pos = match.index + match[0].length;
      console.log(match, matchEnd);
      for (; pos < matchEnd.index; pos++) {
        if (string[pos] === "&") {
          let number = Number(currentN);
          if (Number.isNaN(number)) {
            currentA.push(currentN);
          } else {
            currentA.push(number);
          }
          currentN = "";
        } else if (string[pos] === "\\" && string[pos + 1] === "\\") {
          pos++;
          let number = Number(currentN);
          if (Number.isNaN(number)) {
            currentA.push(currentN);
          } else {
            currentA.push(number);
          }
          currentN = "";
          matrix.push(currentA);
          currentA = [];
        } else {
          currentN += string[pos];
        }
      }
      let number = Number(currentN);
      if (Number.isNaN(number)) {
        currentA.push(currentN);
      } else {
        currentA.push(number);
      }
      currentN = "";
      matrix.push(currentA);
      currentA = [];
      let result = "[";
      for (let i of matrix) {
        result += "[";
        for (let j of i) {
          if (typeof j === "number") {
            result += j + ",";
          } else if (typeof j === "string") {
            result += j + ",";
          }
        }
        result += "],";
      }
      result += "]";
      let regReplace = RegExp(
        "\\\\begin{" + i.type + "}((.|\n)+?)\\\\end{" + i.type + "}",
        "m"
      );
      console.log(regReplace);
      string = string.replace(regReplace, i.wrapper.replace("$0", result));

      // const temp = doReplace(i, match);
      // if (temp === null) {
      //   console.error("There was an error parsing the latex");
      //   return;
      // }
      // string = temp;
      // console.log(temp);
      console.log(string);
      match = string.match(reg);
      matchEnd = string.match(regEnd);
    }
  }
  return string;
}

function parse(latex: string): string {
  let output = latex; //latex.replace(/\s|\\\s/g, " ");
  output = output.replace(/([\^_])/g, "\\$1");
  output = output.replace(/([0-9]),([0-9])/g, "$1$2");
  console.log(output);
  for (const i of elements) {
    const reg = RegExp("\\\\" + i.name, "m");
    let match = output.match(reg);
    console.log(match);
    let failsafe = 0;
    while (match !== null && failsafe !== 100) {
      failsafe++;
      const temp = doReplace(i, match);
      if (temp === null) {
        console.error("There was an error parsing the latex");
        return;
      }
      output = temp;
      console.log(temp);
      match = output.match(reg);
    }
  }
  output = matrixStuff(output);
  return output;
}

function setClipboard(value: unknown) {
  navigator.clipboard.writeText(value + "");
}

chrome.commands.onCommand.addListener(function (command, tab) {
  if (tab.id) {
    if (command === "doMath" || command === "simplify") {
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          func: getLatex,
        })
        .then(async (injectionResults) => {
          if (typeof injectionResults[0].result === "string") {
            const settings = await getSettings();
            let parsedValue = parse(injectionResults[0].result);
            console.log("test", parsedValue);
            let value: any;
            if (command === "doMath") {
              value = mathjs.evaluate(parsedValue);
              value = mathjs
                .format(value, {
                  precision: settings.decimalPlaces,
                  notation: settings.format,
                })
                .toString();
            } else if (command === "simplify") {
              value = mathjs
                .simplify(parsedValue)
                .toTex()
                .replace(/_([a-zA-Z0-9]+)/g, "_{$1}")
                .replace(/\\_/g, "_");
            }
            if (typeof value == "string")
              value = value.replace(
                /([0-9])e\+?(-?[0-9]+)/,
                "$1\\times10^{$2}"
              );

            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: setClipboard,
              args: [value],
            });
          }
        });
    }
    if (command === "pasteLatex") {
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          func: importLatex,
          args: [""],
        })
        .then(async (injectionResults) => {});
    }
  }
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.storage.local.set({
      decimalPlaces: 10,
    });
  }
});
