angular.module('app.srv', []).service('srv',function($rootScope)
{
    moment.locale('tr')
    let _Socket = null;

    this.SocketConnected = false;
    this.Connection = _Connection;
    this.Execute = _Execute;
    this.ExecuteDBT = _ExecuteDBT; 
    
    this.SafeApply = function(pScope,pFn) 
    {
        // if(pScope.$root.$$phase != null)
        // {
            var phase = pScope.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') 
            {
              if(pFn && (typeof(pFn) === 'function')) 
              {
                pFn();
              }
            } else 
            {
                pScope.$apply(pFn);
            }
        // }
    };     
    this.On = function(eventName,callback)
    {   
        _Socket.on(eventName, function(data) 
        {   
            var args = arguments;
            $rootScope.$apply(function()
            {   
                callback.apply(_Socket, args);
            });
        });
    }
    this.Emit = function(eventName,data,callback)
    {        
        _Socket.emit(eventName, data, function () 
        {
            var args = arguments;
            $rootScope.$apply(function () 
            {
                if (callback) 
                {
                  callback.apply(_Socket, args);
                }
            });
        });
    }
    function _Connection()
    {
        return new Promise(resolve => 
        {
            if(_Socket == null || _Socket.connected == false)
            {
                _Socket = io.connect(window.location.origin,{autoConnect: false,reconnectionDelay:10});
                _Socket.open();

                _Socket.on('MaxUserCounted',function(MenuData)
                {               
                    if (typeof(MenuData) == "undefined")
                    {
                        _Socket.disconnect();
                        console.log('Giremezsin !');
                    }
                });

                _Socket.on('connect',(data) => 
                {
                    this.SocketConnected = true;
                    resolve(true);  
                });
                _Socket.on('connect_error',(error) => 
                {
                    this.SocketConnected = false;                    
                    console.log('connect_error');

                    resolve(false);
                });
                _Socket.on('error', (error) => 
                {
                    this.SocketConnected = false;
                    resolve(false);
                });
            }
            else
            {
                this.SocketConnected = true;
                resolve(true); 
            }
        });
    }
    function _Execute()
    {
        return new Promise(resolve => 
        {
            let TmpQuery;

            if(_Socket.connected)
            {
                if(arguments.length == 1)
                {
                    TmpQuery = arguments[0];
                }
                else if(arguments.length > 1)
                {
                    TmpQuery = window["Query"][arguments[1]];
                    TmpQuery.value = arguments[2];
                    TmpQuery.db = '{M}.' + arguments[0];

                    if(typeof arguments[3] != 'undefined')
                    {
                        TmpQuery.loading = arguments[3];
                    }
                }
                else
                {
                    resolve();
                }    
                
                //PARAMETRE UNDEFINED KONTROLÜ (17.07.2020 - ALI KEMAL KARACA)
                if(typeof(TmpQuery.value) != 'undefined')
                {
                    for (let i = 0; i < TmpQuery.value.length; i++) 
                    {
                        if(typeof TmpQuery.value[i] == 'undefined')
                        {
                            swal("Hata !","Parametre değerlerinde problem oluştu ! ",icon="error");    
                            resolve();
                        }
                    }
                }
                /********************************************************** */
                if(typeof TmpQuery.loading == 'undefined' || TmpQuery.loading)
                {
                    //$('#loading').show()              
                }

                _Socket.emit('QMikroDb', TmpQuery, function (data) 
                {
                    if(typeof TmpQuery.loading == 'undefined' || TmpQuery.loading)
                    {
                        //$('#loading').hide()  
                    }

                    if(typeof(data.result.err) == 'undefined')
                    {
                        if(data.result.recordsets.length == 0)
                        {
                            resolve([])
                        }
                        else
                        {
                            resolve(data.result.recordset)
                        }
                    }
                    else
                    {     
                        swal("Hata !","Mikro Sql Query Çalıştırma Hatası : " + data.result.err,icon="error");                 
                        resolve()
                    }
                });
            }
            else
            {
                console.log("Server Erişiminiz Yok.");
            }
        });
    }
    this.SumColumn = function(pData,pColumn,pFilter)    
    {
        let Sum = 0;
        for(i=0;i<pData.length;i++)
        {
            if (typeof(pFilter) != "undefined")
            {
                if(pData[i][pFilter.toString().split('=')[0].trim()] == pFilter.toString().split('=')[1].trim())
                {
                    Sum += pData[i][pColumn];
                }
            }
            else
            {
                Sum += pData[i][pColumn];
            }
        }
        
        return Sum;
    }
    this.Max = function(pData,pColumn)
    {
        if(typeof pData == 'undefined' || pData.length == 0)
        {
            return 0;
        }

        let Tmp = Math.max.apply(Math,pData.map(x => {return x[pColumn]}));

        if(isNaN(Tmp))
        {
            return 0;
        }

        return Tmp;
    }
    this.GetParam = function(pUser)
    {
        for (let i = 0; i < Param.length; i++) 
        {
            if(Param[i].Kullanici == pUser)
            {
                return Param[i];
            }
        }
        
        return
    }
    this.UserControl = function(pUser,pPassword)
    {
        for (let i = 0; i < window.Param.length; i++) 
        {
            if(window.Param[i].Kullanici == pUser && window.Param[i].Sifre == pPassword)
            {
                return true;
            }
        }
        return false;
    }
    this.Alert = function(title,info,type)
    {
        Swal.fire
        (
            title,
            info,
            type
        )
    }
    function _ExecuteDBT()
    {
        return new Promise(resolve => 
        {
            let TmpQuery;

            if(_Socket.connected)
            {
                if(arguments.length == 1)
                {
                    TmpQuery = arguments[0];
                }
                else if(arguments.length > 1)
                {
                    TmpQuery = window["query"][arguments[1]];
                    TmpQuery.value = arguments[2];
                    TmpQuery.db = '{M}.' + arguments[0];

                    if(typeof arguments[3] != 'undefined')
                    {
                        TmpQuery.loading = arguments[3];
                    }
                }
                else
                {
                    resolve();
                } 

                _Socket.emit('DBTDb', TmpQuery, function (data) 
                {
                    if(typeof(data.result.err) == 'undefined')
                    {
                        if(data.result.recordsets.length == 0)
                        {
                            resolve([])
                        }
                        else
                        {
                            resolve(data.result.recordset)
                        }
                    }
                    else
                    {     
                        swal("Hata !","Mikro Sql Query Çalıştırma Hatası : " + data.result.err,icon="error");                 
                        resolve()
                    }
                });
            }
            else
            {
                console.log("Server Erişiminiz Yok.");
            }
        });
    }
});