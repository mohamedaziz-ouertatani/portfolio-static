"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { nearestLoadedIndex, getTargetFrameIndex } from "@/lib/scrollFrames";

const FRAME_COUNT = 249;
const BATCH_SIZE = 8;

function frameSrc(frameNumber: number): string {
  return `/frames/ezgif-frame-${frameNumber.toString().padStart(3, "0")}.jpg`;
}

export default function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  // The canvas backdrop must be a direct child of <body>, as a sibling of
  // .content-overlay — not nested inside it — so its position:fixed,
  // z-index:0 layer is evaluated in the root stacking context. Nested
  // anywhere inside .content-overlay (which is itself position:relative,
  // z-index:1 and therefore its own stacking context), a z-index:0
  // positioned element paints AFTER plain in-flow content within that
  // local context, covering the nav/hero/etc. instead of sitting behind
  // them. A portal to document.body sidesteps this regardless of where
  // <ScrollCanvas /> is used in the component tree.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Runs once on mount, when `mounted` is still false and the canvas
    // hasn't been portal-rendered yet — canvasRef.current is null, so
    // this bails out immediately. It re-runs when `mounted` flips to
    // true (the render right after the portal actually mounts the
    // <canvas>), which is when there's a real element to attach to.
    if (!mounted) return;
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
      // Use the layout-viewport size (matches the CSS vh/dvh units the
      // container is sized with) rather than window.innerWidth/innerHeight,
      // which on mobile can reflect a different viewport (e.g. including
      // area under a collapsed browser toolbar) and desync the canvas's
      // draw buffer from its rendered CSS box, cropping the image.
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const ratio = Math.max(
        viewportWidth / img.width,
        viewportHeight / img.height,
      );
      canvas.width = viewportWidth;
      canvas.height = viewportHeight;

      const drawWidth = img.width * ratio;
      const drawHeight = img.height * ratio;
      const x = (viewportWidth - drawWidth) / 2;
      const y = (viewportHeight - drawHeight) / 2;

      context.drawImage(img, x, y, drawWidth, drawHeight);
    }

    function currentTargetIndex(): number {
      const scrollTop = document.documentElement.scrollTop;
      const maxScrollTop =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
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
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="canvas-container">
        <canvas ref={canvasRef} id="scroll-animation" />
        <div className="canvas-scrim" />
      </div>
      <div className="grid-texture" />
    </>,
    document.body,
  );
}
