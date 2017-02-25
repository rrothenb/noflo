var fsbx = require("fuse-box")
const FuseBox = fsbx.FuseBox

const config = {
  homeDir: "./src",
  outFile: "./dist/bundle.js",
  log: true,
  debug: true,
  plugins:[
    fsbx.CoffeePlugin(),
    // fsbx.UglifyJSPlugin(),
  ],
}

const singleBundle = `[**/*.coffee]`
const fuse = FuseBox.init(config)
const bundled = fuse.bundle(singleBundle)
