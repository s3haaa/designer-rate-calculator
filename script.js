document.getElementById("dailyHours").addEventListener("input", updateMonthlyHours);
document.getElementById("weekendWork").addEventListener("change", updateMonthlyHours);
document.getElementById("calculateBtn").addEventListener("click", calculate);

// Aktivacija valutnih tipki
document.querySelectorAll(".currency-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".currency-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

function updateMonthlyHours() {
  const dailyHours = parseFloat(document.getElementById("dailyHours").value);
  const weekend = parseInt(document.getElementById("weekendWork").value);

  if (isNaN(dailyHours) || dailyHours <= 0) {
    document.getElementById("monthlyHoursRange").innerText = "Unesite pozitivan broj sati.";
    return;
  }

  const minWorkDays = 20;
  const maxWorkDays = 23;
  const minHours = (minWorkDays + weekend * 4) * dailyHours;
  const maxHours = (maxWorkDays + weekend * 4) * dailyHours;

  document.getElementById("monthlyHoursRange").innerText =
    `Aproksimativno: ${minHours} – ${maxHours} sati mjesečno.`;
}

function getCostValue(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function getCurrencySymbol(code) {
  const symbols = { EUR: "€", BAM: "KM", RSD: "RSD" };
  return symbols[code] || code;
}

function calculate() {
  const hourlyRate = parseFloat(document.getElementById("hourlyRate").value);
  const country = document.getElementById("country").value;
  const currency = document.querySelector(".currency-btn.active").dataset.currency;
  const symbol = getCurrencySymbol(currency);

  if (isNaN(hourlyRate) || hourlyRate <= 0) {
    alert("Unesite validnu satnicu.");
    return;
  }

  const taxDetails = {
    FBiH: {
      label: "BiH – Federacija BiH",
      contributions: {
        "PIO (17%)": 0.17,
        "Zdravstvo (12.5%)": 0.125,
        "Nezaposlenost (1.5%)": 0.015
      },
      incomeTax: { rate: 0.10, personalDeduction: 300 },
      netCalc: function (gross, costs = 0) {
        const contribRate = 0.17 + 0.125 + 0.015;
        const afterContrib = gross * (1 - contribRate);
        const taxable = Math.max(afterContrib - costs - this.incomeTax.personalDeduction, 0);
        const tax = taxable * this.incomeTax.rate;
        const net = afterContrib - tax;
        return { net, tax, contribRate };
      }
    },
    RS: {
      label: "BiH – Republika Srpska",
      contributions: {
        "PIO (18.5%)": 0.185,
        "Zdravstvo (12%)": 0.12,
        "Dječija zaštita (1.7%)": 0.017,
        "Nezaposlenost (0.6%)": 0.006
      },
      incomeTax: { rate: 0.10 },
      netCalc: function (gross, costs = 0) {
        const contribRate = 0.185 + 0.12 + 0.017 + 0.006;
        const taxable = Math.max(gross - costs, 0);
        const tax = taxable * this.incomeTax.rate;
        const net = gross - tax;
        return { net, tax, contribRate };
      }
    },
    BD: {
      label: "BiH – Brčko Distrikt",
      contributions: {
        "PIO (17%)": 0.17,
        "Zdravstvo (12%)": 0.12,
        "Nezaposlenost (1.5%)": 0.015
      },
      incomeTax: { rate: 0.10, personalDeduction: 300 },
      netCalc: function (gross, costs = 0) {
        const contribRate = 0.17 + 0.12 + 0.015;
        const afterContrib = gross * (1 - contribRate);
        const taxable = Math.max(afterContrib - costs - this.incomeTax.personalDeduction, 0);
        const tax = taxable * this.incomeTax.rate;
        const net = afterContrib - tax;
        return { net, tax, contribRate };
      }
    },
    SRB: {
      label: "Srbija",
      contributions: {
        "PIO (24%)": 0.24,
        "Zdravstvo (10.3%)": 0.103,
        "Nezaposlenost (0.75%)": 0.0075
      },
      incomeTax: { rate: 0.10 },
      netCalc: function (gross, costs = 0) {
        const contribRate = 0.24 + 0.103 + 0.0075;
        const afterContrib = gross * (1 - contribRate);
        const taxable = Math.max(afterContrib - costs, 0);
        const tax = taxable * this.incomeTax.rate;
        const net = afterContrib - tax;
        return { net, tax, contribRate };
      }
    },
    CG: {
      label: "Crna Gora",
      contributions: {
        "PIO (15%)": 0.15,
        "Nezaposlenost (0.5%)": 0.005
      },
      netCalc: function (gross, costs = 0) {
        const contribRate = 0.15 + 0.005;
        const afterContrib = gross * (1 - contribRate);
        const taxable = Math.max(afterContrib - costs, 0);
        let tax = 0;
        if (taxable > 1000) {
          tax = (taxable - 1000) * 0.15 + 300 * 0.09;
        } else if (taxable > 700) {
          tax = (taxable - 700) * 0.09;
        }
        const net = afterContrib - tax;
        return { net, tax, contribRate };
      }
    },
    HR: {
      label: "Hrvatska",
      contributions: {
        "PIO (20%)": 0.20,
        "Zdravstvo (16.5%)": 0.165
      },
      incomeTax: { rate: 0.20, personalDeduction: 530 },
      prirez: 0.18,
      netCalc: function (gross, costs = 0) {
        const contribRate = 0.20 + 0.165;
        const afterContrib = gross * (1 - contribRate);
        const taxable = Math.max(afterContrib - costs - this.incomeTax.personalDeduction, 0);
        const tax = taxable * this.incomeTax.rate;
        const prirezAmount = tax * this.prirez;
        const net = afterContrib - tax - prirezAmount;
        return { net, tax: tax + prirezAmount, contribRate };
      }
    }
  };

  const selected = taxDetails[country];

  const dailyHours = parseFloat(document.getElementById("dailyHours").value);
  const weekend = parseInt(document.getElementById("weekendWork").value);
  const minWorkDays = 20;
  const maxWorkDays = 23;
  const minHours = (minWorkDays + weekend * 4) * dailyHours;
  const maxHours = (maxWorkDays + weekend * 4) * dailyHours;
  const avgHours = (minHours + maxHours) / 2;

  const totalCosts =
    getCostValue("costBookkeeping") +
    getCostValue("costBank") +
    getCostValue("costSoftware") +
    getCostValue("costMarketing") +
    getCostValue("costVacation") +
    getCostValue("costAcquisition") +
    getCostValue("costUnexpected");

  const grossIncome = hourlyRate * avgHours;
  const { net, tax, contribRate } = selected.netCalc(grossIncome, totalCosts);
  const netIncome = net;
  const taxAmount = tax;
  const netAvailable = netIncome - totalCosts;
  const netHourlyRate = netAvailable / avgHours;

  let taxHTML = `<h3>Porezi i doprinosi</h3>
    <p><strong>Entitet/Država:</strong> ${selected.label}</p>
  <p><strong>Doprinosi:</strong> ${(contribRate * 100).toFixed(1)}%</p>
  <p><strong>Porez:</strong> ${taxAmount.toFixed(2)} ${symbol}</p>`;

  if (selected.contributions) {
    taxHTML += `<ul>`;
    for (let key in selected.contributions) {
      const percent = selected.contributions[key];
      const amount = grossIncome * percent;
      taxHTML += `<li><strong>${key}:</strong> ${amount.toFixed(2)} ${symbol} (${(percent * 100).toFixed(1)}%)</li>`;
    }
    taxHTML += `</ul>`;
  }

  const summaryHTML = `
    <hr>
    <h3>Mjesečni pregled</h3>
    <table class="pregled-tablica">
      <tr>
        <td>Unesena bruto satnica:<br><small>Satnica koju naplaćujete klijentu, prije poreza i troškova.</small></td>
        <td class="desnakol">${hourlyRate.toFixed(2)} ${symbol}</td>
      </tr>
      <tr>
        <td>Bruto prihod:<br><small>Ukupan iznos koji ostvarite na osnovu satnice i radnih sati.</small></td>
        <td class="desnakol">${grossIncome.toFixed(2)} ${symbol}</td>
      </tr>
      <tr>
        <td>Neto nakon poreza i doprinosa:<br><small>Iznos koji ostaje nakon što se odbiju zakonski doprinosi i porezi.</small></td>
        <td class="desnakol">${netIncome.toFixed(2)} ${symbol}</td>
      </tr>
      <tr>
        <td>Ukupni troškovi:<br><small>Svi mjesečni poslovni troškovi koje ste unijeli.</small></td>
        <td class="desnakol">${totalCosts.toFixed(2)} ${symbol}</td>
      </tr>
      <tr>
        <td>Ostaje nakon troškova:<br><small>Neto iznos koji vam ostaje nakon što se odbiju i porezi i troškovi.</small></td>
        <td class="desnakol">${netAvailable.toFixed(2)} ${symbol}</td>
      </tr>
      <tr>
        <td>Efektivna neto satnica:<br><small>Koliko vam realno ostaje po satu rada, nakon svih odbitaka.</small></td>
        <td class="desnakol">${netHourlyRate.toFixed(2)} ${symbol}</td>
      </tr>
      <tr>
        <td>Mjesečni raspon sati:<br><small>Broj sati koji možete raditi mjesečno, ovisno o vikendima.</small></td>
        <td class="desnakol">${minHours} – ${maxHours}</td>
      </tr>
    </table>
  `;

  const yearlyGross = grossIncome * 12;
const yearlyNet = netIncome * 12;
const yearlyCosts = totalCosts * 12;
const yearlyAvailable = netAvailable * 12;
const yearlyTax = taxAmount * 12;

const yearlyHTML = `
  <hr>
  <h3>Godišnji pregled</h3>
  <table class="pregled-tablica">
    <tr>
      <td>Bruto prihod godišnje:</td>
      <td class="desnakol">${yearlyGross.toFixed(2)} ${symbol}</td>
    </tr>
    <tr>
      <td>Neto nakon poreza i doprinosa:</td>
      <td class="desnakol">${yearlyNet.toFixed(2)} ${symbol}</td>
    </tr>
    <tr>
      <td>Ukupni troškovi:</td>
      <td class="desnakol">${yearlyCosts.toFixed(2)} ${symbol}</td>
    </tr>
    <tr>
      <td>Ostaje nakon troškova:</td>
      <td class="desnakol">${yearlyAvailable.toFixed(2)} ${symbol}</td>
    </tr>
    <tr>
      <td>Ukupni porezi:</td>
      <td class="desnakol">${yearlyTax.toFixed(2)} ${symbol}</td>
    </tr>
  </table>
`;

  document.getElementById("costs").innerHTML = "";
  document.getElementById("taxes").innerHTML = taxHTML;
  document.getElementById("summary").innerHTML = summaryHTML;

  const opinionHTML = getOpinion(netAvailable, netHourlyRate, currency);

  document.getElementById("costs").innerHTML = "";
  document.getElementById("taxes").innerHTML = taxHTML;
  document.getElementById("summary").innerHTML = summaryHTML + opinionHTML;


  document.getElementById("summary").innerHTML =
  summaryHTML + yearlyHTML + getOpinion(netAvailable, netHourlyRate, currency);
}

function getOpinion(netAvailable, netHourlyRate, currency) {
  const symbol = getCurrencySymbol(currency);

  // Fiksni kursovi prema EUR
  const currencyToEUR = {
    EUR: 1,
    BAM: 0.511,
    RSD: 0.0085
  };

  const netInEUR = netAvailable * (currencyToEUR[currency] || 1);

  let status = "", message = "", colorClass = "";

  if (netInEUR < 500) {
    status = "Nisko";
    colorClass = "status-low";
    message = `Vaša mjesečna zarada (${netAvailable.toFixed(2)} ${symbol}) je ispod prosjeka za freelancere u regiji. 
    Ako tek počinjete, ovo može biti prihvatljivo, ali razmislite o povećanju satnice ili optimizaciji troškova.`;
  } else if (netInEUR < 1000) {
    status = "Okej";
    colorClass = "status-ok";
    message = `Zarada od ${netAvailable.toFixed(2)} ${symbol} mjesečno je solidna osnova za freelancera početnika. 
    Ako imate 1–3 godine iskustva, ovo je održivo, ali postoji prostor za rast.`;
  } else if (netInEUR < 1500) {
    status = "Dobro";
    colorClass = "status-good";
    message = `Vrlo dobra mjesečna zarada (${netAvailable.toFixed(2)} ${symbol}). 
    Ako imate 3+ godina iskustva, ovo je u skladu s tržištem. Fokusirajte se na stabilnost i dugoročne klijente.`;
  } else {
    status = "Odlično";
    colorClass = "status-excellent";
    message = `Ova zarada (${netAvailable.toFixed(2)} ${symbol}) pokazuje da ste dobro pozicionirani na tržištu. 
    Možete razmisliti o sljedećem koraku — širenju usluga, edukaciji drugih, izgradnji vlastitih digitalnih proizvoda ili radu s timovima na većim projektima.`;
  }

  return `
    <div class="opinion-box ${colorClass}">
      <h3>${status}</h3>
      <p>${message}</p>
      <p class="disclaimer">
        *Procjena je informativna i temelji se na tržišnim prosjecima. 
        Prava vrijednost vašeg rada ovisi o specijalizaciji, reputaciji i vrsti klijenata.*
      </p>
    </div>
  `;
}

window.onload = function () {
  // Dodaj dugme za promjenu teme
  const themeToggle = document.createElement("button");
  themeToggle.id = "themeToggle";
  themeToggle.innerText = "🌓";
  themeToggle.title = "Promijeni temu";
  document.body.appendChild(themeToggle);

  // Učitaj prethodni izbor iz localStorage
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("manual-dark");
  }

  // Toggle i spremi izbor
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("manual-dark");
    const mode = document.body.classList.contains("manual-dark") ? "dark" : "light";
    localStorage.setItem("theme", mode);
  });
};
