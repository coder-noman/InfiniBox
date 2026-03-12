// Authentication start
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVTHWPjNPIQmSuuYDMn2ubE01xN79f7Ig",
  authDomain: "infini-box.firebaseapp.com",
  projectId: "infini-box",
  storageBucket: "infini-box.firebasestorage.app",
  messagingSenderId: "868144770126",
  appId: "1:868144770126:web:30ddd62044764de242271f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const page = window.location.pathname;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../../registration.html";
    return;
  }

  const role = sessionStorage.getItem("userType");

  if (page.includes("index.html") && role !== "admin-hams") {
    alert("Admin only");
    window.location.href = "../../registration.html";
  }

  if (page.includes("client.html") && role !== "client-hams") {
    alert("Client only");
    window.location.href = "../../registration.html";
  }
});

// logout start
document.getElementById("logout")?.addEventListener("click", async () => {
  await signOut(auth);
  sessionStorage.clear();
  window.location.href = "../../registration.html";
});
// Authentication end

//sidebar toggle start
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', function() {
      sidebar.classList.toggle('sidebar-visible');
      
      //icon change based on sidebar state
      const icon = mobileMenuBtn.querySelector('i');
      if (sidebar.classList.contains('sidebar-visible')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
    
    // close sidebar when outside click start
    document.addEventListener('click', function(event) {
      const isMobile = window.innerWidth <= 768;
      if (isMobile && 
          sidebar.classList.contains('sidebar-visible') && 
          !sidebar.contains(event.target) && 
          !mobileMenuBtn.contains(event.target)) {
        sidebar.classList.remove('sidebar-visible');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }
});
//sidebar toggle end

//  declare all data array start
let ipdu1_arr = [0, 0, 0, 0, 0, 0, 0, 0];
let ipdu2_arr = [0, 0, 0, 0, 0, 0, 0, 0];
let ipdu3_arr = [0, 0, 0, 0, 0, 0, 0, 0];
let ipduSum_arr = [0, 0, 0];
let alarm_arr = [0, 0, 0, 0, 0];

let temp = [0, 0, 0, 0, 0, 0, 0, 0];
let hum = [0, 0, 0, 0, 0, 0, 0, 0];
const tim = ["00:00", "00:00", "00:00", "00:00", "00:00","00:00", "00:00", "00:00"];
let barChart;
let lineChart;

updateAllData(0, 0, 0, 0, 0, 0);
updateLineChart(0, 0);
updateBarChart();
psuDataShow();
alarmData(alarm_arr, 0);
//  declare all data array end

//websocket start
var socket = new WebSocket("ws://27.147.170.162:81");
socket.onmessage = function (event) {
  const data = event.data.split(":");
  const data_catagory = data[0] || "";
  const msg = data[1] || "";

  if (data_catagory == "Hams_HO") {
  } else {
    return;
  }
  // clear ipdu start
  ipdu1_arr = [0, 0, 0, 0, 0, 0, 0, 0];
  ipdu2_arr = [0, 0, 0, 0, 0, 0, 0, 0];
  ipdu3_arr = [0, 0, 0, 0, 0, 0, 0, 0];
  ipduSum_arr = [0, 0, 0];
  // clear ipdu end

  clearAllData();

  // console.log(data[1]);
  // console.log(data[2]);
  // console.log(data[3]);
  // console.log(data[4]);

  var splited_data = data[4].split(",");

  updateAllData(
    splited_data[1],
    splited_data[2],
    splited_data[3],
    splited_data[4],
    splited_data[5],
    splited_data[6]
  );

  updateLineChart(splited_data[5], splited_data[6]);

  const ho_main = document.getElementById("main_ho");
  if (ho_main) {
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

  psuDataInsert(data[1], data[2], data[3]);

  for (let i = 7, j = 0; i <= 11; i++, j++) {
    alarm_arr[j] = parseInt(splited_data[i]);
  }
  alarmData(alarm_arr, splited_data[1]);
};
//websocket End

// psu data insert start 
function psuDataInsert(x, y, z) {
  if (x != "") {
    var ipdu1_data = x.split(",");
    for (let i = 2, k = 0; i <= 9; i++, k++) {
      ipdu1_arr[k] = parseInt(ipdu1_data[i]);
    }
  }
  if (y != "") {
    var ipdu2_data = y.split(",");
    for (let i = 2, k = 0; i <= 9; i++, k++) {
      ipdu2_arr[k] = parseInt(ipdu2_data[i]);
    }
  }
  if (z != "") {
    var ipdu3_data = z.split(",");
    for (let i = 2, k = 0; i <= 9; i++, k++) {
      ipdu3_arr[k] = parseInt(ipdu3_data[i]);
    }
  }

  psuDataShow();

  ipduSum_arr[0] = ipdu1_arr.reduce((x, y) => x + y, 0);
  ipduSum_arr[1] = ipdu2_arr.reduce((x, y) => x + y, 0);
  ipduSum_arr[2] = ipdu3_arr.reduce((x, y) => x + y, 0);
  updateBarChart();
}
// psu data insert end

// psu data show start 
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
    "r730-1-psu2",
    "r750-ps-2",
    "nas-ps-1",
    "r720-ps-1",
    "r730-1-ps-2",
    "r730-2-ps-1",
    "r730-3-ps-1",
    "san-sw-2-ps-1",
    "san-ps-1"
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
    "r750-d-ps-2",
    "nas-d-ps-1",
    "r720-d-ps-1",
    "r730-1-d-ps-2",
    "r730-2-d-ps-1",
    "r730-3-d-ps-1",
    "san-sw-2-d-ps-1",
    "san-d-ps-1"
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
    "1. R750 PS-2",
    "2. NAS PS-1",
    "3. R720 PS-1",
    "4. R730-1 PS-2",
    "5. R730-2 PS-1",
    "6. R730-3 PS-1",
    "7. SAN SW-2 PS-1",
    "8. SAN PS-1"
  ];

  // ipdu 1
  for (let i = 0, j = 0; i <= 7; i++, j++) {
    if (ipdu1_arr[i] >= 1) {
      psuOnShowData(psuId[j], psuDisplayId[j], ipdu1_arr[i]);
    } else {
      psuOffShowData(psuId[j], psuCardData[j]);
    }
  }
  // ipdu 2
  for (let i = 0, j = 8; i <= 7; i++, j++) {
    if (ipdu2_arr[i] >= 1) {
      psuOnShowData(psuId[j], psuDisplayId[j], ipdu2_arr[i]);
    } else {
      psuOffShowData(psuId[j], psuCardData[j]);
    }
  }
  // ipdu 3
  for (let i = 0, j = 16; i <= 7; i++, j++) {
    if (ipdu3_arr[i] >= 1) {
      psuOnShowData(psuId[j], psuDisplayId[j], ipdu3_arr[i]);
    } else {
      psuOffShowData(psuId[j], psuCardData[j]);
    }
  }
}
// psu on card
function psuOnShowData(psu_Id, psu_d_id, psu_value) {
  document.getElementById(psu_Id).innerText = "ON";
  document.getElementById(psu_Id).classList.add("on-btn");
  document.getElementById(psu_d_id).innerText = `${psu_value} VA`;
  document.getElementById(psu_d_id).classList.add("show-btn");
}

