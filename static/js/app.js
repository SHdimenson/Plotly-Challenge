// select dropdown field
var dropDown = d3.selectAll("#selDataset");

// capture data
d3.json("data/samples.json").then((data) => {
    // store samples object
    samples = data.samples
    // store test subject metadata object
    metaData = data.metadata
    // call funciton to populate dropdown list
    fillDropDown(samples)
})

// function to add test subject IDs to drodown list
function fillDropDown (rows) {
    rows.forEach((row) => {
        //add option slot
        var option = dropDown.append("option");
        //add subject ID value to slop
        option.text(row.id);
    })
    //call function to create plots
    createPlots();
}

//event listener for changes to dropdown selector
dropDown.on("change", createPlots);

// function to PLOT the plots
function createPlots() {
    // Prevent the page from refreshing
    //d3.event.preventDefault();

    // set the target subject ID as the selected value
    targetID = dropDown.property("value");
    // find id in samples datalist and store row
    var targetRow = samples.filter(row => row.id === targetID)
    // store values array
    var sample_values = targetRow[0].sample_values
    //store OTU IDs array
    var otu_ids = (targetRow[0].otu_ids).map(id => "OTU "+ id)
    // store OTU labels array
    var otu_labels = targetRow[0].otu_labels

    // PLOTTING BAR CHART
    // store top 10 values, IDs and labels
    var top10Values = sample_values.slice(0,10);
    var top10IDs = otu_ids.slice(0,10);
    var top10Labels = otu_labels.slice(0,10)
    // create trace
    var barTrace = {
        y: top10IDs,
        x: top10Values,
        type: "bar",
        orientation: "h",
        text: top10Labels
    }
    barData = [barTrace]
    // create layout
    var barLayout = {
        title: {
            text: "Top 10 OTUs",
            font: {size: 25}
        },
        yaxis:{
            autorange:'reversed'
        }
    }
    // generate plot
    Plotly.newPlot("bar",barData,barLayout)

    // PLOT BUBBLE CHART
    // store marker size array from values
    var markerSizes = sample_values.map(value => value)
    // store array of OTU IDs
    var otu_ids = targetRow[0].otu_ids
    // create trace
    var bubbleTrace = {
        x: otu_ids,
        y: sample_values,
        mode: 'markers',
        text: otu_labels,
        marker: {
          color: otu_ids,
          size: markerSizes
        }
      };
    var bubbleData = [bubbleTrace]
    // create layout
    var bubbleLayout = {
        title: {
            text: "OTU Population",
            font: {size: 25}
        },
        xaxis: {title: {text: "OTU ID"}}
    }
    // generate plot
    Plotly.newPlot("bubble",bubbleData,bubbleLayout)

    // DEMOGRAPHICS INFO
    // find data row that matches selected id
    var targetMetaDataRow = metaData.filter(metaRow => metaRow.id === parseInt(targetID))
    
    // display key-value pairs
    // create placeholder var for key-value pairs
    var keysValues = []
    // add each key-value pair to array
    Object.entries(targetMetaDataRow[0]).forEach(([key, value]) => {
        keysValues.push(`${key}: ${value}<br>`)
    })
    // create placeholder var for iterating html code
    var elementHTML = ""
    // repace existing code with blank
    d3.select("#sample-metadata").html(elementHTML)
    // add each value of the key-value array to html code
    for (i=0;i<keysValues.length;i++) {
        elementHTML = d3.select("#sample-metadata").html()
        d3.select("#sample-metadata").html(
            elementHTML + keysValues[i]
        )
    }
    
    //PLOTING GAUGE CHART
    // build guage trace
    var data = [{
        domain: {x: [0, 1], y: [0, 1]},
		value: targetMetaDataRow[0].wfreq,
		title: {text: "Scrubs per Week"},
		type: "indicator",
        mode: "gauge",        
        gauge: {
            axis: {
                range: [null, 9],
                showticklabels: true,
                ticks: "inside",
                tickmode: "array",
                tickvals: [0,1,2,3,4,5,6,7,8,9],
                ticktext: [0,1,2,3,4,5,6,7,8,9]
            },    
            bar: {thickness: 0},
            steps:[
                {range:[0,1], color: "rgb(255,255,255)"},
                {range:[1,2], color: "rgb(225,255,225)"},
                {range:[2,3], color: "rgb(200,255,200)"},
                {range:[3,4], color: "rgb(175,255,175)"},
                {range:[4,5], color: "rgb(150,255,150)"},
                {range:[5,6], color: "rgb(125,255,125)"},
                {range:[6,7], color: "rgb(100,255,100)"},
                {range:[7,8], color: "rgb(75,255,75)"},
                {range:[8,9], color: "rgb(50,255,50)"}
            ]
        }    
    }]

    //Indicator needle drawing trigonometry
    // Angle of needle caculation based on wash frequency
    var degrees = ((targetMetaDataRow[0].wfreq/9)*180), radius = .4;
    // calculate needle ending coordinates
    switch (true) {
        case (degrees<90):
            var radians = degrees * Math.PI / 180;
            var y = radius * Math.sin(radians)
            var x = Math.sqrt((Math.pow(radius,2)-Math.pow(y,2)))
            var y1 = .25+y
            var x1 = .5-x
            break;
        case (degrees>90):
            var radians = (180-degrees) * Math.PI / 180;
            var y = radius * Math.sin(radians)
            var x = Math.sqrt((Math.pow(radius,2)-Math.pow(y,2)))
            var y1 = .25+y
            var x1 = .5+x
            break;
    }
    
    // bulding gauge layout
    var gaugeLayout = {
        shapes: [{
          // draw needle base circle
          type: 'circle',
          x0: .45,
          x1: .55,
          y0: .3,
          y1: .2,
          fillcolor: "magenta",
          line: {
            color: 'black',
          }},
          {
          // draw needle
          type: 'line',
          x0: .5,
          y0: .25,
          // ending coordinates calculated above
          x1: x1,
          y1: y1,
          line: {
            color: 'purple',
            width: 7
          }      
        }],
        title: {
            text: 'Bellybutton Wash Frequency',
            font: {size: 25}
        },
        xaxis: {visible: false, range: [-1, 1]},
        yaxis: {visible: false, range: [-1, 1]}
      }

    Plotly.newPlot("gauge", data, gaugeLayout)
}