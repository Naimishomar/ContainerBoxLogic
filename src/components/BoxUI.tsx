import { useState, useEffect } from "react";
import {
  MdOutlineKeyboardArrowUp,
  MdOutlineKeyboardArrowDown,
} from "react-icons/md";
import { IoMdDownload } from "react-icons/io";
import ThreeJsStaticOptimized from "./ThreeJsStaticOptimized";

interface BoxDimensions {
  length: string;
  width: string;
  height: string;
  weight: string;
  quantity: string;
  rotation: boolean;
  collapsed: boolean;
  unit: string;   // ✅ Added unit for each box
}

interface ContainerDimensions {
  length: string;
  width: string;
  height: string;
  maxCapacity: string;
  fit: string;
  unit: string; 
}

const defaultBoxes = [
  { box: "20 ft Standard", length: 5.9, width: 2.35, height: 2.39 },
  { box: "40 ft Standard", length: 12.9, width: 12.35, height: 12.39 },
  { box: "40 ft High Cube", length: 15.9, width: 22.35, height: 12.39 },
  { box: "20 ft Reefer", length: 23.9, width: 26.35, height: 20.39 },
  { box: "40 ft Reefer", length: 14.9, width: 12.35, height: 22.39 },
  { box: "32 ft Container", length: 26.9, width: 29.35, height: 12.39 },
];

