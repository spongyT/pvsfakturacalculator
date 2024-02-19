const workingHoursPerDay = 8;
const appName = 'PVS Fakturarechner';
let numberOfRuns = 3;
// Utils
const speaker = (msg) => `${appName}: ${msg}`;
const log = (msg) => console.log(speaker(msg));
const warn = (msg) => console.log(speaker(`WARN ${msg}`));
const error = (msg) => console.log(speaker(`ERROR ${msg}`));
const parseFloatFromTextContent = (content) =>
  content !== undefined && content.length > 0 ? parseFloat(content.replaceAll(',', '.')) : undefined;
function createElement(elementName, text) {
  const el = document.createElement(elementName);
  el.textContent = text;
  return el;
}
const createSpan = (text) => createElement('span', text);

function setStyles(element, style) {
  for (let entry of Object.entries(style)) {
    element.style[entry[0]] = entry[1];
  }
}

function getElementById(id) {
  let element = document.querySelector(`#${id}`);
  // if (element === null) {
  //   // Try to get the element with this mystrious P11_U-Ids
  //   const u_id = id.replace('P11_P_', 'P11_U_');
  //   element = document.querySelector(`#${u_id}`);
  //
  //   if (element !== null) {
  //     log(`Found element by u_id: ${u_id}`);
  //   }
  // }

  if (element === null) {
    throw new Error(`Element by id=${id} required, but not found`);
  }

  return element;
}
// Create result container
const resultDiv = document.createElement('div');
resultDiv.id = 'resultDiv';

/**
 * Wrapper function that runs the calculator, catching errors and adds retry logic
 */
const run = () => {
  try {
    calculator();
  } catch (e) {
    warn(`Fehler: ${e}`);

    numberOfRuns--;
    if (numberOfRuns > 0) {
      setTimeout(run, 1000);
    } else {
      error('Konnte die korrekten Daten nicht ermitteln.');
    }
  }
};

/**
 * The PVS Faktura calculation
 */
const calculator = () => {
  // Collect data
  const shouldDays = parseFloatFromTextContent(getElementById('P11_P_SOLL_TAGE').textContent) ?? 0;
  log('Solltage: ' + shouldDays);

  const holidayHours = parseFloatFromTextContent(getElementById('P11_P_URLAUB').textContent) ?? 0;
  const illHours = parseFloatFromTextContent(getElementById('P11_P_KRANK').textContent) ?? 0;
  log('Urlaubstage: ' + holidayHours / workingHoursPerDay);
  log('Krankentage: ' + illHours / workingHoursPerDay);

  const tableElements = document.querySelectorAll('.a-IRR-table');
  const tableElement = tableElements[tableElements.length - 1]; // get last element
  const daySelector = (day) => `td[headers='${day}']:not(.feiertag)`;
  const dayElements = tableElement.querySelectorAll(
    `${daySelector('col_mo')}, ${daySelector('col_di')}, ${daySelector('col_mi')}, ${daySelector(
      'col_do'
    )}, ${daySelector('col_fr')}`
  );
  // const publicHolidayElements = dayElements.filter(dayElement => dayElement.classList.contains("feiertag"));

  const bookedDayElements = Array.prototype.filter.call(
    dayElements,
    (day) => parseFloatFromTextContent(day.textContent) > 0
  );
  for (el of Array.prototype.filter.call(dayElements, (day) => parseFloatFromTextContent(day.textContent) <= 0)) {
    el.style.backgroundColor = 'yellow';
  }
  log('Gebuchte Tage: ' + bookedDayElements.length);

  const unBookedDays = shouldDays - bookedDayElements.length;
  log('Ungebuchte Tage: ' + unBookedDays);

  const bookedHours = parseFloatFromTextContent(getElementById('P11_P_FAKT').textContent) ?? 0;
  log('Fakturierte Zeiten: ' + bookedHours);

  const developmentHours = parseFloatFromTextContent(getElementById('P11_P_EZ').textContent) ?? 0;
  log('Entwicklungszeiten: ' + developmentHours);

  const aquisitionHours = parseFloatFromTextContent(getElementById('P11_P_AKQ').textContent) ?? 0;
  log('Akquise: ' + aquisitionHours);

  const humanAquisitionHours = parseFloatFromTextContent(getElementById('P11_P_P_AKQ').textContent) ?? 0;
  log('Personalqkquise: ' + humanAquisitionHours);

  const teachingHours = parseFloatFromTextContent(getElementById('P11_P_TEACH').textContent) ?? 0;
  log('Teaching: ' + humanAquisitionHours);

  const shouldTime = parseFloatFromTextContent(getElementById('P11_P_SOLL_STUNDEN').textContent) ?? 0;
  log('Soll-Stunden: ' + shouldTime);

  const adjustedShouldTime = shouldTime - holidayHours - illHours;
  log('Soll-Leistungs-Stunden (SLS): ' + adjustedShouldTime);

  const accountableHoursBreak = adjustedShouldTime * 0.9;
  log('Prämienrelevante Stundenschwelle (90% SLS) ' + accountableHoursBreak);

  const isHours = parseFloatFromTextContent(getElementById('P11_P_IST_STUNDEN').textContent) ?? 0;
  log('Ist-Stunden: ' + isHours);

  if (shouldDays <= 0 || shouldDays > 30 || shouldTime <= 0 || unBookedDays > shouldDays) {
    throw new Error('Einige Werte sind nicht plausibel. Ich beginne die Rechnung von vorne.');
  }

  const estimationResult = estimateResultsForThisMonth({
    shouldDays,
    shouldTime,
    adjustedShouldTime,
    teachingHours,
    isHours,
    accountableHoursBreak,
    humanAquisitionHours,
    aquisitionHours,
    developmentHours,
    bookedHours,
    unBookedDays,
  });

  // Output
  const colorGreen = '#86db67';
  const colorRed = '#e28b4f';

  resultDiv.innerHTML = '';
  resultDiv.append(createElement('h4', appName));
  resultDiv.append(createSpan(`IST/SOLL: ${estimationResult.estimatedIsHours.toFixed(2)}/${shouldTime.toFixed(2)}`));
  resultDiv.append(createSpan(`Bilanz: ${estimationResult.estimatedIsBalance.toFixed(2)}h`));
  resultDiv.append(createSpan(`Urlaub: ${holidayHours.toFixed(2)}h`));
  resultDiv.append(createSpan(`Krankheit: ${illHours.toFixed(2)}h`));
  resultDiv.append(createSpan(`SOLL (Bereinigt): ${adjustedShouldTime.toFixed(2)}h`));
  resultDiv.append(
    createSpan(
      `Prämienrelevant/SOLL: ${estimationResult.estimatedAccountedHours.toFixed(2)}/${adjustedShouldTime.toFixed(2)}`
    )
  );
  resultDiv.append(createSpan(`Überstunden: ${estimationResult.estimatedOverTimeHours.toFixed(2)}h`));

  const madeWithLoveEl = createElement('h5', 'made with ♡');
  setStyles(madeWithLoveEl, {
    'padding-top': '6px',
    'text-align': 'end',
  });
  resultDiv.append(madeWithLoveEl);

  const style = {
    position: 'fixed',
    top: '60px',
    right: '10px',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    'z-index': 1000,
    backgroundColor: estimationResult.estimatedIsBalance >= 0 ? colorGreen : colorRed,
    padding: '12px',
    display: 'flex',
    'flex-direction': 'column',
  };
  setStyles(resultDiv, style);
  document.body.append(resultDiv);

  if (estimationResult.estimatedOverTimeHours >= 0) {
    log('GOOD JOB!');
  }
};

