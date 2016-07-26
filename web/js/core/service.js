// Fonction d'ajout de champ groupe salesforce
function addSfGroupeField()
{
    var currentIteration = localStorage.getItem("currentIteration");
    var listeOfOptions = localStorage.getItem("listeOfOptions");
    var newIteration = parseInt(currentIteration) + parseInt('1');
    var addfield = '<div class="form-group" id="salesforceTerritories_'+newIteration+'">';
    addfield += '<label class="col-sm-3 control-label align_right font_exo_2" for="salesforce_territory'+newIteration+'">Ter. SF '+newIteration+'</label>';
    addfield += '<div class="form-group">' +
        '<div class="col-sm-7">' +
        '<div class="input-group select2-bootstrap-prepend"><span class="input-group-addon"><i class="fa fa-sellsy fa" aria-hidden="true"></i></span>';
    addfield += '<select name="salesforce[territory'+newIteration+']" id="salesforce_territory'+newIteration+'" class="form-control input-md select2-single">';
    addfield += listeOfOptions;
    addfield += '</select>';
    addfield += '</div>';
    addfield += '</div>';
    addfield += '<div class="col-sm-1" style="padding-top: 0.5%">';
    addfield += '<button type="button" class="btn btn-default btn-xs" onclick="unsetField('+newIteration+');" aria-label="Left Align">';
    addfield += '<span class="glyphicon glyphicon-remove btn-xs" aria-hidden="true"></span>';
    addfield += '</button>';
    addfield += '</div>';
    addfield += '</div>';
    addfield += '</div>';
    localStorage.setItem("currentIteration", newIteration);
    $('#midSFEditForm').append(addfield)
    $('.select2-single').select2({
        theme: "bootstrap",
        width: null,
        containerCssClass: ':all:'
    });
}

