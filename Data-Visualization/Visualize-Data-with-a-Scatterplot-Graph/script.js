const DATA_URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
const WIDTH = 800;
const HEIGHT = 480;
const MARGINS = { TOP: 20, LEFT: 80, BOTTOM: 50, RIGHT: 75 };
const DOT_COLORS = { doping: "IndianRed", noDoping: "SeaGreen" };

let svg = d3.select("#dataviz")
    .append("svg")
    .attr('width', WIDTH + MARGINS.LEFT + MARGINS.RIGHT)
    .attr('height', HEIGHT + MARGINS.TOP + MARGINS.BOTTOM)
    .append("g")
    .attr("transform",
        "translate(" + MARGINS.LEFT + "," + MARGINS.TOP + ")");

var div = d3
    .select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip')
    .style('opacity', 0);

d3.json(DATA_URL).then(data => {

    //  x-axis
    let x = d3.scaleLinear().range([0, WIDTH]);

    x.domain([
        d3.min(data, (d) => { return d.Year - 1; }),
        d3.max(data, (d) => { return d.Year + 1; })
    ]);
    let xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));
    svg
        .append('g')
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0,' + HEIGHT + ')')
        .call(xAxis)
    svg
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', WIDTH / 2)
        .attr('y', HEIGHT + MARGINS.BOTTOM)
        .style('text-anchor', 'end')
        .text('Year');

    // y-axis
    let normalizeTimeFunc = (time) => { return new Date(1970, 1, 1, 0, time.split(':')[0], time.split(':')[1]) };
    data.forEach((d) => {
        d.Time = normalizeTimeFunc(d.Time)
    });

    let y = d3.scaleTime().range([0, HEIGHT]);
    y.domain(d3.extent(data, (d) => {
        return d.Time;
    }));

    let timeFormat = d3.timeFormat('%M:%S');
    let yAxis = d3.axisLeft(y).tickFormat(timeFormat);

    svg.append('g')
        .attr('id', 'y-axis')
        .call(yAxis)

    svg
        .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -150)
        .attr('y', -45)
        .style('text-anchor', 'end')
        .text('Best Time (minutes)')
        ;

    // dots
    svg.append('g')
        .selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => { return x(d.Year); })
        .attr("cy", (d) => { return y(d.Time); })
        .attr("r", 6)
        .attr("class", "dot")
        .attr("data-xvalue", (d) => { return d.Year; })
        .attr("data-yvalue", (d) => { return d.Time; })
        .style("fill", (d) => { return d.Doping ? DOT_COLORS.doping : DOT_COLORS.noDoping; })
        .on('mouseover', (event, d) => {
            div.style('opacity', 0.9);
            div.attr('data-year', d.Year);
            div
                .html(`${d.Name}: ${d.Nationality}<br/>Year: ${d.Year}, Time: ${timeFormat(d.Time)}${d.Doping ? "<br/>(" + d.Doping + ")" : ""}`)
                .style('background-color', `${d.Doping ? DOT_COLORS.doping : DOT_COLORS.noDoping}`)
                .style('left', `${event.pageX + 30}px`)
                .style('top', `${event.pageY}px`);
        })
        .on('mouseout', () => {
            div.style('opacity', 0);
        });

    // legend
    let legendContainer = svg
        .append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${WIDTH - MARGINS.RIGHT},${HEIGHT / 2 - MARGINS.BOTTOM})`)

    // labels 
    createLabel(legendContainer, DOT_COLORS.doping, 'Doping allegations');
    createLabel(legendContainer, DOT_COLORS.noDoping, 'No Doping allegations', 0, 30);

    // footer with informations

    d3.select('#dataviz')
        .append('div')
        .attr('id', 'footer')
        .append('div')
        .attr('class', 'info')
        .text(`*Data source ${DATA_URL}`);

});

function createLabel(legendContainer, legendColor, legendText, tx = 0, ty = 0) {
    let noDopingLabel = legendContainer
        .append('g')
        .attr('class', 'legend-label')
        .attr('transform', `translate(${tx}, ${ty})`);

    noDopingLabel
        .append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', legendColor);

    noDopingLabel
        .append('text')
        .attr('x', -10)
        .attr('y', 14)
        .style('text-anchor', 'end')
        .text(`${legendText}`);
}