from app import app, db
from app.forms import LoginForm, RegisterForm
from app.models import User
from flask import render_template, flash, redirect, url_for
from flask_login import login_user, logout_user, current_user

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash("The username or password is invalid/incorrect. Try again.")
        else:
            login_user(user)
            return redirect(url_for("home"))
    return render_template("login.html", title="Login", form=form)


@app.route("/logout", methods=["GET"])
def logout():
    logout_user()
    return redirect(url_for("index"))


@app.route("/register", methods=["GET", "POST"])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None:
            user = User(username=form.username.data)
            user.set_password(form.password.data)
            db.session.add(user)
            db.session.commit()
            flash("Registration successful.")
            return redirect(url_for("index"))
        else:
            flash("Username already exists. Please try again.")
    return render_template("register.html", title="Register", form=form)


@app.route("/home", methods=["GET", "POST"])
def home():
    if current_user.is_anonymous:
        return redirect(url_for("index"))
    else:
        return render_template("home.html", title="Home")

