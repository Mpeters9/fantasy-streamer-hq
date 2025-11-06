"use client";
import React, { useState, useEffect } from "react";
import { defaultWeights, WeightConfig } from "@/lib/scoring-engine";

export default function WeightsPanel() {
  const [weights, setWeights] = useState<WeightConfig>(defaultWeights);

  useEffect(() => {
    const saved = localStorage.getItem("weights");
    if (saved) setWeights(JSON.parse(saved));
  }, []);

  const handleChange = (key: keyof WeightConfig, value: number) => {
    const updated = { ...weights, [key]: value };
    setWeights(updated);
    localStorage.setItem("weights", JSON.stringify(updated));
  };

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      {Object.entries(weights).map(([key, val]) => (
        <div key={key}>
          <label className="text-sm capitalize">{key}</label>
          <input
            type="range"
            min={0}
            max={100}
            value={val}
            onChange={(e) => handleChange(key as keyof WeightConfig, +e.target.value)}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{val}%</span>
        </div>
      ))}
    </div>
  );
}
