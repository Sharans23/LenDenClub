const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Define AuditLog model
const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "audit_logs",
    timestamps: false,
  }
);

module.exports = AuditLog;

// Import User
const User = require('./User');

// Define associations
AuditLog.belongsTo(User, { 
  foreignKey: 'sender_id', 
  as: 'sender' 
});

AuditLog.belongsTo(User, { 
  foreignKey: 'receiver_id', 
  as: 'receiver' 
});