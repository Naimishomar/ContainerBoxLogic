import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

// Initialize GenAI
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

// 🔹 Types
type Box = {
  id: number;
  length: string;
  width: string;
  height: string;
  weight: string;
  quantity: string;
  stackLimit: string;
  stackable: boolean;
};

type Container = {
  length: string;
  width: string;
  height: string;
  maxWeight: string;
};

type Placement = {
  boxId: number;
  container: number;
  x: number;
  y: number;
  z: number;
};

export default function AiPlacement() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [container, setContainer] = useState<Container>({
    length: "",
    width: "",
    height: "",
    maxWeight: "",
  });
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add new box
  const addBox = () => {
    setBoxes((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        length: "",
        width: "",
        height: "",
        weight: "",
        quantity: "",
        stackLimit: "",
        stackable: true,
      },
    ]);
  };

  // Update box field
  const updateBox = <K extends keyof Box>(id: number, field: K, value: Box[K]) => {
    setBoxes(
      boxes.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // Optimize packing using new GenAI SDK
const handleOptimize = async () => {
  setLoading(true);
  setError("");
  setPlacements([]);

  try {
    const cLength = Number(container.length);
    const cWidth = Number(container.width);
    const cHeight = Number(container.height);
    const cMaxWeight = Number(container.maxWeight);

    const boxesData = boxes.map((b) => ({
      ...b,
      length: Number(b.length),
      width: Number(b.width),
      height: Number(b.height),
      weight: Number(b.weight),
      quantity: Number(b.quantity),
      stackLimit: Number(b.stackLimit),
    }));

    const prompt = `
      You are solving a 3D bin-packing problem.
      Container: ${cLength} x ${cWidth} x ${cHeight}, 
      Max Weight: ${cMaxWeight}.
      
      Boxes:
      ${boxesData
        .map(
          (b) =>
            `Box ${b.id}: ${b.length}x${b.width}x${b.height}, weight=${b.weight}, quantity=${b.quantity}, stackLimit=${b.stackLimit}, stackable=${b.stackable}`
        )
        .join("\n")}

      Return ONLY valid JSON array in format:
      [
        { "boxId": number, "container": number, "x": number, "y": number, "z": number }
      ]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // ✅ Clean AI output: remove markdown, backticks, and extra text
    let text = response?.text?.trim();
    if (!text) {
    throw new Error("AI response is empty");
    }
    text = text.replace(/^```json\s*/i, "");
    text = text.replace(/```$/, "");
    
    const parsed: Placement[] = JSON.parse(text);
    setPlacements(parsed);
  } catch (err) {
    console.error(err);
    setError("Failed to optimize packing. Try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-center py-10 gap-10">
      <h1 className="text-3xl font-bold">📦 Box Packing Optimizer</h1>

      {/* Container Input */}
      <div className="bg-white/10 p-5 rounded-lg min-w-md flex flex-col gap-2 w-96">
        <h2 className="text-xl font-semibold">Container</h2>
        {(Object.keys(container) as (keyof Container)[]).map((field) => (
          <input
            key={field}
            type="text"
            placeholder={`Enter ${field}`}
            value={container[field]}
            onChange={(e) =>
              setContainer({ ...container, [field]: e.target.value })
            }
            className="bg-gray-600 px-3 py-2 rounded-lg mt-1"
          />
        ))}
      </div>

      {/* Boxes Input */}
      <div className="flex flex-col gap-5 w-full items-center">
        <h2 className="text-xl font-semibold">Boxes</h2>
        {boxes.map((box) => (
          <div
            key={box.id}
            className="bg-white/10 p-5 rounded-lg w-96 flex flex-col gap-2"
          >
            <h3 className="font-semibold">Box {box.id}</h3>
            {(
              ["length", "width", "height", "weight", "quantity", "stackLimit"] as (keyof Box)[]
            ).map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field}
                value={box[field] as number}
                onChange={(e) =>
                  updateBox(box.id, field, e.target.value as any)
                }
                className="bg-gray-600 px-3 py-2 rounded-lg"
              />
            ))}
            <select
              value={box.stackable ? "stackable" : "unstackable"}
              onChange={(e) =>
                updateBox(box.id, "stackable", e.target.value === "stackable")
              }
              className="py-2 outline-none text-white bg-gray-600 rounded-lg"
            >
              <option value="stackable">Stackable</option>
              <option value="unstackable">Unstackable</option>
            </select>
          </div>
        ))}
        <button
          onClick={addBox}
          className="bg-green-500 px-4 py-2 rounded mt-2 hover:bg-green-600 cursor-pointer"
        >
          ➕ Add Box
        </button>
      </div>

      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={loading}
        className="bg-blue-500 px-6 py-3 rounded-lg font-bold mt-5 hover:bg-blue-600 cursor-pointer"
      >
        {loading ? "Optimizing..." : "🚀 Optimize Packing"}
      </button>

      {/* Error */}
      {error && <p className="text-red-400">{error}</p>}

      {/* Placements Table */}
      {placements.length > 0 && (
        <div className="w-3/4 mt-5">
          <h2 className="text-xl font-semibold mb-3">Optimized Placements</h2>
          <table className="w-full border border-gray-500 text-center">
            <thead className="bg-gray-700">
              <tr>
                <th className="border px-2 py-1">BoxId</th>
                <th className="border py-1">Container</th>
                <th className="border px-2 py-1">X</th>
                <th className="border px-2 py-1">Y</th>
                <th className="border px-2 py-1">Z</th>
                <th className="border px-2 py-1">Type</th>
              </tr>
            </thead>
            <tbody>
            {placements.map((p, idx) => {
                const box = boxes.find(b => b.id === p.boxId);
                return (
                <tr key={idx} className="hover:bg-gray-800">
                    <td className="border px-2 py-1">{idx +1}</td>
                    <td className="border py-1">{p.container}</td>
                    <td className="border px-2 py-1">{p.x}</td>
                    <td className="border px-2 py-1">{p.y}</td>
                    <td className="border px-2 py-1">{p.z}</td>
                    <td className="border px-2 py-1">{box?.stackable ? "stackable" : "unstackable"}</td>
                </tr>
                );
            })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
