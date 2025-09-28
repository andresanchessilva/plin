import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface DocumentAttributes {
  id: number;
  titulo: string;
  conteudo: string;
  data_processamento: Date;
  client_id: number;
  uploaded_by?: number | null;
  type: "pdf" | "url";
  meta_data?: any;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

interface DocumentCreationAttributes
  extends Optional<
    DocumentAttributes,
    | "id"
    | "uploaded_by"
    | "type"
    | "meta_data"
    | "created_at"
    | "updated_at"
    | "deleted_at"
  > {}

class Document
  extends Model<DocumentAttributes, DocumentCreationAttributes>
  implements DocumentAttributes
{
  public id!: number;
  public titulo!: string;
  public conteudo!: string;
  public data_processamento!: Date;
  public client_id!: number;
  public uploaded_by!: number | null;
  public type!: "pdf" | "url";
  public meta_data!: any;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Document.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    conteudo: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    data_processamento: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    type: {
      type: DataTypes.ENUM("pdf", "url"),
      allowNull: false,
      defaultValue: "pdf",
      validate: {
        isIn: [["pdf", "url"]],
      },
    },
    meta_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "documents",
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
      {
        fields: ["client_id"],
      },
      {
        fields: ["uploaded_by"],
      },
      {
        fields: ["data_processamento"],
      },
      {
        fields: ["type"],
      },
    ],
  }
);

export default Document;
