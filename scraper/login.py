import requests

LOGIN_URL = "https://ucsc.cmb.ac.lk/exam_results/"
RESULTS_URL = "https://ucsc.cmb.ac.lk/exam_results/results"  # hypothetical actual results URL


def login(index_no, nic):
    session = requests.Session()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": LOGIN_URL,
    }
    payload = {
        'no': index_no,
        'pw': nic
        # add any hidden inputs if needed after inspecting form
    }
    response = session.post(LOGIN_URL, data=payload, headers=headers)

    if "Student Record of Examinations" not in response.text:
        raise Exception(f"Login failed for {index_no}")

    return response.text  # Return the HTML content after login
