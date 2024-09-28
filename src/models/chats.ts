import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/dbConnection";

interface ChatAttributes {
  id: string;
  message: string;
  sent_by: string;
  sent_to: string;
  time_stamp: string;
}

interface ChatCreationAttributes extends Optional<ChatAttributes, "id" | "time_stamp"> {}

class Chat extends Model<ChatAttributes, ChatCreationAttributes> {
  public id!: string;
  public message!: string;
  public sent_by!: string;
  public sent_to!: string;
  public time_stamp!: string;

  public static associations: {};
}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sent_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sent_to: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    time_stamp: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: new Date().toISOString(),
    },
  },
  {
    sequelize,
    modelName: "Chat",
    tableName: "chats",
    timestamps: false,
  }
);

