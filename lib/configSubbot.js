import fs from "fs";
import path from "path";

const configPath = "./db-config";

export function getSubbotConfig(id) {
  if (!fs.existsSync(configPath)) fs.mkdirSync(configPath);

  const cleanId = id.replace(/:\d+/, "");
  const safeId = cleanId.replace(/:/g, "_");
  const file = path.join(configPath, `${safeId}.json`);

  if (!fs.existsSync(file)) {
    const defaultConfig = {
      prefix: ["/", ".", "#", "!", "-", "*", "×"],  
      mode: "public",
      antiPrivate: false,
     antiCall: false
    };
    fs.writeFileSync(file, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }

  try {
    return JSON.parse(fs.readFileSync(file));
  } catch {
    return { prefix: ["/", ".", "#"], mode: "public" };
  }
}

export function saveSubbotConfig(id, config) {
  const cleanId = id.replace(/:\d+/, "");
  const safeId = cleanId.replace(/:/g, "_");
  const file = path.join(configPath, `${safeId}.json`);
  fs.writeFileSync(file, JSON.stringify(config, null, 2));
}
