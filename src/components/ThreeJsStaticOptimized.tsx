// ThreeJsStaticOptimized.tsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type BoxDim = {
  length: string;
  width: string;
  height: string;
  weight: string;
  quantity: string;
  rotation: boolean;
  collapsed?: boolean;
  unit: string;
};

type ContainerDim = {
  length: string;
  width: string;
  height: string;
  unit: string;
};

type Props = {
  containerDimensions: ContainerDim;
  boxDimensions: BoxDim[];
  style?: React.CSSProperties;
  className?: string;
  /** Maximum instances we allow to create (prevent browser freeze) */
  maxInstances?: number;
  /** show grid under container */
  showGrid?: boolean;
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

export default function ThreeJsStaticOptimized({
  containerDimensions,
  boxDimensions,
  style,
  className,
  maxInstances = 1200,
  showGrid = false,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [renderedCount, setRenderedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // cleanup old renderer if any
    if (rendererRef.current) {
      try {
        rendererRef.current.forceContextLoss();
        const oldCanvas = rendererRef.current.domElement;
        if (mountRef.current.contains(oldCanvas)) mountRef.current.removeChild(oldCanvas);
        rendererRef.current.dispose();
      } catch (e) {
        // ignore
      }
      rendererRef.current = null;
      sceneRef.current = null;
    }

    const mount = mountRef.current;
    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 400;

    // Scene & camera
    const scene = new THREE.Scene();
    scene.background = null; // transparent
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 2000);
    camera.position.set(8, 8, 12);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // Lights (soft, pretty)
    const hemi = new THREE.HemisphereLight(0xffffff, 0x666666, 0.9);
    hemi.position.set(0, 50, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    const rim = new THREE.PointLight(0xffffff, 0.3);
    rim.position.set(-10, 10, -10);
    scene.add(rim);

    // Parse container dims (meters)
    const contL = convertToMeters(Number(containerDimensions.length) || 0, containerDimensions.unit);
    const contW = convertToMeters(Number(containerDimensions.width) || 0, containerDimensions.unit);
    const contH = convertToMeters(Number(containerDimensions.height) || 0, containerDimensions.unit);

    const containerLength = contL > 0 ? contL : 2;
    const containerWidth = contW > 0 ? contW : 1.5;
    const containerHeight = contH > 0 ? contH : 1.5;

    // scale so largest container dimension ~ 8 units
    const maxDim = Math.max(containerLength, containerWidth, containerHeight);
    const targetMax = 8;
    const sceneScale = maxDim > 0 ? targetMax / maxDim : 1;

    // Container: semi-transparent colored box + subtle wireframe
    const contGeometry = new THREE.BoxGeometry(
      containerLength * sceneScale,
      containerHeight * sceneScale,
      containerWidth * sceneScale
    );
    const contMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#B8D5F3"),
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const contMesh = new THREE.Mesh(contGeometry, contMaterial);
    contMesh.position.y = (containerHeight * sceneScale) / 2;
    scene.add(contMesh);

    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(contGeometry),
      new THREE.LineBasicMaterial({ color: "#B8D5F3", transparent: true, opacity: 0.6 })
    );
    wire.position.copy(contMesh.position);
    scene.add(wire);

    // Optional grid under container (toned down)
    let grid: THREE.GridHelper | null = null;
    if (showGrid) {
      const gridSize = Math.max(containerLength, containerWidth) * sceneScale;
      grid = new THREE.GridHelper(gridSize, 10);
      const gridMaterial = (grid.material as THREE.Material) as any;
      gridMaterial.transparent = true;
      gridMaterial.opacity = 0.12;
      grid.position.y = 0.001;
      scene.add(grid);
    }

    // Build box instances (flatten quantity and convert units)
    type BoxInstance = { l: number; w: number; h: number };
    const instances: BoxInstance[] = [];
    for (const b of boxDimensions) {
      const qty = Math.max(1, Math.floor(Number(b.quantity) || 1));
      for (let i = 0; i < qty; i++) {
        const L = convertToMeters(Number(b.length) || 0, b.unit);
        const W = convertToMeters(Number(b.width) || 0, b.unit);
        const H = convertToMeters(Number(b.height) || 0, b.unit);
        if (b.rotation) {
          instances.push({ l: W || L || 0.1, w: L || W || 0.1, h: H || 0.1 });
        } else {
          instances.push({ l: L || 0.1, w: W || 0.1, h: H || 0.1 });
        }
      }
    }

    // sort by base area (heuristic)
    instances.sort((a, b) => b.l * b.w - a.l * a.w);

    // Simple packing to get placements array
    const padding = 0.01;
    const remaining = instances.slice();
    const placements: { box: BoxInstance; pos: { x: number; y: number; z: number } }[] = [];
    let usedHeight = 0;

    while (remaining.length > 0) {
      let layerHeight = 0;
      let cursorZ = 0;
      let placedSomethingInLayer = false;

      while (cursorZ + 1e-9 < containerWidth) {
        let cursorX = 0;
        let rowMaxDepth = 0;
        let placedInRow = false;

        for (let i = 0; i < remaining.length; ) {
          const b = remaining[i];
          if (cursorX + b.l + padding <= containerLength + 1e-9) {
            if (cursorZ + b.w + padding <= containerWidth + 1e-9) {
              placements.push({
                box: b,
                pos: {
                  x: cursorX + b.l / 2,
                  y: usedHeight + b.h / 2,
                  z: cursorZ + b.w / 2,
                },
              });
              cursorX += b.l + padding;
              rowMaxDepth = Math.max(rowMaxDepth, b.w);
              layerHeight = Math.max(layerHeight, b.h);
              remaining.splice(i, 1);
              placedInRow = true;
              placedSomethingInLayer = true;
              continue;
            } else {
              i++;
            }
          } else {
            i++;
          }
        }

        if (!placedInRow) break;
        cursorZ += rowMaxDepth + padding;
        if (cursorZ > containerWidth) break;
      }

      if (!placedSomethingInLayer) {
        console.warn("Some boxes were too large for the container floor and cannot be placed.");
        break;
      }

      usedHeight += layerHeight + padding;
      if (usedHeight > containerHeight + 1e-9) {
        console.warn("Stopped layering: reached container height limit.");
        break;
      }
    }

    // PERFORMANCE PROTECTION & instancing
    const totalToRender = Math.min(placements.length, maxInstances);
    setRenderedCount(totalToRender);

    if (totalToRender > 0) {
      const baseGeom = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshStandardMaterial({
        roughness: 0.6,
        metalness: 0.08,
        transparent: true,
        opacity: 0.95,
      });

      const instanced = new THREE.InstancedMesh(baseGeom, mat, totalToRender);
      instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      // Create an InstancedBufferAttribute for colors
      const colorArray = new Float32Array(totalToRender * 3);
      const colorAttr = new THREE.InstancedBufferAttribute(colorArray, 3, false);

      // Map sizes to colors so same size => same color
      const sizeColorMap = new Map<string, THREE.Color>();
      const pickRandomColor = (): THREE.Color => {
        // random pleasing HSL
        const h = Math.floor(Math.random() * 360);
        const s = 50 + Math.random() * 30; // 50-80%
        const l = 45 + Math.random() * 15; // 45-60%
        const c = new THREE.Color();
        c.setHSL(h / 360, s / 100, l / 100);
        return c;
      };

      for (let i = 0; i < totalToRender; i++) {
        const p = placements[i];
        const b = p.box;
        const sx = b.l * sceneScale;
        const sy = b.h * sceneScale;
        const sz = b.w * sceneScale;

        const posX = (p.pos.x - containerLength / 2) * sceneScale;
        const posY = p.pos.y * sceneScale;
        const posZ = (p.pos.z - containerWidth / 2) * sceneScale;

        const m = new THREE.Matrix4();
        const t = new THREE.Matrix4().makeTranslation(posX, posY, posZ);
        const s = new THREE.Matrix4().makeScale(sx, sy, sz);
        m.multiply(t).multiply(s);
        instanced.setMatrixAt(i, m);

        // size key (rounded to small tolerance to avoid float differences)
        const key = `${b.l.toFixed(4)}x${b.w.toFixed(4)}x${b.h.toFixed(4)}`;
        let color = sizeColorMap.get(key);
        if (!color) {
          color = pickRandomColor();
          sizeColorMap.set(key, color);
        }
        colorAttr.setXYZ(i, color.r, color.g, color.b);
      }

      // attach color attribute and enable vertexColors
      (instanced as any).instanceColor = colorAttr;
      (mat as any).vertexColors = true;
      instanced.instanceMatrix.needsUpdate = true;
      (instanced as any).instanceColor.needsUpdate = true;

      scene.add(instanced);
    }

    // Single static render
    renderer.render(scene, camera);

    // handle resize
    const handleResize = () => {
      const w2 = mount.clientWidth || 600;
      const h2 = mount.clientHeight || 400;
      renderer.setSize(w2, h2);
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    window.addEventListener("resize", handleResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current) {
        try {
          rendererRef.current.forceContextLoss();
          const canvas = rendererRef.current.domElement;
          if (mount.contains(canvas)) mount.removeChild(canvas);
          rendererRef.current.dispose();
        } catch (e) {
          // ignore
        }
      }
      sceneRef.current = null;
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    containerDimensions.length,
    containerDimensions.width,
    containerDimensions.height,
    containerDimensions.unit,
    JSON.stringify(boxDimensions.map((b) => ({ ...b }))),
    maxInstances,
    showGrid,
  ]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        position: "relative",
        ...style,
      }}
    >
      {/* UX overlay */}
      {renderedCount !== null && renderedCount > 0 && (
        <div
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 12,
            zIndex: 30,
            backdropFilter: "blur(4px)",
          }}
        >
          Boxes rendered: {renderedCount}
        </div>
      )}
    </div>
  );
}
