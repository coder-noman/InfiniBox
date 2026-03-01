// Authentication start
(function () {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userType = localStorage.getItem("userType");

  if (!isAuthenticated || (userType !== "admin" && userType !== "client")) {
    // Redirect based on current page
    if (window.location.pathname.includes('factory_client.html')) {
      window.location.href = "../client.html";
    } else {
      window.location.href = "../index.html";
    }
    return;
  }
})();

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');
let overlay;

if (menuToggle) {
  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('active');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'overlay';
      content.appendChild(overlay);

      overlay.addEventListener('click', function () {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      });
    }

    overlay.classList.toggle('active');
  });
}

let ipdu1_arr = [0, 0, 0, 0, 0, 0, 0, 0];
let ipdu2_arr = [0, 0, 0, 0, 0, 0, 0, 0];
let ipduSum_arr = [0, 0];
let alarm_arr = [0, 0, 0, 0, 0];

let temp = [0, 0, 0, 0, 0, 0, 0, 0];
let hum = [0, 0, 0, 0, 0, 0, 0, 0];
const tim = [
  "11:00",
  "11:05",
  "11:10",
  "11:15",
  "11:20",
  "11:25",
  "11:30",
  "11:35",
];
let barChart;
let lineChart;

updateAllData(0, 0, 0, 0, 0, 0);
updateLineChart(0, 0);
updateBarChart();
psuDataShow();
alarmData(alarm_arr, 0);

var socket = new WebSocket("ws://27.147.170.162:81");
socket.onmessage = function (event) {
  const data = event.data.split(":");
  const data_catagory = data[0] || "";
  const msg = data[1] || "";

  if (data_catagory !== "Hams_FAC1") {
    return;
  }

  // clear ipdu start
  ipdu1_arr = [0, 0, 0, 0, 0, 0, 0, 0];
  ipdu2_arr = [0, 0, 0, 0, 0, 0, 0, 0];
  ipduSum_arr = [0, 0, 0];
  // clear ipdu end

  clearAllData();

  var splited_data = data[3].split(",");

  updateAllData(
    splited_data[1],
    splited_data[2],
    splited_data[3],
    splited_data[4],
    splited_data[5],
    splited_data[6]
  );

  updateLineChart(splited_data[5], splited_data[6]);

  const factory = document.getElementById("factory");
  if (factory) {
    deviceInformation(
      splited_data[12],
      splited_data[13],
      splited_data[14],
      splited_data[15],
      splited_data[16],
      splited_data[17],
      splited_data[18]
    );
  }

  psuDataInsert(data[1], data[2]);

  for (i = 7, j = 0; i <= 11; i++, j++) {
    alarm_arr[j] = parseInt(splited_data[i]);
  }
  alarmData(alarm_arr, splited_data[1]);
};

