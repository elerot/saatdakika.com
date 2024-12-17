import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  images: {
    remotePatterns: [
        {
            protocol: 'http',
            hostname: '**',
            port: '',
            pathname: '**',
        },
        {
            protocol: 'https',
            hostname: '**',
            port: '',
            pathname: '**',
        },
    ],
},
};


// images: {
//   remotePatterns: [
//     {
//       protocol: 'https',
//       hostname: '**', // Allows all domains
//     },
//   ],
//   // Alternatively, specify specific domains
//   // domains: ['example.com', 'anotherdomain.com'],
// },
export default nextConfig;
