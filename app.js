const express = require('express');
const cors = require('cors');
const bodyParser=require('body-parser');
const createHttpError = require('http-errors');
const { get, add, getTimestampAfterNDays, Storage_Table } = require('./storage');
const  { getAllModules,addModule,updateCreditunit,deleteModule,getcreditunitbyModuleName } = require('./moduleInfo');

const { query } = require('./database');

module.exports = express()
    .use(cors())
    .use(express.json())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }))
    .get('/storage', (req, res, next) => {
        const { key } = req.query;
        if (!key) {
            return next(createHttpError(400, 'Please provide a key'));
        }
        return get(key)
            .then((data) => {
                if (!data) return next(createHttpError(404, `Key ${key} not found`));
                return res.json(data);
            })
            .catch(next);
    })
    .post('/storage', (req, res, next) => {
        const data = req.body;
        if (!data) {
            return next(createHttpError(400, 'Please provide a data'));
        }
        // Destructuring Assignment: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
        const {  key,expireDuration } = req.query;
        return add(data, key, expireDuration)
            .then((key) => res.status(201).json({ key }))
            .catch(next);
    
    })

    .delete('/storage',(req,res,next)=>{
        const now=getTimestampAfterNDays(0);
        return query(`Delete FROM ${Storage_Table} WHERE expire_on < $1 `, [now])
        .then((Result) => res.status(200).send())
            .catch(next);
    
        
    })
    //Get ModuleInfo
    .get('/Module', (req, res, next) => {
        return getAllModules()
            .then((result) => {
                if (!result) return next(createHttpError(404, `moduleName & creditUnit ${result} not found`));
                return res.json(result).end();
            })
            .catch(next);
    })
        
    //Create module info (moduleName,creditUnit)
    .post('/Module',  (req, res, next) => {
        const { currentModuleName,currentcreditUnit,currentSemester} = req.body;
        if(!currentModuleName) {
            if (!currentModuleName) return next(createHttpError(404, ` modulename not found`));

        }
        return addModule(currentModuleName,currentcreditUnit,currentSemester)
        .then((currentModuleName,currentcreditUnit)=>res.status(201).json({currentModuleName,currentcreditUnit,currentSemester}))
        .catch(next);
        
          })
        
    //Update a creditUnit by id
     .put('/Module/:id/:creditunit', (req,res,next)=>{
        const  id =parseInt(req.params.id); 
    const creditunit=parseInt(req.params.creditunit);

    console.log(creditunit);
     return updateCreditunit(id,creditunit)
     .then((result) => {
        if (!result) return next(createHttpError(404, ` creditUnit ${result} not found`));
        console.log(result.rows);
        return res.json(result.rows).end();
    })
    .catch(next);
})

     //Delete a moduleInfo by id 

    .delete('/Module/:id',(req,res,next)=>{
        const id=parseInt(req.params.id);
        console.log(id);       
        return deleteModule(id)
        .then((result) => res.status(200).send("Successfully deleted Module Info").end())
            .catch(next);
    })
    .get('/Module/:modulename',(req,res,next)=>{
        const modulename=(req.params.modulename)
        return getcreditunitbyModuleName(modulename)
        .then((result) => {
            if (!result) return next(createHttpError(404, ` creditUnit ${result} not found`));
            console.log(result);
            return res.json(result).end;
        })
        .catch(next);
    })

    .use((req, res, next) => next(createHttpError(404, `Unknown resource ${req.method} ${req.originalUrl}`)))
    .use((error, req, res, next) => {
        console.error(error);
        next(error);
    })
    .use((error, req, res, next) => next(res.status(error.status || 500).json({ error: error.message || 'Unknown error' })));
    