function BoxUI() {
  const [boxDimensions, setBoxDimensions] = useState<BoxDimensions[]>([
    {
      length: "",
      width: "",
      height: "",
      weight: "",
      quantity: "",
      rotation: false,
      collapsed: false,
      unit: "m",
    },
  ]);

  const [containerDimensions, setContainerDimensions] =
    useState<ContainerDimensions>({
      length: "",
      width: "",
      height: "",
      maxCapacity: "",
      fit: "",
      unit: "m",
    });

  const [containerVolume, setContainerVolume] = useState<number>(0);
  const [boxVolumes, setBoxVolumes] = useState<number[]>([]);
  const [leftSideBar, setLeftSideBar] = useState(true);
  const [rightSideBar, setRightSetBar] = useState(true);
  const [totalBoxVolume, setTotalBoxVolume] = useState<number>(0);
  const [totalBoxWeight, setTotalBoxWeight] = useState<number>(0);

  const addBox = () => {
    setBoxDimensions([
      ...boxDimensions,
      {
        length: "",
        width: "",
        height: "",
        weight: "",
        quantity: "",
        rotation: false,
        collapsed: false,
        unit: "m",
      },
    ]);
  };

  const toggleCollapse = (index: number) => {
    setBoxDimensions((prev) =>
      prev.map((box, i) =>
        i === index ? { ...box, collapsed: !box.collapsed } : box
      )
    );
  };

  const convertToMeters = (value: number, unit: string): number => {
    switch (unit) {
      case "cm":
        return value / 100;
      case "mm":
        return value / 1000;
      case "in":
        return value * 0.0254;
      case "m":
      default:
        return value;
    }
  };

  const updateBoxField = (
    index: number,
    field: keyof BoxDimensions,
    value: string | boolean
  ) => {
    setBoxDimensions((prev) =>
      prev.map((box, i) =>
        i === index ? { ...box, [field]: value } : box
      )
    );
  };

  const updateContainerField = (
    field: keyof ContainerDimensions,
    value: string
  ) => {
    setContainerDimensions((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Compute container volume in m³
  useEffect(() => {
    const length = convertToMeters(
      Number(containerDimensions.length),
      containerDimensions.unit
    );
    const width = convertToMeters(
      Number(containerDimensions.width),
      containerDimensions.unit
    );
    const height = convertToMeters(
      Number(containerDimensions.height),
      containerDimensions.unit
    );

    const containerVolume = length * width * height;
    setContainerVolume(Number(containerVolume.toFixed(6)));
  }, [
    containerDimensions.length,
    containerDimensions.width,
    containerDimensions.height,
    containerDimensions.unit,
  ]);

  useEffect(() => {
    let totalVolume = 0;
    let totalWeight = 0;

    const volumes = boxDimensions.map((box) => {
      const length = convertToMeters(Number(box.length), box.unit);
      const width = convertToMeters(Number(box.width), box.unit);
      const height = convertToMeters(Number(box.height), box.unit);
      const volume = length * width * height;
      const boxVolume = volume * (Number(box.quantity) || 1);
      const boxWeight = (Number(box.weight) || 0) * (Number(box.quantity) || 1);
      totalVolume += boxVolume;
      totalWeight += boxWeight;
      return isNaN(volume) ? 0 : Number(volume.toFixed(6));
    });
    setBoxVolumes(volumes);
    setTotalBoxVolume(Number(totalVolume.toFixed(3)));
    setTotalBoxWeight(Number(totalWeight.toFixed(3)));
  }, [boxDimensions]);


  const setValuesInContainer = (dimension: {
    length: number;
    width: number;
    height: number;
  }) => {
    setContainerDimensions((prev) => ({
      ...prev,
      length: dimension.length.toString(),
      width: dimension.width.toString(),
      height: dimension.height.toString(),
    }));
  };

  return (
    <div className="h-full w-full relative flex text-black justify-between overflow-x-hidden">
      {/* Background */}
      <img
        src="./Background.png"
        alt="background"
        className="w-full h-full object-cover bg-white absolute top-0 left-0"
      />

      {/* Sidebar Left */}
      <div className={`sidebar ${leftSideBar ? "translate-x-0" : "-translate-x-64"} w-46 md:w-64 transition-all duration-300 ease-in bg-white h-screen z-10 py-5 overflow-y-auto relative`}>
        <h1 className="text-2xl font-semibold px-5">📦 BoxLogic</h1>
        <div className="flex justify-between items-center mt-5 px-5">
          <p className="text-md">Box Dimensions</p>
          <button
            onClick={addBox}
            className="text-2xl w-10 h-10 flex justify-center items-center rounded-full hover:bg-gray-100 cursor-pointer text-black"
          >
            +
          </button>
        </div>

        {/* Render Each Box */}
        <div className="mt-3 mb-10 px-5">
          {boxDimensions.map((box, index) => (
            <div key={index} className="rounded-md py-1 bg-white">
              {/* Header */}
              <div className="flex justify-between items-center">
                <p className="font-medium">BOX {index + 1}</p>
                <p className="text-sm text-gray-400">
                  {box.length || "L"} x {box.width || "W"} x {box.height || "H"}
                </p>
                {box.collapsed ? (
                  <MdOutlineKeyboardArrowDown
                    className="text-2xl cursor-pointer"
                    onClick={() => toggleCollapse(index)}
                  />
                ) : (
                  <MdOutlineKeyboardArrowUp
                    className="text-2xl cursor-pointer"
                    onClick={() => toggleCollapse(index)}
                  />
                )}
              </div>

              {/* Collapsible Content */}
              {!box.collapsed && (
                <div className="mt-3 space-y-3 transition-all duration-300 ease-in-out">
                  {/* Length */}
                  <div className="flex border border-gray-300 rounded-md px-2 py-1 text-sm">
                    <input
                      type="number"
                      placeholder="L*"
                      className="outline-none w-full"
                      value={box.length}
                      onChange={(e) =>
                        updateBoxField(index, "length", e.target.value)
                      }
                    />
                    <select
                      className="ml-2 outline-none"
                      value={box.unit}
                      onChange={(e) =>
                        updateBoxField(index, "unit", e.target.value)
                      }
                    >
                      <option value="m">m</option>
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                      <option value="in">in</option>
                    </select>
                  </div>

                  {/* Width */}
                  <div className="flex border border-gray-300 rounded-md px-2 py-1 text-sm">
                    <input
                      type="number"
                      placeholder="W*"
                      className="outline-none w-full"
                      value={box.width}
                      onChange={(e) =>
                        updateBoxField(index, "width", e.target.value)
                      }
                    />
                    <select
                      className="ml-2 outline-none"
                      value={box.unit}
                      onChange={(e) =>
                        updateBoxField(index, "unit", e.target.value)
                      }
                    >
                      <option value="m">m</option>
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                      <option value="in">in</option>
                    </select>
                  </div>

                  {/* Height */}
                  <div className="flex border border-gray-300 rounded-md px-2 py-1 text-sm">
                    <input
                      type="number"
                      placeholder="H*"
                      className="outline-none w-full"
                      value={box.height}
                      onChange={(e) =>
                        updateBoxField(index, "height", e.target.value)
                      }
                    />
                    <select
                      className="ml-2 outline-none"
                      value={box.unit}
                      onChange={(e) =>
                        updateBoxField(index, "unit", e.target.value)
                      }
                    >
                      <option value="m">m</option>
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                      <option value="in">in</option>
                    </select>
                  </div>

                  <input
                    type="number"
                    placeholder="Weight"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    value={box.weight}
                    onChange={(e) =>
                      updateBoxField(index, "weight", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    value={box.quantity}
                    onChange={(e) =>
                      updateBoxField(index, "quantity", e.target.value)
                    }
                  />
                  <label className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={box.rotation}
                      onChange={(e) =>
                        updateBoxField(index, "rotation", e.target.checked)
                      }
                    />
                    Enable Rotation
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="py-2 w-full px-5 sticky -bottom-5 bg-white">
          <button className="bg-blue-400 hover:bg-blue-500 text-white cursor-pointer py-2 w-full rounded-md">
            Update
          </button>
        </div>
      </div>

      {/* Middle Section */}
      <div className="relative grow h-screen flex">
        {/* Left Sidebar Toggle */}
        <button
          className={`absolute z-50 top-[50%] md:hidden -translate-y-[50%] w-10 h-40 transition-all duration-300 ease-in-out
            ${leftSideBar ? "left-0" : "-left-64"}`}
          onClick={() => setLeftSideBar(!leftSideBar)}
        >
          <img src="./LeftSideBar.png" alt="" className="w-[75%] object-contain" />
        </button>
        {/* Right Sidebar Toggle */}
        <button
          className={`absolute z-50 top-[50%] md:hidden -translate-y-[50%] w-10 h-40 transition-all duration-300 ease-in-out
            ${rightSideBar ? "right-0" : "-right-64"}`}
          onClick={() => setRightSetBar(!rightSideBar)}
        >
          <img src="./RightSideBar.png" alt="" className="w-full h-full object-contain" />
        </button>
        {/* Main Container */}
        <div className="w-full h-full">
          <div className="w-full h-40">
            <div className="w-[65%] mx-0 absolute top-5 flex flex-col gap-3 text-white font-semibold p-3 rounded-md">
              <div className="flex overflow-x-auto sidebar">
                {boxDimensions.map((box, i) => (
                  <div key={i} className="text-black flex-shrink-0 flex flex-col items-center text-sm">
                    <p className="text-sm">Total:{Number(box.length)*Number(box.width)*Number(box.height)}{box.unit}</p>
                    <img src="./Box.png" alt="box" className="w-[40%] object-contain" />
                    <p className="text-sm">Weight: {Number(box.weight)*Number(box.quantity) || box.weight}kg</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="min-w-56 max-h-26 bg-white border-2 flex flex-col border-gray-300 rounded-md absolute top-5 right-5 px-3 py-3 text-sm justify-center gap-2 font-semibold overflow-auto sidebar">
              <p>Container Volume: {containerVolume} m³</p>
              {boxVolumes.map((volume, i) => (
                <p key={i}>Box {i + 1} Volume (pcs): {volume} m³</p>
              ))}
              <p>Total Container Required:</p>
            </div>
          </div>

          <div className="w-full">
            <ThreeJsStaticOptimized
              containerDimensions={containerDimensions}
              boxDimensions={boxDimensions}
              maxInstances={1500} // optional
              style={{ height: 500 }}
            />
          </div>
        </div>
      </div>


      {/* Sidebar Right */}
      <div className={`sidebar ${rightSideBar ? "translate-x-0" : "translate-x-64"} w-46 md:w-64 bg-white h-screen z-10 py-5 px-3 overflow-auto`}>
        <div className="flex justify-end">
          <button className="border border-gray-300 hover:bg-gray-100 cursor-pointer px-5 py-1 rounded-md flex items-center gap-3">
            <IoMdDownload />
            Export
          </button>
        </div>

        <div className="py-2">
          <h1 className="text-md font-semibold">Container Dimensions</h1>
          <div className="flex flex-col justify-between items-center mt-2 gap-3">
            {/* Length */}
            <div className="flex bg-white w-full border border-gray-300 rounded-md px-2 py-1 text-sm">
              <input
                type="text"
                placeholder="L*"
                className="outline-none"
                value={containerDimensions.length}
                onChange={(e) =>
                  updateContainerField("length", e.target.value)
                }
              />
              <select
                className="ml-3 outline-none"
                value={containerDimensions.unit}
                onChange={(e) => updateContainerField("unit", e.target.value)}
              >
                <option value="m">m</option>
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="in">in</option>
              </select>
            </div>

            {/* Width */}
            <div className="flex bg-white w-full border border-gray-300 rounded-md px-2 py-1 text-sm">
              <input
                type="text"
                placeholder="W*"
                className="outline-none"
                value={containerDimensions.width}
                onChange={(e) =>
                  updateContainerField("width", e.target.value)
                }
              />
              <select
                className="ml-3 outline-none"
                value={containerDimensions.unit}
                onChange={(e) => updateContainerField("unit", e.target.value)}
              >
                <option value="m">m</option>
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="in">in</option>
              </select>
            </div>

            {/* Height */}
            <div className="flex bg-white w-full border border-gray-300 rounded-md px-2 py-1 text-sm">
              <input
                type="text"
                placeholder="H*"
                className="outline-none"
                value={containerDimensions.height}
                onChange={(e) =>
                  updateContainerField("height", e.target.value)
                }
              />
              <select
                className="ml-3 outline-none"
                value={containerDimensions.unit}
                onChange={(e) => updateContainerField("unit", e.target.value)}
              >
                <option value="m">m</option>
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="in">in</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Max Capacity"
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
              value={containerDimensions.maxCapacity}
              onChange={(e) =>
                updateContainerField("maxCapacity", e.target.value)
              }
            />

            <select
              name="fit"
              id="fit"
              value={containerDimensions.fit}
              onChange={(e) => updateContainerField("fit", e.target.value)}
              className="w-full py-1 outline-none border border-gray-300 rounded-md px-1"
            >
              <option value="bestFit" defaultChecked>
                Best Fit
              </option>
              <option value="BiggerFirst">Bigger First</option>
            </select>
            <button className="bg-blue-400 hover:bg-blue-500 text-white cursor-pointer w-full py-2 rounded-md">
              Update
            </button>
          </div>
        </div>

        <div className="mt-2">
          <h1 className="font-semibold text-md">Standard Dimensions (meters)</h1>
          <div className="py-3">
            {defaultBoxes.map((dimension, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm mt-1 hover:bg-gray-100 py-1 rounded-md px-2 cursor-pointer"
                onClick={() => setValuesInContainer(dimension)}
              >
                <p>{dimension.box}</p>
                <p>
                  {dimension.length}*{dimension.width}*{dimension.height}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoxUI;
