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
        tasks.append({'name': task.task_name, 'status': task.status,
                      'progress': task.progress})

    return {'tasks': tasks}

@bp.route("/tasks/add", methods=["POST"])
@login_required
def addTask():
    task = Task(task_name=request.json['task'], status="New", progress=0,
                user_id=current_user.id)
    db.session.add(task)
    db.session.commit()

    return {"status": "success"}


@bp.route("/tasks/delete", methods=["POST"])
@login_required
def deleteTask():
    task = Task.query.filter_by(task_name=request.json['task']['name'],
                                user_id=current_user.id).first()
    if task:
        db.session.delete(task)
        db.session.commit()
        return {"status": "success"}
    else:
        return {"status": "failed"}


@bp.route("/tasks/update", methods=["PUT"])
def updateTask():
    task = Task.query.filter_by(task_name=request.json['task']['name'],
                                user_id=current_user.id).first()
    if task:
        task.status = request.json['task']['status']
        db.session.commit()
        return {"status": "success"}
    else:
        return {"status": "failed"}

