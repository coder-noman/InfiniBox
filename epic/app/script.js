// Authentication start
(function () {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userType = localStorage.getItem("userType");

  if (!isAuthenticated || (userType !== "admin" && userType !== "client")) {
    window.location.href = "../../registration.html";
    return;
  }

  const logoutBtn = document.getElementById("log-out");

  if (logoutBtn) {
    logoutBtn.setAttribute('tabindex', '0');
    logoutBtn.setAttribute('role', 'button');

    function logoutAction(e) {
      if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();

        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userType");
        localStorage.removeItem("username");

        window.location.href = "../../registration.html";
      }
    }

    logoutBtn.addEventListener('click', logoutAction);
    logoutBtn.addEventListener('keydown', logoutAction);
  }

})();
// Authentication End

//Declare psu array and variable
let alarm_arr = [0, 0, 0, 0, 0];

// Chart array and variable Declare
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
let lineChart;

// Default Data Show Start
updateAllData(0, 0, 0, 0, 0, 0, 0);
updateLineChart(0, 0);
updateAlarmData(0, 0, 0, 0, 0);
// Default Data Show end

//.........websocket_client code Start..............
var socket = new WebSocket("ws://27.147.170.162:81");
socket.onmessage = function (event) {
  const data = event.data.split(":");
  const data_catagory = data[0] || "";
  const msg = data[1] || "";

  // checking data is coming or not start
  if (data_catagory !== "Epic_HO") {
    return;
  }

  // Clear all data function
  clearAllData();

  console.log(data[1]);

  var splited_data = data[1].split(",");

  console.log("splited data is ", splited_data[0]);

  // Main Gauge
  updateAllData(
    splited_data[0],
    splited_data[1],
    splited_data[2],
    splited_data[3],
    splited_data[4],
    splited_data[5],
    splited_data[7]
  );

  // Line chart Data
  updateLineChart(splited_data[5], splited_data[7]);

  // Device Inforfation
  const ho_main = document.getElementById("main_ho");
  if (ho_main) {
    deviceInformation(
      splited_data[14],
      splited_data[15],
      splited_data[16],
      splited_data[17],
      splited_data[18],
      splited_data[19],
      splited_data[20]
    );
  }

  // Others Alarm Unit
  updateAlarmData(
    splited_data[1],
    splited_data[2],
    splited_data[12],
    splited_data[13],
    splited_data[9]
  );
};
//.........websocket_client code end..............

//Making alarm array start
function updateAlarmData(a, b, c, d, e) {
  if (a > 80) {
    alarm_arr[0] = 1;
  } else {
    alarm_arr[0] = 0;
  }
  if (b > 80) {
    alarm_arr[1] = 1;
  } else {
    alarm_arr[1] = 0;
  }
  alarm_arr[2] = c;
  alarm_arr[3] = d;
  alarm_arr[4] = e;

  alarmData(alarm_arr);
}
//Making alarm array end

//Alarm data start
function alarmData(x, input_voltage) {
  const alarmId = [
    "ups1-status",
    "ups2-status",
    "ups1-cb-status",
    "ups2-cb-status",
    "water-leakage",
  ];
  const alarmCardId = [
    "UPS1 Status",
    "UPS2 Status",
    "Ups1 cb Status",
    "Ups2 cb Status",
    "Water Leakage",
  ];
  const alarmData = [
    ["Failed", "Active"],
    ["Failed", "Active"],
    ["Tripped", "ok"],
    ["Tripped", "ok"],
    ["Detected", "No Alarm"],
  ];

  for (i = 0; i <= 4; i++) {
    if (x[i] == 1) {
      document.getElementById(alarmId[i]).innerText = alarmData[i][1];
      document.getElementById(alarmId[i]).classList.add("on-btn"); //green
    } else {
      document.getElementById(alarmId[i]).innerText = alarmData[i][0];
      document.getElementById(alarmId[i]).classList.add("off-btn"); //red
      let ul = document.getElementById("alert-list");
      let li = document.createElement("li");
      li.classList.add("alert-list-card");
      li.textContent = `${alarmCardId[i]} is ${alarmData[i][0]}`;
      ul.appendChild(li);
    }
  }
}
//Alarm data end

//Gauge alert start
function gaugeAlert(data, status) {
  let ul = document.getElementById("alert-list");
  let li = document.createElement("li");
  li.classList.add("alert-list-card");
  li.textContent = `${data} is ${status}.`;
  ul.appendChild(li);
}

//Gauge alert end

