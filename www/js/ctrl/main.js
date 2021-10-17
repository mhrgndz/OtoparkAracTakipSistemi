function main($scope,$rootScope,$window,srv,$route)
{
    $scope.New = async function()
    {
        let ConStatus = await srv.Connection();

        srv.SafeApply($scope,function()
        {
            $scope.UserName = localStorage.UserName;
        });
    }
}