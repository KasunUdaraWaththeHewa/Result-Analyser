---

```markdown
# 🎓 Exam Results Analyzer

An application to analyze and visualize exam results. Built with **FastAPI** for the backend and **React (Vite + Tailwind)** for the frontend.

## 🛠️ Setup and Run Instructions

### 🔧 Backend Setup

Make sure Python 3.9+ is installed. Then run:

```bash
# Activate virtual environment
venv\Scripts\activate     # On Windows
# OR
source venv/bin/activate  # On Unix/Linux/Mac

# Install Python dependencies
pip install -r requirements.txt 

# Run FastAPI application
python main.py

# Run GPA processing scripts
python ./GPA_Calculator/gpa_caculator.py 
python ./GPA_Calculator/sort_by_medicals.py 

# Run subject analysis script
python ./analyse_subjects/analyse_subjects.py

# Run the REST API server
python run.py
````

---

### 💻 Frontend Setup (Inside `web` Directory)

Make sure Node.js (v16+) is installed.

```bash
# Navigate to frontend project
cd web

# Install JavaScript dependencies
npm install

# Start the development server
npm run dev
```

> Access the app at `http://localhost:8080`

---

## 📊 Features

* Student search by index number
* GPA trend visualization by semester
* Download Excel reports
* Analyze strategic use of medical credits
* Sort and filter student performance data
* Full subject-wise results breakdown
* Visualize GPA summeries
* Visualize subject wise summeries
* Visualize subject wise difficulties and results taken.

---

## 📦 Technologies Used

### Backend

* 🐍 Python
* ⚡ FastAPI
* 🧮 Pandas

### Frontend

* ⚛️ React (Vite)
* 💨 TailwindCSS

---

## 🧪 Development Notes

* Ensure the backend is running before interacting with the frontend.
* Scraping scripts and processing excel sheets must be run manually in order when data changes.
* CORS is enabled for local development.

---

## 🤝 Contributing
If you want to contribute, feel free to fork the repository and submit a pull request. Contributions are welcome!
Recognized improvements are always appreciated, and issues and features can be discussed in the GitHub repository.

## 📜 License

MIT License — feel free to use and modify.

```

---

Let me know if you want this saved as a file, or you'd like to include things like screenshots, contribution guidelines, or deployment instructions.
```
