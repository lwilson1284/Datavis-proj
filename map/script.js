const width = 960;
const height = 600;

const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa();

const path = d3.geoPath()
    .projection(projection);

d3.json("../data/usa-counties.json").then(us => {
    const georgiaCounties = topojson.feature(us, us.objects.USAdrop1).features
        .filter(d => d.properties.CoState.endsWith("Georgia")); // Filter by Georgia

    // scale up the Georgia counties
    projection.fitSize([width, height], {type: "FeatureCollection", features: georgiaCounties});

    svg.append("g")
      .selectAll("path")
      .data(georgiaCounties)
      .join("path")
        .attr("d", path)
        .style("fill", "lightblue") // background fill
        .style("stroke", "#31708f") // county line color
        .style("stroke-width", "1px");
});
