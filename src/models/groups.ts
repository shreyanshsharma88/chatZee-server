import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/dbConnection";

interface GroupAttributes {
    id: string;
    groupname: string;
    type: "GROUP" | "INDIVIDUAL";
}

interface GroupCreationAttributes extends Optional<GroupAttributes, "id"> {}

class Group extends Model<GroupAttributes, GroupCreationAttributes> {
    public id!: string;
    public groupname!: string;
    public type!: "GROUP" | "INDIVIDUAL";

    public static associations: {};
}

Group.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    groupname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.ENUM("GROUP", "INDIVIDUAL"),
        allowNull: false,
    },
}, {
    sequelize,
    modelName: "Group",
    tableName: "groups",
    timestamps: false,
    
})


