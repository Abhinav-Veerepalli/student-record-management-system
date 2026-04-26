import app from './app.js';
const port = 3000;
const host = 'localhost';
app.listen(port,host,()=>{
    console.log(`http://${host}:${port}`);
})