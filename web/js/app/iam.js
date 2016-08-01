/**
 * Created by Xavier on 11/04/2016.
 */
// Fonction de chargement Standard Edit
function ajaxCoreEdit(url, editItem)
{
    urlajax ="/ajax/"+url+"/get/"+editItem;
    $.ajax({url:urlajax,success:function(result){
        var frm = $("#form-edit");
        var i;
        for (i in result) {
            frm.find('[name="'+url+'[' + i + ']"]').val(result[i]);
        }
        if (url ='user') {
            document.getElementById("user_enabled").checked = result.enabled;
            frm.find('[name="sendId"]').val(result.id);
        }
        $('.select2-single').select2({
            theme: "bootstrap",
            width: null,
            containerCssClass: ':all:',
            placeholder: "Choisir une option"
        });
    }});
}

// Recherche sur homepage
function filterGlobal () {
    $('#bootstrap-todo').DataTable().search(
        $('#global_filter').val()
    ).draw();
}

function showHideColumn () {
    var sel = document.getElementById('addHideColum');
    var myVar = sel.options[sel.selectedIndex].value;
    console.log(myVar);
        var table = document.getElementById('bootstrap-ticket');
        // Get the column API object
        var column = table.column(myVar);
        // Toggle the visibility
        column.visible( ! column.visible() );
}

// Recherche sur homepage
function filterGlobalTicket () {
    $('#bootstrap-ticket').DataTable().search(
        $('#global_filter').val()
    ).draw();
}

function ticketMenu(id) {
    $('.ticket_view_menu').removeClass("active");
    var activemenu = '#' + id;
    var activeblock = '#' + id + '_block';
    $(activemenu).addClass("active");
    $('.ticket_middle_block').addClass("hide").removeClass("show");
    $(activeblock).removeClass("hide").addClass("show");
}

function ajaxCreateViaAPI()
{
    var currentEditItem = localStorage.getItem("currentEditItem");
}

// Fonction Process Bulk Import Orange Numbers
function processCsvFile(url) {
    $('#progressBarBulkImportDiv').addClass('show').removeClass('hide');
    $('#fileSelectDiv').addClass('hide');
    $('#fileUploadInfos').addClass('hide');
    $('#upload').addClass('hide');
    document.getElementById('progressBarBulkImport').innerHTML = '0%';
    var fileUpload = document.getElementById("fileUpload");
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var rows = e.target.result.split("\n");
            console.log(rows);
            var totalRows = rows.length - 1;
            localStorage.setItem("totalRows", totalRows);
            var successRows = 0;
            var currentRow = 0;
            for (var i = 1; i < rows.length; i++) {
                var cells = rows[i].replace(/[/]/g, "-5-8-3-");
                urlajax = url + cells;
                $.ajax({
                    url: urlajax,
                    success: function (result) {
                        currentRow = parseInt(currentRow) + parseInt('1');
                        var reglede3 = Math.round(parseInt(currentRow) * parseInt('100') / parseInt(totalRows)).toString();
                        if (reglede3 % 5 === 0 ) {
                            document.getElementById('progressBarBulkImport').innerHTML = reglede3 + '%';
                            $('#progressBarBulkImport').width(reglede3+'%').attr('aria-valuenow', reglede3);
                        }
                        successRows = parseInt(successRows) + parseInt(result);
                        if (parseInt(currentRow) == parseInt(totalRows))
                        {
                            localStorage.setItem("successRows",successRows);
                            $('#resultInsertFile').addClass('show').removeClass('hide');
                            document.getElementById('resultInsertFile').innerHTML = localStorage.getItem("successRows")+"/"+localStorage.getItem("totalRows")+' correctement inséré(s)';
                            $('#progressBarBulkImport').removeClass('active');
                        }
                    }
                });
            }
        };
        reader.readAsText(fileUpload.files[0]);

    } else {
        alert("Merci de charger un CSV valide");
    }
}
