import { useState } from "react";

function BoxModel() {
  const [boxLength, setBoxLength] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);
  const [boxHeight, setBoxHeight] = useState(0);
  const [boxWeight, setBoxWeight] = useState(0);
  const [boxQuantity, setBoxQuantity] = useState(0);
  const [boxStackLimit, setBoxStackLimit] = useState(1);

  const [containerLength, setContainerLength] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWeight, setContainerWeight] = useState(0);

  const [containersRequired, setContainersRequired] = useState<number>(0);
  const [stackable, setStackable] = useState(true);
  const [error, setError] = useState<string>("");

  const calculate = () => {
    setError("");
    if (boxLength === 0 || boxWidth === 0 || boxHeight === 0) {
      setError("Box dimensions must be greater than 0");
      return;
    }
    if (containerLength === 0 || containerWidth === 0 || containerHeight === 0) {
      setError("Container dimensions must be greater than 0");
      return;
    }
    if (boxHeight > containerHeight) {
      setError("Box height is greater than container height");
      return;
    }
    const edgeLength = Math.floor(containerLength / boxLength);
    const edgeWidth = Math.floor(containerWidth / boxWidth);
    const edgeHeight = Math.floor(containerHeight / boxHeight);
    const boxesPerLayer = edgeLength * edgeWidth;
    if (boxesPerLayer === 0) {
      setError("Box cannot fit on container base");
      return;
    }
    const maxLayers = stackable ? Math.min(edgeHeight, boxStackLimit) : 1;
    const boxesPerContainer = boxesPerLayer * maxLayers;
    // const maxByWeight = Math.floor(containerWeight / boxWeight);
    // if (maxByWeight > 0) {
    //   boxesPerContainer = Math.min(boxesPerContainer, maxByWeight);
    // }
    // if (boxesPerContainer === 0) {
    //   setError("Container cannot hold even one box (size or weight issue)");
    //   return;
    // }
    const required = Math.ceil(boxQuantity / boxesPerContainer);
    setContainersRequired(required);
  };


  return (
    <div className="w-full h-full bg-black text-white flex flex-col items-center py-10 gap-10">
      <div className="flex gap-20">
        <div className="bg-white/10 p-5 rounded-lg min-w-md flex flex-col h-full gap-2">
          <h1 className="text-2xl font-semibold text-center">Boxes</h1>
          <label>Length</label>
          <input type="number" value={boxLength} onChange={(e) => setBoxLength(Number(e.target.value))} className="bg-gray-600 px-3 py-2 rounded-lg" />
          <label>Width</label>
          <input type="number" value={boxWidth} onChange={(e) => setBoxWidth(Number(e.target.value))} className="bg-gray-600 px-3 py-2 rounded-lg" />
          <label>Height</label>
          <input type="number" value={boxHeight} onChange={(e) => setBoxHeight(Number(e.target.value))} className="bg-gray-600 px-3 py-2 rounded-lg" />
          <label>Weight</label>
          <input type="number" value={boxWeight} onChange={(e) => setBoxWeight(Number(e.target.value))} className="bg-gray-600 px-3 py-2 rounded-lg" />
          <label>Quantity</label>
          <input type="number" value={boxQuantity} onChange={(e) => setBoxQuantity(Number(e.target.value))} className="bg-gray-600 px-3 py-2 rounded-lg" />

          {stackable && (
            <>
              <label>Stack Limit</label>
              <input type="number" value={boxStackLimit} onChange={(e) => setBoxStackLimit(Number(e.target.value))} className="bg-gray-600 px-3 py-2 rounded-lg" />
            </>
          )}

          <select value={stackable ? "stackable" : "unstackable"} onChange={(e) => setStackable(e.target.value === "stackable")} className="py-2 outline-none text-black">
            <option value="stackable">Stackable</option>
            <option value="unstackable">Unstackable</option>
          </select>
        </div>

        <div className="bg-white/10 p-5 rounded-lg min-w-md flex flex-col h-full gap-2">
          <h1 className="text-2xl font-semibold text-center">Container</h1>
          <label>Length</label>
          <input type="number" value={containerLength} onChange={(e) => setContainerLength(Number(e.target.value))} className="bg-gray-600 px-3 py-2 rounded-lg" />
          <label>Width</label>
          <input type="number" value={containerWidth} onChange={(e) => setContainerWidth(Number(e.target.value))} className="bg-gray-600 px-3 py-2 rounded-lg" />
          <label>Height</label>
          <input type="number" value={containerHeight} onChange={(e) => setContainerHeight(Number(e.target.value))} className="bg-gray-600 px-3 py-2 rounded-lg" />
          <label>Max Weight</label>
          <input type="number" value={containerWeight} onChange={(e) => setContainerWeight(Number(e.target.value))} className="bg-gray-600 px-3 py-2 rounded-lg" />
          <button className="bg-blue-500 w-full py-2 rounded-md mt-6 hover:bg-blue-600 cursor-pointer" onClick={calculate}>
            Calculate
          </button>
        </div>
      </div>

      <div>
        {error ? <p className="text-red-400">{error}</p> : <h1>Containers Required: {containersRequired}</h1>}
      </div>
    </div>
  );
}

export default BoxModel;
