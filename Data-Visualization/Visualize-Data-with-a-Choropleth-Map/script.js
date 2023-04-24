const width = 900;
const height = 600;
const margins = { top: 20, left: 80, bottom: 100, right: 190 };

const usCountyDataUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
const usEducationDataUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

// canvas
const svg = d3.select("#dataviz")
    .append("svg")
    .attr('width', width + margins.right)
    .attr('height', height);

// map colors
const thresholdColors = [
    d3.schemeGreens[6][0],
    d3.schemeGreens[6][1],
    d3.schemeGreens[6][2],
    d3.schemeGreens[6][3],
    d3.schemeGreens[6][4]
];
// tooltip
const div = d3
    .select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip')
    .style('opacity', 0);


// data processing
d3.json(usCountyDataUrl).then((data) => {
    const countyData = topojson.feature(data, data.objects.counties).features;

    d3.json(usEducationDataUrl).then((educationData) => {
        svg.selectAll('path').data(countyData)
            .enter()
            .append('path')
            .attr('d', d3.geoPath())
            .attr('class', 'county')
            .attr('fill', (countyDataItem) => {
                const id = countyDataItem['id']
                const county = educationData.find((item) => {
                    return item['fips'] === id;
                });
                const percentage = county['bachelorsOrHigher'];
                if(percentage < 15) { return thresholdColors[0]; }
                else if(percentage < 30) { return thresholdColors[1];} 
                else if(percentage < 45) { return thresholdColors[2];} 
                else if(percentage < 60) { return thresholdColors[3];} 
                return thresholdColors[4]; 
            })
            .attr('data-fips', (countyDataItem) => {
                return countyDataItem['id']
            })
            .attr('data-education', (countyDataItem) => {
                const id = countyDataItem['id']
                const county = educationData.find((item) => {
                    return item['fips'] === id;
                });
                const percentage = county['bachelorsOrHigher'];
                return percentage;
            })
            .on('mouseover', (event, countyDataItem) => {
                const id = countyDataItem['id']
                const countyData = educationData.find((item) => {
                    return item['fips'] === id;
                });
                const areaName = countyData['area_name'];
                const state = countyData['state'];
                const percentage = countyData['bachelorsOrHigher'];


                div.style('opacity', 1);
                div.attr('data-education', percentage);
                div.html(` ${areaName}, ${state}<br />${percentage}%`)
                    .style('left', `${event.pageX + 30}px`)
                    .style('top', `${event.pageY}px`);
            })
            .on('mouseout', () => {
                div.style('opacity', 0);
            });

        // legend
        const legend = svg
            .append('g')
            .attr('id', 'legend')
            .selectAll('rect')
            .data(thresholdColors)
            .enter()
            .append('g');

        legend
            .append('rect')
            .attr('x', (d, i) => width + 60)
            .attr('y', (d, i) => i * 20)
            .attr('width', d => 20)
            .attr('height', d => 20)
            .attr('fill', (d) => { return d; });

        legend.append('text')
            .attr('x', (d, i) => width + 90)
            .attr('y', (d, i) => 15 + (i * 20))
            .text((d, i) => {
                if(i=== 0) { return '< 15%'; }
                else if(i === 1 ) { return '< 30%';} 
                else if(i === 2 ) { return '< 45%';} 
                else if(i === 3 ) { return '< 60%';} 
                else return '< 100%';
            });
    });
});

// footer 
const footer = d3.select('#dataviz')
    .append('div')
    .attr('id', 'footer');

footer.append('div')
    .attr('class', 'info')
    .text(`*County data source ${usCountyDataUrl}`);

footer.append('div')
    .attr('class', 'info')
    .text(`*Education data source ${usEducationDataUrl}`);
