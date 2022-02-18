from app.api import bp

@bp.route("/users/create", methods=["POST"])
def create_user():
    return {"sample": 123}

