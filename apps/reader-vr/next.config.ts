import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath: isStaticExport ? "/reader-vr" : undefined,
  assetPrefix: isStaticExport ? "/reader-vr/" : undefined,
  images: {
    unoptimized: true, // Required for static export
  },
  // R3F needs this for WebGL
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "@react-three/xr"],
};

export default nextConfig;
