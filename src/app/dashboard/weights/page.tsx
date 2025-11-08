"use client";
import React, { useEffect, useState } from "react";

export default function WeightsPage() {
  const [week, setWeek] = useState<number>(10);
  const [status, setStatus] = useState("");

  useEffect(()=>{
    fetch("/api/cron/week").then(r=>r.json()).then(d=>setWeek(d.week));
  },[]);

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">⚙️ Weights</h1>
      <p className="text-gray-400">Week {week}</p>
      <p className="text-sm text-gray-400">Weights are currently fixed in code (DEFAULT_WEIGHTS). We can expose sliders later.</p>
    </div>
  );
}
