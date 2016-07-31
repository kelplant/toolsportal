

$(function () {
  "use strict";
  // GRAPHIQUE NBTICKET PAR MODEL
  var urlajaxGraph1 = "/ajax/dashboard/get/graph/recursiveEndOfWeek";
  $.ajax({
    url: urlajaxGraph1  , success: function (result1) {
      var chart = echarts.init(document.getElementById('newticket_by_week'), 'macarons');
      var itemStyle = {
        normal: {
        }
      };

      chart.setOption({
        legend: {
          data:['Ouvertures','Fermetures']
        },
        toolbox: {
          x: 'right',
          y: 'bottom',
          show : true,
          feature : {
            saveAsImage : {
              show : true,
              title : 'Sauvegarder en Image',
              type : 'png',
              lang : ['fr']
            }
          }
        },
        calculable : true,
        tooltip: {
          formatter : function (params) {
            return 'Semaine ' + params[1].substring(4, 6) + ' Année ' + params[1].substring(0, 4) + '<br>' + params[2] + ' postes';

          },
        },
        xAxis : [
          {
            type : 'category',
            data : result1.legend,
            axisLabel : {
              show:true,
              interval: 'auto',    // {number}
              rotate: -45,
              margin: 5,
              clickable:true,
              formatter : function (params) {
                return params.substring(4, 6) +
                    ' ' +
                    params.substring(0, 4);
              },
              textStyle: {

                fontFamily: 'verdana',
                fontSize: 12,
                fontStyle: 'normal',
                fontWeight: 'normal'
              }
            }
          }
        ],
        yAxis : [
          {
            type : 'value',
            name : 'Ouvertures'
          },
          {
            type : 'value',
            name : 'Fermetures',
            axisLabel : {
              formatter: '{value}'
            }
          }
        ],

        series: [{
          name: 'Ouvertures',
          type: 'bar',
          symbolSize: 18,
          selectedMode: 'single',
          selectedOffset: 30,
          data: result1.datas2,
          itemStyle: {normal: {label:{show:true}}}
        },{
          name: 'Fermetures',
          type: 'line',
          yAxisIndex: 1,
          selectedMode: 'single',
          selectedOffset: 30,
          data: result1.datas1,
          itemStyle: itemStyle
        }]

      });
      $('#newticket_graph_overlay').addClass("hide");
    }});

  // GRAPHIQUE NBTICKET PAR STATUS
  var urlajaxGraph2 = "/ajax/dashboard/get/graph/status";
  $.ajax({
    url: urlajaxGraph2  , success: function (result2) {
      var chart = echarts.init(document.getElementById('ticket_by_status'), 'macarons');
      var itemStyle = {
        normal: {
        }
      };

      chart.setOption({
        //legend: {
        //  data: result2.legend,
        //  x: 'right',
        //  y: 'top',
        //  orient:'vertical'
        //},
        toolbox: {
          x: 'right',
          y: 'bottom',
          show : true,
          feature : {
            saveAsImage : {
              show : true,
              title : 'Sauvegarder en Image',
              type : 'png',
              lang : ['fr']
            }
          }
        },
        calculable : true,
        tooltip: {
          formatter: "{b} <br/> {c} ({d}%)"
        },
        series: [{
          name: 'pie',
          type: 'pie',
          selectedMode: 'single',
          selectedOffset: 30,
          clockwise: true,
          data: result2.datas,
          itemStyle: itemStyle
        }]
      });
      $('#status_graph_overlay').addClass("hide");
    }});

  // GRAPHIQUE NBTICKET PAR TYPE PANNE
  var urlajaxGraph3 = "/ajax/dashboard/get/graph/type_panne";
  $.ajax({
    url: urlajaxGraph3  , success: function (result3) {
      var chart = echarts.init(document.getElementById('ticket_by_type_panne'), 'macarons');

      var itemStyle = {
        normal: {
        }
      };

      chart.setOption({
        legend: {
          data: result3.legend,
          x: 'right',
          y: 'top',
          orient:'vertical'
        },
        toolbox: {
          x: 'right',
          y: 'bottom',
          show : true,
          feature : {
            saveAsImage : {
              show : true,
              title : 'Sauvegarder en Image',
              type : 'png',
              lang : ['fr']
            }
          }
        },
        calculable : true,
        tooltip: {
          formatter: "{b} <br/> {c} ({d}%)"
        },
        series: [{
          name: 'pie',
          type: 'pie',
          selectedMode: 'single',
          selectedOffset: 30,
          clockwise: true,
          data: result3.datas,
          itemStyle: itemStyle
        }]
      });
      $('#type_panne_graph_overlay').addClass("hide");
    }});

  // GRAPHIQUE NBTICKET PAR MODEL
  var urlajaxGraph4 = "/ajax/dashboard/get/graph/model";
  $.ajax({
    url: urlajaxGraph4  , success: function (result4) {
      var chart = echarts.init(document.getElementById('ticket_by_model'), 'macarons');

      var itemStyle = {
        normal: {
        }
      };

      chart.setOption({
        toolbox: {
          x: 'right',
          y: 'bottom',
          show : true,
          feature : {
            saveAsImage : {
              show : true,
              title : 'Sauvegarder en Image',
              type : 'png',
              lang : ['fr']
            }
          }
        },
        calculable : true,
        tooltip: {
          formatter: "{b} <br/> {c} postes"
        },
        xAxis : [
          {
            type : 'value',
            boundaryGap : [0, 0.01],
            splitLine : {
              show:true,
              lineStyle: {
                color: '#483d8b',
                type: 'dashed',
                width: 1
              }
            },
            splitArea : {
              show: true,
              areaStyle:{
                color:['#FFFFFF','rgba(135,200,250,0.3)']
              }
            }
          }
        ],
        yAxis : [
          {
            type : 'category',
            data : result4.legend,
            axisLabel : {
              show:true,
              interval: 'auto',    // {number}
              rotate: -45,
              margin: 5,
              clickable:true,
              formatter : function (params) {
                return params
                    .replace(" (DELL)", "")
                    .replace(" (LENOVO)", "")
                    .replace(" (HP)", "")
                    .replace(" (ACER)", "")
                    .replace(" (TOUR)", "")
                    .replace("- PENTIUM 3550", "")
                    .replace("-K2200", "")
                    .replace("-K2000", "")
                    .replace("SCIENTIFIC", "S")
                    .replace("TECHNIQUE", "T")
                    .replace("- 256GB", "")
                    .replace("- 128GB", "")
                    .toLowerCase()
                    .replace( /['"]/g, '' )
                    .replace( /\W+/g, ' ' )
                    .replace( / (.)/g, function($1) { return $1.toUpperCase(); });
              },
              textStyle: {
                color: '#1e90ff',
                fontFamily: 'verdana',
                fontSize: 8,
                fontStyle: 'normal',
                fontWeight: 'normal'
              }
            }
          }
        ],

        series: [{
          name: 'bar',
          type: 'bar',
          selectedMode: 'single',
          selectedOffset: 30,
          data: result4.datas,
          itemStyle: {normal: {label:{show:true}}},
        }]
      });
      $('#model_graph_overlay').addClass("hide");
    }});

  // GRAPHIQUE NBTICKET PAR MODEL CATEGORY
  var urlajaxGraph5 = "/ajax/dashboard/get/graph/model_category";
  $.ajax({
    url: urlajaxGraph5  , success: function (result5) {
      var chart = echarts.init(document.getElementById('ticket_by_model_category'), 'macarons');

      var itemStyle = {
        normal: {
        }
      };

      chart.setOption({
        //legend: {
        //  data: result5.legend,
        //  x: 'right',
        //  y: 'top',
        //  orient:'vertical'
        //},
        toolbox: {
          x: 'right',
          y: 'bottom',
          show : true,
          feature : {
            saveAsImage : {
              show : true,
              title : 'Sauvegarder en Image',
              type : 'png',
              lang : ['fr']
            }
          }
        },
        calculable : true,
        tooltip: {
          formatter: "{b} <br/> {c} ({d}%)"
        },
        series: [{
          name: 'pie',
          type: 'pie',
          selectedMode: 'single',
          selectedOffset: 30,
          clockwise: true,
          data: result5.datas,
          itemStyle: itemStyle
        }]
      });
      $('#model_category_graph_overlay').addClass("hide");
    }});

  // GRAPHIQUE NBTICKET EN STOCK
  var urlajaxGraph6 = "/ajax/dashboard/get/graph/recursiveEndOfWeek";
  $.ajax({
    url: urlajaxGraph6  , success: function (result6) {
      var chart = echarts.init(document.getElementById('stock_ticket_by_week'), 'macarons');

      var itemStyle = {
        normal: {
        }
      };

      chart.setOption({
        toolbox: {
          x: 'right',
          y: 'bottom',
          show : true,
          feature : {
            saveAsImage : {
              show : true,
              title : 'Sauvegarder en Image',
              type : 'png',
              lang : ['fr']
            }
          }
        },
        calculable : true,
        tooltip: {
          formatter : function (params) {
            return 'Semaine ' + params[1].substring(4, 6) + ' Année ' + params[1].substring(0, 4) + '<br>' + params[2] + ' postes';

          }
        },
        xAxis : [
          {
            type : 'category',
            data : result6.legend,
            axisLabel : {
              show:true,
              interval: 'auto',    // {number}
              rotate: -45,
              margin: 5,
              clickable:true,
              formatter : function (params) {
                return params.substring(4, 6) +
                    ' ' +
                    params.substring(0, 4);
              },
              textStyle: {

                fontFamily: 'verdana',
                fontSize: 12,
                fontStyle: 'normal',
                fontWeight: 'normal'
              }
            }
          }
        ],
        yAxis : [
          {
            type : 'value'

          }
        ],

        series: [{
          name: 'bar',
          type: 'bar',
          selectedMode: 'single',
          selectedOffset: 30,
          data: result6.datas,
          itemStyle: {normal: {label:{show:true}}}
        }]
      });
      $('#stock_ticket_by_week_overlay').addClass("hide");
    }});

  // GRAPHIQUE NBTICKET PAR END OF WARRANTY
  var urlajaxGraph7 = "/ajax/dashboard/get/graph/end_of_warranty";
  $.ajax({
    url: urlajaxGraph7  , success: function (result7) {
      var chart = echarts.init(document.getElementById('newticket_by_end_warranty'), 'macarons');

      var itemStyle = {
        normal: {
        }
      };

      chart.setOption({
        //legend: {
        //  data: result5.legend,
        //  x: 'right',
        //  y: 'top',
        //  orient:'vertical'
        //},
        toolbox: {
          x: 'right',
          y: 'bottom',
          show : true,
          feature : {
            saveAsImage : {
              show : true,
              title : 'Sauvegarder en Image',
              type : 'png',
              lang : ['fr']
            }
          }
        },
        calculable : true,
        tooltip: {
          formatter: "{b} <br/> {c} postes"
        },
        xAxis : [
          {
            type : 'category',
            data : result7.legend,
            axisLabel : {
              show:true,
              interval: 'auto',    // {number}
              rotate: -45,
              margin: 5,
              clickable:true,
              formatter : function (params) {
                return params.substring(4, 6) +
                    ' ' +
                    params.substring(0, 4);
              },
              textStyle: {

                fontFamily: 'verdana',
                fontSize: 12,
                fontStyle: 'normal',
                fontWeight: 'normal'
              }
            }
          }
        ],
        yAxis : [
          {
            type : 'value'

          }
        ],
        series: [{
          name: 'bar',
          type: 'bar',
          selectedMode: 'single',
          selectedOffset: 30,
          clockwise: true,
          data: result7.datas,
          itemStyle: {normal: {label:{show:true}}},
        }]
      });
      $('#end_warranty_graph_overlay').addClass("hide");
    }});
});
