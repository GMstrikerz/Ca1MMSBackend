const express = require('express');
const cors = require('cors');
const createHttpError = require('http-errors');
const { get, add, Module_Table } = require('./moduleInfo');
const { query } = require('./database');
const { Pool } = require('pg');
//Get all module info
module.exports = express()
    .use(cors())
    .use(express.json())
    .get('/Module', (req, res, next) => {
        try{
            const ModuleInfo=await Pool.query('SELECT * FROM module_tab');
            res.json(ModuleInfo.rows);
        }catch(error) {
            console.log(error.message);
        }

    })
    //Create module info (moduleName,creditUnit)
    .post('/Module', (req, res, next) => {
        try{
            const { modulename,creditUnit,semester }=req.body;
            const newModuleinfo=await pool.query(
          "INSERT INTO module_tab (modulename,creditUnit,semester) VALUES ($1,$2,$3) RETURNING  *",
            [modulename,creditUnit,semester]
    );
       res.json(newModuleinfo.rows[0]);
       }catch (err) {
           console.log(err.message);
       }

    })
    //Update a creditUnit
     .put('/Module/:id',(req,res,next)=>{
        const { id }=req.params; 
    const {creditUnit}=req.body; 
    try{
        const UpdateCreditunit=await pool.query('UPDATE module_tab SET creditUnit =$1 WHERE id=$2',[creditUnit,
           id
        ]);
        res.json("creditUnit was updated!");
    }catch (err) {
        console.log(err.message);
    }

     })
     //Delete a moduleInfo by id 

    .delete('/Module/:id',(req,res,next)=>{
        const { id }=req.params;         
        return query(`Delete FROM ${Module_Table}  WHERE  id= $1 `,[id])
        .then((Result) => res.status(200).send())
            .catch(next);
    })

    .use((req, res, next) => next(createHttpError(404, `Unknown resource ${req.method} ${req.originalUrl}`)))
    .use((error, req, res, next) => {
        console.error(error);
        next(error);
    })
    .use((error, req, res, next) => next(res.status(error.status || 500).json({ error: error.message || 'Unknown error' })));
    