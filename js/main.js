//$.getJSON("http://datatank.stad.gent/4/mobiliteit/bluebikedeelfietsensintpieters.json", success);
//
//function success(data) {
//    console.log("success");
//    console.log(data.properties.description);
//};

function BlueBike(lat, loc, description, capacityTotal, capacityInUse, capacityAvailable, capacityInMaintenance) {
    this.lat = lat;
    this.loc = loc;
    this.description = description;
    this.capacityTotal = capacityTotal;
    this.capacityInUse = capacityInUse;
    this.capacityAvailable = capacityAvailable;
    this.capacityInMaintenance = capacityInMaintenance;
};

var app = {
    refresh: null,
    init: function () {
        app.load();

        app.toggle("l1");
        app.toggle("l2");
    },
    load: function () {
        // Gent Sint-Pieters
        app.loadOpenDataGhent("l1", "http://datatank.stad.gent/4/mobiliteit/bluebikedeelfietsensintpieters.json");

        // Gent Dampoort
        app.loadOpenDataGhent("l2", "http://datatank.stad.gent/4/mobiliteit/bluebikedeelfietsendampoort.json");
    },
    loadOpenDataGhent: function (div, url) {
        $.ajax({
            dataType: "json",
            url: url,
            method: "get",
            cache: false,
            success: function (data) {
                app.toHtml(div, new BlueBike(
                    data.geometry.coordinates[0],
                    data.geometry.coordinates[1],
                    data.properties.description,
                    data.properties.attributes[0].value,
                    data.properties.attributes[1].value,
                    data.properties.attributes[2].value,
                    data.properties.attributes[3].value
                ));

                $("#error").hide();
                app.changeSymbolState("running");
            },
            error: function () {
                $("#error").show();
                app.changeSymbolState("paused");

                // Tries to reload the data every 5s when the connection failed
                // Using a variable so multiple connections aren't running their own timeout
                if (app.refresh == null) {
                    app.refresh = setTimeout(function() {
                        app.load();
                        console.log("check internet connection");
                        app.refresh = null;
                    }, 5000);
                }
            }
        });
    },
    changeSymbolState: function (state) { // running - paused
        $(".symbol").css({
            "-webkit-animation-play-state": state,
            "-moz-animation-play-state": state,
            "-o-animation-play-state": state,
            "animation-play-state": state
        });
    },
    toHtml: function (id, blueBike) {
        var content = $("#" + id + " .content");

        app.buildChart(id, blueBike);

        content.find(".capacity-total").html(blueBike.capacityTotal);
        content.find(".capacity-in-use").html(blueBike.capacityInUse);
        content.find(".capacity-available").html(blueBike.capacityAvailable);
        content.find(".capacity-in-maintenance").html(blueBike.capacityInMaintenance);
        content.find(".btn-map").attr("href", "http://maps.google.com/maps?z=12&t=m&q=loc:" + blueBike.loc + "+" + blueBike.lat);

        content.find(".loading").html("");
    },
    buildChart: function(id, blueBike) {
        // Build the chart
        $("#" + id + " .chart").highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
            },
            colors: ["#E92A2A", "#53E63F", "#E6C83F"],
            credits: {
                enabled: false
            },
            title: {
                text: null
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    dataLabels: {
                        enabled: false
                    },
                    point:{
                        events : { // Disable toggle in legend
                            legendItemClick: function(e){
                                e.preventDefault();
                            }
                        }
                    },
                    showInLegend: true,
                }
            },
            series: [{
                colorByPoint: true,
                data: [{
                    name: 'In gebruik',
                    y: blueBike.capacityInUse
                }, {
                    name: 'Beschikbaar',
                    y: blueBike.capacityAvailable
                }, {
                    name: 'In onderhoud',
                    y: blueBike.capacityInMaintenance
                }]
            }]
        });
    },
    toggle: function (id) {
        var header = $("#" + id + " .header");

        header.click(function() {
            var state = $("#" + id + " .closed")[0];

            $("#" + id).find(".content").slideToggle();

            if (state) {
                header.removeClass("closed");
                header.addClass("open");
            }
            else {
                header.removeClass("open");
                header.addClass("closed");
            }
        });

    }
};

$(document).ready(function () {
    app.init();

    // Refresh every 60 seconds
    setInterval(function() {
        app.load();
        console.log("60s interval");
    }, 60000);
});