// Fonction de chargement du bloc salesforce
function ajaxGenerateSalesforce()
{
    $('#createActionWindowsPart').addClass('hide').removeClass('show');
    $('#createActionAramisPart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    $('#midSFEditForm').addClass('hide').removeClass('show');
    $('#bottomSFEditForm').addClass('hide').removeClass('show');
    $('#windowsToggle').removeClass('active');
    $('#aramisToggle').removeClass('active');
    $('#salesforceToggle').addClass('active');
    $('#loadingRight').removeClass('hide').addClass('show');
    document.getElementById("createActionSalesforcePart").innerHTML = '<div class="hide" id="midSFEditForm"></div><div class="hide" id="bottomSFEditForm"></div>';
    document.getElementById("createActionWindowsPart").innerHTML = '<div class="hide" id="midADEditForm"></div><div class="hide" id="bottomADEditForm"></div>';
    localStorage.setItem("currentADIteration", 0);
    localStorage.setItem("currentIteration", 0);
    var editItem = localStorage.getItem("currentServiceEdit");
    var button = '<div class="form-group text-center" id="buttonSalesforceAdd"><button type="button" class="btn btn-info" onclick="addSfGroupeField();">Ajouter un Territoire Salesforce</button></div>';
    urlajax ="/ajax/get/salesforce/territory_service/"+editItem;
    $.ajax({url:urlajax,success:function(result){
        var i = 0;
        for (i in result) {
            addSfGroupeField();
            var z = parseInt(i) + parseInt('1');
            document.getElementById("salesforce_territory"+z).value = result[i].id;
            localStorage.setItem("currentIteration", z);
        }
        console.log('test');
        $('#loadingRight').addClass('hide').removeClass('show');
        $('#bottomSFEditForm').append(button).addClass('show').removeClass('hide');
        $('#midSFEditForm').addClass('show').removeClass('hide');
        $('#createActionSalesforcePart').addClass('show').removeClass('hide');
    }});
}

// Fonction Unset territoire
function unsetField(fieldId)
{
    document.getElementById('salesforceTerritories_'+fieldId).innerHTML = '';
}



// Fonction d'ajout de champ groupe active directory
function addADGroupeField()
{
    var currentADIteration = localStorage.getItem("currentADIteration");
    var listeOfADOptions = localStorage.getItem("listeOfADOptions");
    var newADIteration = parseInt(currentADIteration) + parseInt('1');
    var addfield = '<div class="form-group" id="activedirectoryGroupes_'+newADIteration+'">';
    addfield += '<label class="col-sm-3 control-label align_right font_exo_2" for="activedirectory_groupe'+newADIteration+'">GRP AD '+newADIteration+'</label>';
    addfield += '<div class="form-group">' +
        '<div class="col-sm-7">' +
        '<div class="input-group select2-bootstrap-prepend"><span class="input-group-addon"><i class="fa fa-windows fa" aria-hidden="true"></i></span>';
    addfield += '<select name="activedirectory[groupe'+newADIteration+']" id="activedirectory_groupe'+newADIteration+'" class="form-control input-md select2-single">';
    addfield += listeOfADOptions;
    addfield += '</select>';
    addfield += '</div>';
    addfield += '</div>';
    addfield += '<div class="col-sm-1" style="padding-top: 0.5%">';
    addfield += '<button type="button" class="btn btn-default btn-xs" onclick="unsetADField('+newADIteration+');" aria-label="Left Align">';
    addfield += '<span class="glyphicon glyphicon-remove btn-xs" aria-hidden="true"></span>';
    addfield += '</button>';
    addfield += '</div>' +
        '</div>' +
        '</div>';
    localStorage.setItem("currentADIteration", newADIteration);
    $('#midADEditForm').append(addfield);
    $('.select2-single').select2({
        theme: "bootstrap",
        width: null,
        containerCssClass: ':all:'
    });
}

// Fonction de chargement du bloc active directory
function ajaxGenerateWindows() {
    $('#createActionWindowsPart').addClass('hide').removeClass('show');
    $('#createActionAramisPart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    $('#midADEditForm').addClass('hide').removeClass('show');
    $('#bottomADEditForm').addClass('hide').removeClass('show');
    $('#windowsToggle').addClass('active');
    $('#aramisToggle').removeClass('active');
    $('#salesforceToggle').removeClass('active');
    $('#loadingRight').removeClass('hide').addClass('show');
    document.getElementById("createActionSalesforcePart").innerHTML = '<div class="hide" id="midSFEditForm"></div><div class="hide" id="bottomSFEditForm"></div>';
    document.getElementById("createActionWindowsPart").innerHTML = '<div class="hide" id="midADEditForm"></div><div class="hide" id="bottomADEditForm"></div>';
    localStorage.setItem("currentADIteration", 0);
    localStorage.setItem("currentIteration", 0);
    var editItem = localStorage.getItem("currentServiceEdit");
    console.log(editItem);
    var button = '<div class="form-group text-center" id="buttonSalesforceAdd"><button type="button" class="btn btn-info" onclick="addADGroupeField();">Ajouter un Groupe Active Directory</button></div>';
    urlajax = "/ajax/get/active_directory/group_service/" + editItem;
    $.ajax({
        url: urlajax, success: function (result) {
            var i = 0;
            for (i in result) {
                addADGroupeField();
                var z = parseInt(i) + parseInt('1');
                document.getElementById("activedirectory_groupe" + z).value = result[i].id;
                localStorage.setItem("currentADIteration", z);
            }
            $('#loadingRight').addClass('hide').removeClass('show');
            $('#midADEditForm').addClass('show').removeClass('hide');
            $('#bottomADEditForm').append(button).addClass('show').removeClass('hide');
            $('#createActionWindowsPart').addClass('show').removeClass('hide');
        }
    });
}

// Fonction Unset territoire
function unsetADField(fieldId)
{
    document.getElementById('activedirectoryGroupes_'+fieldId).innerHTML = '';
}


// Fonction de chargement Standard Edit
function ajaxServiceEdit(editItem)
{
    $('#mainEditForm').addClass('hide').removeClass('show');
    $('#midEditForm').addClass('hide').removeClass('show');
    $('#bottomEditForm').addClass('hide').removeClass('show');
    $('#loading').addClass('show').removeClass('hide');
    $('#windowsToggle').removeClass('active');
    $('#aramisToggle').removeClass('active');
    $('#salesforceToggle').removeClass('active');
    $('#createActionWindowsPart').addClass('hide').removeClass('show');
    $('#createActionAramisPart').addClass('hide').removeClass('show');
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    document.getElementById("createActionSalesforcePart").innerHTML = '<div class="hide" id="midSFEditForm"></div><div class="hide" id="bottomSFEditForm"></div>';
    document.getElementById("createActionWindowsPart").innerHTML = '<div class="hide" id="midADEditForm"></div><div class="hide" id="bottomADEditForm"></div>';
    localStorage.setItem("currentADIteration", 0);
    localStorage.setItem("currentIteration", 0);
    var button = '<div class="form-group text-center" id="buttonSalesforceAdd"><button type="button" class="btn btn-info" onclick="addGroupeField();">Ajouter un Territoire Salesforce</button></div>';
    urlajax ="/ajax/service/get/"+editItem;
    $.ajax({url:urlajax,success:function(result){
        var frm = $("#form-edit");
        var i = 0;
        for (i in result) {
            frm.find('[name="service[' + i + ']"]').val(result[i]);
        }
        urlajax = "/ajax/service/poste/get/" + editItem + "/Responsable";
        $.ajax({url:urlajax,success:function(result){
            for (i in result) {
                $('#formEdit_service_responsable option[value="'+i+'"]').attr('selected', 'selected');
            }
            urlajax = "/ajax/service/poste/get/" + editItem + "/Manager";
            $.ajax({url:urlajax,success:function(result){
                for (i in result) {
                    document.getElementById("formEdit_service_managers").selectedIndex = "-1";
                    $('#formEdit_service_managers option[value="'+i+'"]').attr('selected', 'selected');
                }
                $('.select2-single').select2({
                    theme: "bootstrap",
                    width: null,
                    containerCssClass: ':all:'
                });
                $('#loading').addClass('hide').removeClass('show');
                $('#mainEditForm').addClass('show').removeClass('hide');
                localStorage.setItem("currentServiceEdit", editItem);
            }});
        }});
    }});
}