// device Information start
function deviceInformation(lan, gsmOp, gsmSig, ib, psu1, psu2, ds) {
  const lanIp = document.getElementById("device-lan");
  const gsmOperator = document.getElementById("gsm-operator");
  const gsmSignal = document.getElementById("gsm-signal");
  const internalBattery = document.getElementById("internal-battery");
  const devicePsu1 = document.getElementById("device-psu1");
  const devicePsu2 = document.getElementById("device-psu2");
  const dataSource = document.getElementById("data-source");

  // Lan IP
  lanIp.innerHTML = `: ${lan}`;

  // Gsm Operator
  gsmOperator.innerText = `: ${gsmOp}`;

  // if(gsmOp == 0){
  //   gsmOperator.innerText = ': Not Found';
  // }else if(gsmOp == 1){
  //   gsmOperator.innerText = ': GP';
  // }else if(gsmOp == 2){
  //   gsmOperator.innerText = ': Robi';
  // }else if(gsmOp == 3){
  //   gsmOperator.innerText = ': Banglalink';
  // }else if(gsmOp == 4){
  //   gsmOperator.innerText = ': Airtel';
  // }else if(gsmOp == 5){
  //   gsmOperator.innerText = ': Teletalk';
  // }

  // Gsm Signal
  gsmSignal.innerText = `: ${gsmSig} %`;

  // Internal Battery
  internalBattery.innerText = `: ${ib} V`;

  // Psu Stutus 1
  if (psu1 == 1) {
    devicePsu1.innerText = `: OK`;
  } else {
    devicePsu1.innerText = `: Failed`;
  }

  // Psu Stutus 2
  if (psu2 == 1) {
    devicePsu2.innerText = `: OK`;
  } else {
    devicePsu2.innerText = `: Failed`;
  }

  // Data Source
  if (ds == 0) {
    dataSource.innerText = `: LAN`;
  } else if (ds == 1) {
    dataSource.innerText = `: WIFI`;
  } else if (ds == 2) {
    dataSource.innerText = `: GPRS`;
  }
}
// device Information end

// clear all data function start
function clearAllData() {
  document.getElementById("alert-list").innerHTML = "";

  // Clear alarm elements
  const alarmId = [
    "ups1-status",
    "ups2-status",
    "ups1-cb-status",
    "ups2-cb-status",
    "water-leakage",
  ];
  for (let j = 0; j < alarmId.length; j++) {
    const alarmElem = document.getElementById(alarmId[j]);
    if (alarmElem) {
      alarmElem.innerText = "";
      alarmElem.className = "";
    }
  }
}
// clear all data function end

// gauge data start
//getting color
function getColor(value, ranges) {
  if (value >= ranges.green[0] && value <= ranges.green[1]) {
    return "#4ECDC4"; // Green
  } else if (value >= ranges.orange[0] && value <= ranges.orange[1]) {
    return "#FE9B13"; // Orange
  } else {
    return "#FC5C65"; // Red
  }
}

// get status
function getStatus(value, ranges) {
  if (value >= ranges.green[0] && value <= ranges.green[1]) {
    return { text: "Normal", class: "status-normal" };
  } else if (value >= ranges.orange[0] && value <= ranges.orange[1]) {
    return { text: "Warning", class: "status-warning" };
  } else {
    return { text: "Danger", class: "status-danger" };
  }
}

// update circular gauge
function updateGauge(elementId, value, ranges) {
  const fillElement = document.getElementById(`${elementId}-fill`);
  const valueElement = document.getElementById(`${elementId}-value`);
  const statusElement = document.getElementById(`${elementId}-status`);

  // Calculate rotation based on value (0 to 360 degrees for 0 to max value)
  const rotation = (value / ranges.max) * 360;

  // Get color and status
  const color = getColor(value, ranges);
  const status = getStatus(value, ranges);

  // Update gauge fill
  fillElement.style.background = `conic-gradient(${color} 0deg ${rotation}deg, transparent ${rotation}deg 360deg)`;
  fillElement.style.color = color;

  // Update value (keep the unit span)
  const unit = valueElement.querySelector(".gauge-unit")?.textContent || "";
  valueElement.innerHTML = `${value} <span class="gauge-unit">${unit}</span>`;

  // Update status
  statusElement.textContent = status.text;
  statusElement.className = `status ${status.class}`;

  // Add pulse animation for warning and danger statuses
  if (status.class !== "status-normal") {
    statusElement.classList.add("pulse");
  } else {
    statusElement.classList.remove("pulse");
  }
}

