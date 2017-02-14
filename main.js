var margin = {
    top: 100,
    right: 40,
    bottom: 30,
    left: 100
}
var width = $("svg").width() - margin.right - margin.left,
    height = $("svg").height() - margin.top - margin.bottom;
var maxX, maxY;
var svg, xAxis, xScale, yAxis, yScale;
var countryArray = [];
var countries;
var color_f = "rgba(255,0,0,0.7)",
    color_m = "rgba(0,0,255,0.6)",
    color_f_fade = "rgba(255,0,0,0.2)",
    color_m_fade = "rgba(0,0,255,0.2)";

var chart = $("#main_svg"),
    aspect = chart.width() / chart.height(),
    container = chart.parent();
var d_global;
var top_countries = ["Russia", "India", "Morocco", "Kenya", "Turkey", "Brazil", "Ukraine", "Italy", "France", "United States"];


$(window).on("resize", function () {
    var targetWidth = container.width();
    //console.log(targetWidth);
    chart.attr("width", targetWidth);
    chart.attr("height", Math.round(targetWidth / aspect));
}).trigger("resize");





//init swiper
function init_swiper() {
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        direction: 'vertical',
        mousewheelControl: true,
        keyboardControl: true,
        simulateTouch:true,
    });

    console.log(swiper.activeIndex);
    swiper.on("onSlideChangeEnd", function () {
        if (swiper.activeIndex == 0) {
            $(".y_axis").css({
                "visibility": "visible"
            });
        } else {
            $(".y_axis").css({
                "visibility": "hidden"
            });
        }
        var slides = $(".swiper-wrapper .swiper-slide");
        var activeIndex = swiper.activeIndex;
        var animationKey = $(slides[activeIndex]).data("animation-key");

        manageAnimation(animationKey);
    });

}





//d3 drawing 
function init_chart() {
    d3.json("doping.json", function (d) {
        //console.log("loaded data");
        //helper function for sorting
        Array.prototype.byCount = function () {
            var itm, a = [],
                L = this.length,
                o = {};
            for (var i = 0; i < L; i++) {
                itm = this[i];
                if (!itm) continue;
                if (o[itm] == undefined) o[itm] = 1;
                else ++o[itm];
            }
            for (var p in o) a[a.length] = p;
            return a.sort(function (a, b) {
                return o[b] - o[a];
            });
        };
        for (var i = 0; i < d.length; i++) {
            if (countryArray.indexOf(d[i].countrycode) == -1) {
                countryArray.push(d[i].country);
            }
        }
        //sort countries by count
        countries = countryArray.byCount();
        //console.log(countries);
        //axix config
        maxX = 42;
        maxY = 124;
        svg = d3.select("svg")
            //            .attr("width", width)
            //            .attr("height", height)
            .append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "drawing_area")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        xScale = d3.scale.linear().range([0, width]).domain([0, maxX]);
        xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(3).outerTickSize(0);
        svg.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + margin.top * (-1) + ")")
            .call(xAxis);

        yScale = d3.scale.ordinal().domain(top_countries).rangePoints([0, height * 20 / 62]);
        yAxis = d3.svg.axis().scale(yScale).orient("left");
        svg.append("g")
            .attr("class", "y_axis")
            .call(yAxis);
        indexing(d);
        drawChart(d);
        d_global = d;
    });

}

