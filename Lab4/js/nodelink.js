var width = 500, height = 600;


function updateData() {

    //get the value of the selected episode
    const episode1 = document.getElementsByName('type')[0].value;
    const episode2 = document.getElementsByName('type2')[0].value;

    //change the text of the selected episode
    changeTextEpisode(document.getElementsByName('type')[0]);
    changeTextEpisode2(document.getElementsByName('type2')[0]);

    //fetch the data of the selected episode
    Promise.all([
        fetch(episode1).then(response => response.json()),
        fetch(episode2).then(response => response.json())
    ])
    .then(([data1, data2]) => {
    var nodes1 = data1.nodes;
    var links1 = data1.links;
    var nodes2 = data2.nodes;
    var links2 = data2.links;

    // Reset and initialize simulations with new data
    resetSimulation('.nodes', '.links');
    resetSimulation('.nodes2', '.links2');

    const simulation2 = createSimulation(nodes2, links2, '.nodes2', '.links2');
    const simulation1 = createSimulation(nodes1, links1, '.nodes', '.links');
    
    //update the slider max value based on the new data
    updateSliderMaxValue2(nodes1, nodes2);

    updateSliderValue();
    updateSliderValue2();
    });
}

function resetSimulation(nodesSelector, linksSelector) {
    // Remove all nodes and links from the graph
    d3.selectAll(nodesSelector + ' circle').remove();
    d3.selectAll(linksSelector + ' line').remove();
}

function updateSliderValue2(){
    //update the slider value
    var slider2 = document.getElementById("slider2Left");
    var displayElement2 = document.getElementById("sliderVal2");
    displayElement2.innerText = "Threshold: " + slider2.value;
}

function updateSliderValue(){
    //update the slider value
    var slider1 = document.getElementById("slider1Left");
    var displayElement1 = document.getElementById("sliderVal");
    displayElement1.innerText = "Threshold: " + slider1.value;
}


function updateSliderMaxValue(connectedNodesValues) {
    //find the largest value of the connected nodes and set the max value of the slider to that value
    var maxValue = Math.max(...connectedNodesValues);
    var slider = document.getElementById("slider1Left"); 
    slider.max = maxValue;


}

function updateSliderMaxValue2(nodes, nodes2) { 
    //find the largest d.value of both datasets
    var dValue = Math.max(...nodes.map(d => d.value));
    var dValue2 = Math.max(...nodes2.map(d => d.value));

    //set the max value of the slider to the largest value of the two datasets
    var maxValue2 = dValue > dValue2 ? dValue : dValue2;
    var slider2 = document.getElementById("slider2Left"); 
    slider2.max = maxValue2;
}


