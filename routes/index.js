var express = require("express");
var router = express.Router();
const UserModel = require("../models/userModel");

const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(new LocalStrategy(UserModel.authenticate()));

router.get("/", function (req, res, next) {
    res.render("index", { title: "Homepage", user: req.user });
});

router.get("/signup", function (req, res, next) {
    res.render("signup", { title: "Sign-Up", user: req.user });
});

router.post("/signup", async function (req, res, next) {
    try {
        const { username, password, email } = req.body;
        const user = await UserModel.register({ username, email }, password);
        res.redirect("/signin");
    } catch (error) {
        res.send(error.message);
    }
});

router.get("/signin", function (req, res, next) {
    res.render("signin", { title: "Sign-In", user: req.user });
});

router.post(
    "/signin",
    passport.authenticate("local", {
        failureRedirect: "/signin",
        successRedirect: "/profile",
    }),
    function (req, res, next) {}
);

router.get("/profile", isLoggedIn, async function (req, res, next) {
    try {
        console.log(req.user);
        const users = await UserModel.find();
        res.render("profile", { title: "Profile", users, user: req.user });
    } catch (error) {
        res.send(error);
    }
});

router.get("/signout", async function (req, res, next) {
    req.logout(() => {
        res.redirect("/signin");
    });
});

router.get("/delete/:id", async function (req, res, next) {
    try {
        await UserModel.findByIdAndDelete(req.params.id);
        res.redirect("/profile");
    } catch (error) {
        res.send(error);
    }
});

router.get("/update/:id", async function (req, res, next) {
    try {
        const User = await UserModel.findById(req.params.id);
        res.render("update", { title: "Update", User, user: req.user });
    } catch (error) {
        res.send(error);
    }
});

router.post("/update/:id", async function (req, res, next) {
    try {
        await UserModel.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/profile");
    } catch (error) {
        res.send(error);
    }
});

router.get("/get-email", function (req, res, next) {
    res.render("getemail", { title: "Forget-Password", user: req.user });
});

router.post("/get-email", async function (req, res, next) {
    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (user === null) {
            return res.send(
                `User not found. <a href="/get-email">Forget Password</a>`
            );
        }
        res.redirect("/change-password/" + user._id);
    } catch (error) {
        res.send(error);
    }
});

router.get("/change-password/:id", function (req, res, next) {
    res.render("changepassword", {
        title: "Change Password",
        id: req.params.id,
    });
});

router.post("/change-password/:id", async function (req, res, next) {
    try {
        await UserModel.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/signin");
    } catch (error) {
        res.send(error);
    }
});

router.get("/reset/:id", async function (req, res, next) {
    res.render("reset", {
        title: "Reset Password",
        id: req.params.id,
        user: req.user,
    });
});

router.post("/reset/:id", async function (req, res, next) {
    try {
        const { oldpassword, password } = req.body;
        const user = await UserModel.findById(req.params.id);

        if (oldpassword !== user.password) {
            return res.send(
                `Incorrect Password. <a href="/reset/${user._id}">Reset Again</a>`
            );
        }
        await UserModel.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/profile");
    } catch (error) {
        res.send(error);
    }
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/signin");
}

module.exports = router;
