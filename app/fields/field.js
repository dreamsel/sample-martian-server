const {generate_field: generateField, generate_resources: generateResources} = require('./field-generate');

module.exports = {
  generate (FIELD_SIZE) {
    const field = generateField(FIELD_SIZE);
    return {...field, resources: generateResources(field.field)};
  },
  predefined () {
    return require('./level1.js');
  },
  load (filename) {
    return require(filename);
  }
};
