// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";

// const WeeklyStats = () => {
//   const [weekOffset, setWeekOffset] = useState(0);
//   const [labels, setLabels] = useState(null);
//   const [records, setRecords] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const{projectId,userId}=useParams()

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//         //const userId=localStorage.getItem(userId)
//         console.log("userid",userId)
//       const [labelsRes, recordsRes] = await Promise.all([
//         axios.get(`http://localhost:8000/api/employee/weekly-labels/${projectId}/${userId}`, {
//           params: { week_offset: weekOffset },
//         }),
//         axios.get(`http://localhost:8000/api/employee/weekly-records/${projectId}/${userId}`, {
//           params: { week_offset: weekOffset },
//         }),
//       ]);

//       setLabels(labelsRes.data);
//       setRecords(recordsRes.data);
//     } catch (err) {
//       console.error("Error fetching week data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [weekOffset]);

//   const goBack = () => setWeekOffset((prev) => prev - 1);
//   const goNext = () => setWeekOffset((prev) => prev + 1);
//   console.log(labels,records)

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Weekly Stats</h2>

//       <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
//         <button onClick={goBack}>⬅ Back</button>
//         <button onClick={goNext}>Next ➡</button>
//       </div>

//       {loading && <p>Loading...</p>}

//       {labels && records && (
//         <>
//           <h3>
//             Week: {labels.week_start} → {labels.week_end}
//           </h3>

//           {/* LABEL COUNTS */}
//           <div style={{ marginTop: "20px" }}>
//             <h4>Total Labels / Day</h4>
//             <table border="1" cellPadding="8">
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Labels</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {Object.entries(labels.days).map(([day, count]) => (
//                   <tr key={day}>
//                     <td>{day}</td>
//                     <td>{count}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* RECORD COUNTS */}
//           <div style={{ marginTop: "20px" }}>
//             <h4>Total Records / Day</h4>
//             <table border="1" cellPadding="8">
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Records</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {Object.entries(records.days).map(([day, count]) => (
//                   <tr key={day}>
//                     <td>{day}</td>
//                     <td>{count}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default WeeklyStats;





import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Bar
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const WeeklyStats = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [labelsData, setLabelsData] = useState(null);
  const [recordsData, setRecordsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const {projectId,userId}=useParams()

  const fetchData = async () => {
    setLoading(true);
    try {
      const [labelsRes, recordsRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/employee/weekly-labels/${projectId}/${userId}`, {
          params: { week_offset: weekOffset },
        }),
        axios.get(`http://localhost:8000/api/employee/weekly-records/${projectId}/${userId}`, {
          params: { week_offset: weekOffset },
        }),
      ]);

      setLabelsData(labelsRes.data);
      setRecordsData(recordsRes.data);
    } catch (err) {
      console.error("Error fetching week data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [weekOffset]);

  const days = labelsData ? Object.keys(labelsData.days) : [];

  const chartData = {
    labels: days,
    datasets: [
      {
        label: "Labels",
        data: days.map((d) => labelsData.days[d]),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderRadius: 6,
      },
      {
        label: "Records",
        data: days.map((d) => recordsData.days[d]),
        backgroundColor: "rgba(153, 102, 255, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14 } },
      },
      tooltip: {
        backgroundColor: "#000",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 12 } },
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: 12 } },
      },
    },
  };

  const goBack = () => setWeekOffset((prev) => prev - 1);
  const goNext = () => setWeekOffset((prev) => prev + 1);

  return (
    <div style={{ padding: "25px", maxWidth: "900px", margin: "auto" }}>
      <h2 style={{ marginBottom: "10px" }}>Weekly Performance</h2>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <button
          onClick={goBack}
          style={{
            padding: "8px 15px",
            borderRadius: "6px",
            border: "1px solid #aaa",
            cursor: "pointer",
          }}
        >
          ⬅ Back
        </button>
        <button
          onClick={goNext}
          style={{
            padding: "8px 15px",
            borderRadius: "6px",
            border: "1px solid #aaa",
            cursor: "pointer",
          }}
        >
          Next ➡
        </button>
      </div>

      {/* Week Range */}
      {labelsData && (
        <h4 style={{ marginBottom: "20px", color: "#666" }}>
          {labelsData.week_start} → {labelsData.week_end}
        </h4>
      )}

      {/* Chart */}
      {loading ? (
        <p>Loading chart...</p>
      ) : (
        labelsData &&
        recordsData && (
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )
      )}
    </div>
  );
};

export default WeeklyStats;
