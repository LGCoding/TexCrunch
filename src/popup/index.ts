import { getSettings } from "../util/utils";

window.onload = async () => {
  const settings = await getSettings();

  const decimalElement = <HTMLInputElement>document.getElementById("decimal");
  const formatElements = <NodeListOf<HTMLInputElement>>(
    document.getElementsByName("format")
  );

  formatElements.forEach((el) => {
    el.onchange = (e: InputEvent) => {
      chrome.storage.local.set({
        format: (<HTMLInputElement>e.currentTarget).value,
      });
    };
    el.checked = settings.format === el.value;
  });

  decimalElement.value = settings.decimalPlaces.toString();
  decimalElement.onchange = (e: InputEvent) => {
    chrome.storage.local.set({
      decimalPlaces: Number((<HTMLInputElement>e.currentTarget).value),
    });
  };
};
