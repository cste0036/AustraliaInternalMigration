/**************************
 *  ON LOAD FUNCTION CALLS
 **************************/
window.onload = function() {

    // Set the initial value of Year slider and load initial elements
    color = build_colorScale();
    donut_color = build_donutScale();
    map_svg = build_map_svg();
    bar_svg = build_bar_svg();
    donut_svg = build_donut_svg();
    // MAP COMPONENTS
    migrationScale = build_migrationScale();
    projection = build_projection();
    path = build_path(projection);
    // BAR CHART COMPONENTS
    bar_x = build_bar_xscale(bar_w);
    bar_y = build_bar_yscale(bar_h);
    // DONUT CHART COMPONENTS
    donut_arc = create_arc(radius);
    donut_label = create_donut_label();
    // Render the map and set the initial Year
    render_map();
    time_update(19);

};

/**************************
 *  GLOBAL VARIABLE COMPONENTS
 **************************/

// Screen margins adjustments
var margin = {
    top: 10,
    right: 20,
    bottom: 30,
    left: 30
};

// Width and height aspects for map
var map_w = 1500 - margin.left - margin.right;
var map_h = 1000 - margin.top - margin.bottom;

// Width and height aspects for Bar Chart
var bar_w = 550 - margin.left - margin.right;
var bar_h = 400 - margin.top - margin.bottom;

// Width, height, and radius aspects for Donut Chart
var donut_w = 800 - margin.left - margin.right;
var donut_h = 500 - margin.top - margin.bottom;
var radius = Math.min(donut_w, donut_h) / 3;

// Data Directory and dataset variables
const MIGRATION_PATH = "../data/MigrationData/";
const HOUSING_PATH = "../data/HousingPriceData/";
const INDUSTRY_PATH = "../data/IndustryData/";
var color;
var map_svg;
var bar_svg;
var projection;
var path;
var bar_x;
var bar_y;
var yAxis;
var pie;
var arc;


/**************************
 *  INPUT EVENT HANDLERS
 **************************/

// Define a function time_update to change the value of the input slider
function time_update(nValue) {
    d3.select("#nYear-value").text(2000 + nValue);
    d3.select("#nYear").property("value", nValue);
    load_migration("migration_");
    load_housing("housingprice_");
}

// EVENT LISTENER for when time slider is adjusted
d3.select("#nYear").on("input", function() {
    time_update(+this.value);
});


/**************************
 *  SVG SCALES
 **************************/

// create colour scale for migration numbers
function build_migrationScale() {
    return d3.scaleLinear().domain([-1000, 1000])
        .range(["red", "green"])
}

// Define the State Color Scale
function build_colorScale() {
    return d3.scaleOrdinal()
        .range(['#8dd3c7', '#ffffb3', '#bebada',
            '#fb8072', '#80b1d3', '#fdb462',
            '#b3de69', '#fccde5', '#d9d9d9'
        ]);
};

// Define the Industry Color Scale
function build_donutScale() {
    return d3.scaleOrdinal(d3.schemeCategory20);
};

// Set the width and height ranges for the bars
function build_bar_xscale(width) {
    return d3.scaleBand()
        .range([0, width])
        .padding(0.1);
}

function build_bar_yscale(height) {
    return d3.scaleLinear()
        .range([height, 0]);
}

// Creates a Pie Chart using d3.pie()
function create_pie() {
    return d3.pie()
        .value(function(d) { return d.Employed; })
        .sort(null);
}

// Specify the pie slices(arc) components of the donut chart
function create_arc(radius) {
    return d3.arc()
        .innerRadius(radius - 100)
        .outerRadius(radius - 20);
}

function create_donut_label() {
    return d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);
}


/**************************
 *  DATA LOAD AND DRAW SVG
 **************************/

// This is the main logic function that loads the migration data and draws them to the map
function load_migration(name_structure) {
    filename = get_filename(MIGRATION_PATH, name_structure);
    if (filename == null) return;
    d3.csv(filename, function(data) {
        console.log(data);
        // Draw the components
        circles = draw_circles(data);

    });
};

// This is the main logic function that loads the specified housing price data
function load_housing(name_structure) {
    filename = get_filename(HOUSING_PATH, name_structure);
    if (filename == null) return;
    d3.csv(filename, function(data) {
        console.log(data);
        // Draw the components
        bar_x = build_bar_xscale(bar_w);
        bar_y = build_bar_yscale(bar_h);
        bars = draw_bars(data);
    });
};

