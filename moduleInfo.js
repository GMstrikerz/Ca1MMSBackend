const createHttpError = require('http-errors');
const { query, POSTGRES_ERROR_CODE } = require('./database');

const Module_Table = 'module_tab';
module.exports.Module_Table = Module_Table;

const CREATE_TABLE_Module = `
    CREATE TABLE ${Module_Table} (
        id SERIAL primary key,
        modulename VARCHAR not null,
        creditunit INT not null,
        semester  VARCHAR not null
        
    );
`;
module.exports.CREATE_TABLE_Module = CREATE_TABLE_Module;

//to get All Modules

module.exports.getAllModules = function get() {
    return query(`SELECT * FROM ${Module_Table}  `,[])
    .then((result) => {
        if  (!result.rows.length) return null;
        console.log(result.rows);
        return (result.rows);
    });
};

//To create the Module

module.exports.addModule = function add(currentModuleName, currentcreditUnit,currentSemester) {
    return query(`INSERT INTO ${Module_Table} (modulename,creditUnit,semester) VALUES($1,$2) RETURNING  *`, [
        currentModuleName,
        currentcreditUnit,
        currentSemester
    ])
        .then((response) => response.rows[0].currentModuleName)
        .catch((error) => {
            if (error.code === POSTGRES_ERROR_CODE.UNIQUE_CONSTRAINT) {
                throw createHttpError(400, `modulename ${currentModuleName} already exists`);
            } else throw error; // unexpected error
        });

};

//To update the CreditUnit of the Module
module.exports.updateCreditunit=function add(moduleid,creditUnit) {
    return query(`UPDATE  ${Module_Table} SET creditUnit= $2 where id =$1  RETURNING *` , [moduleid,creditUnit]).then((result) => {
        if (!result.rows.length) return null;
        return result;
    });
};


//To delete the Module by id

module.exports.deleteModule= function get(id) {
    return query(`DELETE FROM ${Module_Table} where id= $1`,[id]).then((result) => {
        if (!result.rows.length) return null;
        return result;
    });

};
//To search Modulename and get creditUnit
module.exports.getcreditunitbyModuleName=function getcreditunitbyModuleName(modulename) {
    console.log(modulename)
    return query(`SELECT creditunit From ${Module_Table}  where modulename=$1`,[modulename])
	.then((result) => {
        if (!result.rows) return null;
        return result.rows;
    });
};