function psuDataInsert(x, y) {
  if (x != "") {
    var ipdu1_data = x.split(",");
    for (i = 2, k = 0; i <= 9; i++, k++) {
      ipdu1_arr[k] = parseInt(ipdu1_data[i]);
    }
  }
  if (y != "") {
    var ipdu2_data = y.split(",");
    for (i = 2, k = 0; i <= 9; i++, k++) {
      ipdu2_arr[k] = parseInt(ipdu2_data[i]);
    }
  }

  psuDataShow();

  ipduSum_arr[0] = ipdu1_arr.reduce((x, y) => x + y, 0);
  ipduSum_arr[1] = ipdu2_arr.reduce((x, y) => x + y, 0);
  updateBarChart();
}
function psuDataShow() {
  const psuId = [
    "r750-ps-1",
    "nas-ps-2",
    "r720-ps-2",
    "r730-1-ps-1",
    "r730-2-ps-2",
    "r730-3-ps-2",
    "san-sw-1-ps-2",
    "san-ps-2",
    "cisco-distribution-psu",
    "ho-dr-psu1",
    "ho-dr-psu2",
    "ho-service-psu1",
    "ho-service-psu2",
    "nvr-psu",
    "r730-1-psu1",
    "r730-1-psu2"
  ];

  const psuDisplayId = [
    "r750-d-ps-1",
    "nas-d-ps-2",
    "r720-d-ps-2",
    "r730-1-d-ps-1",
    "r730-2-d-ps-2",
    "r730-3-d-ps-2",
    "san-sw-1-d-ps-2",
    "san-d-ps-2",
    "cisco-distribution-d-psu",
    "ho-dr-d-psu1",
    "ho-dr-d-psu2",
    "ho-service-d-psu1",
    "ho-service-d-psu2",
    "nvr-d-psu",
    "r730-1-d-psu1",
    "r730-1-d-psu2",
  ];
  const psuCardData = [
    "1. R750 PS-1",
    "2. NAS PS-2",
    "3. R720 PS-2",
    "4. R730-1 PS-1",
    "5. R730-2 PS-2",
    "6. R730-3 PS-2",
    "7. SAN SW-1 PS-2",
    "8. SAN PS-2",
    "CISCO Dist PSU",
    "HO DR PSU1",
    "HO DR PSU2",
    "HO S PSU1",
    "HO S PSU2",
    "NVR PSU",
    "R730-1 PSU1",
    "R730-1 PSU2",
  ];
  for (i = 0, j = 0; i <= 7; i++, j++) {
    if (ipdu1_arr[i] >= 1) {
      psuOnShowData(psuId[j], psuDisplayId[j], ipdu1_arr[i]);
    } else {
      psuOffShowData(psuId[j], psuCardData[j]);
    }
  }

  for (i = 0, j = 8; i <= 7; i++, j++) {
    if (ipdu2_arr[i] >= 1) {
      psuOnShowData(psuId[j], psuDisplayId[j], ipdu2_arr[i]);
    } else {
      psuOffShowData(psuId[j], psuCardData[j]);
    }
  }
}

function psuOnShowData(psu_Id, psu_d_id, psu_value) {
  document.getElementById(psu_Id).innerText = "ON";
  document.getElementById(psu_Id).classList.add("on-btn");
  document.getElementById(psu_d_id).innerText = `${psu_value} VA`;
  document.getElementById(psu_d_id).classList.add("show-btn");
}
function psuOffShowData(psu_Id, psuCardData) {
  document.getElementById(psu_Id).innerText = "OFF";
  document.getElementById(psu_Id).classList.add("off-btn");
  let ul = document.getElementById("alert-list");
  let li = document.createElement("li");
  li.classList.add("alert-list-card");
  li.textContent = `${psuCardData} Failed.`;
  ul.appendChild(li);
}

function alarmData(x, input_voltage) {
  const alarmId = [
    "water-leakage", "fire-Alarm", "generator-status",
    "ups1-cb-status", "ups2-cb-status"
  ];
  const alarmCardId = [
    "Water Leakage", "Fire-Alarm", "Generator Status",
    "Ups1 cb Status", "Ups2 cb Status"
  ];
  const alarmData = [
    ["Detected", "No Alarm"],
    ["Detected", "No Alarm"],
    ["Failed", "Running"],
    ["Tripped", "ok"],
    ["Tripped", "ok"]
  ];

  for (i = 0; i <= 4; i++) {
    if (i == 2) {
      if (x[i] == 0) {
        document.getElementById(alarmId[i]).innerText = alarmData[i][1];
        document.getElementById(alarmId[i]).classList.add("generator-on-btn");
      } else {
        if (x[i] == 1 && input_voltage > 50) {
          document.getElementById(alarmId[i]).innerText = "Stand by";
          document.getElementById(alarmId[i]).classList.add("stand-btn");
        }
        else {
          document.getElementById(alarmId[i]).innerText = alarmData[i][0];
          document.getElementById(alarmId[i]).classList.add("off-btn");
          let ul = document.getElementById("alert-list");
          let li = document.createElement("li");
          li.classList.add("alert-list-card");
          li.textContent = `${alarmCardId[i]} is ${alarmData[i][0]}`;
          ul.appendChild(li);
        }
      }
    }
    else {
      if (x[i] == 1) {
        document.getElementById(alarmId[i]).innerText = alarmData[i][1];
        document.getElementById(alarmId[i]).classList.add("on-btn");
      } else {
        document.getElementById(alarmId[i]).innerText = alarmData[i][0];
        document.getElementById(alarmId[i]).classList.add("off-btn");
        let ul = document.getElementById("alert-list");
        let li = document.createElement("li");
        li.classList.add("alert-list-card");
        li.textContent = `${alarmCardId[i]} is ${alarmData[i][0]}`;
        ul.appendChild(li);
      }
    }
  }
}