// psu off card
function psuOffShowData(psu_Id, psuCardData) {
  document.getElementById(psu_Id).innerText = "OFF";
  document.getElementById(psu_Id).classList.add("off-btn");
  let ul = document.getElementById("alert-list");
  let li = document.createElement("li");
  li.classList.add("alert-list-card");
  li.textContent = `${psuCardData} Failed.`;
  ul.appendChild(li);
}
// psu data show end

// alarm data show start
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

  for (let i = 0; i <= 4; i++) {
    // generator alarm only
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
    } //others 4 Alarm 
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
// alarm data show end

//device inforemation start
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
// device inforemation end

//clear all data start
function clearAllData() {
  document.getElementById("alert-list").innerHTML = "";

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
    "r730-1-psu2",
    "r750-ps-2",
    "nas-ps-1",
    "r720-ps-1",
    "r730-1-ps-2",
    "r730-2-ps-1",
    "r730-3-ps-1",
    "san-sw-2-ps-1",
    "san-ps-1"
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
    "r750-d-ps-2",
    "nas-d-ps-1",
    "r720-d-ps-1",
    "r730-1-d-ps-2",
    "r730-2-d-ps-1",
    "r730-3-d-ps-1",
    "san-sw-2-d-ps-1",
    "san-d-ps-1"
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
    "water-leakage", "fire-Alarm", "generator-status",
    "ups1-cb-status", "ups2-cb-status"
  ];
  for (let j = 0; j < alarmId.length; j++) {
    const alarmElem = document.getElementById(alarmId[j]);
    if (alarmElem) {
      alarmElem.innerText = "";
      alarmElem.className = "";
    }
  }
}
//clear all data end

