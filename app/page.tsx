"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Home() {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHazardous, setShowHazardous] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/asteroids/today`)
      .then(res => res.json())
      .then(data => {
        console.log("API DATA 👉", data);
        setAsteroids(data.asteroids);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-2xl">
        ☄️ Loading asteroid data...
      </div>
    );

  const filtered = (showHazardous
    ? asteroids.filter(a => a.is_hazardous)
    : asteroids
  ).sort((a,b) => b.risk_score - a.risk_score);

  const hazardousCount = asteroids.filter(a => a.is_hazardous).length;
  const fastest = [...asteroids].sort((a,b)=>b.velocity_kmph-a.velocity_kmph)[0];
  const closest = [...asteroids].sort((a,b)=>a.miss_distance_km-b.miss_distance_km)[0];

  // 📊 CHART DATA
  const riskCounts = {
    Low: asteroids.filter(a => a.risk_level === "Low").length,
    Moderate: asteroids.filter(a => a.risk_level === "Moderate").length,
    High: asteroids.filter(a => a.risk_level === "High").length,
    Extreme: asteroids.filter(a => a.risk_level === "Extreme").length,
  };

  const pieData = {
    labels: ["Low","Moderate","High","Extreme"],
    datasets:[{
      data:Object.values(riskCounts),
      backgroundColor:["green","yellow","orange","red"]
    }]
  };

  const barData = {
    labels: asteroids.slice(0,5).map(a=>a.name),
    datasets:[{
      label:"Velocity (km/h)",
      data: asteroids.slice(0,5).map(a=>a.velocity_kmph),
      backgroundColor:"cyan"
    }]
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      
      <h1 className="text-4xl font-bold text-center mb-2">☄️ Cosmic Watch</h1>
      <p className="text-center text-slate-400 mb-8">
        Near Earth Object Monitoring Dashboard
      </p>

      {/* 🚨 ALERT */}
      {asteroids.some(a => a.risk_level === "Extreme" || a.risk_level === "High") && (
        <div className="bg-red-700 p-4 rounded-xl text-center mb-6 animate-pulse">
          🚨 ALERT: High-risk asteroid detected today!
        </div>
      )}

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Stat title="Asteroids Today" value={asteroids.length} />
        <Stat title="Hazardous" value={hazardousCount} />
        <Stat title="Fastest (km/h)" value={Math.round(fastest.velocity_kmph)} />
        <Stat title="Closest (km)" value={Math.round(closest.miss_distance_km)} />
      </div>

      {/* FILTER */}
      <div className="text-center mb-6">
        <button
          onClick={()=>setShowHazardous(!showHazardous)}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl"
        >
          {showHazardous ? "Show All Asteroids" : "Show Hazardous Only"}
        </button>
      </div>

      {/* 📊 CHARTS */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-slate-900 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4 text-center">Risk Distribution</h2>
          <Pie data={pieData} />
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4 text-center">Top 5 Fastest Asteroids</h2>
          <Bar data={barData} />
        </div>
      </div>
      {/* 🧠 RISK SCORE EXPLANATION */}
<div className="bg-slate-900 p-6 rounded-2xl mb-10">
  <h2 className="text-2xl font-bold mb-4 text-center">
    🧠 How Risk Score is Calculated
  </h2>

  <div className="grid md:grid-cols-4 gap-4 text-center">

    <div className="bg-slate-800 p-4 rounded-xl">
      <h3 className="text-lg font-bold text-red-400">+50</h3>
      <p>Potentially Hazardous</p>
    </div>

    <div className="bg-slate-800 p-4 rounded-xl">
      <h3 className="text-lg font-bold text-orange-400">+20</h3>
      <p>Velocity &gt; 50,000 km/h</p>
    </div>

    <div className="bg-slate-800 p-4 rounded-xl">
      <h3 className="text-lg font-bold text-yellow-300">+20</h3>
      <p>Miss Distance &lt; 5M km</p>
    </div>

    <div className="bg-slate-800 p-4 rounded-xl">
      <h3 className="text-lg font-bold text-green-400">+10</h3>
      <p>Diameter &gt; 0.5 km</p>
    </div>

  </div>
</div>
      {/* ASTEROID CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        {filtered.map((a,i)=>(
          <div key={i} className="bg-slate-900 p-5 rounded-2xl shadow-lg hover:scale-105 transition">
            <h2 className="text-xl font-bold mb-2">{a.name}</h2>

            <p>🚀 Velocity: {Math.round(a.velocity_kmph)} km/h</p>
            <p>📏 Diameter: {a.diameter_km} km</p>
            <p>🌍 Miss Distance: {Math.round(a.miss_distance_km)} km</p>

            <div className="mt-3">
              {a.is_hazardous ?
                <span className="bg-red-600 px-3 py-1 rounded-full">Hazardous</span> :
                <span className="bg-green-600 px-3 py-1 rounded-full">Safe</span>
              }
            </div>

            <div className="mt-4">
              <p className="text-sm text-slate-400">Risk Score</p>
              <p className="text-2xl font-bold">{a.risk_score}/100</p>

              <div className="w-full bg-slate-700 h-2 rounded mt-2">
                <div
                  className={`h-2 rounded ${
                    a.risk_level === "Extreme" ? "bg-red-600" :
                    a.risk_level === "High" ? "bg-orange-500" :
                    a.risk_level === "Moderate" ? "bg-yellow-400" :
                    "bg-green-500"
                  }`}
                  style={{width:`${a.risk_score}%`}}
                />
              </div>

              <div className={`mt-2 px-3 py-1 rounded-full text-sm w-fit ${
                a.risk_level === "Extreme" ? "bg-red-700" :
                a.risk_level === "High" ? "bg-orange-500" :
                a.risk_level === "Moderate" ? "bg-yellow-500 text-black" :
                "bg-green-600"
              }`}>
                {a.risk_level} Risk
              </div>
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}

function Stat({title,value}) {
  return (
    <div className="bg-slate-900 p-4 rounded-2xl text-center shadow">
      <h3 className="text-slate-400">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
