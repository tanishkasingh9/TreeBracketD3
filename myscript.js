firstTimeFocus = true
searchTop = 0
searchTags = []
drugPanelIds = []
drugPanelDrugs = []
inputFile = "data/webMDver2.csv"
hideSideEffectsOnMouseOut = false
hideReviewsOnMouseOut = false
hideageEffectivenessOnMouseOut = false
sowSideEffectsOnDrugHover = false
allowShuffle = false
drugLimit = 8
searchTagsLimit = 8
drugOptOpacity = "0.7"
recommendationColor = "yellow"
recommendationBorderColor = "yellow";
recommendationBorderWidth = "5px";

conditions = []
drugIdDict = []
drugNameDict = []
drugsConditionDict = []
datasetJson = null
drugsSatisfactionDict =[]
drugsEffectiveDict = []
drugIdSidesDict = []
drugsSentimentDict =[]
drugRecVals = []
//barwidth = (50/(0+searchTags.length)).toString()+"%"
barwidthDivider = 25
stackMultiplier = 1
barSeparator = 5
barMaxHeight = 80

reviewThresholdNeutralStart = -0.2
reviewThresholdPositiveStart = 0
//stachColorArr = ["#b33040", "#d25c4d", "#f2b447", "#d9d574"]
// var colors = ["#4F000B","#720026","#CE4257","#FF7F51","#FF9B54","#47A025","#0B6E4F","#395B50","#FF570A"]
var colors = ['#a50026','#d73027','#f46d43','#fdae61','#fee090','#ffffbf','#e0f3f8','#abd9e9','#74add1','#4575b4','#313695']
// try
// var stachColorArr = {"con 1":"#b33040", "con 2":"#d25c4d", "a":"#f2b447", "b":"#d9d574"};
function arrSum(arr){
    tot = 0
    for(var i in arr){
        if($.type(arr[i]) === "string"){
            tot += parseInt(arr[i])
        }    
        else{
            tot += arr[i]
        }
    }
    return tot
}

function arrAvg(arr){
    tot = 0
    for(var i in arr){
        if($.type(arr[i]) === "string"){
            tot += parseInt(arr[i])
        }    
        else{
            tot += arr[i]
        }
    }
    return tot/arr.length
}

function filterbytags_andCreateXY(drugid,search_tags,satdict){
    data = []
    x = 0
    for (i=0; i<search_tags.length; i++){
        scoresbydrug = {"condition":searchTags[i]}
        for(j=0; j<drugid.length; j++){
            x += 1
            rating = satdict[search_tags[i]][drugid[j]]
            if (rating){
                sum = 0
                count =0
                scores = ["1","2","3","4","5"]
                countSum = scores.map(function(d){
                    count += rating[d]
                    sum += parseInt(d)*rating[d]
                })
                average = Math.round((sum/count) * 10) / 10
                scoresbydrug[drugid[j]] = average
            }
        }
        data.push(scoresbydrug) 
    }
    return data;
}

function shuffle_colors(color_arr){
    if(allowShuffle){  
        for(let i = color_arr.length-1; i > 0; i--){
            const j = Math.floor(Math.random() * i)
            const temp = color_arr[i]
            color_arr[i] = color_arr[j]
            color_arr[j] = temp
        }
    }
    return color_arr
}

