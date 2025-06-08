def get_results_html(session):
    return session.get("https://ucsc.cmb.ac.lk/exam_results/").text
