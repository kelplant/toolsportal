$(function () {
  "use strict";

  //The Calender
  /* initialize the calendar
   -----------------------------------------------------------------*/
  //Date for the calendar events (dummy data)
  var date = new Date();
  var d = date.getDate(),
      m = date.getMonth(),
      y = date.getFullYear();

  var urlajax = "/ajax/dashboard/get/candidat_todo_liste";
  $.ajax({
    url: urlajax, success: function (result) {
      $('#calendar').fullCalendar({
        lang: 'fr',
        weekends: false,
        height: 750,
        hiddenDays: [ 7 ],
        weekNumbers: true,
        aspectRatio: 1.4,
        editable: false,
        droppable: false,
        fixedWeekCount: false,
        eventMouseover: function( event, jsEvent, view ) {
          this.style.cursor='pointer';
        },
        eventClick: function( event, jsEvent, view ) {
          localStorage.setItem("currentCandidatToView", event.id)
          window.location = "/admin/candidat?isArchived=0";
        },
        eventRender: function(event, eventElement) {
          if (event.imageurl) {
            eventElement.find("div.fc-content").prepend("<img src='" + event.imageurl +"' width='12' height='12'>");
          }
        },
        header: {
          left: 'prev,next today',
          center: 'title',
        },
        buttonText: {
          today: 'Aujourd\'hui',
          month: 'Mois',
          week: 'Année',
          day: 'Jour'
        },
        events: result
      });
    }
  });

  /* Morris.js Charts */
  // Sales chart
  var urlajaxGraph1 = "/ajax/dashboard/get/graph/utilisateur";
  $.ajax({
    url: urlajaxGraph1, success: function (result) {

      var datas = result;

      var area = new Morris.Bar({
        element: 'revenue-chart',
        data: datas,
        resize: true,
        xkey: 'y',
        ykeys: ['item1'],
        labels: ['Nouveaux Utilisateurs'],
        barColors: ['#a0d0e0'],
        hideHover: 'auto'
      });
      //Fix for charts under tabs
      $('.box ul.nav a').on('shown.bs.tab', function () {
        area.redraw();
        bar.redraw();
        line.redraw();
      });
    }});


  /* The todo list plugin */
  $(".todo-list").todolist({
    onCheck: function (ele) {
      window.console.log("The element has been checked");
      return ele;
    },
    onUncheck: function (ele) {
      window.console.log("The element has been unchecked");
      return ele;
    }
  });

});


// Lastest Member link function
function goToUserEdit(editItem)
{
    localStorage.setItem("currentEditItem", editItem);
    window.location = "/admin/utilisateur?isArchived=0";
}