function makeGraph(drug_ids, drug_names){
    $(".graphPannel").html('')
    resetSideEffects()
    var margin = {top: 100, right: 160, bottom: 100, left: 30};
    var width = Math.max(75,$(".graphPannel").width() - margin.left - margin.right),
        height = $(".graphPannel").height() - margin.top - margin.bottom;

    var svg = d3.select(".graphPannel")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    barGdata = filterbytags_andCreateXY(drug_ids,searchTags,drugsSatisfactionDict)
    
    var data = []

    for(var ob in barGdata){
        curD = {}
        for(var key in barGdata[ob]){
            // console.log(key, barGdata[ob][key])
            curD[key] = barGdata[ob][key]
        }
        data.push(curD)
    }
    var parse = d3.time.format("%Y").parse;

    stackdata = drug_ids.map(function(c){
        return barGdata.map(function(d,i) {
          return {x:d["condition"], y:d[c]} })
        })
    var stack = d3.layout.stack()
    var dataset = stack(stackdata)
    // console.log("dataset", dataset)
    
    
    // Set x, y and colors
    var x = d3.scale.ordinal()
    .domain(dataset[0].map(function(d) { return d.x; }))
    .rangeRoundBands([10, width-10], 0.02);

    var y = d3.scale.linear()
    .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
    .range([height, 0]);

    //var colors = ["b33040", "#d25c4d", "#f2b447", "#d9d574"];
    

    // Define and draw axes
    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5)
    .tickSize(-width, 0, 0)
    .tickFormat( function(d) { return d } );
    
    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    // .tickFormat(d3.time.format("%Y"));
 

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);


    // Create groups for each series, rects for each segment 
    var groups = svg.selectAll("g.cost")
    .data(dataset)
    .enter().append("g")
    .attr("class", "cost")
    .style("fill", function(d, i) { 
        // console.log("group")
        // console.log(d)
        return colors[i]; });


    
    var rect = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter()
    .append("rect")
    .attr("class", function(d,i){
        return "dataRect~"+searchTags[i]
    })
    .attr("x", function(d,i) { 
        return x(d.x); 
    })
    .attr("y", function(d) { 
        return y(d.y0 + d.y); })
    .attr("height", function(d) { 
        // console.log("yoo")
        return y(d.y0) - y(d.y0 + d.y); })
    .attr("width", x.rangeBand())
    //////////////////////////// NEEDS WORK -> does not fire
    

    drugInd = 0
    h = -1
    svg.selectAll("g.cost")
            .selectAll("rect")
                .each(function(d,i){
                    h += 1
                    this.setAttribute('class',this.getAttribute('class') + "~" + drug_ids[drug_ids.length -1 - drugInd])
                    // console.log(drugInd,this.getAttribute('class'))
                    if(h == searchTags.length-1){
                        drugInd += 1
                        h = -1
                    }
                })
                .on("mouseover",function(){
                    stt = this.getAttribute("class").split("~");
                    reviewShow(stt[1],stt[2])
                    tooltip.style("display", null)
                    
                    showSideEffects(drugIdDict[stt[2]])
                    $(".drugOpt")
                        .each(function(){
                            // drugIdDict[stt[2]]
                            if(drugIdDict[stt[2]] == $(this).text()){
                                $(this).css("opacity","1");
                                $(this).css("background-color","white");
                                $(this).css("color","black");
                                
                            }
                            else{
                                $(this).css("opacity",drugOptOpacity);
                                $(this).css("background-color","black");
                                $(this).css("color","white");
                            }
                        })
                })
                .on("mouseout", function(){
                    if(hideReviewsOnMouseOut){
                        reviewHide()
                    }
                    if(hideageEffectivenessOnMouseOut){
                        resetAgeEffectiveness()
                    }
                    if(hideSideEffectsOnMouseOut){
                        resetSideEffects()
                    }
                    tooltip.style("display", "none")
                })
                .on("mousemove", function(d) {
                    // console.log("onmove")
                    var xPosition = d3.mouse(this)[0] - 15;
                    var yPosition = d3.mouse(this)[1] - 25;
                    tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                    tooltip.select("text").text(d.y);
                });

    // Draw legend
    var legend = svg.selectAll(".legend")
    .data(drug_ids)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });
    
    legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d, i) {return colors.slice(0,drug_ids.length).reverse()[i];});
    
    legend.append("text")
    .attr("x", width + 5)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function(d, i) { 
        return drug_names[i]
    });
    //$(".dataRect").onmouseover = console.log("nayaa")
    // console.log($("searchbox").on('mouseover', console.log("nayaa")))// = console.log("nayaa"))
    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");
    
    tooltip.append("rect")
    .attr("width", 30)
    .attr("height", 20)
    .attr("fill", "white")
    .style("opacity", 0.5);

    tooltip.append("text")
    .attr("x", 15)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");
    // console.log(tooltip)

    
    $(".drugOpt").off('mouseover')
    $(".drugOpt").on('mouseover', function(){
        if(sowSideEffectsOnDrugHover){
            showSideEffects($(this).text())
        }
        // $(".drugOpt").each(function(){
        //     $(this).css("opacity",drugOptOpacity);
        // })
        // $(this).css("opacity","1");
        // console.log(this)
    })

    
    $(".drugOpt").off('mouseout')
    $(".drugOpt").on('mouseout', function(){
        if(hideSideEffectsOnMouseOut){
            resetSideEffects()
        }
        // $(this).css("opacity",drugOptOpacity);
    })

    $(".drugOpt").each(function(d){
        if(drugIdDict[drugPanelIds[0]] == $(this).text())
            {
                $(this).css("border-style", "solid")
                $(this).css("border-color", recommendationBorderColor)
                $(this).css("border-width", recommendationBorderWidth)
                $(this).css("color", recommendationColor)
            }
    })
}

