//use when you need to get data formatted for use in a datatables table. should be able to just pass in results.values() as the param
function transformDataforEventsTable(data){
  var tableData = []
  _.each(data, function(values,key){
    tableData[key] = [values['Events (Counts)'].split(" (")[0], values.Platform || 'non-standard library or server', parseFloat(values['Events (Counts)'].split("(")[1]) ]
  })
  return tableData
}

function transformDataforPropertiesTable(data){
  var tableData = []
  var index = 0
  _.each(data, function(events){
    _.each(events, function(eventValues, eventKey){
      if(eventKey == 'Properties'){
        _.each(eventValues, function(propValues, propNames){
          tableData[index] = [propNames, propValues, events['Events (Counts)'].split(" (")[0], events.Platform || 'non-standard library or server']
          index++
        })
      }
    })

  })
  return tableData
}
//want to create a function that formatts the returned json so that it follows the formatt of the excel sheet you get when you export from jql
function transformData(data){
  var tableData = []
  //set the first two column values for the header row
  var headersRow = ["Events (Counts)","Platform"]
  var index = 0
  //go through and get all of the properties that exist in the project so we can later create the header row of the table
  _.each(data, function(events){
    _.each(events, function(eventValues, eventKey){
      if(eventKey == 'Properties'){
        _.each(eventValues, function(propValues, propNames){
          doesNotContain(headersRow,propNames)
          // tableData[index] = [propNames, propValues, events['Events (Counts)'].split(" (")[0], events.Platform || 'non-standard library or server']
          // index++
        })
      }
    })
  })
  //after we have all the table header information go through all the evnets and assign % of the time we see the event occur per event per property
  _.each(data, function(events){
    _.each(events, function(eventValues, eventKey){
      if(eventKey == 'Properties'){
        _.each(eventValues, function(propValues, propNames){
          var headerIndex = _.indexOf(headersRow,propNames)
          tableData[index] = tableData[index] || []
          tableData[index][0] = tableData[index][0] ?  tableData[index][0] : events['Events (Counts)']
          tableData[index][1] = tableData[index][1] ? tableData[index][1] : events['Platform'] || 'non-standard library or server'
          tableData[index][headerIndex] = propValues
        })
      }
    })
    index++
  })
  //add in values in case indexes are undefined
  for (var x = 0; x < tableData.length; x++) {
    for(var i= 0; i < headersRow.length; i++){
      tableData[x][i] = tableData[x][i] || ''
    }
  }
  return [tableData, headersRow]
}
//check to see if property value exits in header array
function doesNotContain(currentArray, valueToAdd){
  if(!_.contains(currentArray, valueToAdd)){
    currentArray.push(valueToAdd)
  }
}
dateSelector.on('change', function(e, dates) {                          // Do something when the dates are changed
    alert('From: ' + dates.from + '\nTo: ' + dates.to);
    params.from_date = dates.from
    params.to_date = dates.to
});
