let fs = require('fs');
let _sql = require("./sqllib");

let msql;
let tsql;

let LicKullanici = 0;
let LicMenu = "";

function dbengine(config,io)
{    
    this.config = config;
    // io.listen(config.socket);
    io.on('connection', function(socket) 
    {
        socket.on('GetMenu',function(pParam,pFn)
        {
            if(Object.keys(io.sockets.connected).length > LicKullanici)
            {
                pFn('');
            }
            else
            {
                pFn(LicMenu);
            }
        });
        socket.on('TryConnection', function(name,fn)
        {
            msql = new _sql(config.server, '',config.uid,config.pwd,config.trustedConnection);

            console.log(msql)
            msql.TryConnection(function(status)
            {
                if(status == true)
                    fn(true);
                else
                    fn(false);
            });
        });
        socket.on('QMikroDb',function(pQuery,fn) 
        {   
            try
            {
                let TmpDb = config.database;

                if (typeof(pQuery.db) != "undefined") 
                {
                    if(pQuery.db.indexOf("{M}.") > -1)
                    {
                        TmpDb = config.database + '_' + config.database; //CONFIGDATABSE ALANI EKLENDİ(27.04.2021 - MAHİR)
                    }
                    else
                    {
                        TmpDb = config.database;    
                    }        
                }
                
                msql = new _sql(config.server,TmpDb,config.uid,config.pwd,config.trustedConnection);
                msql.QueryPromise(pQuery,function(data)
                {
                    let obj = JSON.parse(data);
                    fn({tag : pQuery.tag,result : obj});
                });
            }
            catch(err)
            {
                var tmperr = { err : 'Error dbengine.js QMikroDb errCode : 107 - ' + err} 
                socket.emit('RMikroDb',
                {
                    tag : pQuery.tag, 
                    result : tmperr
                });  

                fn({tag : pQuery.tag,result : tmperr});
                console.log(tmperr);
            }
        });
        socket.on("QSMikroDb",function(pQuery,fn)
        {
            try
            {
                let TmpDb = config.database;

                let Tmp = [];

                msql = new _sql(config.server,TmpDb,config.uid,config.pwd,config.trustedConnection);
                msql.QueryStream(pQuery,function(data)
                {
                    var obj = JSON.parse(data);

                    if(obj.tagdata == "row")
                    {
                        Tmp.push(obj.result);
                        
                        if(Tmp.length == 500)
                        {
                            socket.emit('RSMikroDb',
                            {
                                tag : obj.tagdata, 
                                result : Tmp
                            }); 
                            Tmp = [];
                        }
                    }

                    if(obj.tagdata == "done")
                    {
                        socket.emit('RSMikroDb',
                        {
                            tag : obj.tagdata, 
                            result : Tmp,
                        });  
                    }
                });
            }
            catch(err)
            {
                var tmperr = { err : 'Error dbengine.js QSMikroDb errCode : 108 - ' + err} 
                socket.emit('RSMikroDb',
                {
                    tag : pQuery.tag, 
                    result : tmperr
                });  
            }
        });
        socket.on('QToneDb',function(pQuery) 
        {   
            try
            {
                tsql = new _sql(config.server,config.tonedb,config.uid,config.pwd,config.trustedConnection);
                tsql.QueryPromise(pQuery,function(data)
                {
                    var obj = JSON.parse(data);
                    socket.emit('RToneDb',
                    {
                        tag : pQuery.tag, 
                        result : obj
                    });   
                });
            }
            catch(err)
            {
                var tmperr = { err : 'Error dbengine.js QToneDb errCode : 107 - ' + err} 
                socket.emit('RToneDb',
                {
                    tag : pQuery.tag, 
                    result : tmperr
                });  
                console.log(tmperr);
            }
        });
        socket.on("QSToneDb",function(pQuery)
        {
            try
            {
                tsql = new _sql(config.server,config.tonedb,config.uid,config.pwd,config.trustedConnection);
                tsql.QueryStream(pQuery,function(data)
                {
                    var obj = JSON.parse(data);
                    socket.emit('RSToneDb',
                    {
                        tag : pQuery.tag, 
                        result : obj
                    });   
                });
            }
            catch(err)
            {
                var tmperr = { err : 'Error dbengine.js QSToneDb errCode : 108 - ' + err} 
                socket.emit('RSToneDb',
                {
                    tag : pQuery.tag, 
                    result : tmperr
                });  
                console.log(tmperr);
            }
        });
        socket.on("ImgUpload",function(pParam,fn)
        {
            let FilePath = "";
            if(typeof process.env.APP_DIR_PATH != 'undefined')
            {
                FilePath = process.env.APP_DIR_PATH + "/../";
            }
            if(typeof pParam['Logo'] != 'undefined')
            {
                let Img = pParam['Logo']
                let data = Img.replace(/^data:image\/\w+;base64,/, "");
                let buf = Buffer.from(data, 'base64');
                fs.writeFile(FilePath + "www/upload/logo.jpg", buf,function(err, result) 
                {
                    if(err)
                        console.log('error', err);  
                    else
                        fn(true)
                        sharp.cache(false);
                });
            }
            for(let i = 1;i < 9; i++)
            {
                if(typeof pParam['Img' + i] != 'undefined')
                {
                    let Img = pParam['Img' + i]
                    let data = Img.replace(/^data:image\/\w+;base64,/, "");
                    let buf = Buffer.from(data, 'base64');
                    let inputFile  = FilePath + "www/upload/product/" + pParam.Code + "-" + i + ".jpg";
                    let outputFile = FilePath + "www/upload/product/" + pParam.Code + "-" + i + "_thumb.jpg";
                    fs.writeFile(FilePath + "www/upload/product/" + pParam.Code + "-" + i + ".jpg", buf,function(err, result) 
                    {
                        if(err)
                            console.log('error', err);
                        else
                            fn(true)
                            sharp.cache(false);
                            sharp(inputFile).resize({ height: 200, width: 200, fit: 'contain' }).toFile(outputFile)
                            .then(function(newFileInfo) {
                                //console.log(newFileInfo);
                            })
                            .catch(function(err) 
                            {
                                console.log(err);
                            });
                    });
                }
                if(typeof pParam['BgSlider' + i] != 'undefined')
                {
                    let Img = pParam['BgSlider' + i]
                    let data = Img.replace(/^data:image\/\w+;base64,/, ""); 
                    let buf = Buffer.from(data, 'base64');
                    fs.writeFile(FilePath + "www/upload/slider/bg_" + pParam.Name + ".jpg", buf,function(err, result) 
                    {
                        if(err)
                            console.log('error', err);    
                        else
                            fn(true)
                            sharp.cache(false);
                    });
                }
            }
        });
    });
}

module.exports = dbengine;