function drawChart(data) {
    //    console.log("drawChart");
    var selection = d3.select("svg").selectAll("rect")


    //check if returning or initializing 
    if (selection[0][1] !== undefined) {
        //console.log("redrawing axis");
        maxX = 42;
        maxY = 62;

        xScale = d3.scale.linear().range([0, width]).domain([0, maxX]);
        xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(3).outerTickSize(0);
        var axisEl_x = svg.select(".x_axis");
        axisEl_x.transition()
            .duration(500)
            .call(xAxis);

        yScale = d3.scale.ordinal().domain(top_countries).rangePoints([0, height * 20 / 62]);
        yAxis = d3.svg.axis().scale(yScale).orient("left");
        var axisEl_y = svg.select(".y_axis");
        axisEl_y.transition()
            .duration(0)
            .call(yAxis);

        selection
            .attr("fill", function (d) {
                //console.log(d.country);
                var top_countries = ["Russia", "India", "Morocco", "Kenya", "Turkey", "Brazil", "Ukraine", "Italy", "France", "United States"];
                
                if (top_countries.indexOf(d.country) !== -1) {
                    return "rgba(0,0,0,0.6)";
                } else {
                    return "rgba(255,255,255,0)";
                }
            })
            .attr("y", function (d) {
                // console.log(countries.indexOf(d.country)); 
                return yScale(d.country) + margin.top;
            })
            .attr("x", function (d) {
                //console.log(_.countBy(countryArray, _.identity));
                //console.log(d)
                return xScale(d.index) + margin.left;
            });

    } else {
        selection.data(data).enter()
            .append("rect")
            .attr("class", "athlete")
            .attr("width", "9.5px")
            .attr("height", "9.5px")
            .attr("fill", function (d) {
                //console.log(d.country);
                var top_countries = ["Russia", "India", "Morocco", "Kenya", "Turkey", "Brazil", "Ukraine", "Italy", "France", "United States"];
                
                if (top_countries.indexOf(d.country) !== -1) {
                    return "rgba(0,0,0,0.6)";
                } else {
                    return "rgba(255,255,255,0)";
                }
            })
            .attr("y", function (d) {
                // console.log(countries.indexOf(d.country)); 
                return yScale(d.country) + margin.top;
            })
            .attr("x", function (d) {
                //console.log(_.countBy(countryArray, _.identity));
                //console.log(d)
                return xScale(d.index) + margin.left;
            });

    }
}
//helper functions

function indexing(d) {

    var country_count = _.countBy(countryArray, _.identity);

    for (var i = 0; i < d.length; i++) {
        var current_country_count = country_count[d[i].country];
        d[i].index = country_count[d[i].country];
        country_count[d[i].country] = country_count[d[i].country] - 1;
    }
    // console.log(d);
}



//animation functions
function gender(d, c, dur) {

    if (dur == undefined) {
        dur = 300;
    }

    _.sortBy(d, function (d) {
        return d.sex;
    });

    //transition x-axis
    maxX = 200;
    xScale.domain([0, maxX]).range([0, width]);
    var axisEl_x = svg.select(".x_axis");
    axisEl_x.transition()
        .duration(500)
        .call(xAxis);

    //transition y-axis
    maxY = 200;
    yScale = d3.scale.linear().domain([0, maxY]).range([0, width]);
    yAxis = d3.svg.axis().scale(yScale).orient("left");
    var axisEl_y = svg.select(".y_axis");
    axisEl_y.transition()
        .duration(0)
        .call(yAxis);

    //transition rects 
    var selection = d3.select("svg").selectAll("rect");
    var male = 175;
    var female = 112;
    selection.transition().duration(300)
        .attr("x", function (d, i) {
            //console.log("inside gender");
            // console.log(i);
            if (i < 112) {
                var _i = i % 10;
                return xScale(_i) + margin.left + _i * 10 + width /9;
            } else {
                var _i = (i - 112) % 10;
                return xScale(_i + 100) + margin.left + _i * 10 + width / 9;
            }
        })
        .attr("y", function (d, i) {
            //console.log(i);
            if (i < 112) {
                var line_num = Math.floor(i / 10);
                //console.log(line_num);
                return yScale(line_num) + margin.top + line_num * 10;
            } else {


                var line_num = Math.floor((i - 112) / 10);
                //console.log(line_num);
                return yScale(line_num) + margin.top + line_num * 10;
            }


        })
        .attr("fill", function (d, i) {
            if (c == undefined) {
                var current_color;
                d.sex == "M" ? current_color = color_m : current_color = color_f;
                return current_color;
            } else {
                return c;
            }

        });

}


