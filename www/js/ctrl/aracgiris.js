function aracgiris($scope,$rootScope,$window,srv,$route)
{
    $scope.New = async function()
    {
        $scope.SaseNo = "";
        $scope.PlakaBas = "";
        $scope.PlakaOrta = "";
        $scope.PlakaSon = "";
    }
    async function GetLisans()
    {
        return new Promise(async resolve => 
        {
            let TmpQuery = 
            {
                db: "DELETEPLUS",
                query : "SELECT [VALUE] FROM SPECIAL WHERE TAG = 'LISANS' ",
            }

            resolve((await srv.Execute(TmpQuery))[0].VALUE);
        });
    }
    async function InsertData()
    {
        return new Promise(async resolve => 
        {
            let TmpQuery = 
            {
                db: "DELETEPLUS",
                query : "INSERT INTO [dbo].[ARAC_HAREKET] " +
                        "([CUSER] " +
                        ",[LUSER] " +
                        ",[GIRIS_SAAT] " +
                        ",[CIKIS_SAAT] " +
                        ",[PLAKA] " +
                        ",[SASE_NO] " +
                        ",[SUBE_NO] " +
                        ",[IMAGE] " +
                        ",[STATUS] " +
                        ")VALUES( " +
                        "@CUSER                 --<CUSER, nvarchar(25),> \n " +
                        ",@LUSER                --<LUSER, nvarchar(25),> \n " +
                        ",GETDATE()             --<GIRIS_SAAT, datetime,> \n " +
                        ",'1900.01.01'          --<CIKIS_SAAT, datetime,> \n " +
                        ",@PLAKA                --<PLAKA, nvarchar(25),> \n " +
                        ",@SASE_NO              --<SASE_NO, nvarchar(50),> \n " +
                        ",@SUBE_NO              --<SUBE_NO, nvarchar(25),> \n " +
                        ",@IMAGE                --<IMAGE, nvarchar(max),> \n " +
                        ",@STATUS               --<STATUS, int,> \n " +
                        ") " ,
                param : ["CUSER:string|25","LUSER:string|25","PLAKA:string|25","SASE_NO:string|50","SUBE_NO:string|50","IMAGE:string|50","STATUS:int"],
                value : [localStorage.UserCode,localStorage.UserCode,($scope.PlakaBas + $scope.PlakaOrta + $scope.PlakaSon).toUpperCase(),$scope.SaseNo,localStorage.SUBE_NO,"",0]
            }
            
           resolve(await srv.Execute(TmpQuery));
        });
    }
    async function DataControl()
    {
        return new Promise(async resolve => 
        {
            let TmpQuery = 
            {
                db: "DELETEPLUS",
                query : "SELECT * FROM ARAC_HAREKET WHERE PLAKA = @PLAKA AND CAST (GIRIS_SAAT AS DATE) = @GIRIS_SAAT  ",
                param : ["PLAKA:string|25","GIRIS_SAAT:date"],
                value : [($scope.PlakaBas + $scope.PlakaOrta + $scope.PlakaSon).toUpperCase(),moment(new Date()).format("DD.MM.YYYY")]
            }

            resolve(await srv.Execute(TmpQuery));
        });
    }
    async function LisansCheck()
    {
        if(moment(new Date()).format("YYYYMMDD") == await GetLisans())
        {
            alert("Lisans Süreniz Dolmuştur. Lütfen Ürün Yöneticiniz İle Görüşün.")
            var url = "index.html";
            window.location.href = url;
            return;
        }
    }
    $scope.BtnKaydet = async function()
    {
        await LisansCheck();

        if($scope.PlakaBas == "" || $scope.PlakaOrta == "" || $scope.PlakaSon == "")
        {
            swal('İşlem Başarısız!','Lütfen Plaka Alanlarını Doldurun.','warning');
            return;
        }

        let DataControlResult = await DataControl();

        if(DataControlResult.length > 0)
        {
            swal('İşlem Başarısız!',moment(new Date()).format("DD.MM.YYYY") + " - " +($scope.PlakaBas + $scope.PlakaOrta + $scope.PlakaSon).toUpperCase() + '\n Araş Girişi Mevcut.','warning');
            return;
        }

        let InsertResult = await InsertData();

        if(typeof(InsertResult) != "undefined" || InsertResult.length == 0)
        {
            swal('İşlem Başarılı!','Kayıt İşlemi Başarıyla Gerçekleşti.','success');
        }
        else
        {
            swal('İşlem Başarısız!','Kayıt İşleminde Hata!','error');
        }
    }
}