//update all gauge data
function updateAllData(a, b, c, d, e, f, g) {
  // Input Voltage (0-300V)
  const inputVoltage = a;
  updateGauge("input-voltage", inputVoltage, {
    green: [191, 245],
    orange: [0, 190],
    red: [246, 300],
    max: 300,
  });

  // Alert for inputVoltage
  if (inputVoltage >= 0 && inputVoltage <= 190) {
    gaugeAlert("Input Voltage", "low");
  } else if (inputVoltage >= 246 && inputVoltage <= 300) {
    gaugeAlert("Input Voltage", "high");
  }

  // UPS1 Output Voltage (0-300V)
  const ups1Voltage = b;
  updateGauge("ups1-voltage", ups1Voltage, {
    green: [211, 230],
    orange: [0, 210],
    red: [231, 300],
    max: 300,
  });

  // Alert for Ups1
  if (ups1Voltage >= 0 && ups1Voltage <= 210) {
    gaugeAlert("UPS1 Voltage", "low");
  } else if (ups1Voltage >= 231 && ups1Voltage <= 300) {
    gaugeAlert("UPS1 Voltage", "high");
  }

  // UPS2 Output Voltage (0-300V)
  const ups2Voltage = c;
  updateGauge("ups2-voltage", ups2Voltage, {
    green: [211, 230],
    orange: [0, 210],
    red: [231, 300],
    max: 300,
  });

  // Alert for Ups2
  if (ups2Voltage >= 0 && ups2Voltage <= 210) {
    gaugeAlert("UPS2 Voltage", "low");
  } else if (ups2Voltage >= 231 && ups2Voltage <= 300) {
    gaugeAlert("UPS2 Voltage", "high");
  }

  // Battery Voltage 1 (0-220V)
  const batteryVoltage1 = d;
  updateGauge("battery-voltage1", batteryVoltage1, {
    green: [193, 220],
    orange: [185, 192],
    red: [0, 184],
    max: 220,
  });

  // Alert for Battery Voltage 1
  if (batteryVoltage1 >= 185 && batteryVoltage1 <= 192) {
    gaugeAlert("Battery Voltage 1", "low");
  } else if (batteryVoltage1 >= 0 && batteryVoltage1 <= 184) {
    gaugeAlert("Battery Voltage 1", "very Low");
  }

  // Battery Voltage 2 (0-220V)
  const batteryVoltage2 = e;
  updateGauge("battery-voltage2", batteryVoltage2, {
    green: [193, 220],
    orange: [185, 192],
    red: [0, 184],
    max: 220,
  });

  // Alert for Battery Voltage 2
  if (batteryVoltage2 >= 185 && batteryVoltage2 <= 192) {
    gaugeAlert("Battery Voltage 2", "low");
  } else if (batteryVoltage2 >= 0 && batteryVoltage2 <= 184) {
    gaugeAlert("Battery Voltage 2", "very Low");
  }

  // Temperature (0-55°C)
  const temperature = f;
  updateGauge("temperature", temperature, {
    green: [0, 28],
    orange: [28.1, 30],
    red: [30.1, 55],
    max: 55,
  });

  // Alert for Temperature
  if (temperature >= 26 && temperature <= 31) {
    gaugeAlert("Temperature", "high");
  } else if (temperature >= 32 && temperature <= 55) {
    gaugeAlert("Temperature", "very high");
  }

  // Humidity (0-100%)
  const humidity = g;
  updateGauge("humidity", humidity, {
    green: [41, 80],
    orange: [81, 100],
    red: [0, 40],
    max: 100,
  });

  // Alert for Humidity
  if (humidity >= 0 && humidity <= 40) {
    gaugeAlert("Humidity", "low");
  } else if (humidity >= 81 && humidity <= 100) {
    gaugeAlert("Humidity", "high");
  }
}
// updateAllData();
// gauge data end

// Chart data start
let color = "white";

// Initialize charts on page load
function initializeCharts() {
  // Environment Chart (Line Chart)
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
}

// Initialize charts when the page loads
window.addEventListener("load", initializeCharts);

// update Line chart
function updateLineChart(x, y) {
  //getting time
  let z = new Date().toLocaleTimeString();
  let date = new Date().toLocaleDateString();

  document.getElementById("lastUpdateTime").textContent = z;
  document.getElementById("lastUpdateDate").textContent = date;

  // Data shifting
  for (let i = 0; i < 7; i++) {
    temp[i] = temp[i + 1];
    hum[i] = hum[i + 1];
    tim[i] = tim[i + 1];
  }

  temp[7] = x;
  hum[7] = y;
  tim[7] = z;

  // Update Line chart
  if (lineChart) {
    lineChart.data.labels = [...tim];
    lineChart.data.datasets[0].data = [...temp];
    lineChart.data.datasets[1].data = [...hum];
    lineChart.update("none");
  }
}
// Chart data end

// Sidebar Dropdown
// const allDropdown = document.querySelectorAll('#sidebar .side-dropdown');
// const sidebar = document.getElementById('sidebar');

// allDropdown.forEach(item => {
// 	const a = item.parentElement.querySelector('a:first-child');
// 	a.addEventListener('click', function (e) {
// 		e.preventDefault();

// 		if (!this.classList.contains('active')) {
// 			allDropdown.forEach(i => {
// 				const aLink = i.parentElement.querySelector('a:first-child');

// 				aLink.classList.remove('active');
// 				i.classList.remove('show');
// 			})
// 		}

// 		this.classList.toggle('active');
// 		item.classList.toggle('show');
// 	})
// })
