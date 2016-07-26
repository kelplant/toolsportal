
function nextStep(i, max, finalTab, checkedBoxes, message, actionbatch) {
    if (i < max) {
            var string = checkedBoxes[i].name.replace("transform[", "").replace("]", "");
            urlajax ="/ajax/candidat/get/" + string;
            $.ajax({url:urlajax,success:function(result){
                var user = result.surname + ' ' + result.name;
                message += '<li>' + user + '</li>';
                finalTab.push(user);
                i = i + 1;
                nextStep(i, max, finalTab, checkedBoxes, message, actionbatch);
            }});
    } else {
        message += '</ul></p>';
        bootbox.confirm({
            message: message,
            callback: function(result){
                if (result) {
                    var textToAppend = '<input type="hidden" name="send" id="send" value="'+ actionbatch +'">';
                    $('#typeSubmit').append(textToAppend);
                    batchform.submit();
                } else {
                    $('#waiting_transform').addClass('hide').removeClass('show');
                    $('#waiting_archive').addClass('hide').removeClass('show');
                    $('#archive').addClass('show').removeClass('hide');
                    $('#transform').addClass('show').removeClass('hide');
                }
            }
        });
    }
}

function executeBatchTransform()
{
    $('#transform').addClass('hide').removeClass('show');
    $('#waiting_transform').addClass('show').removeClass('hide');
    var checkedBoxes = document.querySelectorAll('.checkbox_transform:checked');
    var i = 0;
    var max = checkedBoxes.length;
    var finalTab = [];
    var message = "Etes vous sur de vouloir Transformer ces condidats ? <br><br><p><ul>";
    nextStep(i, max, finalTab, checkedBoxes, message, "transform");
}

function executeBatchArchive()
{
    $('#archive').addClass('hide').removeClass('show');
    $('#waiting_archive').addClass('show').removeClass('hide');
    var checkedBoxes = document.querySelectorAll('.checkbox_transform:checked');
    var i = 0;
    var max = checkedBoxes.length;
    var finalTab = [];
    var message = "Etes vous sur de vouloir Archiver ces condidats ? <br><br><p><ul>";
    nextStep(i, max, finalTab, checkedBoxes, message, "archive");
}