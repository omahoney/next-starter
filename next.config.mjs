import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // fixes wallet connect dependency issue https://docs.walletconnect.com/web3modal/nextjs/about#extra-configuration
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Add mini-css-extract-plugin
    config.plugins.push(new MiniCssExtractPlugin());
    
    return config;
  },
};

export default nextConfig;
