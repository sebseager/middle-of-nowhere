module.exports = {
  process(sourceText) {
    return { code: `export default ${sourceText};` };
  },
};