// This is the main logic functioh that loads the specified industry employment data
// THIS FUNCTION IS CALLED WHEN A STATE NAME IS CLICKED
function load_industry(name_structure, state) {
    if (d3.select('#nYear').property('value') < 19) {
        filename = INDUSTRY_PATH + "industry_19.csv";
    } else {
        filename = get_filename(INDUSTRY_PATH, name_structure);
    }
    d3.csv(filename, function(data) {
        // Filter the csv data for the specified state
        filtered_data = data.filter(function(row) {
            return row['State'] == state;
        });
        // Draw the donut components
        pie = create_pie();
        arc = create_arc(radius);
        donut_label = create_donut_label()
        donut = draw_donut(filtered_data);

    });
};

/**************************
 *  HELPER FUNCTIONS
 **************************/

// Creates the file path from input slider
function get_filename(data_location, name_structure) {
    filename = name_structure + d3.select('#nYear').property('value') + ".csv";
    if (filename != "") {
        return data_location + filename;
    } else {
        return null;
    }
}

/**************************
 *  SVG CANVAS FUNCTIONS
 **************************/

// Build the SVG element for the map
function build_map_svg() {
    return d3.select("#map")
        .append("svg")
        .attr("width", map_w)
        .attr("height", map_h)
};

// Build the map projection element
function build_projection() {
    return d3.geoMercator()
        .center([125, -30])
        .translate([map_w / 2, map_h / 2])
        .scale(1000);
};

// Build the path generator component
function build_path(projection) {
    return d3.geoPath()
        .projection(projection)
};

// Build the SVG element for the bar chart
function build_bar_svg() {
    return d3.select("#bar")
        .attr("width", bar_w + margin.left + margin.right)
        .attr("height", bar_h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
};

// Build the SVG element for the donut chart
function build_donut_svg() {
    return d3.select("#donut")
        .attr("width", donut_w + margin.left + margin.right)
        .attr("height", donut_h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + donut_w / 2 + "," + donut_h / 2 + ")");
}

/**************************
 *  SVG COMPONENT FUNCTIONS
 **************************/

// Define a function to draw the circle components
function draw_circles(dataset) {

    // Remove all previous circles before drawing new ones
    d3.select("svg")
        .selectAll('circle')
        .remove();

    // Draw circles at the specified locations
    var circles = map_svg.selectAll("Circles")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return d.Long; })
        .attr("cy", function(d) { return d.Lat; })
        .attr("r", function(d) { return (Math.abs(d.Net) / 500) + 25; })
        .attr("fill", function(d) { return migrationScale(d.Net); })
        .attr("opacity", 0.4)
        .attr("stroke-width", 3)
        .append('title')
        .text(function(d) {
            return "Net Migration: " + d.Net;
        });

    return circles;
}


// Define a function to render the Map component
/**
 * GEOJson File provided by Rowan Hogan and the ABS
 * https://github.com/rowanhogan/australian-states/blob/master/states.geojson?short_path=7e3fe8e
 */