function calRecommendationVal(conds,drg){
    effVal = 0
    satVal = 0
    sentVal = 0
    // console.log(conds)
    for(var con in conds){
        // console.log(conds[con],drg)
        // console.log(arrSum(drugsSentimentDict[conds[con]+"~"+drg]))
        sentVal += arrSum(drugsSentimentDict[conds[con]+"~"+drg])
        // console.log("Sentiment", drugsSentimentDict[conds[con]+"~"+drg], "sentVal" ,sentVal)

        for(var i in drugsEffectiveDict[conds[con]+"~"+drg]){
            effVal += arrAvg(drugsEffectiveDict[conds[con]+"~"+drg][i])
        }
        // console.log("Effective", drugsEffectiveDict[conds[con]+"~"+drg], "effVal" ,effVal)

        for(var i in drugsSatisfactionDict[conds[con]][drg]){
            satVal += (i/10) * drugsSatisfactionDict[conds[con]][drg][i]
        }
        // console.log("Satisfaction", drugsSatisfactionDict[conds[con]][drg], "satVal" ,satVal)
    }
    return effVal+satVal+sentVal
}

function getRecommendationSorted(Symptoms,Drugs,N){
    drugs = []
    vals = []
    maxInd = 0
    for(var drg in Drugs){
        curVal = calRecommendationVal(Symptoms,Drugs[drg])
        curVal = curVal.toString(); //If it's not already a String
        curVal = curVal.slice(0, (curVal.indexOf("."))+3); //With 3 exposing the hundredths place
        drugs.push([Drugs[drg],Number(curVal)]) 
        vals.push(Number(curVal))
    }

    transformation = []
    for(i=0;i<drugs.length;i++){
        maxI = vals.indexOf(Math.max(...vals));
        transformation.push(maxI)
        vals[maxI] = -1000000//.splice(maxI, 1);
    }

    finalDrugs = []
    for(i=0;i<transformation.length;i++){
        finalDrugs.push(drugs[transformation[i]])
    }
    drugRecVals = finalDrugs
    return finalDrugs.slice(0, N);
}

function resetSideEffects(){
    // $(".bottomNLP").html("<p class = boardTitle > Side Effects</p><p class=pannelText></p>")
    $(".bottomNLP").html("")
}

function showSideEffects(drugName){
    // console.log(drugIdSidesDict[drugNameDict[drugName]]
    // console.log(drugName)
    $(".bottomNLP").html("<p class=pannelText>"+ drugIdSidesDict[drugNameDict[drugName]] +"</p>")
}

function reviewHide(){
    $(".topNLPConHeader").html("")
    $(".topNLP").html("")
}

