import { readdir, mkdir } from "node:fs/promises";
import { join } from "node:path";

const dist = join(__dirname, "dist");

const ext = join(dist, "ext");

await mkdir(ext, { recursive: true });

let names = await readdir(join(__dirname, "dist"));

names = names.filter((name) => name.endsWith(".js"));

names.map(async (name) => {
  let data = await Bun.file(join(dist, name)).text();
  const regexPattern =
    /import\s*\{\s*([^}]*)\}\s*from\s*["']\.\/([^"']+)["'];?/g;
  const code = data.replace(
    regexPattern,
    'import {$1} from "ext:oogabooga/node_modules/@oogaboogagames/game-core/dist/ext/$2.js";'
  );
  Bun.write(join(ext, name), code);
});
