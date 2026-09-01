module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],

    "@babel/preset-typescript",
  ],
};// as jest runs on js but we need ts