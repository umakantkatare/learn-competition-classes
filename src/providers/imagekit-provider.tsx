"use client";
import { ImageKitProvider } from "@imagekit/next";

interface Props {
  children: React.ReactNode;
}

const Providers = ({ children }: Props) => {
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  return (
    <ImageKitProvider urlEndpoint={urlEndpoint}>{children}</ImageKitProvider>
  );
};

export default Providers;
