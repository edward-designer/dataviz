import { useEffect, useRef } from "react";

interface ICanvas {
  height: number;
  width: number;
  draw: (context: CanvasRenderingContext2D) => void;
}
const Canvas = ({ draw, height, width }: ICanvas) => {
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext("2d")!;
    draw(context);
  }, []);
  return <canvas ref={canvasRef} height={height} width={width} />;
};

export default Canvas;
