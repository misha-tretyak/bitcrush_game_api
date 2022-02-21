"use strict";

module.exports = {
  up: async (queryInterface) => {
    const game_settings = [
      { key: "house_edge", value: "1" },
      { key: "min_bet", value: "1" },
      { key: "main_bet_increase_pct", value: "30" },
      { key: "main_bet_decrease_pct", value: "30" },
      { key: "type_increase_pct", value: "40" },
      { key: "type_decrease_pct", value: "40" },
      { key: "color_increase_pct", value: "40" },
      { key: "color_decrease_pct", value: "40" },
      { key: "multiply_color", value: "2" },
      { key: "multiply_type", value: "1" },
      { key: "side_bet_chance", value: "2.78" },
      /* { key: "sync_balance_sec", value: "120" },
      { key: "sync_balance_increase_ptc", value: "1" },
      { key: "sync_balance_decrease_ptc", value: "1" }, */
      { key: "sync_balance_sec", value: "900" },
      { key: "sync_balance_increase_ptc", value: "10" },
      { key: "sync_balance_decrease_ptc", value: "5" },
      { key: "block_users_time", value: "10800" },
      { key: "unblock_user_interval", value: "600" },
      { key: "block_user_interval", value: "10" },
      { key: "side_bet_multiplier", value: "0.25" },
    ];
    return await queryInterface.bulkInsert("game_settings", game_settings, {});
  },

  down: async (queryInterface) => {
    return await queryInterface.bulkDelete("game_settings", null, {});
  },
};
