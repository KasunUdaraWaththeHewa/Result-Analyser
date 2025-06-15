
# 🎓 Exam Results Analyzer

An application to analyze and visualize exam results. Built with **FastAPI** for the backend and **React (Vite + Tailwind)** for the frontend.

---

## 🛠️ Setup and Run Instructions

### 🔧 Backend Setup

Make sure Python 3.9+ is installed. Then run:

#### ▶️ Activate virtual environment

**Windows**
```bash
venv\Scripts\activate
````

**Unix/Linux/Mac**

```bash
source venv/bin/activate
```

#### 📦 Install Python dependencies

```bash
pip install -r requirements.txt
```

#### 🚀 Run FastAPI application

```bash
python main.py
```

#### 🧮 Run GPA Calculator

```bash
python ./GPA_Calculator/gpa_caculator.py
```

#### 🩺 Sort by medicals

```bash
python ./GPA_Calculator/sort_by_medicals.py
```

#### 📊 Analyze subjects

```bash
python ./analyse_subjects/analyse_subjects.py
```

#### 🌐 Run REST API server

```bash
python run.py
```

---

### 💻 Frontend Setup (Inside `web` Directory)

Make sure Node.js (v16+) is installed.

#### 📁 Navigate to frontend

```bash
cd web
```

#### 📦 Install frontend dependencies

```bash
npm install
```

#### 🚀 Start frontend dev server

```bash
npm run dev
```

> Access the app at: `http://localhost:8080`

---

## 📊 Features

* Student search by index number
* GPA trend visualization by semester
* Download Excel reports
* Analyze strategic use of medical credits
* Sort and filter student performance data
* Full subject-wise results breakdown
* Visualize GPA summaries
* Visualize subject-wise summaries
* Visualize subject difficulties and trends

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

* Ensure the backend is running before using the frontend
* Run data scripts manually when Excel files or data change
* CORS is enabled for local development

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repository, submit a pull request, or open issues for discussion.

---

## 📜 License

MIT License — feel free to use and modify.

```
✅ Let me know if you'd like this saved as a `README.md` file or want to add screenshots, badges, or deployment instructions.
```