function gaugeAlert(data, status) {
  let ul = document.getElementById("alert-list");
  let li = document.createElement("li");
  li.classList.add("alert-list-card");
  li.textContent = `${data} is ${status}.`;
  ul.appendChild(li);
}

function deviceInformation(lan, gsmOp, gsmSig, ib, psu1, psu2, ds) {
  const lanIp = document.getElementById("device-lan");
  const gsmOperator = document.getElementById("gsm-operator");
  const gsmSignal = document.getElementById("gsm-signal");
  const internalBattery = document.getElementById("internal-battery");
  const devicePsu1 = document.getElementById("device-psu1");
  const devicePsu2 = document.getElementById("device-psu2");
  const dataSource = document.getElementById("data-source");

  lanIp.innerHTML = `: ${lan}`;

  gsmOperator.innerText = `: ${gsmOp}`;

  gsmSignal.innerText = `: ${gsmSig} %`;

  internalBattery.innerText = `: ${ib} V`;

  if (psu1 == 1) {
    devicePsu1.innerText = `: OK`;
  } else {
    devicePsu1.innerText = `: Failed`;
  }

  if (psu2 == 1) {
    devicePsu2.innerText = `: OK`;
  } else {
    devicePsu2.innerText = `: Failed`;
  }

  if (ds == 0) {
    dataSource.innerText = `: LAN`;
  } else if (ds == 1) {
    dataSource.innerText = `: WIFI`;
  } else if (ds == 2) {
    dataSource.innerText = `: GPRS`;
  }
}

function clearAllData() {
  document.getElementById("alert-list").innerHTML = "";

  const psuId = [
    "bgp-psu1",
    "bgp-psu2",
    "fortinet-psu1",
    "fortinet-psu2",
    "check-point-psu1",
    "check-point-psu2",
    "cisco-psu",
    "lan-psu",
    "cisco-distribution-psu",
    "ho-dr-psu1",
    "ho-dr-psu2",
    "ho-service-psu1",
    "ho-service-psu2",
    "nvr-psu",
    "r730-1-psu1",
    "r730-1-psu2",
    "r730-2-psu1",
    "r730-2-psu2",
    "san-sw1-psu1",
    "san-sw1-psu2",
    "san-sw-psu1",
    "san-sw-psu2",
    "san-sorage-psu1",
    "san-sorage-psu2",
  ];

  const psuDisplayId = [
    "bgp-d-psu1",
    "bgp-d-psu2",
    "fortinet-d-psu1",
    "fortinet-d-psu2",
    "check-point-d-psu1",
    "check-point-d-psu2",
    "cisco-d-psu",
    "lan-d-psu",
    "cisco-distribution-d-psu",
    "ho-dr-d-psu1",
    "ho-dr-d-psu2",
    "ho-service-d-psu1",
    "ho-service-d-psu2",
    "nvr-d-psu",
    "r730-1-d-psu1",
    "r730-1-d-psu2",
    "r730-2-d-psu1",
    "r730-2-d-psu2",
    "san-sw1-d-psu1",
    "san-sw1-d-psu2",
    "san-sw-d-psu1",
    "san-sw-d-psu2",
    "san-sorage-d-psu1",
    "san-sorage-d-psu2",
  ];

  for (let j = 0; j < psuId.length; j++) {
    const psuElem = document.getElementById(psuId[j]);
    const psuDisplayElem = document.getElementById(psuDisplayId[j]);

    if (psuElem) {
      psuElem.innerText = "";
      psuElem.className = "";
    }
    if (psuDisplayElem) {
      psuDisplayElem.innerText = "";
      psuDisplayElem.className = "";
    }
  }

  const alarmId = [
    "water-leakage",
    "fire-Alarm",
    "generator-status",
    "ups1-cb-status",
    "ups2-cb-status",
  ];
  for (let j = 0; j < alarmId.length; j++) {
    const alarmElem = document.getElementById(alarmId[j]);
    if (alarmElem) {
      alarmElem.innerText = "";
      alarmElem.className = "";
    }
  }
}

