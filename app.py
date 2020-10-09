import json
import requests
import flask
from datetime import datetime
from pandas.io.json import json_normalize

app = Flask(__name__)

@app.route('/')
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
