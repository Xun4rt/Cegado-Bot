import fs from "fs"
import { Sticker } from "wa-sticker-formatter"

export async function writeExif(img, { packname = "Cegado-Bot", author = "by Tú" } = {}) {
  let sticker = new Sticker(img, {
    pack: packname,
    author,
    type: "full", // puede ser "full" o "crop"
    quality: 70
  })
  return await sticker.toBuffer()
}
