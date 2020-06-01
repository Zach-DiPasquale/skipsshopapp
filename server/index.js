require("@babel/core").transform("code", {
  plugins: [
    [
      "@babel/plugin-proposal-decorators",
      {
        legacy: true,
      },
    ],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
  ],
});

require("@babel/register")({
  presets: ["@babel/preset-env"],
  ignore: ["node_modules"],
});

// Import the rest of our application.
module.exports = require("./server.js");
