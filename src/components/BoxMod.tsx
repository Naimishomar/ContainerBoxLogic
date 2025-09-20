import { useState, useEffect } from "react";

function BoxModel() {
  const [boxLength, setBoxLength] = useState("");
  const [boxWidth, setBoxWidth] = useState("");
  const [boxHeight, setBoxHeight] = useState("");
  const [boxWeight, setBoxWeight] = useState("");
  const [boxQuantity, setBoxQuantity] = useState("");
  const [boxStackLimit, setBoxStackLimit] = useState("");

  const [containerLength, setContainerLength] = useState("");
  const [containerWidth, setContainerWidth] = useState("");
  const [containerHeight, setContainerHeight] = useState("");
  const [containerWeight, setContainerWeight] = useState("");

  const [containersRequired, setContainersRequired] = useState<number>(0);
  const [stackable, setStackable] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setError("");
    const bLength = Number(boxLength);
    const bWidth = Number(boxWidth);
    const bHeight = Number(boxHeight);
    // const bWeight = Number(boxWeight);
    const bQuantity = Number(boxQuantity);
    const bStackLimit = Number(boxStackLimit) || 1;

    const cLength = Number(containerLength);
    const cWidth = Number(containerWidth);
    const cHeight = Number(containerHeight);
    // const cWeight = Number(containerWeight);

    if (!bLength || !bWidth || !bHeight) {
      setError("Box dimensions must be greater than 0");
      setContainersRequired(0);
      return;
    }
    if (!cLength || !cWidth || !cHeight) {
      setError("Container dimensions must be greater than 0");
      setContainersRequired(0);
      return;
    }
    if (bHeight > cHeight) {
      setError("Box height is greater than container height");
      setContainersRequired(0);
      return;
    }
    const edgeLength = Math.floor(cLength / bLength);
    const edgeWidth = Math.floor(cWidth / bWidth);
    const edgeHeight = Math.floor(cHeight / bHeight);


    const boxesPerLayer = edgeLength * edgeWidth;
    if (boxesPerLayer === 0) {
      setError("Box cannot fit on container base");
      setContainersRequired(0);
      return;
    }

    const maxLayers = stackable ? Math.min(edgeHeight, bStackLimit) : 1;
    const boxesPerContainer = boxesPerLayer * maxLayers;

    if (boxesPerContainer === 0) {
      setError("Container cannot hold even one box (size or weight issue)");
      setContainersRequired(0);
      return;
    }
    const required = Math.ceil(bQuantity / boxesPerContainer);
    setContainersRequired(required);
  }, [boxLength, boxWidth, boxHeight, boxWeight, boxQuantity, boxStackLimit, containerLength, containerWidth, containerHeight, containerWeight, stackable]);

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-center py-10 gap-10">
      <div className="flex gap-20">
        {/* Box Input */}
        <div className="bg-white/10 p-5 rounded-lg min-w-md flex flex-col h-full gap-2">
          <h1 className="text-2xl font-semibold text-center">Boxes</h1>
          <label>Length</label>
          <input
            type="number"
            placeholder="Enter length"
            value={boxLength}
            onChange={(e) => setBoxLength(e.target.value)}
            className="bg-gray-600 px-3 py-2 rounded-lg"
          />
          <label>Width</label>
          <input
            type="number"
            placeholder="Enter width"
            value={boxWidth}
            onChange={(e) => setBoxWidth(e.target.value)}
            className="bg-gray-600 px-3 py-2 rounded-lg"
          />
          <label>Height</label>
          <input
            type="number"
            placeholder="Enter height"
            value={boxHeight}
            onChange={(e) => setBoxHeight(e.target.value)}
            className="bg-gray-600 px-3 py-2 rounded-lg"
          />
          <label>Weight</label>
          <input
            type="number"
            placeholder="Enter weight"
            value={boxWeight}
            onChange={(e) => setBoxWeight(e.target.value)}
            className="bg-gray-600 px-3 py-2 rounded-lg"
          />
          <label>Quantity</label>
          <input
            type="number"
            placeholder="Enter quantity"
            value={boxQuantity}
            onChange={(e) => setBoxQuantity(e.target.value)}
            className="bg-gray-600 px-3 py-2 rounded-lg"
          />

          {stackable && (
            <>
              <label>Stack Limit</label>
              <input
                type="number"
                placeholder="Enter stack limit"
                value={boxStackLimit}
                onChange={(e) => setBoxStackLimit(e.target.value)}
                className="bg-gray-600 px-3 py-2 rounded-lg"
              />
            </>
          )}

          <select
            value={stackable ? "stackable" : "unstackable"}
            onChange={(e) => setStackable(e.target.value === "stackable")}
            className="py-2 outline-none text-white"
          >
            <option value="stackable" className="text-black">Stackable</option>
            <option value="unstackable" className="text-black">Unstackable</option>
          </select>
        </div>

        {/* Container Input */}
        <div className="bg-white/10 p-5 rounded-lg min-w-md flex flex-col h-full gap-2">
          <h1 className="text-2xl font-semibold text-center">Container</h1>
          <label>Length</label>
          <input
            type="number"
            placeholder="Enter length"
            value={containerLength}
            onChange={(e) => setContainerLength(e.target.value)}
            className="bg-gray-600 px-3 py-2 rounded-lg"
          />
          <label>Width</label>
          <input
            type="number"
            placeholder="Enter width"
            value={containerWidth}
            onChange={(e) => setContainerWidth(e.target.value)}
            className="bg-gray-600 px-3 py-2 rounded-lg"
          />
          <label>Height</label>
          <input
            type="number"
            placeholder="Enter height"
            value={containerHeight}
            onChange={(e) => setContainerHeight(e.target.value)}
            className="bg-gray-600 px-3 py-2 rounded-lg"
          />
          <label>Max Weight</label>
          <input
            type="number"
            placeholder="Enter max weight"
            value={containerWeight}
            onChange={(e) => setContainerWeight(e.target.value)}
            className="bg-gray-600 px-3 py-2 rounded-lg"
          />
        </div>
      </div>

      <div>
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <h1>Containers Required: {containersRequired}</h1>
        )}
      </div>
    </div>
  );
}

export default BoxModel;
