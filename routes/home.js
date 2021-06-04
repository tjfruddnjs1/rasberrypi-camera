const express = require('express');

const router = express.Router();

router.get('/', async(req,res,next)=>{
    try{
        res.render('home/index');
    }catch(err){
        console.log(err);
        next(err);
    }
});

module.exports = router;