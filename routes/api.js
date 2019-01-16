/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

/*let issueSchema = new mongoose.Schema({
  issue_title: String,
  issue_text: String,
  created_by: String,
  assigned_to: String,
  status_text: String
});
let Issue = mongoose.model('Issue', issueSchema);*/

module.exports = function (app) {
  
    app.route('/api/issues/:project')
      .get(function (req, res){
        var project = req.params.project;
        let searchQuery = req.query;
        if (searchQuery._id) {searchQuery._id = new ObjectId(searchQuery._id)}
      
        MongoClient.connect(CONNECTION_STRING, (err, database) => {
          let db = database.db('fccdatabase');
          db.collection(project).find(searchQuery).toArray((err, data) => {
            if (err) return res.send(err);
            res.json(data);
          });
        });
      })
    
      .post(function (req, res){
        var project = req.params.project;
      
        let issue = {
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || "",
          status_text: req.body.status_text || "",
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        };
      
        if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
          res.send('missing inputs');
        } else {
          MongoClient.connect(CONNECTION_STRING, (err, database) => {
            let db = database.db('fccdatabase');
            db.collection(project).insertOne(issue, (err, data) => {
              issue._id = data.insertedId;
              res.json(issue);
            });
          });
        }
      
      })

      .put(function (req, res){
        var project = req.params.project;
        if(!req.body._id) {
          res.send('missing id')
        } else {
          let id = req.body._id;
          delete req.body._id;
          
          let counter = 0;
          for (let i in req.body) {if (req.body[i] === '') {
            delete req.body[i];
            counter++;
          }}
          if (counter == 5 && !req.body.open) {res.send('no updated field sent')};
          req.body.updated_on = new Date();
          
          MongoClient.connect(CONNECTION_STRING, (err, database) => {
            let db = database.db('fccdatabase');
            db.collection(project).updateOne({_id: new ObjectId(id)}, {$set: req.body}, (err, data) => {
             if (err) {
               console.log(err)
               res.send('could not update ' + id)
             } else {
               res.send('successfully updated');
             }
            });
          });
        }
      })

      .delete(function (req, res){
        var project = req.params.project;
        let id = req.body._id;
        if(!id) {
          res.send('_id error')
        } else {
          MongoClient.connect(CONNECTION_STRING, (err, database) => {
            let db = database.db('fccdatabase');
            db.collection(project).deleteOne({_id: new ObjectId(id)}, (err, data) => {
              if (err) {
                console.log(err)
                res.send('could not delete ' + id);
              } else {
                console.log('deleted')
                res.send('deleted ' + id);
              }
            });
          });
        }      
      });
  
};
