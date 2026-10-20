// Renders /resume/ from the built site into dist/resume.pdf
// using print media: selectable text, single column, live links.
import { serve } from "./serve.mjs";
import { launch } from "./browser.mjs";

const srv = await serve();
const browser = await launch();
try {
  for (const name of ["resume"]) {
    const page = await browser.newPage();
    const res = await page.goto(`${srv.origin}${srv.base}/${name}/`, { waitUntil: "networkidle" });
    if (!res.ok()) throw new Error(`/${name}/ returned ${res.status()}`);
    await page.emulateMedia({ media: "print" });
    await page.pdf({ path: `dist/${name}.pdf`, format: "A4", printBackground: true, tagged: true, outline: true });
    console.log(`wrote dist/${name}.pdf`);
    await page.close();
  }
} finally {
  await browser.close();
  srv.close();
}
