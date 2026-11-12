"use client";

import React from "react";
import { ArrowLeft, Clock, PlayCircle } from "lucide-react";
import Link from "next/link";

const Page = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="rounded-md p-2 transition hover:bg-muted">
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
              className="h-full w-full"
              controls
              controlsList="nodownload"
              disablePictureInPicture
              playsInline
              preload="metadata"
              poster="/images/video-poster.jpg"
            >
              <source
                src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                type="video/mp4"
              />
             
              Your browser does not support video playback.
            </video>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;