function reviewShow(con, drg){
    //console.log(con, drg, drugsSentimentDict[con + "~" + drg])
    $(".topNLPConHeader").html("<p class = boardTitle>Condition: " + con + "</p>")
    $(".topNLP").html("")

    // $(".topNLP").html("")
    sentimentList = drugsSentimentDict[con + "~" + drg]
    positiveCount = 0
    negativeCount = 0
    neutralCount = 0
    for (var item in sentimentList){
        if(sentimentList[item] >= reviewThresholdPositiveStart){
            positiveCount += 1
        }
        else if(sentimentList[item] >= reviewThresholdNeutralStart){
            neutralCount += 1
        }
        else{
            negativeCount += 1
        }
    }
    tempSentimentListCounts = [positiveCount,neutralCount,negativeCount]
    sentimentListCounts = []
    tempSigns = ["L","N","D"]
    signs = []
    for(var i=0;i<tempSentimentListCounts.length;i++){
        if(tempSentimentListCounts[i]>0){
            sentimentListCounts.push(tempSentimentListCounts[i])
            signs.push(tempSigns[i])
        }
    }
    
    // console.log(sentimentListCounts)
    // console.log(signs)
    var margin = {top: 40, right: 0, bottom: 20, left: 0};
    var width = Math.max(75,$(".topNLP").width() - margin.left - margin.right),
        height = $(".topNLP").height() - margin.top - margin.bottom;


    var getData = function(){
        var size = sentimentListCounts.length;
        var data = {};
        var text = "";
        for(var i=0; i<size; i++){
          data[signs[i]] = sentimentListCounts[i]
          text += signs[i] +" = " + data[signs[i]] + "<br/>";
        };
        d3.select("#data").html(text);
        // console.log(data)
        return data;
      };
      
    var chart = donut(width, height)
                    .$el(d3.select(".topNLP"))
                    .data(getData())
                    .render();
    showAgeEffectiveness(con,drg)
}

function donut(width, height){  
    // Default settings
    var $el = d3.select("body")
    var data = {};
    // var showTitle = true;
    var radius = Math.min(width, height) / 2;
  
    var currentVal;
    var color = d3.scale.category20();
    var col = {"L":"#FFFFBF","N":"#F7F7FF","D":"#435058"}
    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });
  
    var svg, g, arc; 
  
  
    var object = {};
  
    // Method for render/refresh graph
    object.render = function(){
      if(!svg){
        arc = d3.svg.arc()
        .outerRadius(radius)
        .innerRadius(radius - (radius/2.5));
  
        svg = $el.append("svg")
          .attr("width", width)
          .attr("height", height)
        .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
        g = svg.selectAll(".arc")
          .data(pie(d3.entries(data)))
        .enter().append("g")
        .attr("class", "arc");
  
        g.append("path")
          // Attach current value to g so that we can use it for animation
          .each(function(d) { this._current = d; })
          .attr("d", arc)
          .style("fill", function(d) { 
            // console.log(color(d.data.key),d.data.key)
            return col[d.data.key]; 
          });
        g.append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .style("text-anchor", "middle");
        g.select("text").text(function(d) { return d.data.key; });
  
        svg.append("text")
            .datum(data)
            .attr("x", 0 )
            .attr("y", 0 + radius/10 )
            .attr("class", "text-tooltip")        
            .style("text-anchor", "middle")
            .attr("font-weight", "bold")
            .style("font-size", radius/2.5+"px");
  
        g.on("mouseover", function(obj){
          // console.log(obj)
          svg.select("text.text-tooltip")
          .attr("fill", function(d) { return col[obj.data.key]; })
          .text(function(d){
            return d[obj.data.key];
          });
        });
  
        g.on("mouseout", function(obj){
          svg.select("text.text-tooltip").text("");
        });
  
      }else{
        g.data(pie(d3.entries(data))).exit().remove();
  
        g.select("path")
        .transition().duration(200)
        .attrTween("d", function(a){
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) {
              return arc(i(t));
          };
        })
  
        g.select("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; });
  
        svg.select("text.text-tooltip").datum(data);
      }      
      return object;
    };
  
    // Getter and setter methods
    object.data = function(value){
      if (!arguments.length) return data;
      data = value;
      return object;
    };
  
    object.$el = function(value){
      if (!arguments.length) return $el;
      $el = value;
      return object;
    };
  
    object.width = function(value){
      if (!arguments.length) return width;
      width = value;
      radius = Math.min(width, height) / 2;
      return object;
    };
  
    object.height = function(value){
      if (!arguments.length) return height;
      height = value;
      radius = Math.min(width, height) / 2;
      return object;
    };
  
    return object;
}

function resetAgeEffectiveness(){
    $(".midNLP").html('')
}

