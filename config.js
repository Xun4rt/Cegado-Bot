import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'


global.owner = [
  ['5493444419853', 'Hell', true],
  ['50245439978','Irak', true]
]

//Información 
globalThis.info = {
wm: "𝙲𝙶𝙳៝𝙿𝚁͢𝚅₃₋₄₄",
vs: "1.0.0 (personalizado)",
packname: "𝙲𝙶𝙳៝𝙿𝚁͢𝚅₃₋₄₄",
author: "by Hell y irak",
ig: "https://www.instagram.com/hellkinng911?igsh=MTMwYmh4NDd6dXpmYQ=="
}

//----------------------------------------------------

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
