import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/dbConnection";

interface UserAttributes {
    id: string;
    username: string;
    password_hash: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}
class User extends Model<UserAttributes, UserCreationAttributes> {
    public id!: string;
    public username!: string;
    public password_hash!: string;

    public static associations: {};
}



User.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
}, {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: false,
})

export default User;