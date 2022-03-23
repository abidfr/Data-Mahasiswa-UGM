var express = require("express");
var router = express.Router();
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET mahasiswa page. */

router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM mahasiswa WHERE nama_fakultas='Fakultas Kehutanan'",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("fakultas/prodi", {
          title: "Fakultas",
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
      var fakultas = {
        id: req.params.id,
      };

      var delete_sql = "delete from mahasiswa where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          fakultas,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/prodi");
            } else {
              req.flash("msg_info", "Prodi Berhasil Di Hapus");
              res.redirect("/prodi");
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
        "SELECT * FROM mahasiswa where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/prodi");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Prodi can't be find!");
              res.redirect("/prodi");
            } else {
              console.log(rows);
              res.render("fakultas/edit", {
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
    req.assert("nama_fakultas", "Please fill the name").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_nama_fakultas = req.sanitize("nama_fakultas").escape().trim();
      v_letak_fakultas = req.sanitize("letak_fakultas").escape().trim();
      v_no_fakultas = req.sanitize("no_fakultas").escape().trim();
      v_email_fakultas= req.sanitize("email_fakultas").escape();

      var fakultas = {
        nama_fakultas: v_nama_fakultas,
        letak_fakultas: v_letak_fakultas,
        no_fakultas: v_no_fakultas,
        email_fakultas: v_email_fakultas,
      };

      var update_sql = "update mahasiswa SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          fakultas,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("fakultas/edit", {
                nama_fakultas: req.param("nama_fakultas"),
                letak_fakultas: req.param("letak_fakultas"),
                no_fakultas: req.param("no_fakultas"),
                email_fakultas: req.param("email_fakultas"),
              });
            } else {
              req.flash("msg_info", "Fakultas Berhasil Di Ubah");
              res.redirect("/fakultas/edit/" + req.params.id);
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
      res.redirect("/fakultas/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("nama_fakultas", "Please fill the name").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_nama_fakultas = req.sanitize("nama_fakultas").escape().trim();
    v_letak_fakultas= req.sanitize("letak_fakultas").escape().trim();
    v_no_fakultas = req.sanitize("no_fakultas").escape().trim();
    v_email_fakultas = req.sanitize("email_fakultas").escape();

    var fakultas = {
      nama_fakultas: v_nama_fakultas,
      letak_fakultas: v_letak_fakultas,
      no_fakultas: v_no_fakultas,
      email_fakultas: v_email_fakultas,
    };

    var insert_sql = "INSERT INTO mahasiswa SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        fakultas,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("fakultas/add-fakultas", {
              nama_fakultas: req.param("nama_fakultas"),
              letak_fakultas: req.param("letak_fakultas"),
              no_fakultas: req.param("no_fakultas"),
              email_fakultas: req.param("email_fakultas"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Fakultas Berhasil Ditambahkan");
            res.redirect("/prodi");
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
    res.render("fakultas/add-fakultas", {
      nama_fakultas: req.param("nama_fakultas"),
      letak_fakultas: req.param("letak_fakultas"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("fakultas/add-fakultas", {
    title: "Add New Fakultas",
    name: "",
    email: "",
    phone: "",
    address: "",
    session_store: req.session,
  });
});

module.exports = router;