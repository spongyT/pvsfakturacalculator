const workingHoursPerDay = 8;
const appName = "PVS Fakturarechner";
// Utils
const speaker = (msg) => `${appName}: ${msg}`;
const log = (msg) => console.log(speaker(msg));

log(("Hallo Meister. Schauen wir mal was deine Stunden heute machen..."));

const parseTextFieldAsNumber = (content) => isNaN(content) ? parseFloat(content.replaceAll(",", ".")) : content;
const createElement = (elementName, text) => {
  const el = document.createElement(elementName);
  el.textContent = text;
  return el;
};
const createSpan = (text) => {
  return createElement("span", text);
};

function setStyles(element, style) {
  for (let entry of Object.entries(style)) {
    element.style[entry[0]] = entry[1];
  }
}

// Create result container
const resultDiv = document.createElement("div");
resultDiv.id = "resultDiv";

const runCalculator = () => {

// Daten sammeln
  const shouldDays = parseFloat(document.querySelector(`#P11_P_SOLL_TAGE`).textContent);
  log("Solltage: " + shouldDays);

  const holidayHours = parseFloat(document.querySelector(`#P11_P_URLAUB`).textContent || 0);
  const illHours = parseFloat(document.querySelector(`#P11_P_KRANK`).textContent || 0);
  log("Urlaubstage: " + holidayHours / workingHoursPerDay);
  log("Krankentage: " + illHours / workingHoursPerDay);

  const tableElements = document.querySelectorAll(".a-IRR-table");
  const tableElement = tableElements[tableElements.length - 1]; // get last element
  const daySelector = (day) => `td[headers='${day}']:not(.feiertag)`;
  const dayElements = tableElement.querySelectorAll(
    `${daySelector("col_mo")}, ${daySelector("col_di")}, ${daySelector("col_mi")}, ${daySelector(
      "col_do")}, ${daySelector("col_fr")}`);
// const publicHolidayElements = dayElements.filter(dayElement => dayElement.classList.contains("feiertag"));

  const bookedDayElements = Array.prototype.filter.call(dayElements, day => parseFloat(day.textContent) > 0);
  for(el of Array.prototype.filter.call(dayElements, day => parseFloat(day.textContent) <= 0)){
    el.style.backgroundColor = "yellow";
  }
  log("Gebuchte Tage: " + bookedDayElements.length);

  const unBookedDays = shouldDays - bookedDayElements.length;
  log("Ungebuchte Tage: " + unBookedDays);

  const bookedHours = parseTextFieldAsNumber(document.querySelector(`#P11_P_FAKT`).textContent);
  log("Fakturierte Zeiten: " + bookedHours);

  const developmentHours = parseTextFieldAsNumber(document.querySelector(`#P11_P_EZ`).textContent || 0);
  log("Entwicklungszeiten: " + developmentHours);

  const aquisitionHours = parseTextFieldAsNumber(document.querySelector(`#P11_P_AKQ`).textContent || 0);
  log("Akquise: " + aquisitionHours);

  const humanAquisitionHours = parseTextFieldAsNumber(document.querySelector(`#P11_P_P_AKQ`).textContent || 0);
  log("Personalqkquise: " + humanAquisitionHours);

  const teachingHours = parseTextFieldAsNumber(document.querySelector(`#P11_P_TEACH`).textContent || 0);
  log("Teaching: " + humanAquisitionHours);

  const shouldTime = parseTextFieldAsNumber(document.querySelector("#P11_P_SOLL_STUNDEN").textContent);
  log("Soll-Stunden: " + shouldTime);

  const adjustedShouldTime = shouldTime - holidayHours - illHours;
  log("Soll-Leistungs-Stunden (SLS): " + adjustedShouldTime);

  const accountableHoursBreak = adjustedShouldTime * 0.9;
  log("Prämienrelevante Stundenschwelle (90% SLS) " + accountableHoursBreak);

  const isHours = parseTextFieldAsNumber(document.querySelector(`#P11_P_IST_STUNDEN`).textContent);
  log("Ist-Stunden: " + isHours);

  // Hochrechnungen
  log("");
  log("Na dann rechnen wir mal hoch was du diesen Monat voraussichtlich schaffen wirst.");
  log("");

  const estimatedIsHours = isHours + unBookedDays * workingHoursPerDay;
  log("Voraussichtliche Ist-Stunden: " + estimatedIsHours);

  const estimatedIsBalance = estimatedIsHours - shouldTime;
  log("Voraussichtliche Stundenbilanz: " + estimatedIsBalance.toFixed(2));

  const estimatedAccountedHours = bookedHours + developmentHours + aquisitionHours + humanAquisitionHours
    + teachingHours + unBookedDays * workingHoursPerDay;
  log("Voraussichtliche fakturierte Stunden: " + estimatedAccountedHours);

  const estimatedBonusAwardedHours = estimatedAccountedHours - accountableHoursBreak;
  log("Voraussichtliche prämienrelevante Stunden: " + estimatedBonusAwardedHours.toFixed(2));

  const estimatedOverTimeHours = Math.max(0, estimatedAccountedHours - adjustedShouldTime);
  log("Voraussichtliche Überstunden: " + estimatedOverTimeHours);

// Output
  const colorGreen = "#86db67";
  const colorRed = "#e28b4f";

  resultDiv.innerHTML = "";
  resultDiv.append(createElement("h4", appName));
  resultDiv.append(createSpan(`IST/SOLL: ${estimatedIsHours.toFixed(2)}/${shouldTime.toFixed(2)}`));
  resultDiv.append(createSpan(`Bilanz: ${estimatedIsBalance.toFixed(2)}h`));
  resultDiv.append(createSpan(`Urlaub: ${holidayHours.toFixed(2)}h`));
  resultDiv.append(createSpan(`Krankheit: ${illHours.toFixed(2)}h`));
  resultDiv.append(createSpan(`SOLL (Bereinigt): ${adjustedShouldTime.toFixed(2)}h`));
  resultDiv.append(
    createSpan(`Prämienrelevant/SOLL: ${estimatedAccountedHours.toFixed(2)}/${adjustedShouldTime.toFixed(2)}`));
  resultDiv.append(createSpan(`Überstunden: ${estimatedOverTimeHours.toFixed(2)}h`));

  const madeWithLoveEl = createElement("h5", "made with ♡");
  setStyles(madeWithLoveEl, {
    "padding-top": "6px",
    "text-align": "end"
  });
  resultDiv.append(madeWithLoveEl);

  const style = {
    position: "fixed",
    top: "60px",
    right: "10px",
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    "z-index": 1000,
    backgroundColor: estimatedIsBalance >= 0 ? colorGreen : colorRed,
    padding: "12px",
    display: "flex",
    "flex-direction": "column"
  };
  setStyles(resultDiv, style);
  document.body.append(resultDiv);

  if (estimatedOverTimeHours >= 0) {
    log("GOOD JOB!");
  }
};

// Run calculation on every subtree modification

const config = { childList: true, subtree: true };
const bodyObserver = new MutationObserver(() => {

  const targetNode = document.getElementById("wwvFlowForm");
  if (targetNode) {
    console.log("Target node found");
    bodyObserver.disconnect();
    console.log("Target node is here!");
    runCalculator();
    const observer = new MutationObserver(runCalculator);
    observer.observe(targetNode, { attributes: true, childList: true, subtree: true, attributeOldValue: true, characterData:true, characterDataOldValue: true });
  }
});
bodyObserver.observe(document.body, config);
