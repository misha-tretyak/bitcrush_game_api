"use strict";

const crypto = require("crypto");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const generateUUID = () => {
      let d = new Date().getTime();
      let d2 =
        (performance && performance.now && performance.now() * 1000) || 0;
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          let r = Math.random() * 16;
          if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
          } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
          }
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
      );
    };

    const roles = [
      { id: 1, value: "USER", description: "User Role" },
      { id: 2, value: "ADMIN", description: "ADMIN Role" },
    ];
    await queryInterface.bulkInsert("roles", roles, {});

    const users = [
      {
        id: "4cc08a33-546e-4fab-afe4-050c64927d63",
        email: "bogdan.senkiv@gmail.com",
        wallet_address: "0x9fe49770adf27c2ca69d872b13b98b92b64cf84d",
        password:
          "$2a$10$Taw0FbZqPr6f8gHCwD.QueBhCoafJRpSBmRqwZt2AslFijrXBaAgG",
        username: "Moderator",
        status: 1,
        nonce: Math.floor(Math.random() * 1000000),
        google2fa_secret:
          "IQZS4PZEJVOXEQCUM5WVIXJTKU3DI32MEQTDOUSYJZIHUU2EJ55A",
        email_verified_at: new Date(Date.now()),
        enabled_2fa: true,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        id: "8cf5d067-91bb-494a-b02e-23b34d13fffa",
        email: "misha.tret.ua@gmail.com",
        wallet_address: "0x16b8f7e284e9be12503421959ad9f24f95332b5f",
        password:
          "$2a$10$xVblUBFZJgUaocPKmdhQpe/s0cg5k1AmNaCNDLyJgIL7sggJsAVIW",
        username: "Admin",
        status: 1,
        nonce: Math.floor(Math.random() * 1000000),
        google2fa_secret:
          "ERIGKMCBPBUHOSZ4KRCVCMLPNBBECKJEGFHHG4ZSFQ3W6UZUNBHA",
        email_verified_at: new Date(Date.now()),
        enabled_2fa: true,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        id: "19d6749c-3d41-4d03-8f0c-525c24878764",
        email: "Admin@bitcrusharcade.com",
        wallet_address: "0xaddb2b59d1b782e8392ee03d7e2ceaa240e7f1c0",
        password:
          "$2a$10$U1wLLwkNe2qL.3FhG5gtJuoO0LayAt4vseLIXV9SaAlKjkFFX8/Re",
        username: "Admin Dice Invaders",
        status: 1,
        nonce: Math.floor(Math.random() * 1000000),
        google2fa_secret:
          "KUSEQ7JZKV2DO22JHRLTI5JZMMRTEWCPOE2VMRD2OFFDY5BSKRQQ",
        email_verified_at: new Date(Date.now()),
        enabled_2fa: true,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
    ];
    const newUsers = await queryInterface.bulkInsert("users", users, {
      returning: true,
    });

    const user_roles = [
      {
        id: generateUUID(),
        roleId: 1,
        userId: "8cf5d067-91bb-494a-b02e-23b34d13fffa",
      },
      {
        id: generateUUID(),
        roleId: 2,
        userId: "8cf5d067-91bb-494a-b02e-23b34d13fffa",
      },
      {
        id: generateUUID(),
        roleId: 1,
        userId: "4cc08a33-546e-4fab-afe4-050c64927d63",
      },
      {
        id: generateUUID(),
        roleId: 2,
        userId: "4cc08a33-546e-4fab-afe4-050c64927d63",
      },
      {
        id: generateUUID(),
        roleId: 1,
        userId: "19d6749c-3d41-4d03-8f0c-525c24878764",
      },
      {
        id: generateUUID(),
        roleId: 2,
        userId: "19d6749c-3d41-4d03-8f0c-525c24878764",
      },
    ];
    await queryInterface.bulkInsert("user_roles", user_roles, {});

    const generateServerSeed = (length) => {
      const characters =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let randomString = "";
      for (let i = 0; i < length; i++) {
        let index = Math.floor(Math.random() * characters.length);
        randomString += characters[index];
      }

      return randomString;
    };
    const user_seeds = [];

    newUsers.map(async (user) => {
      const privateKey = generateServerSeed(128);
      const clientSeed = generateServerSeed(32);
      user_seeds.push({
        id: generateUUID(),
        server_seed_public: crypto
          .createHash("sha256")
          .update(privateKey)
          .digest("hex"),
        server_seed_private: privateKey,
        client_seed: clientSeed,
        is_active: true,
        is_next_unused: false,
        user_id: user.id,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      });
    });

    await queryInterface.bulkInsert("user_seeds", user_seeds, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkDelete("user_seeds", null, {});
  },
};
