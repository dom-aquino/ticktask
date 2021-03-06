from app import db, login
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    tasks = db.relationship('Task', backref='owner', lazy='dynamic')

    def __repr__(self):
        return "<User {}>".format(self.username)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(64))
    status = db.Column(db.String(8))
    progress = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    subtasks = db.relationship('Subtask', backref='owner', lazy='dynamic')

    def __repr__(self):
        return "<Task {} | Status {}>".format(self.task_name, self.status)

class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(64))
    is_done = db.Column(db.Boolean, default=False, nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'))

    def __repr__(self):
        return "<Task {} | Status {}>".format(self.task_name, self.status)

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

