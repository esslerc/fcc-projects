const DATA_URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';
const WIDTH = 800;
const HEIGHT = 480;
const BAR_WIDTH = WIDTH / 265;
const MARGINS = { TOP: 20, LEFT: 50, BOTTOM: 50, RIGHT: 75 };

let svg = d3
    .select('.chartPlaceholder')
    .append('svg')
    .attr('width', WIDTH + MARGINS.LEFT + MARGINS.RIGHT)
    .attr('height', HEIGHT + MARGINS.TOP + MARGINS.BOTTOM);

d3.json(DATA_URL).then(jsonContent => {
    let title = jsonContent.source_name;
    let description = jsonContent.description;
    let lastUpdated = jsonContent.updated_at;

    // 1. data loading and transformation
    let xAxisDates = []
    let rawxAxisDate = []
    let gdp = []

    jsonContent.data.forEach((item, index) => {
        xAxisDates[index] = new Date(item[0]);
        rawxAxisDate[index] = item[0]
        gdp[index] = item[1];
    });

    var gdpMax = d3.max(gdp);
    var linearScale = d3.scaleLinear().domain([0, gdpMax]).range([0, HEIGHT]);

    var yAxisScaledGDP = gdp.map((item) => { return linearScale(item); });

    // 2. UI
    // 2.1 xAxis
    let xAxisMaxDate = new Date(d3.max(xAxisDates));

    xAxisMaxDate.setMonth(xAxisMaxDate.getMonth() + 3);

    let xScale = d3
        .scaleTime()
        .domain([d3.min(xAxisDates), xAxisMaxDate])
        .range([0, WIDTH]);

    let xAxis = d3.axisBottom().scale(xScale);

    svg
        .append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(100, 510)');


    // 2.2 yAxis
    let yAxisScale = d3.scaleLinear().domain([0, gdpMax]).range([HEIGHT, 0]);

    let yAxis = d3.axisLeft(yAxisScale);

    svg
        .append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(80, 20)');

    // 3. data
    svg
        .selectAll('rect')
        .data(yAxisScaledGDP)
        .enter()
        .append('rect')
        .attr('data-date', (d, i) => {
            return rawxAxisDate[i];
        })
        .attr('data-gdp', (d, i) => {
            return gdp[i];
        })
        .attr('class', 'bar')
        .attr('x', (d, i) => xScale(xAxisDates[i]) + 2 * MARGINS.LEFT)
        .attr('y', (d, i) => MARGINS.TOP + HEIGHT - d)
        .attr('width', BAR_WIDTH)
        .attr('height', (d) => d)
        .attr('index', (d, i) => i)

    // 4. Misc
    d3.select('#title').text(title);

    let footer = d3.select('.chartPlaceholder')
        .append('div')
        .attr('id', 'footer')

    footer
        .append('div')
        .attr('class', 'info')
        .html(description.replace(/(?:\r\n|\r|\n)/g, '<br>'));

    footer
        .append('div')
        .attr('class', 'info')
        .text(`Last update at ${lastUpdated}`)

    footer
        .append('div')
        .attr('class', 'info')
        .text(`**Data source ${DATA_URL}`);

    svg
        .append('text')
        .attr('transform', `translate(100, ${HEIGHT / 2 + 10}), rotate(-90)`)
        .text('GDP');



    // 5. Tooltip
    let tooltip = d3
        .select('.chartPlaceholder')
        .append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0);

    let overlay = d3
        .select('.chartPlaceholder')
        .append('div')
        .attr('class', 'overlay')
        .style('opacity', 0);

    svg
        .selectAll('rect')
        .on('mouseover', (event, h) => {
            let i = event.target.getAttribute('index');
            overlay
                .transition()
                .duration(0)
                .style('height', h + 'px')
                .style('width', BAR_WIDTH + 'px')
                .style('opacity', 0.9)
                .style('left', i * BAR_WIDTH + 0 + 'px')
                .style('top', HEIGHT - h + 'px')
                .style('transform', 'translateX(60px)');

            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip
                .html(
                    rawxAxisDate[i] +
                    '<br>' +
                    '$' +
                    gdp[i] +
                    ' Billion'
                )
                .attr('data-date', rawxAxisDate[i])
                .style('left', i * BAR_WIDTH + 30 + 'px')
                .style('top', HEIGHT - 100 + 'px')
                .style('transform', 'translateX(60px)');
        })
        .on('mouseout', function () {
            tooltip.transition().duration(200).style('opacity', 0);
            overlay.transition().duration(200).style('opacity', 0);
        });
});