function lifeban() {
    var selection = d3.select("svg").selectAll("rect");
    selection.transition().transition(400)
         
        .attr("fill", function (d, i) {
            //console.log(d.sanction);
            if (d.sanction.indexOf("Lifetime") !== -1) {
                //console.log(d.sanction);
                return "black";
            } else {
                var current_color;
                d.sex == "M" ? current_color = color_m_fade : current_color = color_f_fade;
                return current_color;
            }
        })
    .attr("x", function (d, i) {
            console.log("inside gender");
            // console.log(i);
            if (i < 112) {
                var _i = i % 10;
                return xScale(_i) + margin.left + _i * 10 + width /9;
            } else {
                var _i = (i - 112) % 10;
                return xScale(_i + 100) + margin.left + _i * 10 + width / 9;
            }
        })
        .attr("y", function (d, i) {
            //console.log(i);
            if (i < 112) {
                var line_num = Math.floor(i / 10);
                //console.log(line_num);
                return yScale(line_num) + margin.top + line_num * 10;
            } else {


                var line_num = Math.floor((i - 112) / 10);
                //console.log(line_num);
                return yScale(line_num) + margin.top + line_num * 10;
            }


        });
}

function career_ending() {
    var selection = d3.select("svg").selectAll("rect");
    selection.transition().duration(300)
        .attr("fill", function (d, i) {
            return "rgb(200,200,200)";
        });
}

function stanozolol(d){ 
      //transition x-axis
    maxX = 200;
    xScale.domain([0, maxX]).range([0, width]);
    var axisEl_x = svg.select(".x_axis");
    axisEl_x.transition()
        .duration(500)
        .call(xAxis);

    //transition y-axis
    maxY = 200;
    yScale = d3.scale.linear().domain([0, maxY]).range([0, width]);
    yAxis = d3.svg.axis().scale(yScale).orient("left");
    var axisEl_y = svg.select(".y_axis");
    axisEl_y.transition()
        .duration(0)
        .call(yAxis);

    //transition rects 
    var selection = d3.select("svg").selectAll("rect");
    var drug_other = 287-45;
    var drug_stan = 45;
    selection.transition().duration(300)
        .attr("x", function (d, i) {
            // console.log(i);
            if (i < drug_stan) {
                this.setAttribute("fill","#a99575");
                var _i = i % 5;
                return xScale(_i) + margin.left + _i * 10 + width / 10;
            } else {
                this.setAttribute("fill","rgb(200,200,200)");
                var _i = (i - drug_stan) % 15;
                return xScale(_i + 100) + margin.left + _i * 10 + width / 10;
            }
        })
        .attr("y", function (d, i) {
            //console.log(i);
            if (i < 45) {
                var line_num = Math.floor(i / 5);
                //console.log(line_num);
                return yScale(line_num) + margin.top + line_num * 10;
            } else {


                var line_num = Math.floor((i - 45) / 15);
                //console.log(line_num);
                return yScale(line_num) + margin.top + line_num * 10;
            }


        });
//        .attr("fill", function (d, i) {
//           
//                var current_color;
//                d.rule.indexOf("tanozo") == -1 ? current_color = "rgb(200,200,200)": current_color = "#a99575";
//                return current_color;
//          
//
//        });


}

function manageAnimation(key, data) {
    //console.log(key);
    switch (key) {
    case "start":
        drawChart(d_global);
       // console.log("started");
        break;
    case "gender":
        //console.log("triggered gender");
        gender(d_global);
        break;

    case "lifeban":
        lifeban();
        break;

    case "career_ending":
        career_ending();
        break;
            
    case "stanozolol":
        stanozolol(d_global);
        break;

    }
}




init_swiper();
init_chart();