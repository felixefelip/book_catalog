import react from "@vitejs/plugin-react";
import inertia from "@inertiajs/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
import RubyPlugin from "vite-plugin-ruby";
import tailwindcss from "@tailwindcss/vite";

const serverBinding = (binding?: string): Plugin => ({
  name: "server-binding",
  config: () => (binding ? { server: { host: binding } } : {}),
});

export default defineConfig(({ mode }) => {
  const { BINDING } = loadEnv(mode, ".", "");

  return {
    plugins: [RubyPlugin(), serverBinding(BINDING), inertia(), react(), tailwindcss()],
  };
});
