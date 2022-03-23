var express = require("express");
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var path = require('path');
var formidable = require("formidable");
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;
var mv = require("mv");
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET nim page. */

router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM nim",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("fakultas/nim", {
          title: "nim",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var nim = {
        id: req.params.id,
      };

      var delete_sql = "delete from nim where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          nim,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/nim");
            } else {
              req.flash("msg_info", "NIM Berhasil Di Hapus");
              res.redirect("/nim");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM nim where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/nim");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "NIM can't be find!");
              res.redirect("/nim");
            } else {
              console.log(rows);
              res.render("fakultas/nimedit", {
                title: "Edit ",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("nama_mahasiswa", "Please fill the name").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_nama_mahasiswa = req.sanitize("nama_mahasiswa").escape().trim();
      v_jenis_kelamin = req.sanitize("jenis_kelamin").escape().trim();
      v_jenjang_mahasiswa = req.sanitize("jenjang_mahasiswa").escape().trim();
      v_program_studi= req.sanitize("program_studi").escape();

      if (!req.files) {
        var nim = {
          nama_mahasiswa: v_nama_mahasiswa,
          jenis_kelamin: v_jenis_kelamin,
          jenjang_mahasiswa: v_jenjang_mahasiswa,
          program_studi: v_program_studi,
          };
      }else{
        var file = req.files.gambar;
        file.mimetype == "image/jpeg";
        file.mv("public/images/upload/" + file.name);

      var nim = {
        nama_mahasiswa: v_nama_mahasiswa,
        jenis_kelamin: v_jenis_kelamin,
        jenjang_mahasiswa: v_jenjang_mahasiswa,
        program_studi: v_program_studi,
        gambar: file.name,
      }
    };

      var update_sql = "update nim SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          nim,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("fakultas/nimedit", {
                nama_mahasiswa: req.param("nama_mahasiswa"),
                jenis_kelamin: req.param("jenis_kelamin"),
                jenjang_mahasiswa: req.param("jenjang_mahasiswa"),
                program_studi: req.param("program_studi"),
              });
            } else {
              req.flash("msg_info", "NIM Berhasil Di Ubah");
              res.redirect("/nim/edit/" + req.params.id);
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/nim/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("nama_mahasiswa", "Please fill the name").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_nama_mahasiswa = req.sanitize("nama_mahasiswa").escape().trim();
    v_jenis_kelamin= req.sanitize("jenis_kelamin").escape().trim();
    v_jenjang_mahasiswa = req.sanitize("jenjang_mahasiswa").escape().trim();
    v_program_studi = req.sanitize("program_studi").escape();
        
    var file = req.files.gambar;
        file.mimetype == "image/jpeg";
        file.mv("public/images/upload/" + file.name);

    var nim = {
      nama_mahasiswa: v_nama_mahasiswa,
      jenis_kelamin: v_jenis_kelamin,
      jenjang_mahasiswa: v_jenjang_mahasiswa,
      program_studi: v_program_studi,
      gambar: file.name,
    };

    var insert_sql = "INSERT INTO nim SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        nim,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("fakultas/add-nim", {
              nama_mahasiswa: req.param("nama_mahasiswa"),
              jenis_kelamin: req.param("jenis_kelamin"),
              jenjang_mahasiswa: req.param("jenjang_mahasiswa"),
              program_studi: req.param("program_studi"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "NIM Berhasil Ditambahkan");
            res.redirect("/nim");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sory there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("fakultas/add-nim", {
      nama_mahasiswa: req.param("nama_mahasiswa"),
      jenis_kelamin: req.param("jenis_kelamin"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("fakultas/add-nim", {
    title: "Add New NIM",
    name: "",
    email: "",
    phone: "",
    address: "",
    session_store: req.session,
  });
});

module.exports = router;