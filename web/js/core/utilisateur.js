// Fonction de chargement Standard Edit
function ajaxUtilisateurEdit(editItem)
{
    $('#mainEditForm').addClass('hide').removeClass('show');
    $('#loadingMain').addClass('show').removeClass('hide');
    $('#gmailToggle').removeClass('active');
    $('#odigoToggle').removeClass('active');
    $('#windowsToggle').removeClass('active');
    $('#historyToggle').removeClass('active');
    $('#aramisToggle').removeClass('active');
    $('#salesforceToggle').removeClass('active');
    $('#createActionWindowsPart').addClass('hide').removeClass('show');
    $('#createActionAramisPart').addClass('hide').removeClass('show');
    $('#createActionOdigoPart').addClass('hide').removeClass('show');
    $('#createActionGmailPart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePartEdit').addClass('hide').removeClass('show');
    $('#createActionHistoryPart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePartNew').addClass('hide').removeClass('show');
    localStorage.setItem("emailState", null);
    localStorage.setItem("ableToShowOdigo", null);
    urlajax ="/ajax/utilisateur/get/"+editItem;
    $.ajax({url:urlajax,success:function(result){
        var frm = $("#form-edit");
        var i;
        for (i in result) {
            if (i == 'id') {
                localStorage.setItem("currentEditItem", result[i])
            }
            if (i == 'name') {
                localStorage.setItem("currentName", result[i])
            }
            if (i == 'surname') {
                localStorage.setItem("currentSurname", result[i])
            }
            if (i == 'service') {
                localStorage.setItem("service", result[i])
            }
            if (i == 'fonction') {
                localStorage.setItem("fonction", result[i])
            }
            if (i == 'isCreateInGmail') {
                localStorage.setItem("isCreateInGmail", result[i])
            }
            if (i == 'isCreateInOdigo') {
                localStorage.setItem("isCreateInOdigo", result[i])
            }
            if (i == 'isCreateInWindows') {
                localStorage.setItem("isCreateInWindows", result[i])
            }
            if (i == 'isCreateInSalesforce') {
                localStorage.setItem("isCreateInSalesforce", result[i])
            }
            if (i == 'email') {
                localStorage.setItem("email", result[i])
            }
            frm.find('[name="utilisateur[' + i + ']"]').val(result[i]);
        }
        $('.select2-single').select2({
            theme: "bootstrap",
            width: null,
            containerCssClass: ':all:',
            placeholder: "Choisir une option"
        });
        $('#mainEditForm').addClass('show').removeClass('hide');
        $('#loadingMain').addClass('hide').removeClass('show');
    }});
}

// Fonction d'envoi d'email au salarié
function ajaxSendEmailToSalarie()
{
    $('#sendsinglemail').addClass('hide').removeClass('show');
    $('#singlemailwaiting').addClass('show').removeClass('hide');
    urlajax ="/ajax/send/mail/to_user/"+localStorage.getItem("currentEditItem");
    $.ajax({
        url:urlajax,success:function(result) {
            $('#singlemailwaiting').addClass('hide').removeClass('show');
            $('#singlemailsended').addClass('show').removeClass('hide');
        }});
}

// Fonction d'envoi d'email au salarié et responsable
function ajaxSendEmailToSalarieAndInfoRecrut()
{
    $('#senddualmail').addClass('hide').removeClass('show');
    $('#dualmailwaiting').addClass('show').removeClass('hide');
    urlajax ="/ajax/send/mail/to_user_and_responsable/"+localStorage.getItem("currentEditItem");
    $.ajax({
        url:urlajax,success:function(result) {
            $('#dualmailwaiting').addClass('hide').removeClass('show');
            $('#dualmailsended').addClass('show').removeClass('hide');
        }});
}