function getColor(value, ranges) {
  if (value >= ranges.green[0] && value <= ranges.green[1]) {
    return "#4ECDC4";
  } else if (value >= ranges.orange[0] && value <= ranges.orange[1]) {
    return "#FE9B13";
  } else {
    return "#FC5C65";
  }
}

function getStatus(value, ranges) {
  if (value >= ranges.green[0] && value <= ranges.green[1]) {
    return { text: "Normal", class: "status-normal" };
  } else if (value >= ranges.orange[0] && value <= ranges.orange[1]) {
    return { text: "Warning", class: "status-warning" };
  } else {
    return { text: "Danger", class: "status-danger" };
  }
}

function updateGauge(elementId, value, ranges) {
  const fillElement = document.getElementById(`${elementId}-fill`);
  const valueElement = document.getElementById(`${elementId}-value`);
  const statusElement = document.getElementById(`${elementId}-status`);

  const rotation = (value / ranges.max) * 360;

  const color = getColor(value, ranges);
  const status = getStatus(value, ranges);

  fillElement.style.background = `conic-gradient(${color} 0deg ${rotation}deg, transparent ${rotation}deg 360deg)`;
  fillElement.style.color = color;

  const unit = valueElement.querySelector(".gauge-unit")?.textContent || "";
  valueElement.innerHTML = `${value} <span class="gauge-unit">${unit}</span>`;

  statusElement.textContent = status.text;
  statusElement.className = `status ${status.class}`;

  if (status.class !== "status-normal") {
    statusElement.classList.add("pulse");
  } else {
    statusElement.classList.remove("pulse");
  }
}

function updateAllData(a, b, c, d, e, f) {
  const inputVoltage = a;
  updateGauge("input-voltage", inputVoltage, {
    green: [191, 245],
    orange: [0, 190],
    red: [246, 300],
    max: 300,
  });

  if (inputVoltage >= 0 && inputVoltage <= 190) {
    gaugeAlert("Input Voltage", "low");
  } else if (inputVoltage >= 246 && inputVoltage <= 300) {
    gaugeAlert("Input Voltage", "high");
  }

  const ups1Voltage = b;
  updateGauge("ups1-voltage", ups1Voltage, {
    green: [211, 230],
    orange: [0, 210],
    red: [231, 300],
    max: 300,
  });

  if (ups1Voltage >= 0 && ups1Voltage <= 210) {
    gaugeAlert("UPS1 Voltage", "low");
  } else if (ups1Voltage >= 231 && ups1Voltage <= 300) {
    gaugeAlert("UPS1 Voltage", "high");
  }

  const ups2Voltage = c;
  updateGauge("ups2-voltage", ups2Voltage, {
    green: [211, 230],
    orange: [0, 210],
    red: [231, 300],
    max: 300,
  });

  if (ups2Voltage >= 0 && ups2Voltage <= 210) {
    gaugeAlert("UPS2 Voltage", "low");
  } else if (ups2Voltage >= 231 && ups2Voltage <= 300) {
    gaugeAlert("UPS2 Voltage", "high");
  }

  const batteryVoltage = d;
  updateGauge("battery-voltage", batteryVoltage, {
    green: [241, 280],
    orange: [221, 240],
    red: [0, 220],
    max: 280,
  });

  if (batteryVoltage >= 221 && batteryVoltage <= 240) {
    gaugeAlert("Battery Voltage", "low");
  } else if (batteryVoltage >= 0 && batteryVoltage <= 220) {
    gaugeAlert("Battery Voltage", "very Low");
  }

  const temperature = e;
  updateGauge("temperature", temperature, {
    green: [0, 25],
    orange: [26, 31],
    red: [32, 55],
    max: 55,
  });

  if (temperature >= 26 && temperature <= 31) {
    gaugeAlert("Temperature", "high");
  } else if (temperature >= 32 && temperature <= 55) {
    gaugeAlert("Temperature", "very high");
  }

  const humidity = f;
  updateGauge("humidity", humidity, {
    green: [41, 80],
    orange: [81, 100],
    red: [0, 40],
    max: 100,
  });

  if (humidity >= 0 && humidity <= 40) {
    gaugeAlert("Humidity", "low");
  } else if (humidity >= 81 && humidity <= 100) {
    gaugeAlert("Humidity", "high");
  }
}

