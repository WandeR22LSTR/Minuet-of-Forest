import { chromium } from "playwright";
// Set CHROMIUM_PATH to use an already installed Chromium instead of Playwright's download.
export const launch = () => chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
