function araccikis($scope,$rootScope,$window,srv,$route)
{
    function CarListGrid()
    {
        $("#TblCarList").dxDataGrid
        ({
            dataSource: $scope.ReportGrid,
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
    	        mode: "single"
    	    },
            onCellPrepared: function(e) 
            {
                if (e.rowType == "data" && e.row.isSelected) 
                {
                    e.cellElement.css("background-color", "#4ef037");
                }
            },
            onSelectionChanged: function(e) 
            {
                e.component.repaint();

                if(e.selectedRowsData.length > 0)
                {
                    if(e.selectedRowsData[0].STATUS == 1)
                    {
                        swal("Uyarı","Çıkış İşlemi Başarısız. Bu Araca Ait Çıkış İşlemi Mevcut","error");
                        return;
                    }

                    swal({
                        title: "Uyarı",
                        text : "Seçilen Aracın Çıkış İşlemini Yapmak İstediğinize Emin Misiniz ? ",
                        icon: "warning",
                        buttons: ["İşlemi İptal Et", "Tamamla"],
                        dangerMode: false,
                        })
                        .then(async (willDelete) => 
                        {
                        if (willDelete) 
                        {
                            await UpdateCarList(e.selectedRowsData[0].GUID);
                            await GetCarList();
                            swal("Başarılı!", "İşlem Tamamlandı.", 
                            {
                            icon: "success",
                            });
                        }
                        else 
                        {

                        }
                    });
                }
            },
            onRowPrepared(e) 
            {  
                if (e.rowType == 'data' && e.data.STATUS == 1)  
                {  
                    e.rowElement.css("background-color", "#87bdd8"); 
                }
                else if(e.rowType == 'data'  && e.data.STATUS == 0)
                {
                    e.rowElement.css("background-color", "#FFFF00");
                }
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
                    caption: "GİRİŞ",
                    dataType: "text",
                    align: "center",
                },
                {
                    dataField: "CIKIS",
                    caption: "ÇIKIŞ",
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
    async function GetCarList()
    {   
        return new Promise(async resolve => 
        {
            let TmpQuery = 
            {
                db: "DELETEPLUS",
                query : "SELECT *,CONVERT(VARCHAR,GIRIS_SAAT,8) AS GIRIS,CONVERT(VARCHAR,CIKIS_SAAT,8) AS CIKIS FROM ARAC_HAREKET WHERE SUBE_NO = @SUBE_NO AND CAST (GIRIS_SAAT AS DATE) = @GIRIS_SAAT ORDER BY GIRIS_SAAT DESC ",
                param : ["SUBE_NO:string|25","GIRIS_SAAT:date"],
                value : [localStorage.SUBE_NO,moment(new Date()).format("DD.MM.YYYY")]
            }

            $scope.CarList = await srv.Execute(TmpQuery)
            $("#TblCarList").dxDataGrid("instance").option("dataSource", $scope.CarList);
            resolve();
        });
    }
    async function UpdateCarList(pGuid)
    {   
        return new Promise(async resolve => 
        {
            let TmpQuery = 
            {
                db: "DELETEPLUS",
                query : "UPDATE ARAC_HAREKET SET STATUS = 1,CIKIS_SAAT = GETDATE() WHERE GUID = @GUID ",
                param : ["GUID:string|50"],
                value : [pGuid]
            }

            await srv.Execute(TmpQuery)
            resolve();
        });
    }
    $scope.New = async function()
    {
        $scope.CarList = [];

        CarListGrid();

        await GetCarList();
    }
    $scope.BtnRefresh = async function()
    {
        await GetCarList();
    }
}