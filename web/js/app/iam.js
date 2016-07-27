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
            $('.select2-single').select2({
                theme: "bootstrap",
                width: null,
                containerCssClass: ':all:',
                placeholder: "Choisir une option"
            });
        }
    }});
}

// Fonction de mise en session du user éditer en cours
function resetEditItem()
{
    localStorage.clear();
}

// Fonction de lien vers le predecesseur
function setViewUtilisateur()
{
    var currentEditItem = localStorage.getItem("currentPredecesseurId");
    localStorage.setItem("currentEditItem",currentEditItem);
    window.location = "/admin/utilisateur?isArchived=0";
}

function ajaxCreateViaAPI()
{
    var currentEditItem = localStorage.getItem("currentEditItem");
}

// Fonction Show Password
function replaceT(formName)
{
    var newO = document.getElementById(formName).elements["utilisateur_mainPassword"];
    newO.setAttribute('type', 'text');
}

// Fonction de Generation de mot de passe
function generatePassword(formName)
{
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    var charCount = 0;
    var numCount = 0;
    for (var i=0; i<string_length; i++) {
        // If random bit is 0, there are less than 3 digits already saved, and there are not already 5 characters saved, generate a numeric value.
        if((Math.floor(Math.random() * 2) == 0) && numCount < 3 || charCount >= 5) {
            var rnum = Math.floor(Math.random() * 10);
            randomstring += rnum;
            numCount += 1;
        } else {
            // If any of the above criteria fail, go ahead and generate an alpha character from the chars string
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
            charCount += 1;
        }
    }
    document.getElementById(formName).elements["utilisateur_mainPassword"].value = randomstring;
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
                console.log("line" + i);
                var cells = rows[i].replace(/[/]/g, "-5-8-3-");
                urlajax = url + cells;
                $.ajax({
                    url: urlajax,
                    success: function (result) {
                        console.log("etape 4");
                        currentRow = parseInt(currentRow) + parseInt('1');
                        var reglede3 = Math.round(parseInt(currentRow) * parseInt('100') / parseInt(totalRows)).toString();
                        console.log(reglede3 + '%');
                        if (reglede3 % 5 === 0 ) {
                            document.getElementById('progressBarBulkImport').innerHTML = reglede3 + '%';
                            $('#progressBarBulkImport').width(reglede3+'%').attr('aria-valuenow', reglede3);
                        }
                        successRows = parseInt(successRows) + parseInt(result);
                        if (parseInt(currentRow) == parseInt(totalRows))
                        {
                            console.log("5");
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

//Fonction de rechargement des profiles Sf
function reloadProfilesFromSf()
{
    $("#waiting").removeClass("hide").addClass("show");
    $("#reloadSfProfiles").removeClass("show").addClass("hide");
    urlajax = "/ajax/salesforce/profile/reload";
    $.ajax({
        url: urlajax, success: function (result) {
            $("#waiting").removeClass("show").addClass("hide");
            $("#reloadSfProfiles").removeClass("hide").addClass("show");
            window.location = "/app/salesforce/profile_liste";
        }
    });
}

//Fonction de rechargement des groupes Sf
function reloadGroupesFromSf()
{
    $("#waiting").removeClass("hide").addClass("show");
    $("#reloadSfGroupes").removeClass("show").addClass("hide");
    urlajax = "/ajax/salesforce/groupe/reload";
    $.ajax({
        url: urlajax, success: function (result) {
            $("#waiting").removeClass("show").addClass("hide");
            $("#reloadSfGroupes").removeClass("hide").addClass("show");
            window.location = "/app/salesforce/groupe_liste";
        }
    });
}

//Fonction de rechargement des territoires Sf
function reloadTerritoriesFromSf()
{
    $("#waiting").removeClass("hide").addClass("show");
    $("#reloadSfTerritories").removeClass("show").addClass("hide");
    urlajax = "/ajax/salesforce/territory/reload";
    $.ajax({
        url: urlajax, success: function (result) {
            $("#waiting").removeClass("show").addClass("hide");
            $("#reloadSfTerritories").removeClass("hide").addClass("show");
            window.location = "/app/salesforce/territory_liste";
        }
    });
}

//Fonction de rechargement des groupes Ad
function reloadGroupFromAd()
{
    $("#waiting").removeClass("hide").addClass("show");
    $("#reloadADGroup").removeClass("show").addClass("hide");
    urlajax = "/ajax/active_directory/groupe/reload";
    $.ajax({
        url: urlajax, success: function (result) {
            $("#waiting").removeClass("show").addClass("hide");
            $("#reloadADGroup").removeClass("hide").addClass("show");
            window.location = "/app/active_directory/groupe_liste";
        }
    });
}

//Fonction de rechargement des unités d'organisation Ad
function reloadOrganisationUnitFromAd()
{
    $("#waiting").removeClass("hide").addClass("show");
    $("#reloadADGroup").removeClass("show").addClass("hide");
    urlajax = "/ajax/active_directory/organisations_units/reload";
    $.ajax({
        url: urlajax, success: function (result) {
            $("#waiting").removeClass("show").addClass("hide");
            $("#reloadADGroup").removeClass("hide").addClass("show");
            window.location = "/app/active_directory/organisation_unit_liste";
        }
    });
}

//Fonction de rechargement des groupes google
function reloadGroupFromGoogle()
{
    $("#waiting").removeClass("hide").addClass("show");
    $("#reloadADGroup").removeClass("show").addClass("hide");
    urlajax = "/ajax/google/groupe/reload";
    $.ajax({
        url: urlajax, success: function (result) {
            $("#waiting").removeClass("show").addClass("hide");
            $("#reloadADGroup").removeClass("hide").addClass("show");
            window.location = "/app/google/groupe_liste";
        }
    });
}

// Recherche sur homepage
function filterGlobal () {
    $('#bootstrap-todo').DataTable().search(
        $('#global_filter').val()
    ).draw();
}

// Switch Panel
function switchPanelToUser()
{
    $("#Applicatifs").addClass("show").removeClass("hide");
    $("#user_panel").addClass("show").removeClass("hide");
    $("#Profile").addClass("show").removeClass("hide");
    $("#Equipe").addClass("show").removeClass("hide");
    $("#Recrutement").addClass("show").removeClass("hide");
    $("#admin_panel").removeClass("show").addClass("hide");
    $("#tools_panel").removeClass("show").addClass("hide")
    $("#Dashboards").removeClass("show").addClass("hide");
    $("#Candidats").removeClass("show").addClass("hide");
    $("#Utilisateurs").removeClass("show").addClass("hide");
    $("#Divers").removeClass("show").addClass("hide");
    $("#Odigo").removeClass("show").addClass("hide");
    $("#Salesforce").removeClass("show").addClass("hide");
    $("#ActiveDirectory").removeClass("show").addClass("hide");
    $("#Google").removeClass("show").addClass("hide");
    $("#UserLauncher").removeClass("show").addClass("hide");
}

function switchPanelToAdmin()
{
    $("#Applicatifs").addClass("hide").removeClass("show");
    $("#user_panel").addClass("hide").removeClass("show");
    $("#Profile").addClass("hide").removeClass("show");
    $("#Equipe").addClass("hide").removeClass("show");
    $("#Recrutement").addClass("hide").removeClass("show");
    $("#admin_panel").removeClass("hide").addClass("show");
    $("#tools_panel").removeClass("hide").addClass("show");
    $("#Dashboards").removeClass("hide").addClass("show");
    $("#Candidats").removeClass("hide").addClass("show");
    $("#Utilisateurs").removeClass("hide").addClass("show");
    $("#Divers").removeClass("hide").addClass("show");
    $("#Odigo").removeClass("hide").addClass("show");
    $("#Salesforce").removeClass("hide").addClass("show");
    $("#ActiveDirectory").removeClass("hide").addClass("show");
    $("#Google").removeClass("hide").addClass("show");
    $("#UserLauncher").removeClass("hide").addClass("show");
}