"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bancroll_settings = [
      { key: "dilution_fee_ptc", value: "0" },
      { key: "min_invest", value: "0" },
      { key: "min_divest", value: "0" },
      { key: "max_bet_ptc", value: "100" },
      { key: "max_win_ptc", value: "1" },
      { key: "house_ptc", value: "40" },
      { key: "investors_ptc", value: "60" },
    ];
    return queryInterface.bulkInsert(
      "bancroll_settings",
      bancroll_settings,
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("bancroll_settings", null, {});
  },
};
