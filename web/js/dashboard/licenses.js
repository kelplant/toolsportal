function editMaxNumberGmailLicences()
{
    document.getElementById("maxNumberGmailUserLicenses").innerHTML = '' +
        '<input type="text" maxlength="6" size="6" name="gmail_max_nb_licenses" id="gmail_max_nb_licenses" placeholder="'+document.getElementById("maxNumberGmailUserLicenses").textContent+'">' +
        '<a href="#" onclick="updateGmailMaxLicenses();" class="">' +
        ' <i class="fa fa fa-check text-green"></i>' +
        '</a>';
}

function updateGmailMaxLicenses()
{
    var newVal = document.getElementById("gmail_max_nb_licenses").value;
    urlajax = '/ajax/dashboard/licences/gmail/update/maxnumber/' + newVal;
    $.ajax({
        url: urlajax, success: function (result) {
            document.getElementById("maxNumberGmailUserLicenses").innerHTML = newVal;
            var gmailused = document.getElementById("nbgmailused").innerHTML;
            document.getElementById("nbgmaillast").innerHTML = newVal - gmailused;
            urlajax2 = '/ajax/dashboard/licences/global/update/remaining';
            $.ajax({
                url: urlajax2, success: function (result) {
                }
            });
        }
    });
}