const width = 1024;
const height = 768;
const margins = { top: 20, left: 80, bottom: 50, right: 190 };

const dataMap = new Map()
dataMap.set('videogames', {
    id: 'videogames',
    title: 'Video Game Sales',
    description: 'Top 100 Most Sold Video Games Grouped by Platform',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
});
dataMap.set('movies', {
    id: 'movies',
    title: 'Movies',
    description: 'Top 100 Highest Grossing Movies Grouped By Genre',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
});
dataMap.set('kickstarter', {
    title: 'Kickstarter',
    description: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
});

// determine dataset
const params = new URLSearchParams(window.location.search);
const defaultDataSet = 'videogames';
const selectedDataset = params.get('data') || defaultDataSet;
const currentDataSet = dataMap.get(selectedDataset);

// set title and description based on selected dataset
document.getElementById('title').innerHTML = currentDataSet.title;
document.getElementById('description').innerHTML = currentDataSet.description;

// tooltip
const div = d3
    .select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip')
    .style('opacity', 0);

// canvas
const svg = d3.select("#dataviz")
    .append("svg")
    .attr('width', width + margins.right)
    .attr('height', height);

// data handling
d3.json(currentDataSet.url).then((data) => {

    const root = d3.hierarchy(data).sum((d) => { return d.value }).sort((a, b) => {
        return b.height - a.height || b.value - a.value;
    });

    const categories = root.data.children;

    const colorPalette = generateColorPalette(categories);

    d3.treemap()
        .size([width, height])
        .padding(3)
        (root);

    const tiles = svg
        .attr('id', 'data-tiles')
        .selectAll('rect')
        .data(root.leaves())
        .enter()
        .append('g');

    tiles.append('rect')
        .attr('class', 'tile')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .style('stroke', "black")
        .style('fill', d => colorPalette.get(d.parent.data.name))
        .on('mouseover', (event, d) => {
            div.style('opacity', 0.9);
            div
                .attr('data-value', d.data.value)
                .html(`${d.data.name}<br/>${d.data.category}<br/>${d.data.value}`)
                .style('background-color', 'grey')
                .style('left', `${event.pageX + 30}px`)
                .style('top', `${event.pageY}px`);
        })
        .on('mouseout', () => {
            div.style('opacity', 0);
        });

    tiles
        .append("text")
        .style('text-anchor', 'start')
        .attr("class", "data-tile")
        .selectAll('tspan')
        .data((d) => {
            const nameItems = d.data.name.split(' ');
            const dx = d.x0;
            const dy = d.y0;

            return nameItems.map((n) => { return { name: n, x: dx, y: dy } });
        })
        .enter()
        .append('tspan')
        .attr("class", "data-tiles-text")
        .attr("x", d => d.x + 5)
        .attr("y", (d, i) => { return d.y + 15 + i * 10 })
        .text(d => d.name);

    // legend
    const legend = svg
        .append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${width + 25}, 10)`)
        .style('background-color', 'grey')
        .selectAll('rect')
        .data(categories)
        .enter();

    legend.append('rect')
        .attr('class', 'legend-item')
        .attr('x', 0)
        .attr('y', (_d, i) => i * 25)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', d => colorPalette.get(d.name));

    legend
        .append('text')
        .attr('x', 30)
        .attr('y', (_d, i) => 15 + i * 25)
        .attr('class', 'legend-item-text')
        .text(d => d.name);


});

// footer info
const info = d3
    .select('#info')
    .html(`Data source: <a href="${currentDataSet.url}" target="_blank">${currentDataSet.url}</a>`);


function generateColorPalette(categories) {
    let colorMap = new Map()
    let colors = chroma.scale(['#58508d', '#bc5090', '#ff6361', '#ffa600']).mode('rgb').colors(categories.length)

    for (let i = 0; i < categories.length; i++) {
        colorMap.set(categories[i].name, colors[i]);
    }

    return colorMap;
}
