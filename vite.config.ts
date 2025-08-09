import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
    return defineConfig({
        plugins: [react({
            include: 'src/**/*.{js,jsx,ts,tsx}', // Include all JS/TS files in src
        })],
        build: {
            sourcemap: process.env.NODE_ENV === 'development',
            outDir: 'build', // CRA's default build output
        },
    });
}