from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, EqualTo

class LoginForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])
    sign_in = SubmitField("Sign In")

class RegisterForm(FlaskForm):
    username = StringField("Username", validators=[
        DataRequired(), Length(min=5, max=20)
    ])
    password = PasswordField("Password", validators=[
        DataRequired(), EqualTo("repeat", message="Password must match.")
    ])
    repeat = PasswordField("Repeat Password")
    register = SubmitField("Register")

