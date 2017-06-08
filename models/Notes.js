// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var NotesSchema = new Schema({
  title: {
    type: String
  },
  body: {
    type: String
  }
});


// Create the Note model with the NoteSchema
var Note = mongoose.model("Notes", NotesSchema);

// Export the Note model
module.exports = Notes;