function estimateResultsForThisMonth(inputs) {
  // Hochrechnungen
  log('');
  log('Na dann rechnen wir mal hoch was du diesen Monat voraussichtlich schaffen wirst.');
  log('');

  const estimatedIsHours = inputs.isHours + inputs.unBookedDays * workingHoursPerDay;
  log('Voraussichtliche Ist-Stunden: ' + inputs.estimatedIsHours);

  const estimatedIsBalance = estimatedIsHours - inputs.shouldTime;
  log('Voraussichtliche Stundenbilanz: ' + estimatedIsBalance.toFixed(2));

  const estimatedAccountedHours =
    inputs.bookedHours +
    inputs.developmentHours +
    inputs.aquisitionHours +
    inputs.humanAquisitionHours +
    inputs.teachingHours +
    inputs.unBookedDays * workingHoursPerDay;
  log('Voraussichtliche fakturierte Stunden: ' + estimatedAccountedHours);

  const estimatedBonusAwardedHours = estimatedAccountedHours - inputs.accountableHoursBreak;
  log('Voraussichtliche prämienrelevante Stunden: ' + estimatedBonusAwardedHours.toFixed(2));

  const estimatedOverTimeHours = Math.max(0, estimatedAccountedHours - inputs.adjustedShouldTime);
  log('Voraussichtliche Überstunden: ' + estimatedOverTimeHours);

  return {
    estimatedAccountedHours,
    estimatedBonusAwardedHours,
    estimatedOverTimeHours,
    estimatedIsHours,
    estimatedIsBalance,
  };
}

// Start the routing
log('Hallo Meister. Schauen wir mal was deine Stunden heute machen...');

// Run calculation on every subtree modification
const config = { childList: true, subtree: true };
const bodyObserver = new MutationObserver(() => {
  const targetNode = document.getElementById('wwvFlowForm');
  if (targetNode) {
    console.log('Target node found');
    bodyObserver.disconnect();
    console.log('Target node is here!');
    run();
    const observer = new MutationObserver(run);
    observer.observe(targetNode, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
    });
  }
});
bodyObserver.observe(document.body, config);
