### UCSC Exam results analyser:

````markdown
## 🛠️ Setup and Run Instructions

### 🔧 Backend Setup

```bash
# Activate virtual environment
venv\Scripts\activate  

# Install dependencies
pip install -r requirements.txt 

# Run FastAPI main app
python main.py

# Run GPA processing scripts
python .\GPA_Calculator\gpa_caculator.py 
python .\GPA_Calculator\sort_by_medicals.py 

# Run subject analysis
python .\analyse_subjects\analyse_subjects.py

# Run the python server to expose rest apis.
python run.py
````

---

### Frontend Setup (Inside `web` Directory)

```bash
# Navigate to frontend project
cd web

# Install dependencies
npm install

# Start the development server
npm run dev
```
