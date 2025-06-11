import { defineConfig } from 'cypress';
import { baseURL } from "./astro.config";

export default defineConfig({
  e2e: {
    supportFile: false,
	  baseUrl: `http://localhost:4321/${baseURL.split("/").filter(Boolean).join("/")}`,
  }
})