// Fonction d'ajout de champ de matching
function addMachingFieldField()
{
    var currentFonctionIteration = localStorage.getItem("currentFonctionIteration");
    var currentServiceIteration = localStorage.getItem("currentServiceIteration");
    var currentGlobalIteration = localStorage.getItem("currentGlobalIteration");
    var listeOfFonctionsOptions = localStorage.getItem("listeOfFonctionsOptions");
    var listeOfServicesOptions = localStorage.getItem("listeOfServicesOptions");
    var newFonctionIteration = parseInt(currentFonctionIteration) + parseInt('1');
    var newServiceIteration = parseInt(currentServiceIteration) + parseInt('1');
    var newGlobalIteration = parseInt(currentGlobalIteration) + parseInt('1');
    var addfield = '<div class="form-group" id="matchFonction_'+newGlobalIteration+'">';
    addfield += '<div class="col-sm-5">';
    addfield += '<select name="match[fonction'+newFonctionIteration+']" id="match_fonction'+newFonctionIteration+'" class="form-control input-md select2-single">';
    addfield += listeOfFonctionsOptions;
    addfield += '</select>';
    addfield += '</div>';
    addfield += '<div class="col-sm-1">';
    addfield += ' + ';
    addfield += '</div>';
    addfield += '<div class="col-sm-5">';
    addfield += '<select name="match[service'+newServiceIteration+']" id="match_service'+newServiceIteration+'" class="form-control input-md select2-single">';
    addfield += listeOfServicesOptions;
    addfield += '</select>';
    addfield += '</div>';
    addfield += '<div class="col-sm-1" style="padding-top: 0.5%">';
    addfield += '<button type="button" class="btn btn-default btn-xs" onclick="unsetGoogleGroupField('+newGlobalIteration+');" aria-label="Left Align">';
    addfield += '<span class="glyphicon glyphicon-remove btn-xs" aria-hidden="true"></span>';
    addfield += '</button>';
    addfield += '</div>';
    addfield += '</div>';
    addfield += '<input type="hidden" name="match[count]" id="match_count" value="'+newGlobalIteration  +'">';
    localStorage.setItem("currentFonctionIteration", newFonctionIteration);
    localStorage.setItem("currentServiceIteration", newServiceIteration);
    localStorage.setItem("currentGlobalIteration", newGlobalIteration);
    $('#createActionFonctionPart').append(addfield).addClass('show').removeClass('hide');
    $('.select2-single').select2({
        theme: "bootstrap",
        width: null,
        containerCssClass: ':all:'
    });
}

// Fonction Unset territoire
function unsetGoogleGroupField(fieldId)
{
    document.getElementById('matchFonction_'+fieldId).innerHTML = '';
}


// Fonction de chargement Standard Edit
function ajaxGoogleGroupEdit(editItem)
{
    $('#mainEditForm').addClass('hide').removeClass('show');
    $('#createActionSalesforcePart').addClass('hide').removeClass('show');
    localStorage.setItem("currentGlobalIteration", '0');
    $('#loading').addClass('show').removeClass('hide');
    document.getElementById("createActionFonctionPart").innerHTML = '';
    urlajax ="/ajax/google_group/get/"+editItem;
    $.ajax({url:urlajax,success:function(result){
        var frm = $("#form-edit");
        var i;
        for (i in result) {
            frm.find('[name="google_group[' + i + ']"]').val(result[i]);
        }
        urlajax = "/ajax/get/google/group_fonction_service/" + editItem;
        $.ajax({
            url: urlajax, success: function (result) {
                var i = 0;
                for (i in result) {
                    addMachingFieldField();
                    var z = parseInt(i) + parseInt('1');
                    document.getElementById("match_service" + z).value = result[i].serviceId;
                    document.getElementById("match_fonction" + z).value = result[i].fonctionId;
                    localStorage.setItem("currentFonctionIteration", z);
                    localStorage.setItem("currentServiceIteration", z);
                    localStorage.setItem("currentGlobalIteration", z);
                }
                $('#loading').addClass('hide').removeClass('show');
                $('#mainEditForm').addClass('show').removeClass('hide');
            }
        });
    }});
}