"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    ALTER TABLE documents 
    ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'pdf' CHECK (type IN ('pdf', 'url')),
    ADD COLUMN meta_data JSONB;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE documents 
    DROP COLUMN type,
    DROP COLUMN meta_data;
  `);
};

exports._meta = {
  version: 1,
};
