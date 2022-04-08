from flask import request
from flask_login import login_required, current_user
from app import db
from app.api import bp
from app.models import Task, Subtask

@bp.route("/users/<int:user_id>/tasks", methods=["GET"])
@login_required
def getTasks(user_id):
    tasks = list()
    for task in Task.query.filter_by(user_id=user_id).all():
        subtasks = [
            {'task_name': subtask.task_name, 'is_done': subtask.is_done}
            for subtask in Subtask.query.filter_by(task_id=task.id).all()
        ]
        tasks.append({'name': task.task_name, 'status': task.status,
                      'progress': task.progress, 'subtasks': subtasks})

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


@bp.route("/subtasks/add", methods=["POST"])
def addSubtask():
    subtask = Subtask(task_name=request.json['task_name'],
                      is_done=request.json['is_done'],
                      task_id=request.json['task_id'])
    db.session.add(subtask)
    db.session.commit()

    return {"status": "success"}


@bp.route("/subtasks/update", methods=["PUT"])
def updateSubtask():
    task_id = request.json['task_id']
    task = Task.query.filter_by(id=task_id).first()
    if task:
        task.progress = request.json['progress']

    for subtask in request.json['subtasks']:
        currentSubtask = Subtask.query.filter_by(
            task_name=subtask['task_name'], task_id=task_id).first()
        if currentSubtask:
            currentSubtask.is_done = subtask['is_done']

    db.session.commit()
    return {"status": "success"}

