function signIn(){
  var email = $('#email').val()
  var password = $('#password').val()
  var auth = firebase.auth()
  auth.signInWithEmailAndPassword(email, password).then(function(){
    console.log('did it!')
  })
}
$(document).ready(function(){

  var db = firebase.database()
  var auth = firebase.auth()
  var storage = firebase.storage().ref()
  var events = {}
  var images = {}
  var audio = {}
  var selectedImage = ''
  var selectedAudio = ''
  $('select').formSelect();
  $('.timepicker').timepicker();
  $('.datepicker').datepicker({format: 'yyyy-mm-dd'});
  $('.tabs').tabs();
  $('.modal').modal()
  db.ref('/siteInfo').on('value', function(snapshot){
    if(snapshot){
        console.log(snapshot.val())
        events = snapshot.val().events
        images =snapshot.val().images
        audio = snapshot.val().audio
        makePicker(events)
        makeImageModal(images)
        makeAudioModal(audio)
    } else {
        console.log('no snapshot!')
      }
  })

  auth.onAuthStateChanged(function(user){
    if(user){
      console.log('signed in!')
      $('#sign-in').toggle(false)
      $('#signed-in').toggle(true)
    } else {
      console.log('signed out!')
      $('#sign-in').toggle(true)
      $('#signed-in').toggle(false)
    }
  })

  $('#sign-out').click(function(){
    auth.signOut()
  })

  $('#edit-select1').change(function(){
    var id = $('#edit-select1').val()
    var event = events[id]
    $('#edit-name').val(event.title)
    $('#edit-start-time').val(reverseTime(event.start.split('T')[1]))
    $('#edit-end-time').val(reverseTime(event.end.split('T')[1]))
    $('#edit-description').val(event.description)
    $('#edit-date').val(event.start.split('T')[0])
    $('#edit-venue').val(event.location.name)
    $('#edit-address').val(event.location.streetAddress)
    $('#edit-city').val(event.location.cityState.split(', ')[0])
    $('#edit-state').val(event.location.cityState.split(', ')[1])
    $('#edit-zip').val(event.location.zip)
    M.updateTextFields()
  })
  $('#add-event').click(function(){
    var name = $('#name').val()
    var start = $('#start-time').val()
    var end = $('#end-time').val()
    var description = $('#description').val()
    var date = $('#date').val()
    var venue = $('#venue').val()
    var address = $('#address').val()
    var city = $('#city').val()
    var state = $('#state').val()
    var zip = $('#zip').val()

    var event = {
      title: name,
      start: date + "T" + parseTime(start),
      end: date + "T" + parseTime(end),
      addDay: false,
      location: {
        name: venue,
        streetAddress: address,
        cityState: city + ", " + state,
        zip: zip
      },
      description: description,
      textColor: '#111111'
    }
    var promise1 = new Promise(function(resolve, reject){
      try{
        db.ref('siteInfo/events/' + generateCode(5, 'abcdefgABCDEFG1234567890')).set(event)
        $('#name').val("")
        $('#start-time').val("")
        $('#end-time').val("")
        $('#description').val("")
        $('#date').val("")
        $('#venue').val("")
        $('#address').val("")
        $('#city').val("")
        $('#state').val("")
        $('#zip').val("")
        M.updateTextFields()
        resolve('Event Added!')
      }catch{
        reject('Error! Please Try Again!')
      }
    })
    promise1.then(function(value){
      M.toast({html: value})
    })
  })
  $('#edit-event').click(function(){
    var id = $('#edit-select1').val()
    var name = $('#edit-name').val()
    var start = $('#edit-start-time').val()
    var end = $('#edit-end-time').val()
    var description = $('#edit-description').val()
    var date = $('#edit-date').val()
    var venue = $('#edit-venue').val()
    var address = $('#edit-address').val()
    var city = $('#edit-city').val()
    var state = $('#edit-state').val()
    var zip = $('#edit-zip').val()

    var event = {
      title: name,
      start: date + "T" + parseTime(start),
      end: date + "T" + parseTime(end),
      addDay: false,
      location: {
        name: venue,
        streetAddress: address,
        cityState: city + ", " + state,
        zip: zip
      },
      description: description,
      textColor: '#111111'
    }


    var promise1 = new Promise(function(resolve, reject){
      try{
        db.ref('siteInfo/events/' + id).set(event)
        $('#edit-name').val("")
        $('#edit-start-time').val("")
        $('#edit-end-time').val("")
        $('#edit-description').val("")
        $('#edit-date').val("")
        $('#edit-venue').val("")
        $('#edit-address').val("")
        $('#edit-city').val("")
        $('#edit-state').val("")
        $('#edit-zip').val("")
        M.updateTextFields()
        resolve('Event Edited!')
      }catch{
        reject('Error! Please Try Again!')
      }
    })
    promise1.then(function(value){
      M.toast({html: value})
    })
  })
  $('#remove-event').click(function(){
    var id = $('#edit-select1').val()
    delete events[id]

    var promise1 = new Promise(function(resolve, reject){
      try{
        db.ref('siteInfo/events/').set(events)
        $('#edit-name').val("")
        $('#edit-start-time').val("")
        $('#edit-end-time').val("")
        $('#edit-description').val("")
        $('#edit-date').val("")
        $('#edit-venue').val("")
        $('#edit-address').val("")
        $('#edit-city').val("")
        $('#edit-state').val("")
        $('#edit-zip').val("")
        M.updateTextFields()
        resolve('Event Removed!!')
      }catch{
        reject('Error! Please Try Again!')
      }
    })
    promise1.then(function(value){
      M.toast({html: value})
    })

  })

  $('#add-image').click(function(){
    var name = $('#name2').val()
    var description = $('#description2').val()
    var date = $('#date2').val()
    var file = $('#image-file').prop('files')[0]
    var imageEvent = $('#edit-select2').val()
    var tmp = name.split(' ')
    var fileName=''
    for(var i = 0; i < tmp.length; i++){
      fileName += tmp[i]
    }
    var ext = $('#image-file-path').val().split('.')[1]
    storage.child(date+'/'+fileName+'.'+ext).put(file).then(function(snapshot){
      var path = snapshot.metadata.fullPath
      var photoInfo = {
        name: name,
        description: description,
        date: date,
        event: imageEvent,
        path: path
      }

      var id = generateCode(5, 'abcderfgABCDEFG1234567890')
      var promise1 = new Promise(function(resolve, reject){
        try {
          db.ref('siteInfo/images/' + id).set(photoInfo)
          $('#name2').val('')
          $('#description2').val('')
          $('#date2').val('')
          $('#image-file').val('')
          $('#image-file-path').val('')
          $('#edit-select2').val('')
          $('#edit-select2').formSelect()
          M.updateTextFields()
          resolve('Image Uploaded!')
        } catch {
          reject('Error! Please Try Again!')
        }
      })
      promise1.then(function(value){
        M.toast({html: value})
      })
    })
  })
  $('#edit-image').click(function(){
    var id = selectedImage
    var image = images[id]
    images[id].name = $('#name3').val()
    images[id].description = $('#description3').val()
    images[id].date = $('#date3').val()
    images[id].event = $('#edit-select4').val()
    var promise = new Promise(function(resolve, reject){
      try{
        db.ref('siteInfo/images').set(images)
        $('#name3').val("")
        $('#description3').val("")
        $('#date3').val("")
        $('#edit-select4').val("")
        M.updateTextFields()
        $('#edit-select4').formSelect()

        resolve('Image Edited!')
      } catch {
        M.toast({html: 'Error! Please Try Again!'})
        reject('Error! Please Try Again!')
      }
    })
    promise.then(function(value){
      M.toast({html:value})
    })
  })
  $('#remove-image').click(function(){
    var id = selectedImage
    var image = images[id]
    delete images[id]
    var promise = new Promise(function(resolve, reject){
      try{
        db.ref('siteInfo/images').set(images)
        $('#name3').val("")
        $('#description3').val("")
        $('#date3').val("")
        $('#edit-select4').val("")
        M.updateTextFields()
        $('#edit-select4').formSelect()
        resolve('Image Removed!')
      } catch {
        M.toast({html: 'Error! Please Try Again!'})
        reject('Error! Please Try Again!')
      }
    })
    promise.then(function(value){
      M.toast({html:value})
    })
  })

  $('#add-audio').click(function(){
    var name = $('#name4').val()
    var description = $('#description4').val()
    var band = $('#band4').val()
    var date = $('#date4').val()
    var file = $('#audio-file').prop('files')[0]
    var audioEvent = $('#edit-select6').val()
    var tmp = name.split(' ')
    var fileName=''
    for(var i = 0; i < tmp.length; i++){
      fileName += tmp[i]
    }

    var ext = $('#audio-file-path').val().split('.')[1]

    storage.child(date+'/'+fileName+'.'+ext).put(file).then(function(snapshot){
      var path = snapshot.metadata.fullPath
      var audioInfo = {
        name: name,
        description: description,
        date: date,
        band: band,
        event: audioEvent,
        path: path
      }

      var id = generateCode(5, 'abcderfgABCDEFG1234567890')
      var promise1 = new Promise(function(resolve, reject){
        try {
          db.ref('siteInfo/audio/' + id).set(audioInfo)
          $('#name4').val('')
          $('#description4').val('')
          $('#date4').val('')
          $('#band4').val('')
          $('#audio-file').val('')
          $('#audio-file-path').val('')
          $('#edit-select6').val('')
          $('#edit-select6').formSelect()
          M.updateTextFields()
          resolve('Audio Uploaded!')
        } catch {
          reject('Error! Please Try Again!')
        }
      })
      promise1.then(function(value){
        M.toast({html: value})
      })
    })
  })
  $('#edit-audio').click(function(){
    var id = selectedAudio
    var image = audio[id]
    audio[id].name = $('#name5').val()
    audio[id].description = $('#description5').val()
    audio[id].date = $('#date5').val()
    audio[id].event = $('#edit-select5').val()
    audio[id].band = $('#band5').val()
    var promise = new Promise(function(resolve, reject){
      try{
        db.ref('siteInfo/audio').set(audio)
        $('#name5').val("")
        $('#description5').val("")
        $('#date5').val("")
        $('#band5').val("")
        $('#edit-select5').val("")
        M.updateTextFields()
        $('#edit-select5').formSelect()
        resolve('Audio Edited!')
      } catch {
        M.toast({html: 'Error! Please Try Again!'})
        reject('Error! Please Try Again!')
      }
    })
    promise.then(function(value){
      M.toast({html:value})
    })
  })
  $('#remove-audio').click(function(){
    var id = selectedAudio
    var image = images[id]
    delete audio[id]
    var promise = new Promise(function(resolve, reject){
      try{
        db.ref('siteInfo/audio').set(audio)
        var name = $('#name5').val("")
        var description = $('#description5').val("")
        var date = $('#date5').val("")
        var event = $('#edit-select5').val("")
        M.updateTextFields()
        $('#edit-select5').formSelect()
        resolve('Audio Removed!')
      } catch {
        M.toast({html: 'Error! Please Try Again!'})
        reject('Error! Please Try Again!')
      }
    })
    promise.then(function(value){
      M.toast({html:value})
    })
  })

  function parseTime(time){
    var split = time.split(':')
    var hours = split[0]
    var minutes = split[1].split(' ')[0]
    if(time.includes('AM')){

      if(hours.length == 1){
        hours = "0"+hours
      }
      return hours + ":" + minutes + ":00"
    } else {
      hours = parseInt(hours) + 12
      return hours + ":" + minutes + ":00"
    }
  }
  function reverseTime(time){
    var hours = parseInt(time.split(':')[0])
    var minutes = time.split(':')[1]
    if(hours>12){
      hours=hours-12
      var rtn = hours + ":" + minutes + " PM"
      return rtn
    } else {
      var rtn = hours + ":" + minutes + " AM"
      return rtn
    }

  }
  function generateCode(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }
  function makePicker(events){
    var keys = Object.keys(events)
    var vals = Object.values(events)
    var rtn = '<option value="" disabled selected>Select Event</option>'
    for (var i = 0; i < vals.length; i++){
      var tmp = vals[i].title + " at " + vals[i].location.name + " - " + vals[i].start.split('T')[0]
      rtn += '<option value="' + keys[i] + '">' + tmp + '</option>'
    }
    $('#edit-select1').empty()
    $('#edit-select1').append(rtn)
    $('#edit-select2').empty()
    $('#edit-select2').append(rtn)
    $('#edit-select4').empty()
    $('#edit-select4').append(rtn)
    $('#edit-select5').empty()
    $('#edit-select5').append(rtn)
    $('#edit-select6').empty()
    $('#edit-select6').append(rtn)

    $('select').formSelect()
  }
  function makeImageModal(images){
    var keys = Object.keys(images)
    var vals = Object.values(images)
    var rtn = ""
    for (var i = 0; i < vals.length; i++){
      var tmp = '<div  class="col s12 m6 l4 ">\
        <div id="'+keys[i]+'" class="card select-image-card">\
          <div id="'+keys[i]+'" class="card-image">\
            <img id="'+keys[i]+'_image" src="loading.gif">\
            <span id="'+keys[i]+'" class="card-title black-text">'+vals[i].name+'</span>\
          </div>\
          <div id="'+keys[i]+'" class="card-content">\
            <p id="'+keys[i]+'" >'+vals[i].date+'</p>\
            <p id="'+keys[i]+'">'+vals[i].description+'</p>\
          </div>\
        </div>\
      </div>'
      rtn+=tmp
    }

    $('#image-select-area').empty()
    $('#image-select-area').append(rtn)
    $('.select-image-card').click(function(event){
      var id = event.target.id
      if(id.includes('_image')){
        id = id.split('_')[0]
      }
      var image = images[id]
      imageSelected(image)
      selectedImage=id
    })
    var key = ""
    for(var i = 0; i < keys.length; i++){
      key = keys[i]
      storage.child(images[key].path).getDownloadURL().then(function(url){
        var imageVals=Object.values(images)
        var imageKeys=Object.keys(images)
        var first = url.split('%2F')[0].split('o/')[1]
        var second = url.split('%2F')[1].split('?alt=media')[0]
        var imagePath = first +'/'+second
        var key = ""

        for(var j=0; j<imageKeys.length;j++){
          if(imageVals[j].path == imagePath){
            key = imageKeys[j]

            var id ='#'+key+'_image'
            $(id).attr('src', url)
          }
        }

      }).catch(function(error) {
        // Handle any errors
        M.toast({html:'Error Loading Image!'})
      });
    }

  }
  function makeAudioModal(audio){
    var keys = Object.keys(audio)
    var vals = Object.values(audio)
    var rtn = ""
    for (var i = 0; i < vals.length; i++){
      var tmp = '<div  class="col s12 m6 l4 ">\
        <div id="'+keys[i]+'" class="card select-audio-card">\
          <div id="'+keys[i]+'" class="card-content">\
            <div id="'+keys[i]+'" class="col s12 center">\
              <div id="waveform_'+keys[i]+'"></div>\
            </div>\
            <div id="'+keys[i]+'" class="col s12">\
              <div id="'+keys[i]+'_play" class="btn-flat waves-effect waves-light"><i class="material-icons">play_arrow</i></div>\
              <div id="'+keys[i]+'_pause" class="btn-flat waves-effect waves-light"><i class="material-icons">pause</i></div>\
            </div>\
            <p id="'+keys[i]+'" >'+vals[i].date+'</p>\
            <p id="'+keys[i]+'">'+vals[i].name+'</p>\
            <p id="'+keys[i]+'">'+vals[i].description+'</p>\
          </div>\
        </div>\
      </div>'
      rtn+=tmp
    }

    $('#audio-select-area').empty()
    $('#audio-select-area').append(rtn)
    $('.select-audio-card').click(function(event){
      var id = event.target.id
      if(id.includes('_image')){
        id = id.split('_')[0]
      }
      console.log(audio)
      var thisaudio = audio[id]
      audioSelected(thisaudio)
      selectedAudio=id
    })
    var key = ""
    for(var i = 0; i < keys.length; i++){
      key = keys[i]
      storage.child(audio[key].path).getDownloadURL().then(function(url){
        var audioVals=Object.values(audio)
        var audioKeys=Object.keys(audio)
        var first = url.split('%2F')[0].split('o/')[1]
        var second = url.split('%2F')[1].split('?alt=media')[0]
        var audioPath = first +'/'+second
        var key = ""
        for(var j=0; j<audioKeys.length;j++){

          if(audioVals[j].path == audioPath){
            key = audioKeys[j]
            var id ='#waveform_'+key
            console.log($(id))
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

  function imageSelected(image){
    $('#name3').val(image.name)
    $('#date3').val(image.date)
    $('#description3').val(image.description)
    $('#edit-select4').val(image.event)
    $('#edit-select4').formSelect()
    M.updateTextFields()
    $('#image-select-modal').modal('close')
  }
  function audioSelected(audio){
    if(audio){
      $('#name5').val(audio.name)
      $('#date5').val(audio.date)
      $('#band5').val(audio.band)
      $('#description5').val(audio.description)
      $('#edit-select5').val(audio.event)
      $('#edit-select5').formSelect()
      M.updateTextFields()
    } else {
      M.toast({html: 'Click on the title to select this audio!'})
    }
  }
})
