const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 1000.0,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "", // Add default value
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "", // Add default value
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "", // Add default value
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

// module.exports = User;
// Add createdAt and updatedAt manually as virtual fields
User.prototype.getCreatedAt = function () {
  return this.createdAt || new Date();
};

User.prototype.getUpdatedAt = function () {
  return this.updatedAt || new Date();
};

module.exports = User;

// Import AuditLog
const AuditLog = require("./AuditLog");

// Define associations
User.hasMany(AuditLog, {
  foreignKey: "sender_id",
  as: "sentTransactions",
});

User.hasMany(AuditLog, {
  foreignKey: "receiver_id",
  as: "receivedTransactions",
});
