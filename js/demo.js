// Function to generate d3 map from passed-in GeoJSON feature collection.
// This is called from below, after the data has been loaded.
function generateMap(townsFeatureCollection) {
	// Define SVG container ('viewport')
	var width = 960,
		height = 500;
		
	var svgContainer = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("border", "2px solid steelblue");

	// Define projection: Mass State Plane NAD 83 Meters.
	// Standard parallels and rotation (grid origin latitude and longitude) from 
	//     NOAA Manual NOS NGS 5: State Plane Coordinate System of 1983, p. 67.
	// The scale and translation vector were determined empirically.
	var projection = d3.geoConicConformal()
		.parallels([41 + 43 / 60, 42 + 41 / 60])
		.rotate([71 + 30 / 60, -41 ])
		.scale([13000])
		.translate([500,560]);
			
	// Define geo-path generator function
	var geoPath = d3.geoPath().projection(projection);
	
	// Define color palette
	var palette = d3.scaleOrdinal()
					.domain(['C', 'T', 'TC'])
					.range(['red', 'green', 'blue']);
	palette.domainStrings = function() { return ['City', 'Town', 'Town with City form of government']; };
		
	// Create SVG <path> for each town
	var svgTowns = svgContainer
		.selectAll("path")
		.data(townsFeatureCollection.features)
		.enter()
		.append("path")
			.attr("d", function(d, i) { return geoPath(d); })
			.style("stroke", "black")
			.style("stroke-width", "0.5px")
			.style("fill", function(d, i) { return palette(d.properties.TYPE); })
			.append("title")
				.text(function(d, i) { return d.properties.TOWN; });
			
	// Generate legend
	// Create data array ({color, text} pairs) for legend
	var i,
		legendData = [];
	for (i = 0; i < palette.domain().length; i++) {
		legendData.push( { 'color': palette.range()[i], 
						   'text' : palette.domainStrings()[i] } );
	}	
		
	svgContainer.selectAll("rect")
		.data(legendData)
		.enter()
		.append("rect")
			.attr("height", 28)
			.attr("width", 28)
			.attr("x", function(d,i) { return 10 + (i * 50); } )
			.attr("y", height-50)
			.style("stroke", "black")
			.style("stroke-width", "0.5px")
			.style("fill", function(d,i) { return d.color; });	
			
	svgContainer.selectAll("text")
		.data(legendData)
		.enter()
		.append("text")
			.attr("x", function(d,i) { return 10 + (i * 50); } )
			.attr("y", height-8)
			.text(function(d,i) { return d.text; } )
			.style("font-size", 12);
			
	svgContainer.append("text")
		.attr("x", 10)
		.attr("y", height-60)
		.style("font-size", "14px")
		.style("font-weight", "bold")
		.text("Form of Government");		
} // generateMap

// This is where execution begins:
// Load the GeoJSON data, and call 'generateMap' function to generate map from it.
d3.json("json/TOWNS_POLYM.geo.json").then((data) => { generateMap(data); });
