from flask import Blueprint
from flask_login import login_required
from app.models import Task

bp = Blueprint('api', __name__, url_prefix="/api")

from app.api import users, tasks