function sortDataByAge(unsortedData){
    newD = []
    for(i=0;i<unsortedData.length;i++){
        newD.push(unsortedData[i]['name'] + "~" + (unsortedData[i]['value']).toString())
    }
    newD = newD.sort()
    newD = newD.reverse()
    
    sortedData = []

    for(i=0;i<newD.length;i++){
        temp = {}
        st = newD[i].split("~")
        temp['name'] = st[0]
        temp['value'] = st[1]
        sortedData.push(temp)
    }
    return sortedData
}

function showAgeEffectiveness(con,drg){
    
    resetAgeEffectiveness() 
    var margin = {
            top: 15,
            right: 25,
            bottom: 15,
            left: 60
        };
    // var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var width = Math.max(75,$(".midNLP").width() - margin.left - margin.right),
        height = $(".midNLP").height() - margin.top - margin.bottom;
    
    
    // console.log(con+"~"+drg)
    var data = []
    my_data_dict = drugsEffectiveDict[con+"~"+drg]
    for(var key in my_data_dict){
            // console.log(my_data_dict[key])
            if(key == "[NULL]"){
                continue
            }
            curD = {}
            curD['name'] = key
            curD['value'] = ((my_data_dict[key]).reduce((previous, current) => current += previous))/my_data_dict[key].length;
            curD['value'] = curD['value'].toString()
            curD['value'] = Number(curD['value'].slice(0, (curD['value'].indexOf("."))+3))
            data.push(curD)
    }
    data = sortDataByAge(data)

    var svg = d3.select(".midNLP").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.linear()
        .range([0, width])
        .domain([0, d3.max(data, function (d) {
            return d.value;
        })]);

    var y = d3.scale.ordinal()
        .rangeRoundBands([height, 0], .1)
        .domain(data.map(function (d) {
            return d.name;
        }));

    //make y axis to show bar names
    var yAxis = d3.svg.axis()
        .scale(y)
        //no tick marks
        .tickSize(0)
        .orient("left");

    var gy = svg.append("g")
        .attr("class", "y HBCaxis")
        .call(yAxis)

    var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")

    //append rects
    bars.append("rect")
        .attr("class", "HBCbar")
        .attr("y", function (d) {
            return y(d.name);
        })
        .attr("height", y.rangeBand())
        .attr("x", 0)
        .attr("width", function (d) {
            return x(d.value);
        });

    //add a value label to the right of each bar
    bars.append("text")
        .attr("class", "HBClabel")
        //y position of the label is halfway down the bar
        .attr("y", function (d) {
            return y(d.name) + y.rangeBand() / 2 + 4;
        })
        //x position is 3 pixels to the right of the bar
        .attr("x", function (d) {
            return x(d.value) + 3;
        })
        .text(function (d) {
            return d.value;
        });
}

function findCommonElements(inArrays) {
    
  // check for valid input
  if (typeof inArrays==="undefined") return undefined;
  if (typeof inArrays[0]==="undefined") return undefined;
  
  return _.intersection.apply(this, inArrays);
}

function removeSymptomsWithNoCommonDrugs(myconditions, mysearchTags){
    new_conditions = []

    my_conditions_with_common_drugs = []
    for(i=0;i<searchTags.length;i++){
        my_conditions_with_common_drugs.push(drugsConditionDict[searchTags[i]])
    }

    for(i=0;i<myconditions.length;i++){
        my_conditions_with_common_drugs.push(drugsConditionDict[myconditions[i]])
        myPossibleSymptoms = findCommonElements(my_conditions_with_common_drugs);
        if(myPossibleSymptoms.length != 0){
            new_conditions.push(myconditions[i])
        }
        my_conditions_with_common_drugs.pop()
    }
    return new_conditions
}

