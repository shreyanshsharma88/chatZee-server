import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/dbConnection";

interface GroupUserAttributes {
    id: string;
    group_id: string;
    user_id: string;
}

interface GroupUserCreationAttributes extends Optional<GroupUserAttributes, "id"> {}

class GroupUser extends Model<GroupUserAttributes, GroupUserCreationAttributes> {
    public id!: string;
    public group_id!: string;
    public user_id!: string;

    public static associations: {};
}

GroupUser.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    group_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: "GroupUser",
    tableName: "group_users",
    timestamps: false,
})
