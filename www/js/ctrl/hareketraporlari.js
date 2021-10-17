function hareketraporlari($scope,$rootScope,$window,srv,$route)
{
    function HareketListGrid()
    {
        $("#TblHareketList").dxDataGrid
        ({
            dataSource: $scope.HareketList,
            columnMinWidth: 120,
            height: 465,
            showBorders: true,
            filterRow: 
            {
                visible: true,
                applyFilter: "auto"
            },
            headerFilter: 
            {
                visible: true
            },
            scrolling: 
            {
                columnRenderingMode: "horizontal"
            },
            paging: 
            {
                pageSize: 10
            },
            selection: 
            {
                mode: 'multiple'
            },
            export: 
            {
                enabled: true,
                allowExportSelectedData: true
            },
            onExporting: function(e) 
            {
                var workbook = new ExcelJS.Workbook();
                var worksheet = workbook.addWorksheet('Employees');
                
                DevExpress.excelExporter.exportDataGrid({
                  component: e.component,
                  worksheet: worksheet,
                  autoFilterEnabled: true
                }).then(function() {
                  workbook.xlsx.writeBuffer().then(function(buffer) 
                  {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'AracHareketRaporu.xlsx');
                  });
                });
                e.cancel = true;
            },
            columns: 
            [
                {
                    dataField : "PLAKA",
                    caption: "PLAKA",
                    dataType: "text",
                    align: "center",
                    with : 50
                },
                {
                    dataField: "GIRIS",
                    caption: "GİRİŞ TARİHİ",
                    dataType: "text",
                    align: "center",
                },
                {
                    dataField: "CIKIS",
                    caption: "ÇIKIŞ TARİHİ",
                    dataType: "text",
                    align: "center",
                },
                {
                    dataField : "SASE_NO",
                    caption: "ŞASE NO",
                    dataType: "text",
                    align: "center",
                },
            ],
        });
    }
    async function GetHareketList()
    {   
        return new Promise(async resolve => 
        {
            let TmpQuery = 
            {
                db: "DELETEPLUS",
                query : "SELECT *,CONVERT(VARCHAR,GIRIS_SAAT,121) AS GIRIS,CONVERT(VARCHAR,CIKIS_SAAT,121) AS CIKIS FROM ARAC_HAREKET WHERE SUBE_NO = @SUBE_NO AND ((CAST(GIRIS_SAAT AS DATE) = @STARTDATE) OR (CAST(GIRIS_SAAT AS DATE) = @FINISHDATE)) AND STATUS = 1 ORDER BY GIRIS_SAAT DESC ",
                param : ["SUBE_NO:string|25","STARTDATE:date","FINISHDATE:date"],
                value : [localStorage.SUBE_NO,$scope.StartDate,$scope.FinshDate]
            }

            $scope.HareketList = await srv.Execute(TmpQuery)
            $("#TblHareketList").dxDataGrid("instance").option("dataSource", $scope.HareketList);

            if($scope.HareketList.length == 0)
            {
                swal('Uyarı!','Seçilen Tarihe Ait Gösterilecek Veri Bulunamadı.','warning');
            }
            resolve();
        });
    }
    $scope.New = async function()
    {
        $scope.StartDate = moment(new Date()).format("DD.MM.YYYY");
        $scope.FinshDate = moment(new Date()).format("DD.MM.YYYY");

        $scope.HareketList = [];

        HareketListGrid();
        await GetHareketList();
    }
    $scope.BtnCalistir = async function()
    {
        await GetHareketList();
    }
}