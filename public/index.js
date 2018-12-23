$(document).ready(function(){
  $('.tabs').tabs();
  $('.modal').modal();
  $('.carousel').carousel();
  var db = firebase.database()
  var images = {}
  var audio = {}
  db.ref('/siteInfo').on('value', function(snapshot){
    if(snapshot){
      console.log(snapshot.val())
      var events = Object.values(snapshot.val().events)
      doCalendars(events)
      audio = snapshot.val().images
      images = snapshot.val().audio
    } else {
      console.log('no snapshot!')
    }
  }, function(error){
    console.log('db read error')
  })

  var wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: 'violet',
      progressColor: 'purple',
      scrollParent:false,
      height: 60,
      hideScrollbar: true,
      fillParent: true
  });
  wavesurfer.load('audio/fever.mp3')
  $('#play-1').click(function(){
    wavesurfer.play()
  })
  $('#pause-1').click(function(){
    wavesurfer.pause()
  })
  var wavesurfer2 = WaveSurfer.create({
      container: '#waveform2',
      waveColor: 'violet',
      progressColor: 'purple',
      scrollParent:false,
      height: 60,
      hideScrollbar: true,
      fillParent: true
  });
  wavesurfer2.load('audio/east_of_the_sun.mp3')
  $('#play-2').click(function(){
    wavesurfer2.play()
  })
  $('#pause-2').click(function(){
    wavesurfer2.pause()
  })

  function doCalendars(events){
    $('#home-cal').fullCalendar({
      eventClick: function(calEvent, jsEvent, view){populateEventModal(calEvent)},
      header : false,
      defaultView:'listMonth',
      events : events,
      eventColor: '#e6e6fa',

    })
    $('#calendar').fullCalendar({
      eventClick: function(calEvent, jsEvent, view){populateEventModal(calEvent)},
      header : {
        left : '',
        center : 'title',
        right : 'prev, next'
      },
      events : events,
      eventColor: '#e6e6fa',

    })
  }

  function populateEventModal(calEvent){
    var title = calEvent.title
    var start = calEvent.start
    var end = calEvent.end
    var description = calEvent.description
    var location = calEvent.location.name + '</br>' + calEvent.location.streetAddress + '</br>' + calEvent.location.cityState + ' ' + calEvent.location.zip
    $('#event_name').html(title)
    $('#event_time').html(parseTime(start) + '-' + parseTime(end))
    $('#event_description').html(description)
    $('#event_location').html(location)
    $('#modal1').modal('open')
  }
  function parseTime(timeStamp){
    console.log(timeStamp)
    var tmp = timeStamp._i.split('T')[1]
    var tmp2 =tmp.split(':')

    if(tmp2[0] > 12){
      var time = parseInt(tmp2[0]-12) + ':' + tmp2[1] + 'pm'
    } else {
      var time = tmp2[0] + ':' + tmp2[1] + 'am'
    }
    return time
  }
});