// gauge data start
// gauge alert function start
function gaugeAlert(data, status) {
  let ul = document.getElementById("alert-list");
  let li = document.createElement("li");
  li.classList.add("alert-list-card");
  li.textContent = `${data} is ${status}.`;
  ul.appendChild(li);
}
// gauge alert function end

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
  valueElement.innerHTML = `${Math.round(value * 10) / 10} <span class="gauge-unit">${unit}</span>`;

  statusElement.textContent = status.text;
  statusElement.className = `status ${status.class}`;

  if (status.class !== "status-normal") {
    statusElement.classList.add("pulse");
  } else {
    statusElement.classList.remove("pulse");
  }
}
// gauge data update function 
function updateAllData(a, b, c, d, e, f) {
  const inputVoltage = parseFloat(a) || 0;
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

  const ups1Voltage = parseFloat(b) || 0;
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

  const ups2Voltage = parseFloat(c) || 0;
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

  const batteryVoltage = parseFloat(d) || 0;
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

  const temperature = parseFloat(e) || 0;
  updateGauge("temperature", temperature, {
    green: [0, 25.9],
    orange: [26, 31.9],
    red: [32, 55],
    max: 55,
  });

  if (temperature >= 26 && temperature <= 31.9) {
    gaugeAlert("Temperature", "high");
  } else if (temperature >= 32 && temperature <= 55) {
    gaugeAlert("Temperature", "very high");
  }

  const humidity = parseFloat(f) || 0;
  updateGauge("humidity", humidity, {
    green: [41, 80.9],
    orange: [81, 100],
    red: [0, 40.9],
    max: 100,
  });

  if (humidity >= 0 && humidity <= 40.9) {
    gaugeAlert("Humidity", "low");
  } else if (humidity >= 81 && humidity <= 100) {
    gaugeAlert("Humidity", "high");
  }
}
// gauge data end

//line chart declare start
let color = "white";
function initializeCharts() {
  const environmentCtx = document.getElementById("environment-chart").getContext("2d");
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
              size: window.innerWidth < 768 ? 10 : 14,
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
            maxTicksLimit: window.innerWidth < 768 ? 4 : 5,
            font: {
              size: window.innerWidth < 768 ? 8 : 12,
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
              size: window.innerWidth < 768 ? 8 : 12,
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
              size: window.innerWidth < 768 ? 8 : 12,
            },
          },
        },
      },
    },
  });
//line chart declare end

//bar chart declare start
  const voltageCtx = document.getElementById("voltage-chart").getContext("2d");
  barChart = new Chart(voltageCtx, {
    type: "bar",
    data: {
      labels: ["Ipdu1", "Ipdu2", "Ipdu3"],
      datasets: [
        {
          label: "Load (VA)",
          data: ipduSum_arr,
          backgroundColor: [
            "#fc5c65",
            "#fe9b13",
            "#3867d6",
          ],
          borderRadius: 10,
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
          anchor: "center",
          align: "center",
          offset: 0,
          backgroundColor: "transparent",
          // backgroundColor: "#0f1c2d",
          // borderRadius: 6,
          // padding: {
          //   top: 6,
          //   bottom: 6,
          //   left: 9,
          //   right: 9,
          // },
          color: "black",
          font: {
            size: window.innerWidth < 768 ? 10 : 20,
            weight: "700",
          },
          formatter: function (value) {
            const percent = Math.round((value * 100) / 3000);
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
              size: window.innerWidth < 768 ? 8 : 12,
            },
            callback: function (value) {
              return value;
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
              size: window.innerWidth < 768 ? 10 : 12,
            },
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}
window.addEventListener("load", initializeCharts);
//bar chart declare end

//chart fonts and resize update start
window.addEventListener('resize', function() {
  if (lineChart) {
    lineChart.options.plugins.legend.labels.font.size = window.innerWidth < 768 ? 10 : 14;
    lineChart.options.scales.x.ticks.font.size = window.innerWidth < 768 ? 8 : 12;
    lineChart.options.scales.y.ticks.font.size = window.innerWidth < 768 ? 8 : 12;
    lineChart.options.scales.y1.ticks.font.size = window.innerWidth < 768 ? 8 : 12;
    lineChart.update();
  }
  
  if (barChart) {
    barChart.options.plugins.datalabels.font.size = window.innerWidth < 768 ? 10 : 13;
    barChart.options.scales.y.ticks.font.size = window.innerWidth < 768 ? 8 : 12;
    barChart.options.scales.x.ticks.font.size = window.innerWidth < 768 ? 10 : 12;
    barChart.update();
  }
});
//chart fonts and resize update end

// update line chart start 
function updateLineChart(x, y) {
  let z = new Date().toLocaleTimeString();
  let date = new Date().toLocaleDateString("en-GB");

  document.getElementById("lastUpdateTime").textContent = z;
  document.getElementById("lastUpdateDate").textContent = date;

  for (let i = 0; i < 7; i++) {
    temp[i] = temp[i + 1];
    hum[i] = hum[i + 1];
    tim[i] = tim[i + 1];
  }

  temp[7] = parseFloat(x) || 0;
  hum[7] = parseFloat(y) || 0;
  tim[7] = z;

  if (lineChart) {
    lineChart.data.labels = [...tim];
    lineChart.data.datasets[0].data = [...temp];
    lineChart.data.datasets[1].data = [...hum];
    lineChart.update("none");
  }
}
// update line chart end

// update bar chart start
function updateBarChart() {
  if (barChart) {
    barChart.data.datasets[0].data = ipduSum_arr;
    barChart.update("none");
  }
}
// update line chart end