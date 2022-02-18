from flask import request
from flask_login import login_required, current_user
from app import db
from app.api import bp
from app.models import Task

@bp.route("/users/<int:user_id>/tasks", methods=["GET"])
@login_required
def getTasks(user_id):
    tasks = list()
    for task in Task.query.filter_by(user_id=user_id).all():
        tasks.append({'name': task.task_name, 'status': task.status})

    return {'tasks': tasks}

@bp.route("/tasks/add", methods=["POST"])
@login_required
def addTask():
    newTask = Task(task_name=request.json['task'], status="New",
                   user_id=current_user.id)
    db.session.add(newTask)
    db.session.commit()

    return {"status": "success"}

