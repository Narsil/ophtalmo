import os
import random
import string
from flask import Flask, flash, request, redirect, url_for
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"mov", "mp4", "json", "txt", "jpg", "jpeg", "png"}

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["SESSION_TYPE"] = "memcached"
app.config["SECRET_KEY"] = "".join(random.choices(string.ascii_letters, k=20))


def allowed_file(filename):
    print(filename)
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        # check if the post request has the file part
        print("Request files", request.files)
        print("Request ", request.form)
        if "file" not in request.files:
            flash("No file part")
            return redirect(request.url)
        if "patient" not in request.form:
            flash("No patient specified")
            return redirect(request.url)
        file = request.files["file"]
        patient_uuid = request.form["patient"]
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == "":
            flash("No selected file")
            print("No filename")
            return redirect(request.url)
        if not allowed_file(file.filename):
            print("File not allowed")
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            directory = os.path.join(app.config["UPLOAD_FOLDER"], patient_uuid)
            os.makedirs(directory, exist_ok=True)
            full_filename = os.path.join(directory, filename)
            if os.path.exists(full_filename):
                return """{status: "exists"}"""
            else:
                file.save(full_filename)
                return """{status: "created"}"""
    return """
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    """
