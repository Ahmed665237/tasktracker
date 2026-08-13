"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("TaskTrack@123", 12);
    const now = new Date();

    const users = Array.from({ length: 18 }, (_, index) => {
      const number = String(index + 1).padStart(2, "0");

      return {
        name: `Demo User ${number}`,
        email: `user${number}@tasktrack.local`,
        password_hash: passwordHash,
        created_at: now,
        updated_at: now,
      };
    });

    await queryInterface.bulkInsert("users", users);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: Array.from(
        { length: 18 },
        (_, index) => `user${String(index + 1).padStart(2, "0")}@tasktrack.local`
      ),
    });
  },
};
