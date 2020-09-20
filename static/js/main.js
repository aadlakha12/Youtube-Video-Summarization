$(document).ready(function () {
    
    $('.loader').hide();
    $('#result').hide();
    $("#errormessage").hide();
    $("#btn-speech").hide();
    $("#btn-pause").hide();
    // Upload Preview

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
                $('#imagePreview').fadeIn(650);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    $("#imageUpload").change(function () {
        // event.preventDefault();
        // $('#btn-predict').prop("disabled", false);
        if ($('#imageUpload').val() == ''){
            setTimeout(function(){
              $("#errormessage").show();
            })
        }else{
          setTimeout(function(){
            $("#errormessage").hide();
          })
        }
        $('#result').text('');
        $('#result').hide();
        $("#btn-speech").hide();
        $("#btn-pause").hide();
      //  readURL(this);
    });


    // Predict
    $('#btn-predict').click(function () {
        var form_data = new FormData($('#youtube-video')[0]);
        // var splitdata = form_data.split('=');
        // var requestpayload = {
        //   videoid : splitdata[1]
        // }
        // Show loading animation
      //  $(this).hide();
      $("#btn-speech").hide();
      $("#btn-pause").hide();
      if ($('#imageUpload').val() == ''){
          setTimeout(function(){
            $("#errormessage").show();
          })
      }else{
        $('.loader').show();

        // Summarazing video by making a call to flask api
        $.ajax({
            type: 'POST',
            url: '/youtube',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: true,
            success: function (data) {
                // Get and display the result
                console.log(data)
                var result = data
                $('.loader').hide();
                $('#result').fadeIn(600);
                if (result['status'] == 'error'){
                    $('#result').html(' <h5>Result:</h5> <b> Error: </b> ' + result.error);
                }else{
                  $("#btn-speech").show();
                  $('#result').html('<h5>Result:</h5> <b>Video Summary: </b>' + "<p>" + result.video_summary.summary +'</p>'  + '<b>Video Content:</b>' + result.video_summary.text);
                }
                $('#btn-speech').click(function () {
                    console.log(result.video_summary.summary)
                    var msg = new SpeechSynthesisUtterance(result.video_summary.summary);
                    $("#btn-pause").show();
                    window.speechSynthesis.speak(msg);
                });

                $('#btn-pause').click(function () {
                    // if ($('#btn-pause').val() == 'Pause'){
                    //   $('#btn-pause').val('Play')
                    //   window.speechSynthesis.resume();
                    // }else{
                    //   $('#btn-pause').val('Pause')
                       window.speechSynthesis.pause();
                    // }
                });

                console.log('Success!');
            },
        });
      }

    });

});
