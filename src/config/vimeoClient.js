const { Vimeo } = require("vimeo");

const vimeoClient = new Vimeo(
  null,
  null,
  process.env.VIMEO_ACCESS_TOKEN
);

module.exports = vimeoClient;
