from flask import Flask
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/')
def hello_world():
    """Print 'Hello, world!' as the response body."""
    return 'Hello, world!'

if __name__ == "__main__":
    app.run(debug=True)
