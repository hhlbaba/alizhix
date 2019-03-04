function jsonsrc(value) {
  return JSON.parse(value)[0].url
}
module.exports = {
    src : jsonsrc
}
