import sequelize from "../config/database";
import Client from "./Client";
import Document from "./Document";
import User from "./User";

Client.hasMany(Document, {
  foreignKey: "client_id",
  as: "documents",
});

Document.belongsTo(Client, {
  foreignKey: "client_id",
  as: "client",
});

User.hasMany(Client, {
  foreignKey: "created_by",
  as: "createdClients",
});

Client.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});

User.hasMany(Document, {
  foreignKey: "uploaded_by",
  as: "uploadedDocuments",
});

Document.belongsTo(User, {
  foreignKey: "uploaded_by",
  as: "uploader",
});

export const syncModels = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    throw error;
  }
};

export { Client, Document, User, sequelize };
