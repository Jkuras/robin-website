$(document).ready(function(){
  $('.tabs').tabs();
  $('.modal').modal();
  $('.carousel').carousel();
  var db = firebase.database()
  var storage = firebase.storage().ref()
  var images = {}
  var audio = {}
  db.ref('/siteInfo').on('value', function(snapshot){
    if(snapshot){
      console.log(snapshot.val())
      var events = Object.values(snapshot.val().events)
      doCalendars(events)
      audio = snapshot.val().audio
      images = snapshot.val().images
      doAudio(audio)
      doImages(images)
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
  function doAudio(audio){
    console.log(audio)
    var vals = Object.values(audio)
    var keys = Object.keys(audio)
    var str = '<div>'
    var bands = getBands(vals)
    console.log(bands)
    for(var j = 0; j<bands.length; j++){
      str += '<div id="'+bands[j]+'_area" class="col s12 left">\
        <h5 class="left">'+bands[j]+'</h5>\
      </div>'
    }
    $('#audio-area').empty()
    $('#audio-area').append(str)
    for(var i = 0; i<vals.length; i++){
      storage.child(vals[i].path).getDownloadURL().then(function(url){
        var first = url.split('%2F')[0].split('o/')[1]
        var second = url.split('%2F')[1].split('?alt=media')[0]
        var audioPath = first +'/'+second
        var key = ""

        for(var j=0; j<keys.length;j++){

          if(vals[j].path == audioPath){
            var id = vals[j].band + '-area'
            $('#'+vals[j].band+'-area').append('<div id="'+vals[j].band+'-area"></div>')
            var id = '#'+vals[j].band +'-area'
            key = keys[j]
            var id2 =id
            var playId = '#'+key+'_play'
            var pauseId = '#'+key+'_pause'
            var wavesurfer = WaveSurfer.create({
                container: id,
                waveColor: 'violet',
                progressColor: 'purple',
                scrollParent:false,
                height: 60,
                hideScrollbar: true,
                fillParent: true
            });
            wavesurfer.load(url)
            $(playId).click(function(){
              wavesurfer.play()
            })
            $(pauseId).click(function(){
              wavesurfer.pause()
            })
          }
        }

      }).catch(function(error) {
        // Handle any errors
        console.log(error)
        M.toast({html:'Error Loading Audio!'})
      });
    }

  }
  function doImages(images){

    console.log(images)

    var vals = Object.values(images)
    var keys = Object.keys(images)
    var nextCol = 0
    for(var i = 0; i<vals.length; i++){
      storage.child(vals[i].path).getDownloadURL().then(function(url){
        var first = url.split('%2F')[0].split('o/')[1]
        var second = url.split('%2F')[1].split('?alt=media')[0]
        var imagePath = first +'/'+second
        console.log(i)

        for(var j = 0; j<vals.length; j++){

          if(imagePath == vals[j].path){
            var str = '<img class="material-boxed" src="'+url+'" style="width:100%"></img>'
            $('#image-col-' + nextCol%4).append(str)
            nextCol+=1
          }
        }

      }).catch(function(error) {
        // Handle any errors
        console.log(error)
        M.toast({html:'Error Loading Image!'})
      });
    }

  }

  function getBands(list){
    var count = []
    console.log(list)
    for(var i = 0; i<list.length; i++){
      if(count.includes(list[i].band)){

      } else {
        count.push(list[i].band)
      }
    }
    return count
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
