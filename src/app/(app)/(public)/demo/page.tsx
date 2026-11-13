
"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, PlayCircle } from "lucide-react";
import Link from "next/link";

const VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const Page = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "300px",
        threshold: 0.01,
      }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoadVideo) {
      videoRef.current?.load();
    }
  }, [shouldLoadVideo]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link
            href="/"
            aria-label="Go back to home"
            className="rounded-md p-2 transition hover:bg-muted"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <h1 className="text-lg font-semibold">Demo Video</h1>
        </div>
      </header>

      {/* Video Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="space-y-6">
          {/* Video Player */}
          <div className="relative aspect-video overflow-hidden rounded-xl border bg-black shadow-lg">
            <video
              ref={videoRef}
              className="h-full w-full"
              controls
              controlsList="nodownload"
              disablePictureInPicture
              playsInline
              preload="none"
              poster="/images/video-poster.jpg"
            >
              {shouldLoadVideo && (
                <source src={VIDEO_URL} type="video/mp4" />
              )}

              Your browser does not support video playback.
            </video>

            {!shouldLoadVideo && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <PlayCircle className="size-16 text-white/80" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;
