npm create vite@latest my-app -- --template react 
cd my-app 
npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer 
echo import { defineConfig } from "vite";import react from "@vitejs/plugin-react";import tailwindcss from "@tailwindcss/vite";export default defineConfig({ plugins: [react(), tailwindcss()],}); > vite.config.js  
cd src 
echo @import "tailwindcss"; > index.css 
cd .. 
npm install
echo -e '\n✅ Vite + React + Tailwind CSS (via plugin) is ready!\nRun "npm run dev" to start the dev server.'