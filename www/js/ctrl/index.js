function index($scope,$rootScope,$window,srv,$route)
{
    $scope.New = async function()
    {
        let ConStatus = await srv.Connection();

        if(ConStatus == false)
        {
            swal('İşlem Başarısız!','Programı Kapatıp Tekrar Açın.','error')
        }

        $scope.User = "";
        $scope.Password = "";
    }
    $scope.BtnLogin = async function()
    {
        let TmpQuery = 
        {
            db: "DELETEPLUS",
            query : "SELECT * FROM KULLANICILAR WHERE KODU = @KODU AND SIFRE = @SIFRE ",
            param : ["KODU:string|25","SIFRE:string|25"],
            value : [$scope.User,$scope.Password]
        }
        
        let LoginControl = await srv.Execute(TmpQuery);

        if(LoginControl.length == 0)
        {
            swal('Giriş Başarısız!','Lütfen Giriş Bilgilerini Kontrol Edin !','error');
        }
        else
        {
            localStorage.UserCode = LoginControl[0].KODU;
            localStorage.UserName = LoginControl[0].AD;
            localStorage.SUBE_NO = LoginControl[0].SUBE_NO;
            var url = "main.html";
            window.location.href = url;
        }
    }
}   