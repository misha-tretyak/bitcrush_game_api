"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const settings = [
      { key: "exchange_rate", value: "1000000" },
      { key: "withdraw_fee", value: "2" },
      { key: "bonus_register", value: "100" },
      { key: "bonus_lost_when", value: "1" },
      { key: "bonus_lost_return", value: "1" },
      { key: "bonus_win_when", value: "1" },
      { key: "bonus_win_return", value: "1" },
      { key: "bonus_deposit_when", value: "1" },
      { key: "bonus_deposit_return", value: "100" },
      { key: "bonus_referee_sign_up", value: "100" },
      { key: "bonus_referrer_sign_up", value: "0" },
      { key: "bonus_referrer_game_loss", value: "0" },
      { key: "bonus_referrer_game_win", value: "0" },
      { key: "bonus_referrer_game_bet", value: "0" },
      { key: "bonus_referrer_deposit", value: "0" },
      { key: "coinpayments_private", value: "null" },
      { key: "coinpayments_public", value: "null" },
      { key: "coinpayments_secret", value: "null" },
      { key: "coinpayments_autopayment", value: "1" },
      { key: "faucet_time_elapse", value: "30" },
      { key: "faucet_max_balance", value: "0" },
      { key: "faucet_claim", value: "100" },
      { key: "max_profit", value: "0" },
      { key: "min_withdraw", value: "0" },
    ];
    return queryInterface.bulkInsert("settings", settings, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("settings", null, {});
  },
};
