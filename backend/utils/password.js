const bcrypt = require("bcryptjs");

const matchPassword = async (enteredPassword, password) => {
  return await bcrypt.compare(enteredPassword, password);
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

module.exports = { matchPassword, hashPassword };
