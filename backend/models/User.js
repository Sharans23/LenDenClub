const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Define User model
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
  },
  {
    tableName: "users", // table name in database
    timestamps: false, // we already have created_at column
  }
);

module.exports = User;

// Import AuditLog
const AuditLog = require('./AuditLog');

// Define associations
User.hasMany(AuditLog, { 
  foreignKey: 'sender_id', 
  as: 'sentTransactions' 
});

User.hasMany(AuditLog, { 
  foreignKey: 'receiver_id', 
  as: 'receivedTransactions' 
});