const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const width = 1200;
const height = 480;
const margins = { top: 20, left: 80, bottom: 100, right: 75 };
const months = [...Array(12).keys()];
const temperatureFieldColor = [
    d3.schemeBlues[6][0], 
    d3.schemeBlues[6][1], 
    d3.schemeBlues[6][2],
    d3.schemeBlues[6][3],
    d3.schemeBlues[6][4],
    d3.schemeBlues[6][5],
    d3.schemeOranges[6][0],
    d3.schemeOranges[6][1],
    d3.schemeOranges[6][2],
    d3.schemeOranges[6][3],
    d3.schemeOranges[6][4]
];

const svg = d3.select("#dataviz")
    .append("svg")
    .attr('width', width + margins.left + margins.right)
    .attr('height', height + margins.top + margins.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margins.left + "," + margins.top + ")");

const div = d3
    .select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip')
    .style('opacity', 0);

d3.json(dataUrl).then(data => {
    // normalize months to fit months array items
    data.monthlyVariance.forEach((item) => {
        item.month -= 1;
    });

    // x-axis
    const x = d3.scaleLinear().range([0, width]);

    x.domain([
        d3.min(data.monthlyVariance, (d) => { return d.year - 1; }),
        d3.max(data.monthlyVariance, (d) => { return d.year + 1; })
    ]);

    const xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));
    svg
        .append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);


    // y-axis
    const y = d3.scaleBand().domain(months).rangeRound([0, height]);
    const yAxis = d3.axisLeft(y).scale(y).tickValues(y.domain()).tickFormat((month) => {
        const date = new Date(0);
        date.setUTCMonth(month);
        const format = d3.timeFormat('%B');
        return format(date);
    });

    svg
        .append('g')
        .attr('id', 'y-axis')
        .call(yAxis);

    // data
    svg
        .append('g')
        .selectAll('rect')
        .data(data.monthlyVariance)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('data-month', (d) => {
            return d.month;
        })
        .attr('data-year', (d) => {
            return d.year;
        })
        .attr('data-temp', (d) => {
            return data.baseTemperature + d.variance;
        })
        .attr('x', d => x(d.year))
        .attr('y', d => y(d.month))
        .attr('width', d => 5)
        .attr('height', d => height / 12)
        .attr('fill', (d) => {
            return temperatureColor(data.baseTemperature + d.variance);
        })
        .on('mouseover', (event, d) => {
            const date = new Date(d.year, d.month);
            div.style('opacity', 1);
            div.attr('data-year', d.Year);
            div.html(`${d3.timeFormat('%Y - %B')(date)}<br />${d3.format('.1f')(data.baseTemperature + d.variance)}<br />${d3.format('+.1f')(d.variance)}`)
                .style('left', `${event.pageX + 30}px`)
                .style('top', `${event.pageY}px`);
            div.attr('data-year', d.year);
        })
        .on('mouseout', () => {
            div.style('opacity', 0);
        });

    // legend
    svg
        .append('g')
        .attr('id', 'legend')
        .style('background-color', 'blue')
        .append('g')
        .selectAll('rect')
        .data(temperatureFieldColor)
        .enter()
        .append('rect')
        .attr('x', (d, i) => i*20)
        .attr('y', height + 50)
        .attr('width', d => 20)
        .attr('height', d => 20)
        .attr('fill', (d) => { return d;})
        ;

    const temperatureLimits = ["2.0", "3.0", "4.0", "5.0", "6.0", "7.0", "8.0", "9.0", "10.0", "11.0", "12.0"]
    const xlegend = d3.scaleBand().domain(temperatureLimits).rangeRound([0, 20 * 11]);
    const xAxisLegend = d3.axisBottom(xlegend)
    svg
        .append('g')
        .attr('id', 'x-axis-legend')
        .attr('transform', `translate(0,${height + 70})`)
        .call(xAxisLegend);
    


    // footer 
    d3.select('#dataviz')
        .append('div')
        .attr('id', 'footer')
        .append('div')
        .attr('class', 'info')
        .text(`*Data source ${dataUrl}`);
       
});

/**
 * base temperature + variance goes from 2.8 upt to 12.8
 * @param {*} temperature 
 */
function temperatureColor(temperature) {
    let color;
    switch (true) {
        case temperature < 2.0: color = temperatureFieldColor[0]; break;
        case temperature < 3.0: color = temperatureFieldColor[1]; break;
        case temperature < 4.0: color = temperatureFieldColor[2]; break;
        case temperature < 5.0: color = temperatureFieldColor[3]; break;
        case temperature < 6.0: color = temperatureFieldColor[4]; break;
        case temperature < 7.0: color = temperatureFieldColor[5]; break;
        case temperature < 8.0: color = temperatureFieldColor[6]; break;
        case temperature < 9.0: color = temperatureFieldColor[7]; break;
        case temperature < 10.0: color = temperatureFieldColor[8]; break;
        case temperature < 11.0: color = temperatureFieldColor[9]; break;
        default:
            color = temperatureFieldColor[10]
    }
    return color;
}