function generateWindowsBody()
{
    urlajax ="/ajax/get/active_directory/organisation_units";
    $.ajax({
        url:urlajax,success:function(result) {
            document.getElementById("createActionWindowsPart").innerHTML = '';
            $('#loading').addClass('show').removeClass('hide');
            $('#right-navbar').addClass('no-events');
            var i;
            var nom = localStorage.getItem("currentName").toLowerCase().replace(' ', '').replace('-', '');
            var prenom = localStorage.getItem("currentSurname").substring(0,3).toLowerCase();
            var orgaUnitsListe = '' +
                '<div id="InsertWindowsField">' +
                '<div class="form-group font_exo_2">' +
                '<label class="font_exo_2 col-sm-4">Identifiant :';
            if(localStorage.getItem("isCreateInWindows") != '0' && localStorage.getItem("isCreateInWindows") != 0 && localStorage.getItem("isCreateInWindows") != null && localStorage.getItem("isCreateInWindows") != 'null') {
                urlajax = '/ajax/get/active_directory/user_link/'+localStorage.getItem("currentEditItem");
                $.ajax({
                    url: urlajax, success: function (result2) {
                        orgaUnitsListe +='<input type="text" name="windows[identifiant]" id="windows_identifiant" class="form-control" value="'+result2.identifiant+'">' +
                            '</label>' +
                            '</div>';
                        orgaUnitsListe += '<div class="form-group font_exo_2">' +
                            '<label class="font_exo_2 col-sm-4">Service de l\'Utilisateur:';
                        orgaUnitsListe += '<select name="windows[service]" id="windows_service" class="form-control input-md select2-single">';
                        for (i in result) {
                            orgaUnitsListe += '<option value="' + result[i].service + '">' + result[i].service + '</option>';
                        }
                        orgaUnitsListe += '' +
                            '</select>' +
                            '</label>' +
                            '</div>';

                        orgaUnitsListe += '<div class="form-group font_exo_2">' +
                            '<label class="font_exo_2 col-sm-4">Fonction de l\'Utilisateur:';
                        orgaUnitsListe += '<select name="windows[dn]" id="windows_fonction" class="form-control">';
                        for (i in result) {
                            orgaUnitsListe += '<option class="' + result[i].service + '" value="' + result[i].id + '">' + result[i].fonction + '</option>';
                        }
                        orgaUnitsListe += '' +
                            '</select>' +
                            '</label>' +
                            '</div>';
                        orgaUnitsListe += '</div>'+
                            '<div class="form-group font_exo_2 col-sm-4 align_right">'+
                            '<input type="submit" class="form-control font_exo_2 btn btn-danger" onclick="ajaxCreateViaAPI();" name="sendaction" id="sendaction" value="Mise à jour Session Windows">'+
                            '</div>';
                        document.getElementById("createActionWindowsPart").innerHTML = orgaUnitsListe;
                        $('#windows_service option').each(function() {
                            $(this).prevAll('option[value="' + this.value + '"]').remove();
                        });
                        $('.select2-single').select2({
                            theme: "bootstrap",
                            width: null,
                            containerCssClass: ':all:',
                            placeholder: "Choisir une option"
                        });
                        $("#windows_fonction").chained("#windows_service");
                        $('#loading').addClass('hide').removeClass('show');
                        $('#right-navbar').removeClass('no-events');
                        $('#createActionWindowsPart').addClass('show').removeClass('hide');
                    }
                });
            } else {
                orgaUnitsListe +='<input type="text" name="windows[identifiant]" id="windows_identifiant" class="form-control" value="'+prenom+nom+'">' +
                    '</label>' +
                    '</div>';
                orgaUnitsListe += '<div class="form-group font_exo_2">' +
                    '<label class="font_exo_2 col-sm-4">Service de l\'Utilisateur:';
                orgaUnitsListe += '<select name="windows[service]" id="windows_service" class="form-control input-md select2-single">';
                for (i in result) {
                    orgaUnitsListe += '<option value="' + result[i].service + '">' + result[i].service + '</option>';
                }
                orgaUnitsListe += '' +
                    '</select>' +
                    '</label>' +
                    '</div>';

                orgaUnitsListe += '<div class="form-group font_exo_2">' +
                    '<label class="font_exo_2 col-sm-4">Fonction de l\'Utilisateur:';
                orgaUnitsListe += '<select name="windows[dn]" id="windows_fonction" class="form-control">';
                for (i in result) {
                    orgaUnitsListe += '<option class="' + result[i].service + '" value="' + result[i].id + '">' + result[i].fonction + '</option>';
                }
                orgaUnitsListe += '' +
                    '</select>' +
                    '</label>' +
                    '</div>'+
                    '<div class="form-group font_exo_2 col-sm-4 align_right">'+
                    '<input type="submit" class="form-control font_exo_2 btn btn-danger" onclick="ajaxCreateViaAPI();" name="sendaction" id="sendaction" value="Créer Session Windows">'+
                    '</div>';
                document.getElementById("createActionWindowsPart").innerHTML = orgaUnitsListe;
                $('#windows_service option').each(function() {
                    $(this).prevAll('option[value="' + this.value + '"]').remove();
                });
                $('.select2-single').select2({
                    theme: "bootstrap",
                    width: null,
                    containerCssClass: ':all:',
                    placeholder: "Choisir une option"
                });
                $('#loading').addClass('hide').removeClass('show');
                $('#right-navbar').removeClass('no-events');
                $('#createActionWindowsPart').addClass('show').removeClass('hide');
            }
        }
    });
}