let color = "white";

function initializeCharts() {
  const environmentCtx = document
    .getElementById("environment-chart")
    .getContext("2d");
  lineChart = new Chart(environmentCtx, {
    type: "line",
    data: {
      labels: tim,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temp,
          borderColor: "#ff9f1a",
          backgroundColor: "rgba(255, 159, 26, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          yAxisID: "y",
          fill: true,
        },
        {
          label: "Humidity (%)",
          data: hum,
          borderColor: "#3867d6",
          backgroundColor: "rgba(56, 103, 214, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          yAxisID: "y1",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: `${color}`,
            font: {
              size: 14,
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(160, 174, 192, 0.1)",
          },
          ticks: {
            color: `${color}`,
            maxTicksLimit: 5,
            font: {
              size: 12,
            },
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          min: 0,
          grid: {
            color: "rgba(160, 174, 192, 0.1)",
          },
          ticks: {
            color: `${color}`,
            font: {
              size: 12,
            },
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          min: 0,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: `${color}`,
            font: {
              size: 12,
            },
          },
        },
      },
    },
  });

  const voltageCtx = document.getElementById("voltage-chart").getContext("2d");
  barChart = new Chart(voltageCtx, {
    type: "bar",
    data: {
      labels: ["Ipdu1", "Ipdu2"],
      datasets: [
        {
          label: "Load (VA)",
          data: ipduSum_arr,
          backgroundColor: [
            "#61dbd3ff",
            "#fc5c65",
            "#3867d6",
          ],
          borderRadius: 10,
          barThickness: 70,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          anchor: "end",
          align: "top",
          offset: 0,
          minWidth: 90,
          backgroundColor: "#0f1c2d",
          borderRadius: 6,
          padding: {
            top: 6,
            bottom: 6,
            left: 9,
            right: 9,
          },
          color: "#ffffff",
          font: {
            size: 13,
            weight: "700",
          },
          formatter: function (value, ctx) {
            const percent = Math.round((value * 100) / 2500);
            return percent + "%";
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.parsed.y + " VA";
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(160, 174, 192, 0.1)",
          },
          ticks: {
            color: `${color}`,
            font: {
              size: 12,
            },
            callback: function (value) {
              return value + " VA";
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: `${color}`,
            font: {
              size: 12,
            },
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}

window.addEventListener("load", initializeCharts);

function updateLineChart(x, y) {
  let z = new Date().toLocaleTimeString();
  let date = new Date().toLocaleDateString();

  document.getElementById("lastUpdateTime").textContent = z;
  document.getElementById("lastUpdateDate").textContent = date;

  for (let i = 0; i < 7; i++) {
    temp[i] = temp[i + 1];
    hum[i] = hum[i + 1];
    tim[i] = tim[i + 1];
  }

  temp[7] = x;
  hum[7] = y;
  tim[7] = z;

  if (lineChart) {
    lineChart.data.labels = [...tim];
    lineChart.data.datasets[0].data = [...temp];
    lineChart.data.datasets[1].data = [...hum];
    lineChart.update("none");
  }
}

function updateBarChart() {
  if (barChart) {
    barChart.data.datasets[0].data = ipduSum_arr;
    barChart.update("none");
  }
}