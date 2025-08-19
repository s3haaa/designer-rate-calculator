document.getElementById("dailyHours").addEventListener("input", updateMonthlyHours);
document.getElementById("weekendWork").addEventListener("change", updateMonthlyHours);
document.getElementById("calculateBtn").addEventListener("click", calculate);

function updateMonthlyHours() {
  const dailyHours = parseFloat(document.getElementById("dailyHours").value);
  const weekend = parseInt(document.getElementById("weekendWork").value);

  if (isNaN(dailyHours) || dailyHours <= 0) {
    document.getElementById("monthlyHoursRange").innerText = "Unesite pozitivan broj sati.";
    return;
  }

  const minWorkDays = 20;
  const maxWorkDays = 23;
  const weekendDays = weekend;

  const minHours = (minWorkDays + weekendDays * 4) * dailyHours;
  const maxHours = (maxWorkDays + weekendDays * 4) * dailyHours;

  document.getElementById("monthlyHoursRange").innerText =
    `Aproksimativno: ${minHours} – ${maxHours} sati mjesečno.`;
}

function getCostValue(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function calculate() {
  const netSalary = parseFloat(document.getElementById("netSalary").value);
  const country = document.getElementById("country").value;

  if (isNaN(netSalary) || netSalary <= 0) {
    alert("Unesite validnu NETO platu.");
    return;
  }

  const taxDetails = {
    FBiH: {
      rate: 0.385,
      label: "BiH – Federacija BiH",
      breakdown: {
        "PIO (15%)": 0.15,
        "Zdravstvo (12%)": 0.12,
        "Nezaposlenost (1.5%)": 0.015,
        "Porez na dohodak (10%)": 0.10
      }
    },
    RS: {
      rate: 0.44,
      label: "BiH – Republika Srpska",
      breakdown: {
        "PIO (18%)": 0.18,
        "Zdravstvo (12.5%)": 0.125,
        "Nezaposlenost (3%)": 0.03,
        "Porez na dohodak (10%)": 0.10
      }
    },
    BD: {
      rate: 0.41,
      label: "BiH – Brčko Distrikt",
      breakdown: {
        "PIO (17%)": 0.17,
        "Zdravstvo (12.5%)": 0.125,
        "Nezaposlenost (1.5%)": 0.015,
        "Porez na dohodak (10%)": 0.10
      }
    },
    HR: {
      rate: 0.365,
      label: "Hrvatska",
      breakdown: {
        "Doprinosi (16.5%)": 0.165,
        "Porez na dohodak (20%)": 0.20
      }
    },
    CG: {
      rate: 0.255,
      label: "Crna Gora",
      breakdown: {
        "Doprinosi (16.5%)": 0.165,
        "Porez na dohodak (9%)": 0.09
      }
    },
    SRB: {
      rate: 0.35,
      label: "Srbija",
      breakdown: {
        "Doprinosi (25%)": 0.25,
        "Porez na dohodak (10%)": 0.10
      }
    }
  };

  const selected = taxDetails[country];
  const grossSalary = netSalary / (1 - selected.rate);
  const taxAmount = grossSalary - netSalary;

  const totalCosts =
    getCostValue("costBookkeeping") +
    getCostValue("costBank") +
    getCostValue("costSoftware") +
    getCostValue("costMarketing") +
    getCostValue("costVacation") +
    getCostValue("costAcquisition") +
    getCostValue("costUnexpected");

  const dailyHours = parseFloat(document.getElementById("dailyHours").value);
  const weekend = parseInt(document.getElementById("weekendWork").value);
  const minWorkDays = 20;
  const maxWorkDays = 23;
  const minHours = (minWorkDays + weekend * 4) * dailyHours;
  const maxHours = (maxWorkDays + weekend * 4) * dailyHours;

  const totalMonthlyNeed = totalCosts + grossSalary;
  const minRate = totalMonthlyNeed / maxHours;
  const maxRate = totalMonthlyNeed / minHours;

  let taxHTML = `<h3>Porezi i doprinosi</h3>
    <p><strong>Entitet/Država:</strong> ${selected.label}</p>
    <p><strong>Ukupno:</strong> ${(selected.rate * 100).toFixed(1)}% → €${taxAmount.toFixed(2)}</p>
    <ul>`;
  for (let key in selected.breakdown) {
    const percent = selected.breakdown[key];
    const amount = grossSalary * percent;
    taxHTML += `<li>${key}: €${amount.toFixed(2)} (${(percent * 100).toFixed(1)}%)</li>`;
  }
  taxHTML += `</ul>`;

  const summaryHTML = `
    <h3>Pregled</h3>
    <p><strong>Željena NETO plata:</strong> €${netSalary.toFixed(2)}</p>
    <p><strong>Bruto iznos (sa porezima):</strong> €${grossSalary.toFixed(2)}</p>
    <p><strong>Ukupni troškovi:</strong> €${totalCosts.toFixed(2)}</p>
    <p><strong>Potrebno mjesečno:</strong> €${totalMonthlyNeed.toFixed(2)}</p>
    <h3>Potrebna satnica</h3>
    <p>Da bi se pokrili svi troškovi i ostvarila NETO plata od €${netSalary.toFixed(2)}, potrebno je naplatiti:</p>
    <p><strong>€${minRate.toFixed(2)} – €${maxRate.toFixed(2)} po satu</strong></p>
    <p><em>(raspon zavisi od broja radnih dana i rada vikendom)</em></p>
  `;

  document.getElementById("costs").innerHTML = "";
  document.getElementById("taxes").innerHTML = taxHTML;
  document.getElementById("summary").innerHTML = summaryHTML;
}