function updateDrugsPanel(){
    
    drugPanelIds = []
    conditions_with_common_drugs = []
    for(i=0;i<searchTags.length;i++){
        conditions_with_common_drugs.push(drugsConditionDict[searchTags[i]])
    }
    drugPanelIds = findCommonElements(conditions_with_common_drugs);
    newDrugs = getRecommendationSorted(searchTags,drugPanelIds,drugLimit)
    drugPanelIds = []
    for(i=0;i<newDrugs.length;i++){
        drugPanelIds.push(newDrugs[i][0])
    }

    if(drugPanelIds != null){
        drugPanelDrugs = drugPanelIds.map(drugPanelId => drugIdDict[drugPanelId])
        drugsList = drugPanelDrugs.map(drug => `<li class=drugOpt value=${drug}>${drug}</li>`)

        blah = drugsList.join('')
        if(!drugsList){
            $(".drugList").html('')
        }
        else{
            $(".drugList").html(blah)
        }
        //$(".drugList").html(!drugsList ? '' : drugsList.join(''));
        makeGraph(drugPanelIds, drugPanelDrugs)
    }
    else{
        
        $(".graphpannel").html('')
        $(".drugList").html('')
    }
}

function resetRightPanel(top,mid,bottom){
    if(top) reviewHide();
    if(mid) resetAgeEffectiveness();
    if(bottom) resetSideEffects();
    
}

function updateSearchTags() {
    tempTags = searchTags.map(searchTag => `<div class=aSearchTag>${searchTag}</div>`)
    $(".searchTags").html(!tempTags ? '' : tempTags.join(''));
    $('.aSearchTag').on('click', function () {
        searchTags = searchTags.filter(searchTag => searchTag != $(this).text());
        $(".searchTags").html('');
        updateSearchTags()
    });
    if (searchTags.length==0){
        colors = shuffle_colors(colors)
    }
    resetRightPanel(true,true,true)
    updateDrugsPanel()
}

function firstTimeSearchFocus() {
    if (firstTimeFocus) {
        firstTimeFocus = false;
    }
    else {
        return;
    }
    $(".searchContent").css({ "animation-name": "searchMoveUp", "animation-duration": "1s" }).css({ "top": "20%" });
    $(".dashboard").css({ "animation-name": "dashboardMoveUp", "animation-duration": "1s" }).css({ "top": "60%", "opacity":"1" });
    
}

function csvJSON(csv){
    var lines=csv.split("\n");
    var result = [];
    var headers=lines[0].split("~");
  
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].split("~");
        if(currentline[0]==""){
            continue
        }
        for(var j=0;j<headers.length;j++){
            // if(currentline[j] == "")
            // {
            //     obj[headers[j]] = lines[i-1].split(",")[j];
            // }
            obj[headers[j]] = currentline[j];
        }
  
        result.push(obj);
  
    }
    return result; //JSON
}

function scoreDict(json,cond_list,key,value){
    var dict = {};
    for (i=0;i<cond_list.length;i++){
        dict[cond_list[i]] = {}
    }
    
    for (i=0;i<json.length;i++)
    {   //console.log(i, json[i])
        if (cond_list.indexOf(json[i]["Condition"]) != -1){
            if (dict[json[i]["Condition"]][json[i][key]]==null){
                dict[json[i]["Condition"]][json[i][key]] = {'5':0, '4':0, '3':0, '2':0, '1':0}
            }
            if (dict[json[i]["Condition"]][json[i][key]]){
                if (json[i][key][value] != NaN){
                    dict[json[i]["Condition"]][json[i][key]][json[i][value]] += 1;
                }
            }
        }
    }
    return dict
}

function toDict(json,key,value){
    var dict = {};
    for (i=0;i<json.length;i++)
    {   //console.log(i, json[i])
        if (dict[json[i][key]]==null){
            dict[json[i][key]] = []
        }
        if (dict[json[i][key]]){
            dict[json[i][key]].push(json[i][value]);
            dict[json[i][key]] = Array.from(new Set(dict[json[i][key]]))
        }
        
    }
    
    return dict;
}

function getColAsArray(Json, key) {

    arr = [];
    for (i = 0; i < Json.length; i++) {
        // console.log(i,myJ[i][key])
        arr.push(Json[i][key]);
    }
    return arr;
}

function removeSelected(my_conditions, my_searchTags) {

    return my_conditions.filter(x => !my_searchTags.includes(x));
}

function flatenKeyOfDict(x){
    for(var i in x){
        if (x[i].length > 1){
            x[i] = [x[i].reduce(function(prev, curr) {
                return prev.concat(curr);
            })];
        }
    }
    return x
}