function render_map() {
    d3.json("Json/Australia.json", function(json) {
        // Add the Australian path lines to the SVG canvas
        map_svg.append("g")
            .selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "dimgray")
            .attr("fill", function(d, i) { return color(i) })
            // When a state name is clicked call the Load Industry Data
            .on("click", function(d) {
                d3.selectAll("path").attr("opacity", 0.4);
                d3.select(this).attr("opacity", 1);
                load_industry("industry_", d.properties.STATE_NAME)
            });

        // Add the State Text based on the center of each states paths
        map_svg.selectAll("text")
            .data(json.features)
            .enter()
            .append("text")
            .attr("fill", "darkslategray")
            .attr("transform", function(d) {
                return "translate(" + path.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .on("click", function(d) {
                load_industry("industry_", d.properties.STATE_NAME)
            })
            .text(function(d) {
                return d.properties.STATE_NAME;
            })

        // Add the title
        map_svg.append("text")
            .attr("x", (map_w / 2) + 150)
            .attr('id', 'title')
            .attr("y", 70)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Net Migration of Australian States");

    })
}


// Define a function to draw the bar chart components
function draw_bars(dataset) {

    // Remove all previous bar plots before drawing new ones
    d3.select("#bar")
        .selectAll('.bar')
        .remove();

    d3.select('#yaxis')
        .remove();

    d3.select("#bar")
        .selectAll("text")
        .remove();

    // format the csv data to the correct format
    dataset.forEach(function(d) {
        dataset.price = +d.price;
    });

    // Scale the range of the data in the domains
    bar_x.domain(dataset.map(function(d) { return d.state; }));
    bar_y.domain([0, d3.max(dataset, function(d) { return d.price; })]);

    // append the rectangles for the bar chart
    var bars = bar_svg.selectAll(".bar")
        .data(dataset)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("fill", function(d, i) { return color(i) })
        .attr("x", function(d) { return bar_x(d.state) + 3; })
        .attr("width", bar_x.bandwidth())
        .attr("y", function(d) { return bar_y(d.price); })
        .attr("height", function(d) { return bar_h - bar_y(d.price); })
        .append('title')
        .text(function(d) {
            return "Average Price: $" + d.price;
        });

    // Add the x Axis
    xAxis = bar_svg.append("g")
        .attr("transform", "translate(0," + bar_h + ")")
        .call(d3.axisBottom(bar_x))
        .attr('id', 'xaxis')
        .selectAll("text")
        .attr("x", 75)
        .attr('y', -5)
        .attr("transform", "rotate(-90)");
    // Add the y Axis
    yAxis = bar_svg.append("g")
        .attr("transform", "translate(" + 3 + ',0)')
        .call(d3.axisLeft(bar_y))
        .attr('id', 'yaxis')
        .selectAll("text")
        .attr('transform', "rotate(-45)");
    // Add the title
    bar_svg.append("text")
        .attr("x", bar_w / 2)
        .attr('id', 'title')
        .attr("y", 12)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Average Housing Per State");

    return bars;
}


// Define a function to generate the donut chart
function draw_donut(dataset) {

    // Remove any donut components already existing
    d3.select("#donut")
        .selectAll(".arc")
        .remove();

    d3.select("#donut")
        .selectAll("text")
        .remove();

    d3.select("#donut")
        .selectAll("polyline")
        .remove();


    // format the csv data to the correct format
    dataset.forEach(function(d) {
        dataset.Employed = +d.Employed;
    });

    // Define the outer location to draw labels to
    var outerArc = d3.arc()
        .outerRadius(radius * 0.9)
        .innerRadius(radius * 0.9);

    // Define the initial space for the pie chart
    var arcs = donut_svg.selectAll(".arc")
        .data(pie(dataset))
        .enter().append("g")
        .attr("class", "arc");

    // Draw each of the pie slices base on Employed data
    arcs.append("path")
        .attr("d", arc)
        .attr("class", "slice")
        .attr("fill", function(d) { return donut_color(d.data.Employed); })
        .on("mouseover", function(d) {
            d3.selectAll("path").attr("opacity", 0.3);
            d3.select(this).attr("opacity", 1);
        })
        .on("mouseleave", function(d) {
            d3.selectAll("path").attr("opacity", 1);
        })
        .append('title')
        .text(function(d) {
            return "" + d.data.Industry + "\n" + "People Employed: " + d.data.Employed + ",000";
        });

    // Add the title
    donut_svg.append("text")
        .attr("x", 10)
        .attr('id', 'title')
        .attr("y", -160)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text(function(d) {
            return "Industry Breakdown of State";
        });

    /*
        Donut Chart Labels provided by Laxmikanta Nayak's Block
        https://bl.ocks.org/laxmikanta415/dc33fe11344bf5568918ba690743e06f
    */

    // Append the Industry labels and pointer lines
    donut_svg.append('g').classed('labels', true);
    donut_svg.append('g').classed('lines', true);

    // Append the pointer polylines
    var polyline = donut_svg.select('.lines')
        .selectAll('polyline')
        .data(pie(dataset))
        .enter().append('polyline')
        .attr('points', function(d) {

            // see label transform function for explanations of these three lines.
            var pos = outerArc.centroid(d);
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
            return [arc.centroid(d), outerArc.centroid(d), pos]
        });

    // Append the labels to the donut based on their position of the pie chart
    var label = donut_svg.select('.labels').selectAll('text')
        .data(pie(dataset))
        .enter().append('text')
        .attr('dy', '.35em')
        .attr('font-size', "11px")
        .html(function(d) {
            return d.data.Industry;
        })
        .attr('transform', function(d) {
            var pos = outerArc.centroid(d);
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
        })
        .style('text-anchor', function(d) {
            return (midAngle(d)) < Math.PI ? 'start' : 'end';
        });

    // Function to determine the center angle of a pie slice.
    function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }




};