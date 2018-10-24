// <!-- ================================= -->
// <!-- DISPLAYING ACCURACY -->
// <!-- ================================= -->
var training_form = document.querySelector('.training_form');

training_form.addEventListener('submit', function (e) {

	e.preventDefault();

	var C_Parameter = e.target[0].value
	console.log(C_Parameter)

	training_result = document.getElementById('firstResult')
	var x = new XMLHttpRequest()
	x.onreadystatechange = function () {
		if (x.readyState == 4 && x.status == 200) {
			training_result.outerHTML = x.responseText;
			// console.log(x.responseText);
		};
	};

	x.open("POST", "/train", true);
	x.send(C_Parameter);
});

// <!-- ================================= -->
// <!-- CHARTING RESULTS -->
// <!-- ================================= -->
var form = document.getElementById('prediction_form');

form.addEventListener('submit', function (e) {
	e.preventDefault();

	var sepalLength = e.target[0].value
	var sepalWidth = e.target[1].value
	var petalLength = e.target[2].value
	var petalWidth = e.target[3].value

	console.log(sepalLength, sepalWidth, petalLength, petalWidth)

	el = document.getElementById("secondResult");
	var xhr = new XMLHttpRequest()
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {

			// <!-- ================================= -->
			// Assign text response from server to el 
			// This would be useful if I want to display the results 
			// as element on my page. Since I am displaying results
			// as a PIE charts, there is no use for it.
			// Leaving it here as notes.
			// <!-- ================================= -->
			// el.innerHTML = xhr.responseText;

			// Parse JSON response from server and passing it to drawChart
			let dataset = JSON.parse(xhr.responseText);
			drawChart(dataset);
		};
	};

	xhr.open("POST", "/predict", true)
	xhr.send(JSON.stringify({
		sepalLength: sepalLength,
		sepalWidth: sepalWidth,
		petalLength: petalLength,
		petalWidth: petalWidth
	}));
});

// <!-- ================================= -->
// <!-- PIE CHART --> https://codepen.io/anon/pen/qJMJyL
// <!-- ================================= -->

const drawChart = function (dataset) {
	
	// DATASET
	// console.log(dataset);

	// chart dimensions
	var width = 1200;
	var height = 800;

	// a circle chart needs a radius
	var radius = Math.min(width, height) / 2;

	// Legend Dimensions
	var legendRectSize = 25; // defines the size of the colored squares in legend
	var legendSpacing = 6; // defines spacing between squares

	// define color scale
	var color = d3.scaleOrdinal(d3.schemePastel2);
	// https://npm.runkit.com/d3-scale-chromatic

	var svg = d3.select('#chart') // select element in the DOM with id 'chart'
		.append('svg') // append an svg element to the element we have selected
		.attr('width', width) // set the width of svg element we just added
		.attr('height', height) // set the height of svg element we just added
		.append('g') // append 'g' element to the svg element
		.attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')'); // our reference is now to the 'g' element. Centering the 'g' element to the svg element

	var arc = d3.arc()
		.innerRadius(0) // none for pie chart
		.outerRadius(radius); // size of overall chart

	var pie = d3.pie()  // start and end angles of segments
		.value(function (d) {
			return d.value; // How to extract numerical data from each entry in our dataset
		})
		.sort(null) // by default, data sorts in ascending order which mess with our animation so we set it to null

	// define tooltip
	var tooltip = d3.select('#chart') // select element in the DOM with id 'chart'
		.append('div') // append a div element ot the element we have selected
		.attr('class', 'tooltip') // add class 'tooltip' on the divs we have just selected

	tooltip.append('div') // add divs to the the tooltip defined above
		.attr('class', 'name'); // add class 'name' on the selection

	tooltip.append('div')  // add divs to the tooltip define above
		.attr('class', 'value'); // add class 'name' on the selection

	// <div id="chart">
	//   <div class="tooltip">
	//     <div class="name">
	//     </div>
	//     <div class="value">
	//     </div>
	//   </div>
	// </div>

	// creating the chart
	var path = svg.selectAll('path') // select all path elements inside the svg. specifically the 'g' element. they don't exist yet but they will be created below
		.data(pie(dataset)) //associate dataset wit he path elements we're about to create. must pass through the pie function. it magically knows how to extract values and bakes it into the pie
		.enter() //creates placeholder nodes for each of the values
		.append('path') // replace placeholders with path elements
		.attr('d', arc) // define d attribute with arc function above
		.attr('fill', function (d) { return color(d.data.name); }) // use color scale to define fill of each name in dataset
		.each(function (d) { this._current - d; }) // creates a smooth animation for each track

	// mouse event handlers are attached to path so they need to come after its definition
	path.on('mouseover', function (d) {
		tooltip.select('.name').html(d.data.name); // set current name
		tooltip.select('.value').html(d.data.value + '%'); // set current value
		tooltip.style('display', 'block'); // set display
	});

	// When mouse leave div
	path.on('mouseout', function () {
		tooltip.style('display', 'none');
	});

	// When mouse moves
	path.on('mousemove', function (d) {
		tooltip.style('top', (d3.event.layerY + 10) + 'px') // always 10px below the cursor
			.style('left', (d3.event.layerX + 10) + 'px'); // always 10 px to the right of the mouse
	});

	// Defining legend
	var legend = svg.selectAll('.legend')  // selecting elements with class 'legend'
		.data(color.domain()) // refers to an array of names from our dataset
		.enter() // create placeholder
		.append('g') // replaces placeholders with g elements
		.attr('class', 'legend') // each g is given a legend class
		.attr('transform', function (d, i) {
			var height = legendRectSize + legendSpacing; // height of element is the height of colored square plus spacing
			var offset = height * color.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements
			var horz = 18 * legendRectSize; // the legend is shifted to the left to make room for the text
			var vert = i * height - offset; // the top of the element is shifted up or down from the center using the offset defiend earlier and the index of the current element 'i' 
			return 'translate(' + horz + ',' + vert + ')'; //return translation
		});

	// Adding the colored squares next to legend
	legend.append('rect')
		.attr('width', legendRectSize)
		.attr('height', legendRectSize)
		.style('fill', color) // each fill is passed a color
		.style('stroke', color);

	// Adding text to legend
	legend.append('text')
		.attr('x', legendRectSize + legendSpacing)
		.attr('y', legendRectSize - legendSpacing)
		.text(function (d) { return d; });
};