function sentDict(json,cond_list,key,value){
    var dict = {};
    xT = Object.keys(json[1]).pop()
    for(var rec in json){
        dict[json[rec]['Condition'] + "~" + json[rec]['DrugId']] = []
    }
    for(var rec in json){
        dict[json[rec]['Condition'] + "~" + json[rec]['DrugId']].push(parseFloat(json[rec][xT]))
    }
    return dict
}

function EffDict(json,cond_list,key,value){
    var dict = {};
    
    for(var rec in json){
        dict[json[rec]['Condition'] + "~" + json[rec]['DrugId']] = {}
    }
    for(var rec in json){
        dict[json[rec]['Condition'] + "~" + json[rec]['DrugId']][json[rec]['Age']] = []
    }
    for(var rec in json){
        dict[json[rec]['Condition'] + "~" + json[rec]['DrugId']][json[rec]['Age']].push(parseFloat(json[rec][value]))
    }
    return dict
}

$(document).ready(function () {
    $.ajax({
        url: inputFile,
        dataType: "text",
        success: function (data) {
            datasetJson = csvJSON(data)
            // datasetJson = data//JSON.parse(data)
            // console.log(datasetJson)
            conditions = getColAsArray(datasetJson,"Condition");
            //conditions.pop()
            conditions = Array.from(new Set(conditions))
            drugIdDict = toDict(datasetJson, "DrugId", "Drug")
            drugNameDict = toDict(datasetJson, "Drug", "DrugId")
            drugsConditionDict = toDict(datasetJson, "Condition", "DrugId")
            drugsSatisfactionDict = scoreDict(datasetJson, conditions, "DrugId", "Satisfaction") 
            drugIdSidesDict = flatenKeyOfDict(toDict(datasetJson, "DrugId", "Sides"))
            drugsSentimentDict = sentDict(datasetJson, conditions, "DrugId", "SentimentScore")
            drugsEffectiveDict = EffDict(datasetJson, conditions, "DrugId", "Effectiveness")
            //console.log(drugsEffectiveDict) 
        },
        // recommendation -> sorted(ease_of_use * weight1 + sattisfaction + effectiveness + normalised_useful_count + score)
        complete: function(){
            $('.loadingScreen').remove();
          }
    });

    $(".input").keyup(function (data) {
        let searchOptions = []
        updatedConditions = removeSelected(conditions, searchTags)
        updatedConditions = removeSymptomsWithNoCommonDrugs(updatedConditions, searchTags)

        searchOptions = updatedConditions.filter(condition => condition.toLowerCase().includes(data.target.value.toLowerCase()));
        if (data.target.value == '') {
            searchOptions = []
        }

        //////////////////////////// NEEDS WORK -> detached search dropdown
        searchOptions = searchOptions.map(searchOption => `<li class=searchOpt value=${searchOption}>${searchOption}</li>`)
        $(".searchList").html(!searchOptions ? '' : searchOptions.join(''));

        $('.searchOpt').on('click', function () {
            if(searchTags.length<searchTagsLimit){
                $(".input").val('')
                $('.searchOpt').off('click');
                $(".searchList").html('');
                searchTags.push($(this).text())
                updateSearchTags()
            }
            else{
                alert("Sorry, you can only enter " + searchTagsLimit + " symptoms!")
            }
        });
        // console.log($(".dataRect").on("mouseover", function(){
        //     console.log("aaaaaaa")
        // }))

    });

    $('.searchbtn').on('click', function(){
        if(searchTags.length<searchTagsLimit){
            currVal = $(".input").val()
            updatedConditions = removeSelected(conditions, searchTags)
            updatedConditions = removeSymptomsWithNoCommonDrugs(updatedConditions, searchTags)

            searchOptions = updatedConditions.filter(condition => condition.toLowerCase() == currVal.toLowerCase());
            if (searchOptions.length != 0) {
                searchTags.push(currVal)
                updateSearchTags()
                $(".input").val('')
                $('.searchOpt').off('click');
                $(".searchList").html('');
            }
        }
        else{
            alert("Sorry, you can only enter " + searchTagsLimit + " symptoms!")
        }
    });
    $(window).resize(function() {
        updateSearchTags()
    });
});



