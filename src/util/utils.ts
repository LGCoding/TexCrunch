export async function getSettings() {
  const settings: {
    decimalPlaces: number;
    format:
      | "fixed"
      | "exponential"
      | "engineering"
      | "auto"
      | "hex"
      | "bin"
      | "oct";
  } = await chrome.storage.local.get(["decimalPlaces", "format"]);
  if (typeof settings.decimalPlaces !== "number") settings.decimalPlaces = 10;
  if (
    ![
      "fixed",
      "exponential",
      "engineering",
      "auto",
      "hex",
      "bin",
      "oct",
    ].includes(settings.format)
  )
    settings.format = "auto";
  return settings;
}
