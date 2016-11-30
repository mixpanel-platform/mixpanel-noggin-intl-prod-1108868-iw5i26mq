var params ={}
params.default_props = ['$last_name','$first_name','$email','$referring_domain','$city', '$region', 'mp_country_code', '$browser', '$browser_version', '$device', '$current_url', '$initial_referrer', '$initial_referring_domain', '$os', '$referrer', '$screen_height', '$screen_width', '$search_engine', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', '$city', '$region', '$app_release', '$app_version', '$carrier', '$ios_ifa', '$os_version', '$manufacturer', '$lib_version', '$model', '$os', '$screen_height', '$screen_width', '$wifi', '$city', '$region', 'mp_country_code', '$app_version', '$bluetooth_enabled', '$bluetooth_version', '$brand', '$carrier', '$has_nfc', '$has_telephone', '$lib_version', '$manufacturer', '$model', '$os', '$os_version', '$screen_dpi', '$screen_height', '$screen_width', '$wifi', '$google_play_services', '$import'];
params.default_events = ['$campaign_delivery', '$campaign_marked_spam', '$campaign_bounced', '$campaign_open', '$experiment_started'];

MP.api.jql(function main() {
  return Events({
    from_date: params.from_date || new Date(_.now() - (30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, -14),
    to_date: params.to_date || new Date().toISOString().slice(0, -14)
  })
  .filter(event => !_.contains(params.default_events, event.name))
  .map(item => ({
    event_name: item.name,
    platform: item.properties.mp_lib,
    properties: _.keys(_.omit(item.properties, params.default_props))
  }))
  .groupBy(['event_name','platform'], function(accums, items) {
    var res = {};
    _.each(accums, function(accum) {
      res.properties = res.properties || {};
      _.each(_.keys(accum.properties), function(prop) {
        res.properties[prop] = res.properties[prop] + accum.properties[prop] || accum.properties[prop];
      });
      res.total = res.total + accum.total || accum.total;
    });
    _.each(items, function(item) {
      res.properties = res.properties || {};
      _.each(item.properties, function(prop) {
        res.properties[prop] = res.properties[prop] + 1 || 1;
      });
      res.total = res.total + 1 || 1;
    });
    return res;
  })
  .map(function(result) {
    var res = {};
    res.event = result.key[0] + ' (' + result.value.total + ')';
    res.platform = result.key[1]
    res.properties = _.mapObject(result.value.properties, function(prop) {
      return Math.round(prop * 1000 / result.value.total) / 10 + '%';
    });
    return res;
  })
  .map(function(results){
    return {
      "Events (Counts)": results.event,
      "Platform": results.platform,
      "Properties": results.properties
    }
  })
},params
).done(function(results){

  console.log(results);
  // transfrom results for graphing of events table
  var eventTableData = transformDataforEventsTable(results)
  var propertiesTableData = transformDataforPropertiesTable(results)
  var properties = transformData(results)
  console.log(properties[1]);
  console.log(properties[0]);
  //add all of ther header tags for the final graph so highcharts graphs properly
  function addHeaderRow(array){
    for(var i=0;i<array.length; i++){
      $('#full-table-header-row').append('<th>'+array[i]+'</t>')
    }
  }
  addHeaderRow(properties[1])
  //hide loading icon
  $("#loading-container").hide()
  //graph events table
  $('#event-table').DataTable( {
    data: eventTableData,
    dom: 'Bfrtip',
    lengthMenu: [
      [ 10, 25, 50, -1 ],
      [ '10 rows', '25 rows', '50 rows', 'Show all' ]
    ],
    buttons: [
        'csv', 'excel','pageLength'
    ],
    "columns": [
      { className: "dt-left" },
      { className: "dt-left" },
      { className: "dt-left" }
    ]
  });
  $('#properties-table').DataTable( {
    data: propertiesTableData,
    dom: 'Bfrtip',
    lengthMenu: [
      [ 10, 25, 50, -1 ],
      [ '10 rows', '25 rows', '50 rows', 'Show all' ]
    ],
    buttons: [
        'csv', 'excel','pageLength'
    ],
    "columns": [
      { className: "dt-left" },
      { className: "dt-left" },
      { className: "dt-left" },
      { className: "dt-left" }
    ]
  });
  $('#full-table').DataTable( {
    data: properties[0],
    dom: 'Bfrtip',
    lengthMenu: [
      [ -1, 10, 25, 50],
      [ 'Show all','10 rows', '25 rows', '50 rows']
    ],
    buttons: [
        'csv', 'excel','pageLength'
    ]
  });
  $('#table-header-row, #export').show()
  $('#date-picker').show()
})
