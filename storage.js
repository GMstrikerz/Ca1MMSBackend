const createHttpError = require('http-errors');
const { nanoid } = require('nanoid');
const { query, POSTGRES_ERROR_CODE } = require('./database');

const Storage_Table = 'storage_tab';
module.exports.Storage_Table = Storage_Table;

const CREATE_TABLE_Storage = `
    CREATE TABLE ${Storage_Table} (
        id SERIAL primary key,
        key VARCHAR unique not null,
        data VARCHAR not null,
        expire_on INT not null
        
    );
`;
module.exports.CREATE_TABLE_Storage = CREATE_TABLE_Storage;

function getTimestampAfterNDays(n) {
    return Math.floor(new Date().setDate(new Date().getDate() + n) / 1000);
}
module.exports.getTimestampAfterNDays = getTimestampAfterNDays;

module.exports.add = function add(data, key = nanoid(), expireAfterDays = 7) {
    const expireOn = getTimestampAfterNDays(expireAfterDays);
    return query(`INSERT INTO ${Storage_Table} (key, data, expire_on) VALUES($1, $2, $3) RETURNING key`, [
        key,
        JSON.stringify(data),
        expireOn,
    ])
        .then((response) => response.rows[0].key)
        .catch((error) => {
            if (error.code === POSTGRES_ERROR_CODE.UNIQUE_CONSTRAINT) {
                throw createHttpError(400, `Key ${key} already exists`);
            } else throw error; // unexpected error
        });
};

module.exports.get = function get(key, now = getTimestampAfterNDays(0)) {
    return query(`SELECT data FROM ${Storage_Table} where key = $1 and expire_on > $2`, [key, now]).then((result) => {
        if (!result.rows.length) return null;
        return JSON.parse(result.rows[0].data);
    });
};
module.exports.delete== function get( now = getTimestampAfterNDays(0)) {
    return query(`DELETE FROM ${Storage_Table} where expire_on < $1`, [now]).then((result) => {
        if (!result.rows.length) return null;
        return JSON.parse(result.rows[0].data);
    });
};