// Fonction de chargement du bloc Windows
function ajaxGenerateWindows()
{
    $('#right-navbar').addClass('no-events');
    $('#createActionWindowsPart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    $('#createActionAramisPart').addClass('hide').removeClass('show');
    $('#createActionOdigoPart').addClass('hide').removeClass('show');
    $('#createActionGmailPart').addClass('hide').removeClass('show');
    $('#createActionHistoryPart').addClass('hide').removeClass('show');
    $('#gmailToggle').removeClass('active');
    $('#odigoToggle').removeClass('active');
    $('#historyToggle').removeClass('active');
    $('#windowsToggle').addClass('active');
    $('#aramisToggle').removeClass('active');
    $('#salesforceToggle').removeClass('active');
    if(localStorage.getItem("email") == '' || localStorage.getItem("email") == null || localStorage.getItem("email") == 'null') {
        document.getElementById("createActionWindowsPart").innerHTML = '<div class="alert-danger-2" role="alert">Veuillez d\'abord indiquer ou créer un email</div>';
        $('#loading').removeClass('show').addClass('hide');
        $('#right-navbar').removeClass('no-events');
        $('#createActionWindowsPart').addClass('show').removeClass('hide');
    } else {
        if (localStorage.getItem("isCreateInWindows") == 'null' || localStorage.getItem("isCreateInWindows") == 0) {
            $('#loading').removeClass('hide').addClass('show');
            generateWindowsBody();
        } else {
            urlajax = '/ajax/get/active_directory/user_link/'+localStorage.getItem("currentEditItem");
            $.ajax({
                url:urlajax,success:function(result) {
                    document.getElementById("createActionWindowsPart").innerHTML = '';
                    var textToAppend = '<div class="block-update-card">' +
                        '<div class="font_exo_2 update-card-header">' +
                        '<button type="button" class="close" onclick="generateWindowsBody();"><i class="fa fa-edit fa"></i></span></button>' +
                        '<h4 class="font_exo_2">'+result.identifiant+'</h4>' +
                        '</div>' +
                        '<div class="font_exo_2 update-card-body">';
                    textToAppend += '' +
                        '<p>dn :</p>' +
                        '<p class="" style="font-size: 10px">'+
                        result.dn+
                        '</p>' +
                        '</div></div>';
                    document.getElementById("createActionWindowsPart").innerHTML = textToAppend;
                    $('#loading').addClass('hide').removeClass('show');
                    $('#createActionWindowsPart').addClass('show').removeClass('hide');
                    $('#right-navbar').removeClass('no-events');
                }
            });
        }
    }
}

// Fonction generate Salesforce Edit Body
function generateSalesforceBody(action)
{
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    document.getElementById("createActionSalesforcePart").innerHTML = '';
    urlajax ="/ajax/get/salesforce/profiles";
    $.ajax({
        url:urlajax,success:function(result) {
            var profilesListe = '<div class="hide" id="createActionSalesforcePartNew">'+
                '<div class="form-group font_exo_2" id="salesforceProfilesListe">';
            var i;
            profilesListe += '<label class="font_exo_2 col-sm-4">Profil Salesforce:';
            profilesListe += '<select name="salesforce[profile]" id="salesforce_profile" class="form-control">';
            for (i in result) {
                profilesListe += '<option value="'+result[i].profileId+'">'+result[i].profileName+'</option>';
            }
            profilesListe += '</select>';
            profilesListe += '</label>';
            profilesListe += '</div>'+
                '<div class="form-group font_exo_2 col-sm-4 align_right">';
            if (action == 'create') {
                profilesListe += '<input type="submit" class="form-control font_exo_2 btn btn-danger" onclick="ajaxCreateViaAPI();" name="sendaction" id="sendaction" value="Créer sur Salesforce">';
            }
            if (action == 'edit') {
                profilesListe += '<input type="submit" class="form-control font_exo_2 btn btn-danger" onclick="ajaxCreateViaAPI();" name="sendaction" id="sendaction" value="Mettre à jour sur Salesforce">';
            }
            profilesListe += '</div>'+
                '</div>'+
                '<div class="hide" id="createActionSalesforcePartEdit">'+
                '</div>';
            document.getElementById("createActionSalesforcePart").innerHTML = profilesListe;
            $('#loading').removeClass('show').addClass('hide');
            $('#right-navbar').removeClass('no-events');
            $('#createActionSalesforcePartNew').addClass('show').removeClass('hide');
            $('#createActionSalesforcePart').addClass('show').removeClass('hide');
        }
    });
}


// Fonction de chargement du bloc salesforce
function ajaxGenerateSalesforce()
{
    $('#right-navbar').addClass('no-events');
    $('#createActionWindowsPart').addClass('hide').removeClass('show');
    $('#createActionAramisPart').addClass('hide').removeClass('show');
    $('#createActionOdigoPart').addClass('hide').removeClass('show');
    $('#createActionGmailPart').addClass('hide').removeClass('show');
    $('#createActionHistoryPart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePartEdit').addClass('hide').removeClass('show');
    $('#createActionSalesforcePartNew').addClass('hide').removeClass('show');
    $('#gmailToggle').removeClass('active');
    $('#odigoToggle').removeClass('active');
    $('#windowsToggle').removeClass('active');
    $('#historyToggle').removeClass('active');
    $('#aramisToggle').removeClass('active');
    $('#salesforceToggle').addClass('active');
    $('#loading').removeClass('hide').addClass('show');
    if(localStorage.getItem("email") == '' || localStorage.getItem("email") == null || localStorage.getItem("email") == 'null') {
        document.getElementById("createActionSalesforcePart").innerHTML = '<div class="alert-danger-2" role="alert">Veuillez d\'abord indiquer ou créer un email</div>';
        $('#loading').removeClass('show').addClass('hide');
        $('#right-navbar').removeClass('no-events');
        $('#createActionSalesforcePart').addClass('show').removeClass('hide');
    } else if (localStorage.getItem("isCreateInSalesforce") != 'null' && localStorage.getItem("isCreateInSalesforce") != 0) {
        urlajax ="/ajax/get/salesforce/utilisateur/full_profil/"+localStorage.getItem("email");
        $.ajax({
            url:urlajax,success:function(result) {
                if (result.Username != null)
                {
                    document.getElementById("createActionSalesforcePart").innerHTML = '';
                    var textToAppend = '' +
                        '<div class="block-update-card">' +
                        '<div class="update-card-header">'+
                        '<button type="button" class="close" onclick="generateSalesforceBody(\'edit\');"><i class="fa fa-edit fa"></i></span></button>' +
                        '<h4 class="font_exo_2">'+result.Name+'<br>'+result.Profil__c+'<br>';
                    if (result.IsActive == true) {
                        textToAppend += '<input type="submit" name="sendaction" id="sendaction" class="font_exo_2 top-right btn btn-danger" value="Désactiver">';
                        textToAppend += '<span class="text-green">Actif</span>';
                    } else {
                        textToAppend += '<input type="submit" name="sendaction" id="sendaction" class="font_exo_2 top-right btn btn-success" value="Activer">';
                        textToAppend += '<span class="text-red">Inactif</span>';
                    }
                    textToAppend += '</h4>'+
                        '</div>'+
                        '<div class="update-card-body font_exo_2">'+
                        '<ul>Informations Profil'+
                        '<li>Username : '+result.Username+'</li>' +
                        '<li>Département : '+result.Department+'</li>' +
                        '<li>Division : '+result.Division+'</li>' +
                        '<li>Profil : '+result.Profil__c+'</li>' +
                        '<li>Extension Odigo : '+result.OdigoCti__Odigo_login__c+'</li>' +
                        '<li>Phone : '+result.Phone+'</li>' +
                        '<li>Phone Redirect : '+result.Telephone_interne__c+'</li>' +
                        '<li>Service Cloud : '+result.UserPermissionsSupportUser+'</li>' +
                        '</ul>';
                    urlajax = '/ajax/get/salesforce/utilisateur_group/' + localStorage.getItem("currentEditItem");
                    $.ajax({
                        url: urlajax, success: function (result) {
                            textToAppend += '<ul>Groupes';
                            var i;
                            for (i in result) {
                                textToAppend += '<li>'+result[i]+'</li>';
                            }
                            textToAppend += '</ul>';
                            urlajax = '/ajax/get/salesforce/utilisateur_territories/' + localStorage.getItem("currentEditItem");
                            $.ajax({
                                url: urlajax, success: function (result) {
                                    textToAppend += '<ul>Territoires';
                                    var i;
                                    for (i in result) {
                                        textToAppend += '<li>'+result[i]+'</li>';
                                    }
                                    textToAppend += '</ul>'+
                                        '</div>' +
                                        '</div>';
                                    document.getElementById("createActionSalesforcePart").innerHTML = textToAppend;
                                    $('#createActionSalesforceParNew').addClass('hide').removeClass('show');
                                    $('#loading').removeClass('show').addClass('hide');
                                    $('#createActionSalesforcePartEdit').addClass('show').removeClass('hide');
                                    $('#createActionSalesforcePart').addClass('show').removeClass('hide');
                                    $('#right-navbar').removeClass('no-events');
                                }
                            });
                        }
                    });
                } else {
                    generateSalesforceBody('create');
                }
            }
        });
    } else {
        generateSalesforceBody('create');
    }
}

// Fonction de chargement du bloc History
function ajaxGenerateHistory()
{
    $('#right-navbar').addClass('no-events');
    $('#createActionWindowsPart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    $('#createActionOdigoPart').addClass('hide').removeClass('show');
    $('#createActionGmailPart').addClass('hide').removeClass('show');
    $('#gmailToggle').removeClass('active');
    $('#odigoToggle').removeClass('active');
    $('#windowsToggle').removeClass('active');
    $('#historyToggle').addClass('active');
    $('#aramisToggle').removeClass('active');
    $('#salesforceToggle').removeClass('active');
    $('#loading').removeClass('hide').addClass('show');
    urlajax ="/ajax/generate/utilisateur/history/" + localStorage.getItem("currentEditItem");
    $.ajax({
        url:urlajax,success:function(result) {
            var i;
            var textToAppend = '';
            for (i in result) {
                textToAppend += '<div class="panel panel-success history_main_panel">';
                textToAppend += '<div class="panel-heading text-center history_heading_panel">';
                textToAppend += '<h4 class="panel-title history_title_panel">'+result[i].requesterId+'</h4>';
                textToAppend += '<span class="history_span_date"> Le '+result[i].date+'</span>';
                textToAppend += '</div>';
                textToAppend += '<div class="panel-body history_panel_body">';
                textToAppend += '<span class="history_span_field">';
                textToAppend += result[i].field+' : <br>';
                textToAppend += '</span>';
                textToAppend += '<p class="text-center history_p_string">';
                if (result[i].oldString != null && result[i].oldString != 'null') {
                    textToAppend += result[i].oldString+' ';
                }
                textToAppend += '=> '+result[i].newString;
                textToAppend += '</p>';
                textToAppend += '</div>';
                textToAppend += '</div>';
            }
            document.getElementById("createActionHistoryPart").innerHTML = textToAppend;
            $('#loading').addClass('hide').removeClass('show');
            $('#createActionHistoryPart').addClass('show').removeClass('hide');
            $('#right-navbar').removeClass('no-events');
        }
    });
}

// Fonction de chargement du bloc aramis
function ajaxGenerateAramis()
{
    $('#right-navbar').addClass('no-events');
    $('#createActionWindowsPart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    $('#createActionOdigoPart').addClass('hide').removeClass('show');
    $('#createActionGmailPart').addClass('hide').removeClass('show');
    $('#createActionHistoryPart').addClass('hide').removeClass('show');
    $('#gmailToggle').removeClass('active');
    $('#odigoToggle').removeClass('active');
    $('#windowsToggle').removeClass('active');
    $('#historyToggle').removeClass('active');
    $('#aramisToggle').addClass('active');
    $('#salesforceToggle').removeClass('active');
    $('#createActionAramisPart').addClass('show').removeClass('hide');
    $('#right-navbar').removeClass('no-events');
}

// Fonction de chargement du bloc de gestion gmail
function ajaxGenerateEmail()
{
    $('#right-navbar').addClass('no-events');
    $('#createActionGmailPart').addClass('hide').removeClass('show');
    $('#createActionWindowsPart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    $('#createActionAramisPart').addClass('hide').removeClass('show');
    $('#createActionOdigoPart').addClass('hide').removeClass('show');
    $('#createActionHistoryPart').addClass('hide').removeClass('show');
    $('#windowsToggle').removeClass('active');
    $('#historyToggle').removeClass('active');
    $('#aramisToggle').removeClass('active');
    $('#salesforceToggle').removeClass('active');
    $('#odigoToggle').removeClass('active');
    $('#gmailToggle').addClass('active');
    $('#loading').removeClass('hide').addClass('show');
    if(localStorage.getItem("email") == '' || localStorage.getItem("email") == null || localStorage.getItem("email") == 'null') {
        urlajax ="/ajax/generate/email/"+localStorage.getItem("currentEditItem");
        $.ajax({
            url:urlajax,success:function(result) {
                var i;
                var textToAppend = '';
                for (i in result) {
                    textToAppend += '<div class="form-group font_exo_2" onclick="showhide();">' +
                        '<label class="font_exo_2 col-sm-8">' +
                        '<input class="font_exo_2 col-sm-1" type="radio" name="genEmail" value="'+result[i]+'">'
                        +result[i]+
                        '</label>' +
                        '</div>';
                }
                document.getElementById("actionGmailList").innerHTML = textToAppend;
                $('#loading').addClass('hide').removeClass('show');
                $('#createActionGmailPart').addClass('show').removeClass('hide');
                $('#right-navbar').removeClass('no-events');
            }
        });
    } else {
        urlajax = "/ajax/check/google/isexist/" + localStorage.getItem("email");
        $.ajax({
            url: urlajax, success: function (result) {
                localStorage.setItem("emailState",result);
                if (localStorage.getItem("emailState") == "nouser") {
                    var currentEditItem = localStorage.getItem("currentEditItem");
                    urlajax ="/ajax/generate/email/"+currentEditItem;
                    $.ajax({
                        url:urlajax,success:function(result) {
                            var i;
                            var textToAppend = '';
                            for (i in result) {
                                textToAppend += '' +
                                    '<div class="form-group font_exo_2" onclick="showhide();">' +
                                    '<label class="font_exo_2 col-sm-8"><input class="font_exo_2 col-sm-1" type="radio" name="genEmail" value="'+result[i]+'">'
                                    +result[i]+'' +
                                    '</label>' +
                                    '</div>';
                            }
                            document.getElementById("actionGmailList").innerHTML = textToAppend;
                            $('#loading').addClass('hide').removeClass('show');
                            $('#right-navbar').removeClass('no-events');
                            $('#createActionGmailPart').addClass('show').removeClass('hide');
                        }
                    });
                }
                else {
                    var textToAppend = '<div class="block-update-card">' +
                        '<div class="font_exo_2 update-card-header">' +
                        '<h4 class="font_exo_2">'+result.primaryEmail+'</h4>' +
                        '</div>' +
                        '<div class="font_exo_2 update-card-body">' +
                        '<p>Alias :</p>' +
                        '<ul>';
                    var i;
                    for (i in result.emails)
                    {
                        textToAppend += '<li>'+result.emails[i].address+'</li>';
                    }
                    textToAppend += '</ul>' +
                        '</div>' +
                        '</div>';
                    document.getElementById("createActionGmailPart").innerHTML = textToAppend;
                    $('#loading').addClass('hide').removeClass('show');
                    $('#right-navbar').removeClass('no-events');
                    $('#createActionGmailPart').addClass('show').removeClass('hide');
                }
            }
        });
    }
}

// Fonction de chargement du bloc de gestion odigo
function ajaxGenerateOdigo()
{
    $('#right-navbar').addClass('no-events');
    $('#createActionGmailPart').addClass('hide').removeClass('show');
    $('#createActionWindowsPart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    $('#createActionAramisPart').addClass('hide').removeClass('show');
    $('#createActionOdigoPart').addClass('hide').removeClass('show');
    $('#createActionHistoryPart').addClass('hide').removeClass('show');
    $('#gmailToggle').removeClass('active');
    $('#windowsToggle').removeClass('active');
    $('#historyToggle').removeClass('active');
    $('#aramisToggle').removeClass('active');
    $('#salesforceToggle').removeClass('active');
    $('#odigoToggle').addClass('active');
    $('#loading').removeClass('hide').addClass('show');
    var service = localStorage.getItem("service");
    var fonction = localStorage.getItem("fonction");
    if(localStorage.getItem("email") == '' || localStorage.getItem("email") == null || localStorage.getItem("email") == 'null') {
        document.getElementById("createActionOdigoPart").innerHTML = '<div class="alert-danger-2" role="alert">Veuillez d\'abord indiquer ou créer un email</div>';
        $('#loading').removeClass('show').addClass('hide');
        $('#right-navbar').removeClass('no-events');
        $('#createActionOdigoPart').addClass('show').removeClass('hide');
    } else {
        document.getElementById("createActionOdigoPart").innerHTML = '';
        urlajax = "/ajax/check/odigo/isabletouse/" + service + "/" + fonction;
        $.ajax({
            url: urlajax, success: function (result) {
                localStorage.setItem("ableToShowOdigo", result);
                if (localStorage.getItem("ableToShowOdigo") == 0) {
                    document.getElementById("createActionOdigoPart").innerHTML = '<div class="alert-danger-2" role="alert">Le couple Service/Fonction ne permets pas cette fonction</div>';
                    $('#loading').removeClass('show').addClass('hide');
                    $('#right-navbar').removeClass('no-events');
                    $('#createActionOdigoPart').addClass('show').removeClass('hide');
                } else if ((localStorage.getItem("isCreateInOdigo") == 'null' || localStorage.getItem("isCreateInOdigo") == 0) && localStorage.getItem("ableToShowOdigo") == 1) {
                    var nom = localStorage.getItem("currentName").toLowerCase().replace(' ', '').replace('-', '');
                    var prenom = localStorage.getItem("currentSurname").substring(0, 3).toLowerCase();
                    var textToAppend = '<div class="form-group font_exo_2">'+
                        '<label class="font_exo_2 col-sm-4">Identifiant :'+
                        '<input type="text" name="prosodie[identifiant]" id="prosodie_identifiant" class="form-control" value="'+prenom + nom+'">'+
                        '</label>'+
                        '</div>';
                    var currentEditItem = localStorage.getItem("currentEditItem");
                    urlajax = "/ajax/generate/odigo/" + service + "/" + fonction;
                    $.ajax({
                        url: urlajax, success: function (result) {
                            var i;
                            var prosodieListe = '<label class="font_exo_2 col-sm-4">Numéro Prosodie:';
                            prosodieListe += '<select name="prosodie[numProsodie]" id="prosodie_numProsodie" class="form-control">';
                            if (result.length >= 1) {
                                prosodieListe += '<option value="">Numéro Prosodie</option>';
                                for (i in result) {
                                    prosodieListe += '<option value="' + result[i] + '">' + result[i] + '</option>';
                                }
                            } else {
                                prosodieListe += '<option value="">Pas de Numéros</option>';
                            }
                            prosodieListe += '</select>';
                            prosodieListe += '</label>';
                            urlajax = "/ajax/generate/orange/" + service;
                            $.ajax({
                                url: urlajax, success: function (result) {
                                    var i;
                                    var orangeListe = '<label class="font_exo_2 col-sm-2">Numéro Orange:';
                                    orangeListe += '<select name="prosodie[numOrange]" id="prosodie_numOrange" class="form-control">';
                                    if (result.length >= 1) {
                                        orangeListe += '<option value="">Numéro Orange</option>';
                                        for (i in result) {
                                            orangeListe += '<option value="' + result[i] + '">' + result[i] + '</option>';
                                        }
                                    } else {
                                        orangeListe += '<option value="">Pas de Numéros</option>';
                                    }
                                    orangeListe += '</select>';
                                    orangeListe += '</label>';
                                    orangeListe += '<button type="button" onclick="showOtherNum();" class="otherNumButton btn btn-info font_exo_2">Autre Num</button>';

                                    textToAppend += '<div class="form-group font_exo_2" id="prosodieListe">'+
                                        prosodieListe +
                                        '</div>'+
                                        '<div class="form-group font_exo_2" id="orangeliste">'+
                                    orangeListe +
                                        '</div>'+
                                    '<div class="form-group font_exo_2 hide" id="otherNumField">'+
                                    '<label class="font_exo_2 col-sm-4">Autre Numéro :'+
                                    '<input type="text" name="prosodie[autreNum]" id="prosodie_autreNum" class="form-control">'+
                                    '</label>'+
                                    '</div>'+
                                    '<div class="form-group font_exo_2 col-sm-4 align_right">'+
                                    '<input type="submit" class="form-control font_exo_2 btn btn-danger" onclick="ajaxCreateViaAPI();" name="sendaction" id="sendaction" value="Créer sur Odigo">'+
                                    '</div>'
                                    document.getElementById("createActionOdigoPart").innerHTML = textToAppend;
                                    $('#loading').addClass('hide').removeClass('show');
                                    $('#right-navbar').removeClass('no-events');
                                    $('#createActionOdigoPart').addClass('show').removeClass('hide');
                                }
                            });
                        }
                    });
                } else {
                    document.getElementById("createActionOdigoPart").innerHTML = '';
                    urlajax = "/ajax/odigo/get/utilisateur_infos/" + localStorage.getItem("currentEditItem");
                    $.ajax({
                        url: urlajax, success: function (result) {
                            var textToAppend = '<div class="block-update-card">' +
                                '<div class="update-card-header">' +
                                '<input type="submit" name="sendaction" id="sendaction" class="font_exo_2 top-right btn btn-danger" value="Supprimer dans Odigo">' +
                                '<h4 class="font_exo_2">'+result.odigoExtension+'<br>' +
                                result.profilBase+'</h4>' +
                                '</div>' +
                                '<div class="font_exo_2 update-card-body">' +
                                '<p>Informations :</p>' +
                                '<ul>';
                            textToAppend += '<li>Numéro Odigo : '+result.odigoPhoneNumber+'</li>';
                            textToAppend += '<li>Poste Fixe : '+result.redirectPhoneNumber+'</li>';
                            textToAppend += '</ul>' +
                                '</div>' +
                                '</div>';
                            textToAppend += '<input type="hidden" name="odigo[odigoId]" id="odigo_odigoId" value="'+result.id+'">';
                            document.getElementById("createActionOdigoPart").innerHTML = textToAppend;
                            $('#loading').addClass('hide').removeClass('show');
                            $('#right-navbar').removeClass('no-events');
                            $('#createActionOdigoPart').addClass('show').removeClass('hide');
                        }
                    });
                }
            }
        });
    }
}

// Fonction d'affichage du champ autre email pendant création gmail
function showhide()
{
    if($('#otherMail').prop('checked')) {
        $('#otherEmail').addClass('show').removeClass('hide');
    } else {
        $('#otherEmail').addClass('hide').removeClass('show');
    }
}

// Fonction Affiche Autre numéro Field
function showOtherNum()
{
    $('#otherNumField').addClass('show').removeClass('hide');
}