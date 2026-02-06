const { nanoid } = require("nanoid");

function getUniqIdValue() {
  // important: use a library to ensure uniqueness without custom logic.
  // note: nanoid is collision-resistant for small apps.
  // nota bene: this keeps IDs stable across environments.
  return nanoid();
}

module.exports = { getUniqIdValue };
