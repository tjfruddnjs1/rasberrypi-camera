const express = require('express');
const dotenv = require('dotenv');
const app = express();
const homeRouter = require('./routes/home');
const streamRouter = require('./routes/stream');

app.set('port', process.env.PORT || 8005);
app.set('view engine', 'ejs');

app.use(express.static(__dirname+'/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', homeRouter);
app.use('/stream', streamRouter);

app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    console.log(err.status +' error 발생')
});

app.listen(app.get('port'), ()=> {
    console.log(app.get('port'), '번 포트에서 대기중');
});