function changeTextEpisode(episode){
    //change the text of the selected episode
    const selectedOptionText1 = episode.options[episode.selectedIndex].text;

    document.getElementById('selectedEpisode').textContent =  selectedOptionText1;

}
function changeTextEpisode2(episode){
    const selectedOptionText1 = episode.options[episode.selectedIndex].text;

    document.getElementById('selectedEpisode2').textContent =  selectedOptionText1;
}


    function createSimulation(nodes, links, nodesSelector, linksSelector) {

        var simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(-100))
            .force('center', d3.forceCenter(width/1.4, height / 2.1))
            .force('link', d3.forceLink().links(links))
            .on('tick', ticked);

        let selectedNodeData = null;
        

        function updateNodes() {
            var u = d3.select(nodesSelector)
                .selectAll('circle')
                .data(nodes); 
        
            u.exit().remove(); // Remove old nodes

            sliderNodes();
    
            u = u.enter()
                .append('circle')
                .merge(u)
                .attr('r', d => Math.sqrt(d.value) + 3)
                .attr('fill', d => d.colour)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .call(d3.drag()
                    .on('start', dragStarted)
                    .on('drag', dragged)
                    .on('end', dragEnded)
                )
                .on('mouseover', mouseHover)
                .on('mouseout', mouseOut)
                .on('click', selectedNode)
                .attr('stroke', d => selectedNodeData && d === selectedNodeData ? 'red' : '#999') // Highlight selected node
                .attr('stroke-width', d => selectedNodeData && d === selectedNodeData ? 2 : 0); 
                
        }

        function updateLinks() {

            var threshold= sliders();

            var u = d3.select(linksSelector)
                .selectAll('line')
                .data(links); 
        
            u.exit().remove(); // Remove old links
 
            u = u.enter()
                .append('line')
                .merge(u)
                .attr('stroke', d => selectedNodeData && (d.source === selectedNodeData || d.target === selectedNodeData) && sliderThreshold(d, threshold) ? 'red' : '#999')
                .attr('stroke-opacity', 0.5)
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y)
                .attr('stroke-width', d => selectedNodeData && (d.source === selectedNodeData || d.target === selectedNodeData) ? 3 : 1);  
                
        }

        function ticked() {

            updateNodes();
            updateLinks();

            const nodeRadius = 5;   // Minimum distance from the edge of the graph
        
            // Update node positions
            d3.selectAll('circle')
                .attr('cx', function(d) { return d.x = Math.max(nodeRadius, Math.min(width+125, d.x)); })
                .attr('cy', function(d) { return d.y = Math.max(nodeRadius, Math.min(height - nodeRadius-50, d.y)); });
        
            // Update link positions to follow nodes
            d3.selectAll('line')
                .attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });

        }

        function dragStarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragEnded(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        function mouseHover(event, d) {
            //display the name of the node when hovering over it with the mouse, but only change the name correspornding to the graph the node is in
            if (nodesSelector === '.nodes'){
                d3.select(".hoverName").html(d.name);
            } else {
                d3.select(".hoverName2").html(d.name);
            }

            //change the size of node when hovering over it with the mouse
                d3.select(this).transition().duration(100).attr('r',18 );
        }

        function mouseOut(event, d) {
            
            //remove the name of the node when leaving it with the mouse
            d3.select(".hoverName").html("");
            d3.select(".hoverName2").html("");

            //change the size of node when leaving it with the mouse
            d3.select(this).transition().duration(100).attr('r', d => Math.sqrt(d.value)+3);
        }

        function selectedNode(event, d) {
            resetHighlight();
            selectedNodeData = d;
        
            updateNodes(); // Update nodes with new selection
            updateLinks(); // Update links with new selection
        
            compare(d);

            //find the connected nodes and links of the selected node
            var connectedNodes = links.filter(link => link.source === d || link.target === d).map(link => link.source === d ? link.target : link.source);
            var connectedLinks = links.filter(link => link.source === d || link.target === d);
            
            //find the names and link-values of the connected nodes and store in array
            var connectedNodesNames = connectedNodes.map(node => node.name);
            var connectedNodesValues = connectedLinks.map(link => link.value);

            
            //add connectedNodesNames and connectedNodesValues to one array and sort from high to low values
            var connectedNodesValuesAndNames = connectedNodesNames.map((name, i) => ({name, value: connectedNodesValues[i]})).sort((a, b) => b.value - a.value);

            //update the max value of the slider based on the connected nodes
            updateSliderMaxValue(connectedNodesValues);

            //display the name, interactions and connected nodes of the selected node
            d3.select(".infoName").html(d.name);
            d3.select(".infoInteractions").html(d.value);
            d3.select(".infoConnected").html(connectedNodesValuesAndNames.map(node => node.name + " (" + node.value + ")").join('<br>'));

            updateSliderValue();
            updateSliderValue2();

        }

        function resetHighlight() {
            // Reset the selected node and remove all highlights
            selectedNodeData = null;
            d3.selectAll("circle").attr('stroke', '#999').attr('stroke-width', 0);
            d3.selectAll('line').attr('stroke-width', 1).attr('stroke', '#999');
            d3.select(".infoName").html("");
            d3.select(".infoInteractions").html("");
            d3.select(".infoConnected").html("");
            d3.select(".hoverName").html("");
            d3.select(".hoverName2").html("");
        }

        function compare(d){
            var threshold= sliders();
            // Highlight the corresponding node in the other graph (nodes2)
            var comparisonNode2 = d3.select('.nodes2').selectAll('circle').filter(node => node.name === d.name);
            comparisonNode2.attr('stroke', 'red').attr('stroke-width', 2);

            // Highlight the corresponding node in the other graph (nodes1)
            var comparisonNode1 = d3.select('.nodes').selectAll('circle').filter(node => node.name === d.name);
            comparisonNode1.attr('stroke', 'red').attr('stroke-width', 2);
            
            // Highlight the corresponding links in the other graph (links2)
            var comparisonLink2 = d3.select('.links2').selectAll('line').filter(link => link.source.name === d.name || link.target.name === d.name);
            comparisonLink2.attr('stroke', d => sliderThreshold(d, threshold) ? 'red' : '#999').attr('stroke-width', 3); // Highlight selected links
            
            // Highlight the corresponding links in the other graph (links1)
            var comparisonLink1 = d3.select('.links').selectAll('line').filter(link => (link.source.name === d.name || link.target.name === d.name));
            comparisonLink1.attr('stroke',  d => sliderThreshold(d, threshold) ? 'red' : '#999').attr('stroke-width', 3); // Highlight selected links

        }

        function sliders() {
            
            var slider1 = document.getElementById("slider1Left");

            var threshold = slider1.value;
            //update the slider value on input
            slider1.oninput = function() {
                threshold = this.value;

                compare(selectedNodeData);

                updateLinks();
                updateSliderValue();
            }
            return threshold;
        }

        function sliderNodes(){
           //update the slider value
            var slider2 = document.getElementById("slider2Left");
            var thresholdNode = slider2.value;

            //update the slider value on input on input
            slider2.oninput = function() {
                thresholdNode = this.value;

                //update the display of the nodes based on the threshold (remove or add nodes based on the threshold value)
                d3.select('.nodes2').selectAll('circle').attr('display', d => d.value >= thresholdNode ? 'block' : 'none');

                d3.select('.nodes').selectAll('circle').attr('display', d => d.value >= thresholdNode ? 'block' : 'none');

                //remove the links based on what nodes are removed
                d3.select('.links2').selectAll('line').attr('display', d => d.source.value >= thresholdNode && d.target.value >= thresholdNode ? 'block' : 'none');
                d3.select('.links').selectAll('line').attr('display', d => d.source.value >= thresholdNode && d.target.value >= thresholdNode ? 'block' : 'none');
                updateSliderValue2();

                
            }

        }

        function sliderThreshold(d, threshold) {
            //check if the link value is higher than the threshold
            if (d.value >= threshold) {
                return true;
            }
            else {
                return false;
            }
        }

    }