
from flask import Flask, render_template, request
import sqlite3


# ========================================
# FLASK APPLICATION
# ========================================

app = Flask(__name__)


# ========================================
# DATABASE CONNECTION
# ========================================

def get_db_connection():

    connection = sqlite3.connect("tasks.db")

    connection.row_factory = sqlite3.Row

    return connection


# ========================================
# CREATE DATABASE TABLE
# ========================================

def create_table():

    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0
        )
    """)

    connection.commit()

    connection.close()


# ========================================
# PAGE ROUTES
# ========================================

@app.route("/")
def home():

    return render_template("index.html")


# ========================================
# API ROUTES
# ========================================


# ----------------------------------------
# HELLO API
# ----------------------------------------

@app.route("/api/hello")
def api_hello():

    return {
        "message": "Hello from the Flask API!"
    }


# ----------------------------------------
# GET + CREATE TASKS
# ----------------------------------------

@app.route("/api/tasks", methods=["GET", "POST"])
def tasks():

    connection = get_db_connection()


    # ========================================
    # GET TASKS
    # ========================================

    if request.method == "GET":

        tasks = connection.execute(
            "SELECT * FROM tasks"
        ).fetchall()

        connection.close()

        return [dict(task) for task in tasks]


    # ========================================
    # CREATE TASK
    # ========================================

    if request.method == "POST":

        data = request.get_json()

        cursor = connection.execute(
            """
            INSERT INTO tasks (title, completed)
            VALUES (?, ?)
            """,
            (data["title"], 0)
        )

        connection.commit()


        # Get the task we just created
        new_task = connection.execute(
            "SELECT * FROM tasks WHERE id = ?",
            (cursor.lastrowid,)
        ).fetchone()

        connection.close()

        return dict(new_task)


# ----------------------------------------
# UPDATE TASK
# ----------------------------------------

@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):

    # Get data sent from JavaScript
    data = request.get_json()

    new_title = data["title"]

    completed = data.get("completed", 0)


    # Connect to database
    connection = get_db_connection()


    # Update the task
    connection.execute(
        """
        UPDATE tasks
        SET title = ?, completed = ?
        WHERE id = ?
        """,
        (new_title, completed, task_id)
    )


    # Save the change
    connection.commit()


    # Get the updated task
    updated_task = connection.execute(
        "SELECT * FROM tasks WHERE id = ?",
        (task_id,)
    ).fetchone()


    connection.close()


    return dict(updated_task)


# ----------------------------------------
# DELETE TASK
# ----------------------------------------

@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):

    connection = get_db_connection()


    connection.execute(
        "DELETE FROM tasks WHERE id = ?",
        (task_id,)
    )


    connection.commit()

    connection.close()


    return {
        "message": "Task deleted successfully"
    }


# ========================================
# START APPLICATION
# ========================================

if __name__ == "__main__":

    create_table()

    app.run(debug=True)

