/* eslint-disable no-console */
const database = require('../database');
const storage = require('../storage');
const Module=require('../moduleInfo');

database
    .query(
        `
    DROP TABLE IF EXISTS ${storage.Storage_Table};
    ${storage.CREATE_TABLE_Storage}
    DROP TABLE IF EXISTS ${Module.Module_Table};
    ${Module.CREATE_TABLE_Module}
    `,
    )
    .then(() => {
        console.log('Successfully created!');
    })
    .catch((error) => {
        console.error(error);
    })
    .finally(() => {
        database.end();
    })
       