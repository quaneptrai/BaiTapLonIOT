// ==============================================================
// LƯU Ý: ĐÃ XÓA TẤT CẢ CÁC CÂU LỆNH IMPORT
// ==============================================================

// CẤU HÌNH FIREBASE THỰC TẾ CỦA BẠN
const firebaseConfig = {
  apiKey: "AIzaSyDscZ5RITwpdbrEJCZniFSpiE82lHu2aew",
  authDomain: "esp32project-60b4f.firebaseapp.com",
  databaseURL: "https://esp32project-60b4f-default-rtdb.firebaseio.com",
  projectId: "esp32project-60b4f",
  storageBucket: "esp32project-60b4f.firebasestorage.app",
  messagingSenderId: "460415134642",
  appId: "1:460415134642:web:acfb2c0d6864475b22d2ab",
  measurementId: "G-ETNR80TPSR",
};

// Khởi tạo Firebase và Database (Sử dụng Global Namespace)
firebase.initializeApp(firebaseConfig);
const database = firebase.database(); // Lấy tham chiếu đến database

// Định nghĩa các Node Firebase
const MOTOR_PATH = "motor";
const DATA_PATH = "sensor_data";

let sensorChart;

// --- 1. LÔGIC ĐIỀU KHIỂN MOTOR ---

document.getElementById("btn-on").addEventListener("click", () => {
  // Ghi trạng thái 'on' vào node /motor
  database.ref(MOTOR_PATH).set("on"); // Sử dụng database.ref().set()
});

document.getElementById("btn-off").addEventListener("click", () => {
  // Ghi trạng thái 'off' vào node /motor
  database.ref(MOTOR_PATH).set("off");
});

// Theo dõi trạng thái motor để cập nhật giao diện
database.ref(MOTOR_PATH).on("value", (snapshot) => {
  // Sử dụng database.ref().on("value")
  const status = snapshot.val();
  document.getElementById("motor-status").textContent =
    status === "on" ? "ĐANG BẬT" : "ĐANG TẮT";
});

// --- 2. XỬ LÝ DỮ LIỆU CẢM BIẾN VÀ BIỂU ĐỒ ---

// Theo dõi toàn bộ node sensor_data để lấy lịch sử
database.ref(DATA_PATH).on("value", (snapshot) => {
  const historyData = snapshot.val();

  if (!historyData) return;

  const labels = [];
  const tdsData = [];
  const tempData = [];
  let latestTDS = "--";
  let latestTemp = "--";

  // ... (Phần logic lặp và vẽ biểu đồ giữ nguyên) ...
  for (const key in historyData) {
    const item = historyData[key];

    if (key === "latest") {
      latestTDS = item.TDS;
      latestTemp = item.Temperature;
      continue;
    }

    const date = new Date(item.timestamp * 1000);
    labels.push(date.toLocaleTimeString());

    tdsData.push(item.TDS);
    tempData.push(item.Temperature);
  }

  // Cập nhật giá trị mới nhất lên giao diện
  document.getElementById("display-tds").textContent =
    latestTDS !== "--" ? latestTDS.toFixed(0) : "--";
  document.getElementById("display-temp").textContent =
    latestTemp !== "--" ? latestTemp.toFixed(1) : "--";
  document.getElementById("last-update").textContent =
    new Date().toLocaleTimeString();

  updateChart(labels, tdsData, tempData);
});

// --- 3. HÀM VẼ BIỂU ĐỒ SỬ DỤNG CHART.JS (Giữ nguyên) ---

function updateChart(labels, tdsData, tempData) {
  const ctx = document.getElementById("sensorChart").getContext("2d");

  if (sensorChart) {
    sensorChart.destroy();
  }

  sensorChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        // ... (Cấu hình datasets giữ nguyên) ...
        {
          label: "TDS (ppm)",
          data: tdsData,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          yAxisID: "yTDS",
          tension: 0.1,
        },
        {
          label: "Nhiệt độ (°C)",
          data: tempData,
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          yAxisID: "yTemp",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        yTDS: {
          type: "linear",
          display: true,
          position: "left",
          title: { display: true, text: "TDS (ppm)" },
        },
        yTemp: {
          type: "linear",
          display: true,
          position: "right",
          title: { display: true, text: "Nhiệt độ (°C)" },
          grid: { drawOnChartArea: false },
        },
      },
    },
  });
}
