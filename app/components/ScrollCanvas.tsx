"use client";

import { useEffect, useRef } from "react";
import { nearestLoadedIndex, getTargetFrameIndex } from "@/lib/scrollFrames";

const FRAME_COUNT = 249;
const BATCH_SIZE = 8;

function frameSrc(frameNumber: number): string {
  return `/frames/ezgif-frame-${frameNumber.toString().padStart(3, "0")}.jpg`;
}

export default function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    const loaded: boolean[] = new Array(FRAME_COUNT).fill(false);
    let lastRenderedIndex = -1;

    function loadFrame(frameNumber: number): HTMLImageElement {
      const idx = frameNumber - 1;
      if (images[idx]) return images[idx];
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        loaded[idx] = true;
      };
      img.src = frameSrc(frameNumber);
      images[idx] = img;
      return img;
    }

    function renderFrame(frameIndex: number) {
      const drawIndex = nearestLoadedIndex(loaded, frameIndex);
      if (drawIndex === -1 || drawIndex === lastRenderedIndex) return;
      const img = images[drawIndex];
      if (!img || !img.complete || !context || !canvas) return;

      lastRenderedIndex = drawIndex;
      const ratio = Math.max(
        window.innerWidth / img.width,
        window.innerHeight / img.height,
      );
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const drawWidth = img.width * ratio;
      const drawHeight = img.height * ratio;
      const x = (window.innerWidth - drawWidth) / 2;
      const y = (window.innerHeight - drawHeight) / 2;

      context.drawImage(img, x, y, drawWidth, drawHeight);
    }

    function currentTargetIndex(): number {
      const scrollTop = document.documentElement.scrollTop;
      const maxScrollTop =
        document.documentElement.scrollHeight - window.innerHeight;
      return getTargetFrameIndex(scrollTop, maxScrollTop, FRAME_COUNT);
    }

    function streamRemainingFrames(startAt: number) {
      let next = startAt;

      function loadBatch() {
        const end = Math.min(next + BATCH_SIZE, FRAME_COUNT + 1);
        for (; next < end; next++) {
          loadFrame(next);
        }
        if (next <= FRAME_COUNT) {
          scheduleNextBatch();
        }
      }

      function scheduleNextBatch() {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(loadBatch, { timeout: 500 });
        } else {
          setTimeout(loadBatch, 60);
        }
      }

      scheduleNextBatch();
    }

    const firstFrame = loadFrame(1);
    firstFrame.onload = () => {
      loaded[0] = true;
      renderFrame(0);
    };
    streamRemainingFrames(2);

    function handleScroll() {
      requestAnimationFrame(() => {
        renderFrame(currentTargetIndex());
      });
    }

    function handleResize() {
      lastRenderedIndex = -1;
      renderFrame(currentTargetIndex());
    }

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} id="scroll-animation" />
      <div className="canvas-scrim" />
    </div>
  );
}
