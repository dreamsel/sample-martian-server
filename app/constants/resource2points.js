const RESOURCES = require('./resources');

const resource2Points = {
  [RESOURCES.NONE]: 0,
  [RESOURCES.RAREEARTH]: 5,
  [RESOURCES.METAL]: 2,
  [RESOURCES.HYDRATES]: 1,
  [RESOURCES.URANIUM]: 10,
  [RESOURCES.HOLE]: 0
};
Object.freeze(resource2Points);

module.exports = resource2Points;
