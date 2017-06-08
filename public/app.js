

$(document).on("click", ".saveArticle", function() {


      var status = $(this).attr("data-status");

      $(this).attr("data-status", true);

      console.log(status);

      var thisId = $(this).attr("data-id");
      console.log(thisId);

        // Run a POST request to change the note, using the data entered in the inputs
  $.ajax({
    method: "POST",
    url: "/updates/" + thisId,
    data: {
      // Values taken from title input
      saved: true
    }
  })
    
    .done(function(data) {
      // Logging the response
      console.log(data);
      //  toEmpty the notes section
    });


});


// On-click, change saved from true to false and shoup on home page
$(document).on("click", ".removeFavorite", function(e) {


  var thisStatus = $(this).attr("data-status");
  var thisId = $(this).attr("data-id");
  console.log(thisId);
        // Run a POST request to change the note, using data entered in the inputs
  $.ajax({
    method: "POST",
    url: "/updates/" + thisId + "/" + thisStatus,
    data: {
      // Value taken from title input
      saved: false
    }
  })
    
    .done(function(data) {
      // Logging the response
      console.log(data);
      // toEmpty the notes section
    });


});



$(document).on("click", ".saveNotes", function(e) {

   var thisId = $(this).attr("data-id");
   var showSection = "#" + thisId;
   var notesContentId = "#newNote_" + thisId;
   var notesContent = $(notesContentId).val();

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/notes/" + thisId,
    data: {
        body: notesContent
      // Value taken from title input
    },

  })
    // With that done
    .done(function(data) {
      // Logging the response
      console.log(data);
      // toEmpty the notes section
      $(showSection).append("<h4 style='margin-top: 30px'>" + "Saved Notes" + "</h4>");
      $(showSection).append("<p>" + notesContent + "</p>");
      $(showSection).append("<button data-id='" + data._id + "'>Clear Note</button>");
    });


  });

//On-click save notes to database
$(document).on("click", ".takeNotes", function(e) {

  var thisId = $(this).attr("data-id");
  var showSection = "#" + thisId;

  $(showSection).show();

    $.ajax({
    method: "GET",
    url: "/notes/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // // The title of the article
      $(showSection).append("<h4 style='margin-top: 30px; margin-left: 30px'>" + "Saved Notes" + "</h4>");
      $(showSection).append("<p style='margin-left: 65px'>" + data.note.body + "</p>");
     
      $(showSection).append("<button style='margin-left: 30px'data-id='" + data._id + ">Clear Note</button>");

  });
  });

